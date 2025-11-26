# JWT Verification Testing Guide

## Overview

This document provides testing procedures for verifying JWT verification enforcement on Supabase Edge Functions.

**Last Updated**: December 2024  
**Configuration File**: `supabase/config.toml`

---

## Quick Verification

### Automated Verification Script

Run the automated verification script to check JWT configuration:

```bash
./scripts/verify-jwt-config.sh
```

**Expected Output**:
```
✅ JWT CONFIGURATION VERIFICATION PASSED

All Edge Functions are properly configured with explicit JWT verification settings.
Security posture: ✅ EXCELLENT

Function Statistics:
- Total Functions: 33
- Public (verify_jwt = false): 1
- Protected (verify_jwt = true): 32

Public Functions:
- get-predictions
```

---

## Manual Testing

### Prerequisites

1. **Local Supabase Instance** (optional):
   ```bash
   supabase start
   ```

2. **Get Test JWT Token**:
   - Sign in to your application
   - Open browser DevTools → Application → Local Storage
   - Copy the JWT token from `sb-<project-id>-auth-token`

3. **Get Anon Key**:
   - From `.env` file: `VITE_SUPABASE_ANON_KEY`
   - Or from Supabase Dashboard: Settings → API

---

## Test Cases

### Test 1: Public Function (Unauthenticated Access)

**Function**: `get-predictions`  
**Expected**: ✅ Should succeed without authentication

```bash
curl -X POST \
  https://<project-ref>.supabase.co/functions/v1/get-predictions \
  -H "Content-Type: application/json" \
  -H "apikey: <ANON_KEY>" \
  -d '{
    "matchId": "123e4567-e89b-12d3-a456-426614174000"
  }'
```

**Expected Response**: `200 OK` with prediction data

---

### Test 2: Protected Function (No Authentication)

**Function**: `analyze-match`  
**Expected**: ❌ Should fail without authentication

```bash
curl -X POST \
  https://<project-ref>.supabase.co/functions/v1/analyze-match \
  -H "Content-Type: application/json" \
  -H "apikey: <ANON_KEY>" \
  -d '{
    "matchId": "123e4567-e89b-12d3-a456-426614174000"
  }'
```

**Expected Response**: `401 Unauthorized`
```json
{
  "error": "Unauthorized"
}
```

---

### Test 3: Protected Function (With Authentication)

**Function**: `analyze-match`  
**Expected**: ✅ Should succeed with valid JWT (if user has required role)

```bash
curl -X POST \
  https://<project-ref>.supabase.co/functions/v1/analyze-match \
  -H "Content-Type: application/json" \
  -H "apikey: <ANON_KEY>" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -d '{
    "matchId": "123e4567-e89b-12d3-a456-426614174000"
  }'
```

**Expected Response** (if user is admin/analyst): `200 OK` with analysis data  
**Expected Response** (if user is regular user): `403 Forbidden`

---

### Test 4: Protected Function (Insufficient Role)

**Function**: `models-auto-prune` (admin-only)  
**Expected**: ❌ Should fail for non-admin users

```bash
curl -X POST \
  https://<project-ref>.supabase.co/functions/v1/models-auto-prune \
  -H "Content-Type: application/json" \
  -H "apikey: <ANON_KEY>" \
  -H "Authorization: Bearer <USER_JWT_TOKEN>" \
  -d '{}'
```

**Expected Response**: `403 Forbidden`
```json
{
  "error": "Admin access required"
}
```

---

### Test 5: All Job Management Functions

Test that all job management functions require authentication:

```bash
# Test each endpoint
for func in jobs-create jobs-delete jobs-list jobs-logs jobs-toggle jobs-trigger jobs-update; do
  echo "Testing $func..."
  curl -X POST \
    https://<project-ref>.supabase.co/functions/v1/$func \
    -H "Content-Type: application/json" \
    -H "apikey: <ANON_KEY>" \
    -d '{}'
  echo ""
done
```

**Expected**: All should return `401 Unauthorized`

---

### Test 6: All Monitoring Functions

Test that monitoring functions require authentication:

```bash
# Test each endpoint
for func in monitoring-health monitoring-metrics monitoring-alerts monitoring-computation-graph; do
  echo "Testing $func..."
  curl -X GET \
    https://<project-ref>.supabase.co/functions/v1/$func \
    -H "apikey: <ANON_KEY>"
  echo ""
done
```

**Expected**: All should return `401 Unauthorized`

---

### Test 7: Phase 9 Functions (Feature Flagged)

Test Phase 9 functions with authentication:

```bash
curl -X POST \
  https://<project-ref>.supabase.co/functions/v1/phase9-collaborative-intelligence \
  -H "Content-Type: application/json" \
  -H "apikey: <ANON_KEY>" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -d '{
    "matchId": "123e4567-e89b-12d3-a456-426614174000"
  }'
```

**Expected** (if PHASE9_ENABLED=false): `503 Service Unavailable`
```json
{
  "error": "Feature disabled",
  "message": "Phase 9 collaborative intelligence is currently disabled"
}
```

**Expected** (if PHASE9_ENABLED=true): `200 OK` with data (if authenticated)  
**Expected** (if not authenticated): `401 Unauthorized`

---

## Testing with Supabase CLI (Local)

### Start Local Supabase

```bash
supabase start
```

### Serve Functions Locally

```bash
supabase functions serve
```

### Test Local Function

```bash
curl -X POST http://localhost:54321/functions/v1/analyze-match \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <LOCAL_JWT_TOKEN>" \
  -d '{
    "matchId": "123e4567-e89b-12d3-a456-426614174000"
  }'
```

---

## Automated Testing Script

Create a comprehensive test script:

```bash
#!/bin/bash

# JWT Verification Test Suite

ANON_KEY="your_anon_key"
PROJECT_REF="your_project_ref"
JWT_TOKEN="your_jwt_token"

BASE_URL="https://${PROJECT_REF}.supabase.co/functions/v1"

# Test public function (should succeed)
echo "Testing public function..."
response=$(curl -s -w "\n%{http_code}" -X POST \
  "$BASE_URL/get-predictions" \
  -H "Content-Type: application/json" \
  -H "apikey: $ANON_KEY" \
  -d '{"matchId": "123e4567-e89b-12d3-a456-426614174000"}')

http_code=$(echo "$response" | tail -n1)
if [ "$http_code" = "200" ]; then
  echo "✅ Public function works without auth"
else
  echo "❌ Public function failed (expected 200, got $http_code)"
fi

# Test protected function without auth (should fail)
echo ""
echo "Testing protected function without auth..."
response=$(curl -s -w "\n%{http_code}" -X POST \
  "$BASE_URL/analyze-match" \
  -H "Content-Type: application/json" \
  -H "apikey: $ANON_KEY" \
  -d '{"matchId": "123e4567-e89b-12d3-a456-426614174000"}')

http_code=$(echo "$response" | tail -n1)
if [ "$http_code" = "401" ]; then
  echo "✅ Protected function blocks unauthenticated requests"
else
  echo "❌ Protected function should return 401, got $http_code"
fi

# Test protected function with auth (should succeed or 403)
echo ""
echo "Testing protected function with auth..."
response=$(curl -s -w "\n%{http_code}" -X POST \
  "$BASE_URL/analyze-match" \
  -H "Content-Type: application/json" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{"matchId": "123e4567-e89b-12d3-a456-426614174000"}')

http_code=$(echo "$response" | tail -n1)
if [ "$http_code" = "200" ] || [ "$http_code" = "403" ]; then
  echo "✅ Protected function accepts authenticated requests"
else
  echo "❌ Protected function failed (expected 200 or 403, got $http_code)"
fi

echo ""
echo "JWT verification testing complete!"
```

---

## Troubleshooting

### Issue: 401 Unauthorized on All Functions

**Possible Causes**:
1. JWT token expired
2. Invalid JWT token format
3. Supabase project not properly configured

**Solution**:
- Get a fresh JWT token by signing in again
- Verify token format: `Bearer <token>`
- Check Supabase Dashboard → Settings → API

---

### Issue: 403 Forbidden

**Possible Causes**:
1. User doesn't have required role
2. User profile not created

**Solution**:
- Check user role in database:
  ```sql
  SELECT id, email, role FROM user_profiles WHERE id = '<user_id>';
  ```
- Update role if needed:
  ```sql
  UPDATE user_profiles SET role = 'analyst' WHERE id = '<user_id>';
  ```

---

### Issue: Public Function Returns 401

**Possible Causes**:
1. `verify_jwt` not set to `false` in config
2. Config not deployed

**Solution**:
- Verify config.toml:
  ```toml
  [functions.get-predictions]
  verify_jwt = false
  ```
- Redeploy functions:
  ```bash
  supabase functions deploy --project-ref <PROJECT_ID>
  ```

---

### Issue: Protected Function Doesn't Require Auth

**Possible Causes**:
1. `verify_jwt` not set to `true` in config
2. Config not deployed

**Solution**:
- Verify config.toml:
  ```toml
  [functions.analyze-match]
  verify_jwt = true
  ```
- Run verification script:
  ```bash
  ./scripts/verify-jwt-config.sh
  ```
- Redeploy functions

---

## Verification Checklist

Before deploying to production:

- [ ] Run `./scripts/verify-jwt-config.sh` - all checks pass
- [ ] Test public function without auth - succeeds
- [ ] Test protected function without auth - returns 401
- [ ] Test protected function with valid JWT - succeeds (if authorized)
- [ ] Test protected function with insufficient role - returns 403
- [ ] Verify all 33 functions have explicit JWT settings
- [ ] Review audit logs to ensure actions are being logged
- [ ] Test feature flags (Phase 5-9 functions)

---

## Related Documentation

- **SECURITY_IMPLEMENTATION_SUMMARY.md**: Complete security overview
- **EDGE_FUNCTIONS_RBAC.md**: Detailed RBAC implementation
- **CONFIGURATION_REFERENCE.md**: Environment configuration
- **OPERATIONS_RUNBOOK.md**: Deployment procedures

---

**Document Version**: 1.0  
**Last Updated**: December 2024  
**Status**: Active ✅
