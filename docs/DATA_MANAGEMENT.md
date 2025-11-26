# Data Management Guidelines

Last updated: 2025-11

This document outlines how data is handled in the WinMix TipsterHub project, including storage, retention, privacy, and export.

---

## Storage

- Primary store: Supabase Postgres
- Access: Supabase JS SDK from the frontend and Supabase Edge Functions (Deno)
- Policies: Row Level Security (RLS) enforced on sensitive tables; use service role in Edge Functions for controlled reads/writes

## Retention

- Match data: retain for historical analytics; consider pruning raw logs after 18–24 months
- Prediction outputs: retain aggregated metrics indefinitely; raw probabilities can be compacted by time windows
- Job logs: rotate weekly or on size thresholds, persist summaries

## Privacy

- Do not store secrets in VITE_* variables; store sensitive keys in the `environment_variables` table or Supabase secrets
- Follow the RBAC model: admin/analyst/user; guard Edge Functions with `_shared/auth.ts` helpers when needed

## Export

- Provide CSV exports for matches and predictions via authorized Edge Functions
- Future: PDF/HTML report generation for analyst briefings

## Observability

- Sentry (frontend) via CDN DSN if configured
- Cloudflare Browser Insights (optional) for RUM

## Backups

- Use `supabase db dump` for schema and data backups
- Automate scheduled backups in the hosting provider of your choice

---

For detailed configuration, see `docs/CONFIGURATION_REFERENCE.md` and `docs/OPERATIONS_RUNBOOK.md`.
