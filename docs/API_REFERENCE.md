# API Reference – Supabase Edge Functions

Last updated: 2025-11

This document lists the public Edge Functions relevant to analytics widgets. All endpoints support CORS and accept either JSON bodies (POST) or URL query params (GET). Authentication requirements vary; read the notes for each endpoint.

Base: Supabase Edge Functions
- Local: http://localhost:54321/functions/v1/<name>
- Production: https://<project-id>.supabase.co/functions/v1/<name>

---

## team-streaks

- Method: GET or POST
- Auth: none required (read-only via service role); configure to your needs
- Body/query:
  - teamId: UUID (optional if teamName provided)
  - teamName: string (optional)

Response:
```
{
  team_id: string,
  streaks: {
    overall_winning?: { pattern_type, pattern_name, confidence, strength, prediction_impact, metadata },
    clean_sheet?: { ... },
    btts?: { ... },
    home_winning?: number | null
  }
}
```

Errors: 400 (missing parameters), 404 (team not found), 500 (server errors)

---

## team-transition-matrix

- Method: GET or POST
- Auth: none required (read-only via service role)
- Body/query:
  - teamId: UUID (optional if teamName provided)
  - teamName: string (optional)
  - maxMatches: number (default: 20, min: 5, max: 50)

Response:
```
{
  team_id: string,
  matrix: number[3][3],   // rows: from H,D,V; cols: to H,D,V
  counts: number[3][3],
  sampleSize: number,
  confidence: 'low' | 'medium' | 'high'
}
```

---

## patterns-detect (existing)

- Method: GET or POST
- Auth: required (admin/analyst)
- Body/query:
  - team_id or team_name
  - pattern_types: ["winning_streak", "home_dominance", "high_scoring_trend", "form_surge"]

Persists results to `team_patterns` and returns the upserted rows. See `supabase/functions/patterns-detect/index.ts`.

---

Notes
- For sensitive tables, protect endpoints using RBAC and the helpers in `_shared/auth.ts`.
- Keep service role usage read-only unless absolutely necessary.
