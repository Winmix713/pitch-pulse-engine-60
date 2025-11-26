# Frontend Core Shell Architecture

This document describes the foundational architecture of the WinMix TipsterHub frontend, including the core shell that wires together routing, authentication, data fetching, and shared UI components.

## Overview

The frontend is built as a React 19 + TypeScript SPA using Vite, with the following key technologies:

- **Routing**: React Router v6 with lazy loading and route protection
- **State Management**: TanStack Query for server state, React Context for auth
- **Authentication**: Supabase Auth with role-based access control (RBAC)
- **UI**: Tailwind CSS + shadcn/ui component library
- **Data Fetching**: Standardized edge function calls with error handling
- **Environment**: Validated configuration with feature flags

## Core Architecture

### 1. Environment Configuration (`src/config/env.ts`)

All environment variables are validated at startup using Zod schemas:

```typescript
// Core Supabase configuration
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_SUPABASE_PUBLISHABLE_KEY

// Environment
VITE_ENV="development" | "staging" | "production"

// Feature flags for Phase 5-9 features
VITE_FEATURE_PHASE5="false"
VITE_FEATURE_PHASE6="false"
VITE_FEATURE_PHASE7="false"
VITE_FEATURE_PHASE8="false"
VITE_FEATURE_PHASE9="false"

// API origins (optional)
VITE_API_ORIGIN
VITE_EDGE_FUNCTION_ORIGIN
```

**Usage:**
```typescript
import { env, phaseFlags, isDev } from '@/config/env';

// Access validated environment variables
const supabaseUrl = env.VITE_SUPABASE_URL;

// Check feature flags
if (phaseFlags.phase6) {
  // Phase 6 features are enabled
}

// Environment helpers
if (isDev()) {
  console.log('Development mode');
}
```

### 2. Authentication & Authorization

#### AuthProvider (`src/providers/AuthProvider.tsx`)

Provides authentication context with role-based access control:

```typescript
interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName?: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  
  // Role-based helpers
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  isAdmin: () => boolean;
  isAnalyst: () => boolean;
}
```

#### Auth Hooks (`src/hooks/useAuth.tsx`)

Convenience hooks for authentication and authorization:

```typescript
// Basic auth hook
const { user, profile, loading, signIn, signOut } = useAuth();

// Require authentication
const { loading, authenticated } = useRequireAuth();

// Require specific roles
const { loading, authorized, error } = useRequireRole(['admin', 'analyst']);

// Specific role helpers
const { authorized } = useRequireAdmin();
const { authorized } = useRequireAnalystOrAdmin();
```

#### Role-Based Access Control (RBAC)

The system supports three user roles:
- **`admin`**: Full access to all features and admin panels
- **`analyst`**: Access to analytics, models, and monitoring features
- **`user`**: Basic access to predictions and public features

### 3. Routing Architecture

#### AppRoutes (`src/components/AppRoutes.tsx`)

Centralized routing with lazy loading and protection:

```typescript
// Protected route with role requirements
<Route path="/admin" element={
  <ProtectedRoute requiredRoles={['admin', 'analyst']}>
    <AdminDashboard />
  </ProtectedRoute>
} />

// Phase-gated routes
{isPhase6Enabled && (
  <Route path="/models" element={
    <ProtectedRoute>
      <ModelsPage />
    </ProtectedRoute>
  } />
)}
```

#### Route Protection

Two main route wrappers handle authentication and authorization:

- **`PublicRoute`**: No authentication required, optional sidebar
- **`ProtectedRoute`**: Requires authentication, optional role requirements

### 4. Layout System

#### AppLayout (`src/components/layout/AppLayout.tsx`)

Shared layout component with:

- Responsive sidebar navigation
- Error boundaries
- Suspense boundaries for lazy loading
- Toast notification integration

```typescript
<AppLayout showSidebar={true} withErrorBoundary={true}>
  <PageContent />
</AppLayout>
```

#### Sidebar (`src/components/navigation/Sidebar.tsx`)

Dynamic navigation that:
- Shows/hides items based on user roles
- Respects phase feature flags
- Provides tooltips and active states
- Supports both desktop and mobile layouts

### 5. Data Fetching Architecture

#### API Client (`src/lib/apiClient.ts`)

Standardized client for:
- Edge function calls with timeout and retry logic
- Direct Supabase table operations
- Consistent error handling and logging

```typescript
// Edge function calls
const { data, error } = await callEdgeFunction('models-performance', {
  method: 'GET',
  timeout: 10000,
});

// Supabase operations
const { data, error } = await apiClient.select('user_profiles', {
  filter: { role: 'admin' },
  orderBy: { column: 'created_at', ascending: false },
});
```

#### Edge Function Hooks (`src/hooks/useEdgeFunction.ts`)

React Query integration for consistent data fetching:

```typescript
// Query hook
const { data, loading, error } = useEdgeFunctionQuery({
  functionName: 'jobs-list',
  options: { method: 'GET' },
});

// Mutation hook
const mutation = useEdgeFunctionMutation({
  functionName: 'jobs-create',
  onSuccess: (data) => console.log('Job created:', data),
});
```

#### Pre-configured Hooks

Commonly used hooks for specific edge functions:
- `useJobsList()`, `useJobCreate()`, `useJobToggle()`
- `useModelsPerformance()`, `useModelCompare()`
- `useMonitoringMetrics()`, `useAnalyticsData()`
- `usePhase9CollaborativeIntelligence()`
- `useCrossLeagueAnalyze()`, `usePatternsDetect()`

### 6. UI Component System

#### Shared Primitives

- **`PageLoading`**: Consistent loading states with optional skeletons
- **`FormShell`**: Standardized form wrapper with error handling
- **`ToastPortal`**: Global toast notification system
- **`ErrorBoundary`**: React error boundary with logging

#### shadcn/ui Integration

Full integration with shadcn/ui component library:
- Consistent design system
- TypeScript support
- Tailwind CSS styling
- Accessibility features

### 7. Feature Flag System

#### FeatureFlagsProvider (`src/providers/FeatureFlagsProvider.tsx`)

Environment-based feature flags for Phase 5-9 features:

```typescript
const { isEnabled } = useFeatureFlags();

// Check specific phase
if (isEnabled('phase6')) {
  // Show model evaluation features
}
```

#### Phase Flags Hook (`src/hooks/usePhaseFlags.tsx`)

Convenience hook for phase-specific flags:

```typescript
const { 
  isPhase5Enabled, 
  isPhase6Enabled, 
  isPhase7Enabled, 
  isPhase8Enabled, 
  isPhase9Enabled 
} = usePhaseFlags();
```

## Environment Configuration

### Development Setup

1. Copy `.env.example` to `.env.local`
2. Configure Supabase credentials
3. Enable desired feature flags:
   ```bash
   VITE_FEATURE_PHASE6="true"  # Enable model evaluation
   VITE_FEATURE_PHASE8="true"  # Enable monitoring
   ```

### Production Deployment

Environment variables are validated at startup, preventing runtime errors from missing configuration.

### Local vs Hosted Supabase

Switch between local Docker Supabase and hosted instances by updating environment variables:

```bash
# Local development
VITE_SUPABASE_URL="http://localhost:54321"
VITE_SUPABASE_ANON_KEY="your-local-anon-key"

# Production
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-production-anon-key"
```

## Testing Strategy

### Unit Tests

- **Providers**: Test authentication and feature flag logic
- **Hooks**: Test data fetching and state management
- **Components**: Test UI rendering and interactions
- **Utilities**: Test helper functions and validators

### Integration Tests

- **Routing**: Test route protection and navigation
- **Authentication**: Test login/logout flows
- **API Integration**: Test edge function calls
- **Feature Flags**: Test conditional rendering

### Test Utilities

Helper functions for testing with providers:

```typescript
import { renderWithProviders } from '@/test-utils';

renderWithProviders(<ComponentUnderTest />);
```

## Performance Optimizations

### Code Splitting

- Route-based lazy loading
- Component-level lazy loading for heavy components
- Dynamic imports for admin panels

### Data Fetching

- TanStack Query caching with 5-minute stale time
- Background refetching on window focus (dev only)
- Intelligent retry logic with exponential backoff

### Bundle Optimization

- Tree shaking for unused imports
- Environment-specific builds
- Asset optimization and compression

## Security Considerations

### Authentication

- JWT token management with Supabase
- Automatic token refresh
- Session persistence

### Authorization

- Server-side role validation in edge functions
- Client-side route protection for UX
- Role-based UI component visibility

### Data Protection

- Environment variable validation
- No hardcoded secrets in frontend
- Secure API communication via HTTPS

## Development Workflow

### Adding New Features

1. **Environment**: Add any new environment variables to `src/config/env.ts`
2. **Feature Flags**: Add phase-specific flags if needed
3. **Routing**: Add routes with appropriate protection
4. **API**: Use standardized edge function hooks
5. **UI**: Follow component patterns and use shared primitives

### Best Practices

- Use TypeScript for all new code
- Follow existing naming conventions
- Add tests for new functionality
- Update documentation for API changes
- Use consistent error handling patterns

## Migration Guide

### From Legacy Routing

Old routing patterns are still supported for backward compatibility:

```typescript
// Old pattern (still works)
<Route path="/admin/jobs" element={
  <AuthGate>
    <RoleGate allowedRoles={['admin', 'analyst']}>
      <JobsPage />
    </RoleGate>
  </AuthGate>
} />

// New pattern (recommended)
<Route path="/admin/jobs" element={
  <ProtectedRoute requiredRoles={['admin', 'analyst']}>
    <JobsPage />
  </ProtectedRoute>
} />
```

### Environment Variable Migration

Legacy environment variables are automatically mapped to new validation schema:

```typescript
// These are still supported
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY

// But these are preferred
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

## Troubleshooting

### Common Issues

1. **Environment validation errors**: Check `.env` file for missing variables
2. **Route protection failures**: Verify user roles in database
3. **Feature flags not working**: Check environment configuration
4. **API call failures**: Check edge function deployment status

### Debug Mode

Enable detailed logging in development:

```typescript
import { isDev } from '@/config/env';

if (isDev()) {
  console.log('Debug information');
}
```

## Future Enhancements

### Planned Improvements

- **Real-time updates**: WebSocket integration for live data
- **Offline support**: Service worker for offline functionality
- **Performance monitoring**: Integration with APM tools
- **Advanced caching**: Local storage for frequently accessed data
- **Internationalization**: Multi-language support

### Scalability Considerations

- Micro-frontend architecture for large teams
- Component library extraction for shared usage
- Advanced state management for complex scenarios
- Performance budgets and monitoring

---

This architecture provides a solid foundation for the WinMix TipsterHub frontend, enabling rapid development while maintaining code quality, security, and performance.