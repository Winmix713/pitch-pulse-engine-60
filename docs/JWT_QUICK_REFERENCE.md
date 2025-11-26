# JWT Verification Quick Reference

**Quick guide for developers working with Edge Functions**

---

## 📋 Quick Checks

### Verify JWT Configuration
```bash
./scripts/verify-jwt-config.sh
```

### Check Function Status
```bash
# List all functions
ls -1 supabase/functions | grep -v "^_shared$"

# Count configured functions
grep -c "^\[functions\." supabase/config.toml
```

### Test JWT Enforcement
```bash
# Test public endpoint (should work)
curl -X POST https://<project-ref>.supabase.co/functions/v1/get-predictions \
  -H "Content-Type: application/json" \
  -H "apikey: <ANON_KEY>" \
  -d '{}'

# Test protected endpoint (should return 401)
curl -X POST https://<project-ref>.supabase.co/functions/v1/analyze-match \
  -H "Content-Type: application/json" \
  -H "apikey: <ANON_KEY>" \
  -d '{}'
```

---

## 🔐 Adding New Functions

When creating a new Edge Function, **always** add it to `supabase/config.toml`:

### For Protected Functions (default)
```toml
[functions.your-new-function]
verify_jwt = true
```

### For Public Functions (rare)
```toml
[functions.your-new-function]
verify_jwt = false
```

**⚠️ Important**: Public functions should be rare. Only use `verify_jwt = false` for:
- Read-only endpoints
- Demo/preview functionality
- No sensitive data access

---

## 📊 Current Status

- **Total Functions**: 33
- **Public**: 1 (`get-predictions`)
- **Protected**: 32 (all others)
- **Security Posture**: ✅ EXCELLENT

---

## 🎯 Function Categories

### Public (1)
- `get-predictions` - Read-only predictions

### Protected (32)
- **Admin Operations** (2): `admin-import-*`
- **Predictions** (4): `analyze-match`, `predictions-*`, `submit-feedback`
- **Jobs** (8): `jobs-*`
- **Patterns** (5): `patterns-*`, `meta-patterns-*`
- **Models** (3): `models-*`
- **Cross-League** (2): `cross-league-*`
- **Monitoring** (4): `monitoring-*`
- **Phase 9** (4): `phase9-*`

---

## 🛠️ Common Tasks

### Deploy Functions
```bash
supabase functions deploy --project-ref wclutzbojatqtxwlvtab
```

### View Function Logs
```bash
supabase functions logs <function-name> --project-ref wclutzbojatqtxwlvtab
```

### Test Locally
```bash
supabase functions serve
curl -X POST http://localhost:54321/functions/v1/<function-name> -d '{}'
```

---

## ⚠️ Troubleshooting

### 401 Unauthorized
- JWT token missing or invalid
- Get fresh token by signing in

### 403 Forbidden
- User doesn't have required role
- Check user role in `user_profiles` table

### Function Not Found
- Function not deployed
- Run `supabase functions deploy`

---

## 📚 Documentation

- **Full Guide**: `docs/JWT_VERIFICATION_TESTING.md`
- **Security Overview**: `docs/SECURITY_IMPLEMENTATION_SUMMARY.md`
- **Operations**: `docs/OPERATIONS_RUNBOOK.md`

---

## ✅ Pre-Deployment Checklist

Before deploying to production:

- [ ] Run `./scripts/verify-jwt-config.sh`
- [ ] Run `npm run build`
- [ ] Review `supabase/config.toml` changes
- [ ] Test JWT enforcement locally
- [ ] Deploy to staging first
- [ ] Verify in production

---

**Last Updated**: December 2024  
**Status**: Active ✅
