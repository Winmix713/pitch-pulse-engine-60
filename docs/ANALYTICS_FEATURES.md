# Analytics Features

Last updated: 2025-11

This document summarizes the core analytics features provided by the WinMix TipsterHub frontend and Edge Functions. It explains the concepts, data flow, and how to use the UI components effectively.

---

## Streak Analysis

- Purpose: surface short-term form signals that analysts can act on
- Types supported:
  - Winning Streak (overall)
  - Clean Sheet Streak (no goals conceded)
  - BTTS Streak (Both Teams To Score)
  - Home Winning Streak (current home-only sequence)
- Backend: Supabase Edge Function `team-streaks` (read-only)
- Frontend: `src/components/analysis/StreakAnalysis.tsx`

Expected payload from `team-streaks`:
```
{
  team_id: string,
  streaks: {
    overall_winning?: { pattern_type, pattern_name, confidence, strength, metadata: { streak_length } },
    clean_sheet?: { ... },
    btts?: { ... },
    home_winning?: number | null
  }
}
```

Notes
- Confidence and strength are simple heuristics intended for UI prioritization, not statistical certainties.
- Minimum streak length defaults to 3 and the last 10 matches are scanned.

---

## Transition Matrix (Markov)

- Purpose: estimate the conditional probability of the next outcome given the previous one
- States: H (win), D (draw), V (loss)
- Smoothing: Laplace (K=3) to improve stability with small samples
- Backend: Supabase Edge Function `team-transition-matrix`
- Frontend: `src/components/analysis/TransitionMatrixHeatmap.tsx`

Sample response:
```
{
  team_id: string,
  matrix: number[3][3],   // probabilities, rows: from H,D,V; cols: to H,D,V
  counts: number[3][3],   // raw transition counts
  sampleSize: number,     // number of transitions (N-1)
  confidence: 'low' | 'medium' | 'high'
}
```

UI
- 3×3 heatmap with tooltips shows P(next | previous).
- Confidence badge reflects sample size thresholds (<10, <20, >=20 transitions).

---

## RNG Validation (Foundations)

- Library: `src/lib/rngValidation.ts`
- Functions:
  - `chiSquareTest(observed, expected)` → { statistic, df, pValue, isRandom }
  - `runsTest(sequence)` → { zScore, isRandom, runsCount, expectedRuns }
  - `detectAnomalies(values, threshold)` → number[] indices

Usage
- Intended for league- or market-level sanity checks and exploratory dashboards.
- Use with care: the included distribution approximations are suitable for indicative analysis; prefer vetted statistical packages for production-grade inference.

---

## Component Integration

Team Detail page (`src/pages/TeamDetail.tsx`) integrates:
- Team Patterns (persistent DB-backed signals)
- Streak Analysis (current sequences)
- Transition Matrix Heatmap (Markov transitions)

All widgets degrade gracefully if Edge Functions are unavailable or the user is not authenticated.
