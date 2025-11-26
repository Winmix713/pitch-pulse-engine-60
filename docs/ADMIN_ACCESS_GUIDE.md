# Admin Access Guide - takosadam@gmail.com

## Quick Reference
- **Email**: takosadam@gmail.com
- **UID**: 838803e7-bc4f-4722-89ac-4c94c923f785
- **Role**: admin
- **Status**: Active

## What You Can Access

### 🎨 Frontend Routes
All admin panel routes are accessible at:

| Route | Description |
|-------|-------------|
| `/admin` | Main Admin Dashboard |
| `/admin/users` | User Management (Admin Only) |
| `/admin/jobs` | Scheduled Jobs Management |
| `/admin/phase9` | Phase 9 Collaborative Intelligence Settings |
| `/admin/health` | System Health Dashboard |
| `/admin/stats` | System Statistics |
| `/admin/integrations` | External Integrations |
| `/admin/model-status` | Model Status & Registry |
| `/admin/feedback` | User Feedback Inbox |
| `/admin/environment` | Environment Variables (Admin Only) |
| `/admin/models` | Model Management |
| `/admin/matches` | Match Data Management |
| `/admin/monitoring` | System Monitoring |

### 🗄️ Database Access
Full read/write access to all tables including:

**User & Auth**
- user_profiles (full control)
- auth.users metadata

**Core Data**
- matches, teams, leagues
- predictions, user_predictions
- patterns, detected_patterns, team_patterns

**Analytics & Performance**
- model_performance, model_comparison
- pattern_accuracy
- cross_league_correlations, meta_patterns

**System Operations**
- scheduled_jobs, job_execution_logs
- system_health, performance_metrics
- computation_graph

**Admin-Specific**
- environment_variables
- audit_log, admin_audit_log
- phase9_settings
- admin_invites

**Recent Features**
- model_override_log
- system_logs
- prediction_review_log
- retrain_suggestion_log
- feedback_inbox

### 🔌 Edge Functions
All admin Edge Functions are accessible, including:

**Model Management**
- `admin-model-analytics`
- `admin-model-promote`
- `admin-model-trigger-training`
- `admin-model-system-status`

**Data Management**
- `admin-import-matches-csv`
- `admin-import-env`
- `admin-prediction-review`

**Job Management**
- `jobs-create`, `jobs-update`, `jobs-delete`
- `jobs-list`, `jobs-logs`, `jobs-trigger`, `jobs-toggle`
- `jobs-scheduler`

**And all other system functions...**

## Security Features

### ✅ What's Protected
1. **RLS Bypass**: Your admin role bypasses all Row-Level Security policies
2. **Audit Trail**: All your admin actions are logged to `admin_audit_log`
3. **Full Permissions**: Access to all CRUD operations on all tables
4. **Service Role Equivalent**: Your access level is equivalent to the service role for most operations

### 🔒 Security Notes
- Your admin privileges are permanent (set via database migration)
- All actions are audited for security compliance
- Admin access cannot be revoked without running a new migration
- RLS policies will always recognize your role via the `is_admin()` function

## How It Works

### Authentication Flow
1. Login with `takosadam@gmail.com`
2. System fetches your profile from `user_profiles` → role = 'admin'
3. Frontend routes check role via `RoleGate` component → grants access
4. Database queries execute with `auth.uid()` = your UID
5. RLS policies call `is_admin()` → returns true → grants full access
6. Edge Functions verify role from profile → grants access

### Technical Details
- Role stored in: `user_profiles.role` (PostgreSQL enum: `public.user_role`)
- Admin check function: `public.is_admin()` returns `BOOLEAN`
- Frontend auth: `AuthProvider` + `RoleGate` components
- Backend auth: RLS policies + Edge Function helpers

## Verification

### Check Your Setup
Run this SQL query in Supabase SQL Editor:
```sql
SELECT 
  id, email, role::text, is_active 
FROM public.user_profiles 
WHERE email = 'takosadam@gmail.com';
```

Expected result:
- `role` = "admin"
- `is_active` = true

### Test Access
1. Login to the application
2. Navigate to `/admin`
3. Verify all dashboards load without errors
4. Check that you can view/edit data in admin panels

### Run Full Verification
Execute the verification script:
```bash
psql <connection_string> -f scripts/verify_admin_setup.sql
```

## Troubleshooting

### Can't Access Admin Routes
1. **Clear browser cache and cookies**
2. **Logout and login again** to refresh the session
3. **Check profile**: Run verification query above
4. **Check browser console** for any errors

### 403 Forbidden Errors
- Ensure you're logged in with `takosadam@gmail.com`
- Verify your profile role is 'admin' (run verification query)
- Check that `is_active = true` in your profile
- Try refreshing the page

### Database Access Issues
- RLS policies should automatically grant access
- Verify the `is_admin()` function exists
- Check that policies use `public.is_admin()` in their definitions
- Contact system administrator if policies are missing

## Support

### Migration File
The admin setup is defined in:
```
supabase/migrations/20260115000000_setup_admin_takosadam.sql
```

### Documentation
- Full setup details: `docs/ADMIN_SETUP_TAKOSADAM.md`
- Verification script: `scripts/verify_admin_setup.sql`

### Need Help?
If you encounter any issues:
1. Run the verification script first
2. Check the browser console for errors
3. Review the migration file for any issues
4. Contact the development team with:
   - Your UID
   - The error message
   - The route or operation you were attempting
