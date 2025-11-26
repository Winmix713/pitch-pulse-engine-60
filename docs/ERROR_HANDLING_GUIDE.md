# Error Handling Guide

## Common Errors & Solutions

### 1. Supabase Connection Errors
- Verify VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env
- Check network connectivity and CORS settings
- Review RLS policies if queries fail with 401/403

### 2. Authentication Errors
- Verify user role in user_profiles
- Check token expiration and refresh logic
- Clear browser storage and retry login

### 3. Type Errors
- Run `npm run type-check` to catch TypeScript errors
- Verify interfaces in `src/types/*`
- Ensure mock data structure matches DB schema

## Architecture
- Global error boundary: `src/components/ErrorBoundary.tsx`
- API error middleware: `src/lib/api-error-handler.ts`
- Validation error formatter: `src/lib/validation-error-handler.ts`
- Logger: `src/lib/logger.ts`
- Performance monitoring: `src/lib/performance-monitor.ts`

## Operational Notes
- All privileged operations must be audited to admin_audit_log via Edge Functions
- All sensitive tables use RLS with deny-by-default policies
- Health monitoring integrates with Edge Functions under `monitoring-*`
