# Authentication & Authorization Guide

This document provides detailed information about the authentication and authorization system implemented in WinMix TipsterHub.

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Setup Guide](#setup-guide)
4. [User Roles](#user-roles)
5. [Protected Routes](#protected-routes)
6. [API Integration](#api-integration)
7. [Testing](#testing)
8. [Security Best Practices](#security-best-practices)

---

## Overview

WinMix TipsterHub uses **Supabase Authentication** to provide secure user authentication and role-based access control (RBAC). The system supports:

- ✅ Email/password authentication
- ✅ Automatic session management with token refresh
- ✅ Role-based access control (Admin, Analyst, User)
- ✅ Protected routes with AuthGate component
- ✅ Public demo access for read-only views
- ✅ OAuth hooks for future integration (Google, GitHub, etc.)

---

## Architecture

### Components

```
src/
├── providers/
│   └── AuthProvider.tsx          # Central auth state management
├── hooks/
│   └── useAuth.tsx               # Hook for accessing auth context
├── components/
│   └── AuthGate.tsx              # Route protection component
├── pages/Auth/
│   ├── Login.tsx                 # Sign-in page
│   └── Signup.tsx                # Registration page
└── integrations/supabase/
    └── client.ts                 # Supabase client with auth config
```

### Database Schema

**Table: `user_profiles`**
```sql
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'analyst', 'user')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Automatic Profile Creation**
A database trigger automatically creates a user profile when a new user signs up:
```sql
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

## Setup Guide

### 1. Environment Configuration

Copy `.env.example` to `.env` and configure:
```bash
cp .env.example .env
```

Update the following variables:
```env
VITE_SUPABASE_URL="https://your-project-id.supabase.co"
VITE_SUPABASE_ANON_KEY="your_anon_key_here"
```

### 2. Apply Database Migrations

Apply the `user_profiles` migration to your Supabase project:
```bash
supabase db push --project-ref <YOUR_PROJECT_ID>
```

Or manually run the migration file:
```bash
supabase/migrations/20251106000000_add_user_profiles.sql
```

### 3. Configure Supabase Auth Settings

In your Supabase Dashboard:

1. Go to **Authentication > Providers**
2. Enable **Email** provider
3. Configure email templates (optional)
4. Set **Site URL**: `http://localhost:5173` (development) or your production URL
5. Add redirect URLs for OAuth (if needed)

### 4. Start the Application

```bash
npm install
npm run dev
```

Navigate to `http://localhost:5173/signup` to create your first account.

---

## User Roles

### Admin
- **Permissions**: Full system access
- **Can Access**:
  - All dashboards
  - Scheduled jobs management
  - Model evaluation and experiments
  - User management (via SQL)
  - All predictions and analytics

### Analyst
- **Permissions**: Read/write predictions, analytics access
- **Can Access**:
  - Create and view predictions
  - Access analytics dashboards
  - View models and monitoring
  - Scheduled jobs management

### User (Default)
- **Permissions**: Read-only access
- **Can Access**:
  - View predictions
  - Browse matches, teams, leagues
  - View public analytics

### Promoting Users

To promote a user to admin or analyst:
```sql
-- Promote to admin
UPDATE user_profiles SET role = 'admin' WHERE email = 'user@example.com';

-- Promote to analyst
UPDATE user_profiles SET role = 'analyst' WHERE email = 'user@example.com';
```

---

## Protected Routes

### Public Routes (No Authentication Required)
- `/` - Home page
- `/login` - Sign-in page
- `/signup` - Registration page

### Demo Routes (Read-Only for Unauthenticated)
- `/predictions` - View public predictions
- `/matches` - Browse matches
- `/match/:id` - Match details
- `/teams` - Team directory
- `/teams/:teamName` - Team details
- `/leagues` - League directory

### Protected Routes (Authentication Required)
- `/dashboard` - Main dashboard (all roles)
- `/predictions/new` - Create predictions (all roles)
- `/analytics` - Analytics dashboard (all roles)
- `/models` - Model management (all roles)
- `/monitoring` - System monitoring (all roles)
- `/crossleague` - Cross-league intelligence (all roles)
- `/phase9` - Advanced features (all roles)
- `/jobs` - Scheduled jobs (admin, analyst only)

### Route Configuration

Protected routes are wrapped with `AuthGate`:
```tsx
// Public route
<Route path="/" element={
  <AuthGate requireAuth={false}>
    <Index />
  </AuthGate>
} />

// Protected route (all authenticated users)
<Route path="/dashboard" element={
  <AuthGate>
    <Dashboard />
  </AuthGate>
} />

// Role-restricted route
<Route path="/jobs" element={
  <AuthGate allowedRoles={['admin', 'analyst']}>
    <ScheduledJobs />
  </AuthGate>
} />
```

---

## API Integration

### Automatic Token Injection

The Supabase client automatically includes authentication tokens in all API requests:
```typescript
import { supabase } from '@/integrations/supabase/client';

// Token is automatically included
const { data, error } = await supabase
  .from('predictions')
  .select('*');
```

### Edge Function Calls

Edge functions automatically receive the authenticated user context:
```typescript
const { data, error } = await supabase.functions.invoke('my-function', {
  body: { /* your data */ }
});
// User session is automatically passed via Authorization header
```

### Accessing User in Edge Functions

In your Edge Function:
```typescript
import { createClient } from '@supabase/supabase-js';

Deno.serve(async (req) => {
  const authHeader = req.headers.get('Authorization')!;
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { global: { headers: { Authorization: authHeader } } }
  );

  // Get authenticated user
  const { data: { user }, error } = await supabaseClient.auth.getUser();
  
  if (error || !user) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Use user.id for queries
  const { data: profile } = await supabaseClient
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  // Implement role-based logic
  if (profile?.role !== 'admin') {
    return new Response('Forbidden', { status: 403 });
  }

  // Process request...
});
```

---

## Testing

### Running Authentication Tests

```bash
npm test -- auth
```

### Test Coverage

The test suite includes:
- ✅ Sign-in flow with valid/invalid credentials
- ✅ Sign-up flow with validation
- ✅ Email format validation
- ✅ Password requirements (min 6 characters)
- ✅ Password confirmation matching
- ✅ Session management
- ✅ Sign-out functionality
- ✅ Role-based access control
- ✅ Profile auto-creation on signup
- ✅ Auth state change handling

### Manual Testing Checklist

1. **Sign Up**
   - [ ] Create account with valid email/password
   - [ ] Verify email validation
   - [ ] Check profile is created in `user_profiles`
   - [ ] Confirm email sent (check Supabase logs)

2. **Sign In**
   - [ ] Sign in with created account
   - [ ] Verify session persists on page refresh
   - [ ] Check user info displays in TopBar
   - [ ] Verify role is loaded correctly

3. **Protected Routes**
   - [ ] Access `/dashboard` (should redirect to login if not authenticated)
   - [ ] Sign in and access `/dashboard` (should succeed)
   - [ ] Try accessing `/jobs` as regular user (should redirect to dashboard)
   - [ ] Promote user to analyst and retry (should succeed)

4. **Sign Out**
   - [ ] Click sign out in TopBar
   - [ ] Verify redirect to home or login
   - [ ] Confirm session cleared
   - [ ] Try accessing protected route (should redirect to login)

---

## Security Best Practices

### ✅ Implemented

1. **Environment Variables**: Sensitive keys stored in `.env` (never committed)
2. **Row Level Security (RLS)**: Enabled on `user_profiles` table
3. **Token Storage**: Secure storage in localStorage with automatic refresh
4. **Password Requirements**: Minimum 6 characters (configurable in Supabase)
5. **Email Verification**: Optional email confirmation before access
6. **Session Timeout**: Automatic token refresh (configurable)
7. **HTTPS Only**: Production should always use HTTPS

### 🔒 Recommendations

1. **Enable Email Verification**: In Supabase Dashboard > Authentication > Settings
   - Set "Enable email confirmations" to ON
   - Users must verify email before accessing protected routes

2. **Configure Password Policy**: 
   - Increase minimum password length (8-12 characters recommended)
   - Require uppercase, lowercase, numbers, special characters
   - Configure in Supabase Dashboard > Authentication > Settings

3. **Rate Limiting**:
   - Enable rate limiting in Supabase Dashboard
   - Prevents brute-force attacks on login

4. **Two-Factor Authentication (2FA)**:
   - Enable 2FA in Supabase Dashboard (Pro plan)
   - Require for admin accounts

5. **OAuth Best Practices**:
   - Use OAuth for production (Google, GitHub)
   - Reduces password management risks
   - Configure in Supabase Dashboard > Authentication > Providers

6. **Audit Logging**:
   - Monitor auth events in Supabase Dashboard > Logs
   - Set up alerts for suspicious activity

7. **Regular Security Updates**:
   - Keep Supabase SDK updated
   - Monitor security advisories
   - Review and update dependencies regularly

---

## OAuth Configuration (Optional)

### Google OAuth

1. Create OAuth credentials in Google Cloud Console
2. Add to Supabase Dashboard > Authentication > Providers > Google
3. Configure redirect URLs
4. Add to `.env`:
   ```env
   VITE_GOOGLE_CLIENT_ID="your_google_client_id"
   ```

### GitHub OAuth

1. Create OAuth App in GitHub Settings
2. Add to Supabase Dashboard > Authentication > Providers > GitHub
3. Configure callback URL
4. Add to `.env`:
   ```env
   VITE_GITHUB_CLIENT_ID="your_github_client_id"
   ```

### Implementation

Update `Login.tsx` to include OAuth buttons:
```tsx
import { supabase } from '@/integrations/supabase/client';

const signInWithGoogle = async () => {
  await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/dashboard`
    }
  });
};

// Add button in Login component
<Button onClick={signInWithGoogle} variant="outline">
  <GoogleIcon /> Sign in with Google
</Button>
```

---

## Troubleshooting

### Issue: "User already registered" error
**Solution**: Check if email exists in auth.users table. Either use password reset flow or delete the user and retry.

### Issue: Session not persisting
**Solution**: Check that `persistSession: true` is set in Supabase client configuration. Verify localStorage is not blocked by browser settings.

### Issue: Profile not created on signup
**Solution**: Verify the `on_auth_user_created` trigger exists and is enabled. Check Supabase logs for trigger errors.

### Issue: Redirect loop on protected routes
**Solution**: Verify AuthGate logic. Check that user session is properly loaded before rendering. Add loading state checks.

### Issue: Edge functions return 401 Unauthorized
**Solution**: Ensure Authorization header is passed. Verify Supabase client is initialized with correct anon key. Check RLS policies.

---

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Auth Helpers](https://supabase.com/docs/guides/auth/auth-helpers)
- [OAuth Integration Guide](https://supabase.com/docs/guides/auth/social-login)

---

## Support

For issues or questions:
1. Check this documentation
2. Review Supabase logs in Dashboard > Logs
3. Check browser console for errors
4. Review test files in `src/test/auth.test.ts`
5. Consult team documentation in project README
