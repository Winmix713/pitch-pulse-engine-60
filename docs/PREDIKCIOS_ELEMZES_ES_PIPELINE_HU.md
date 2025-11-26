# Predikciós Elemzés és Pipeline – Teljes Áttekintés

## Tartalom

1. [Áttekintés](#áttekintés)
2. [Architektúra Diagram](#architektúra-diagram)
3. [Frontend Komponensek](#frontend-komponensek)
4. [Supabase Edge Functions](#supabase-edge-functions)
5. [Adatbázis Táblák](#adatbázis-táblák)
6. [Python ML Backend](#python-ml-backend)
7. [Feedback Loop és Admin Triage](#feedback-loop-és-admin-triage)
8. [Auto-Reinforcement Workflow](#auto-reinforcement-workflow)
9. [Rendszer Naplózás](#rendszer-naplózás)
10. [Parancsok és Tesztek](#parancsok-és-tesztek)

---

## Áttekintés

A WinMix TipsterHub predikciós rendszere egy végpontok közötti ML pipeline, amely:
- **Előrejelzéseket generál** meccsekre három almodell (full-time, half-time, pattern-based) összegzésével
- **Felhasználói visszajelzéseket gyűjt** a tényleges eredményekről
- **Admin felülvizsgálatot biztosít** a blokkolt/bizonytalan predikciókhoz
- **Automatikusan újratanítja** a modellt napi időközönként vagy kézi kérésre
- **Naplózza a rendszer eseményeket** hibakereséshez és auditáláshoz

Az adatfolyam a következő lépéseken keresztül halad:
1. Felhasználó kér előrejelzést a UI-n keresztül
2. Edge Function hívja a Python ML motort
3. Predikció elmentésre kerül az adatbázisba
4. Felhasználó visszajelzést ad a tényleges eredményről
5. Admin felülvizsgálja a blokkolt előrejelzéseket
6. Napi/kézi újratanítás hibaadatok alapján

---

## Architektúra Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React + TypeScript)                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  PredictionsView.tsx                                                     │
│  ├─ Listázza az összes predikciót (predictions tábla)                   │
│  ├─ Frissítés gomb → újra lekérdezi az adatokat                         │
│  └─ Új predikció gomb → navigál /predictions/new-ra                     │
│                                                                           │
│  PredictionDisplay.tsx                                                   │
│  ├─ Megjeleníti az egyedi előrejelzés részleteit                        │
│  ├─ Ensemble lebontás (FT, HT, PT modellek)                             │
│  ├─ Konfidencia downgrade jelzések                                      │
│  ├─ Detektált pattern-ek                                                │
│  └─ Magyarázatok és döntési fa                                          │
│                                                                           │
│  PredictionResults.tsx                                                   │
│  ├─ Bulk predikciós eredmények megjelenítése                           │
│  ├─ Forma pontszámok                                                    │
│  ├─ Detektált minták                                                    │
│  └─ FeedbackForm → eredmények rögzítése                                │
│                                                                           │
│  FeedbackForm.tsx                                                        │
│  ├─ Félidő és végeredmény bevitel                                      │
│  ├─ Validáció (halftime ≤ fulltime)                                    │
│  └─ submit-feedback Edge Function hívása                               │
│                                                                           │
│  MonitoringPage.tsx                                                      │
│  ├─ Auto Reinforcement státusz kártya                                   │
│  ├─ Legutóbbi újratanítás metrikái                                     │
│  ├─ Kézi újratanítás trigger gomb                                      │
│  └─ useLatestRetrainingRun query hook                                  │
│                                                                           │
│  Admin/FeedbackInboxPanel.tsx                                            │
│  ├─ Összes felhasználói visszajelzés listázása                         │
│  ├─ Megoldott/függő státusz kezelés                                    │
│  ├─ CSV export funkció                                                 │
│  └─ Predikció részletek megtekintése                                   │
│                                                                           │
│  Admin/PredictionReviewPanel.tsx                                         │
│  ├─ Blokkolt előrejelzések listázása                                   │
│  ├─ admin-prediction-review service                                    │
│  ├─ Elfogadás/elutasítás műveletek                                    │
│  └─ Auto-refresh 30 másodpercenként                                    │
│                                                                           │
└──────────────────────┬───────────────────────────────────────────────────┘
                       │
                       │ HTTP (Supabase Client SDK)
                       │
┌──────────────────────▼───────────────────────────────────────────────────┐
│                    SUPABASE EDGE FUNCTIONS (Deno)                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  get-predictions                                                         │
│  ├─ SELECT * FROM predictions + joins (match, teams, league)           │
│  ├─ Szűrés státusz alapján (scheduled/finished)                        │
│  └─ Limit/pagination támogatás                                         │
│                                                                           │
│  predictions-track                                                       │
│  ├─ INSERT INTO predictions                                            │
│  ├─ Validáció: PredictionInputSchema (Zod)                            │
│  ├─ Ensemble breakdown, konfidencia, CSS score                        │
│  └─ BTTS, over/under, predicted scores                                │
│                                                                           │
│  predictions-update-results                                              │
│  ├─ UPDATE predictions (actual_outcome, was_correct)                   │
│  ├─ Kalibrációs hiba számítása                                        │
│  └─ Pattern accuracy frissítése                                        │
│                                                                           │
│  submit-feedback                                                         │
│  ├─ RBAC védelem: requireAdminOrAnalyst                               │
│  ├─ UPDATE matches (home_score, away_score, status)                   │
│  ├─ Félidő eredmények tárolása                                        │
│  ├─ Tényleges kimenetel meghatározása                                 │
│  ├─ UPDATE predictions (was_correct, calibration_error)               │
│  ├─ Pattern accuracy frissítése (detected_patterns)                   │
│  ├─ Template confidence adjustment (RPC: adjust_template_confidence)  │
│  └─ Audit log bejegyzés                                               │
│                                                                           │
│  admin-prediction-review                                                 │
│  ├─ RBAC védelem: requireAdmin                                         │
│  ├─ SELECT blokkolt predikciók (prediction_status='blocked/uncertain')│
│  ├─ INSERT INTO prediction_review_log (action, notes)                 │
│  ├─ UPDATE predictions (prediction_status='active')                   │
│  └─ Felülvizsgáló email mentése                                       │
│                                                                           │
└──────────────────────┬───────────────────────────────────────────────────┘
                       │
                       │ PostgreSQL + Row Level Security
                       │
┌──────────────────────▼───────────────────────────────────────────────────┐
│                      SUPABASE DATABASE (PostgreSQL)                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  predictions                                                             │
│  ├─ id, match_id, predicted_outcome, confidence_score                  │
│  ├─ actual_outcome, was_correct, calibration_error                     │
│  ├─ ensemble_breakdown (jsonb), css_score                              │
│  ├─ prediction_status (active/uncertain/blocked)                       │
│  ├─ blocked_reason, alternate_outcome                                  │
│  ├─ downgraded_from_confidence                                         │
│  └─ explanation (jsonb), decision_path (jsonb)                         │
│                                                                           │
│  feedback                                                                │
│  ├─ id, prediction_id, user_suggestion                                 │
│  ├─ submitted_by (user_id)                                             │
│  ├─ resolved (boolean)                                                 │
│  └─ metadata (jsonb)                                                   │
│                                                                           │
│  prediction_review_log                                                   │
│  ├─ id, prediction_id, reviewer_id                                     │
│  ├─ action (accepted/rejected/flagged)                                 │
│  ├─ notes, blocked_at, reviewed_at                                     │
│  └─ FK → predictions, user_profiles                                    │
│                                                                           │
│  model_retraining_runs                                                   │
│  ├─ id, source (auto_daily/manual/decay_triggered)                    │
│  ├─ dataset_size, fine_tune_flag                                       │
│  ├─ status (pending/running/completed/failed)                          │
│  ├─ metrics (jsonb: accuracy, precision, recall, F1)                  │
│  ├─ started_at, completed_at, log_url, error_message                  │
│  └─ triggered_by (user_id)                                             │
│                                                                           │
│  model_retraining_requests                                               │
│  ├─ id, requested_by (user_id), reason                                │
│  ├─ priority (low/normal/high)                                         │
│  ├─ status (pending/processing/completed/cancelled)                    │
│  ├─ processed_at, retraining_run_id                                    │
│  └─ FK → model_retraining_runs                                         │
│                                                                           │
│  system_logs                                                             │
│  ├─ id, component (string)                                             │
│  ├─ status (info/warning/error)                                        │
│  ├─ message, details (jsonb), created_at                               │
│  └─ RLS: admins/analysts SELECT, service_role INSERT                  │
│                                                                           │
│  matches                                                                 │
│  ├─ id, home_team_id, away_team_id, league_id                         │
│  ├─ match_date, status (scheduled/finished)                            │
│  ├─ home_score, away_score                                             │
│  └─ halftime_home_score, halftime_away_score                           │
│                                                                           │
│  detected_patterns                                                       │
│  ├─ id, match_id, template_id                                          │
│  └─ confidence_boost, pattern_data (jsonb)                             │
│                                                                           │
│  pattern_accuracy                                                        │
│  ├─ id, template_id                                                    │
│  ├─ total_predictions, correct_predictions, accuracy_rate              │
│  └─ last_updated                                                       │
│                                                                           │
└──────────────────────┬───────────────────────────────────────────────────┘
                       │
                       │ Scheduled (GitHub Actions) / Manual Trigger
                       │
┌──────────────────────▼───────────────────────────────────────────────────┐
│                      PYTHON ML BACKEND                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  prediction_engine.py                                                    │
│  ├─ Registry-driven model lookup (singleton cache)                     │
│  ├─ Feature validation (model_config.yaml schema)                      │
│  ├─ Probabilistic inference helpers                                    │
│  ├─ CLI harness: python prediction_engine.py                           │
│  └─ Uses joblib/pickle to load .pkl models                             │
│                                                                           │
│  ml_pipeline/ensemble_predictor.py                                      │
│  ├─ EnsemblePredictor class                                            │
│  ├─ Weighted voting: FT=0.5, HT=0.3, PT=0.2                           │
│  ├─ Dynamic re-weighting (null model handling)                         │
│  ├─ Conflict detection (top 2 scores < 10% diff)                      │
│  └─ Outcome normalization (HOME/DRAW/AWAY)                             │
│                                                                           │
│  ml_pipeline/auto_reinforcement.py                                      │
│  ├─ run_auto_reinforcement(lookback_days, source, request_id)         │
│  ├─ Fetches pending requests (model_retraining_requests)               │
│  ├─ Creates retraining run record                                      │
│  ├─ Calls prepare_retraining_data() → dataset_path                    │
│  ├─ Runs train_model.py subprocess with --fine_tune                    │
│  ├─ Parses JSON output (metrics)                                       │
│  ├─ UPDATE model_retraining_runs (status, metrics, log_url)           │
│  ├─ Uploads training logs to Supabase Storage                          │
│  └─ insert_system_log() at key stages                                  │
│                                                                           │
│  ml_pipeline/data_loader.py                                             │
│  ├─ prepare_retraining_data(lookback_days, confidence_threshold)      │
│  ├─ Downloads evaluation_log.csv from Supabase Storage                 │
│  ├─ Filters: incorrect + confidence > 70% + last 7 days               │
│  ├─ Minimum 10 error samples required                                  │
│  ├─ Creates CSV dataset for training                                   │
│  └─ Returns (dataset_path, error_count)                                │
│                                                                           │
│  ml_pipeline/train_model.py                                             │
│  ├─ CLI: --dataset, --config, --fine_tune, --model_path               │
│  ├─ Loads data from CSV                                                │
│  ├─ Trains/fine-tunes ML model (scikit-learn pipeline)                │
│  ├─ Calculates metrics: accuracy, precision, recall, F1               │
│  ├─ Saves model to --output_dir                                        │
│  ├─ JSON output: {"status":"success","metrics":{...},"model_path":""}│
│  └─ insert_system_log() at start, success, error                       │
│                                                                           │
│  ml_pipeline/supabase_client.py                                         │
│  ├─ get_supabase_client() → Supabase admin client                     │
│  ├─ download_from_storage(bucket, path, dest)                          │
│  ├─ upload_to_storage(bucket, path, content)                           │
│  ├─ insert_system_log(component, status, message, details)            │
│  └─ Graceful failure handling (no exceptions raised)                   │
│                                                                           │
│  Konfiguráció:                                                           │
│  ├─ model_config.yaml: feature schema, model parameters               │
│  ├─ model_registry.json: active model path, version, metadata         │
│  └─ ml_pipeline/config.py: Supabase URL, thresholds, paths            │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│              GITHUB ACTIONS WORKFLOW (Auto-Reinforcement)                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  .github/workflows/auto-reinforcement.yml                                │
│  ├─ Schedule: cron '0 2 * * *' (napi 2:00 UTC)                        │
│  ├─ Manual trigger: workflow_dispatch                                  │
│  ├─ Steps:                                                             │
│  │   1. Checkout kód                                                   │
│  │   2. Python 3.11 telepítés                                         │
│  │   3. pip install -r ml_pipeline/requirements.txt                   │
│  │   4. export SUPABASE_URL, SUPABASE_SERVICE_KEY (secrets)           │
│  │   5. python -m ml_pipeline.auto_reinforcement                      │
│  │   6. Upload training logs (artifacts, 30 nap megőrzés)            │
│  │   7. Hiba esetén: Issue #1 kommentálás                            │
│  └─ Artifacts: training-logs-*, evaluation-log                        │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Frontend Komponensek

### 1. `src/pages/PredictionsView.tsx`

**Felelősség:**
- Listázza az összes predikciót a `predictions` táblából
- JOIN-ok: `matches`, `teams`, `leagues`
- "Frissítés" gomb → `loadPredictions()` újrahívása
- "Új predikciók" gomb → navigál `/predictions/new` oldalra

**Főbb függvények:**
```typescript
const loadPredictions = async () => {
  const { data, error } = await supabase
    .from("predictions")
    .select(`
      id,
      predicted_outcome,
      confidence_score,
      actual_outcome,
      was_correct,
      match:matches(
        match_date,
        home_team:teams!matches_home_team_id_fkey(name),
        away_team:teams!matches_away_team_id_fkey(name),
        league:leagues(name)
      )
    `)
    .order("created_at", { ascending: false })
    .limit(25);
  // ... formázás és setState
}
```

**Megjelenítés:**
- `RecentPredictions` komponens (predikciós kártyák grid-je)
- Loader spinner töltés közben
- Hibaüzenet Alert-ben

---

### 2. `src/components/PredictionDisplay.tsx`

**Felelősség:**
- Egyedi előrejelzés részletes megjelenítése
- Ensemble lebontás (FT, HT, PT almodellek)
- Konfidencia downgrade jelzések
- Detektált pattern-ek
- Döntési fa és magyarázatok

**Főbb Props:**
```typescript
interface PredictionDisplayProps {
  prediction: {
    predicted_outcome: string;
    confidence_score: number;
    ensemble_breakdown?: EnsembleBreakdown;
  };
  patterns?: Pattern[];
  explanation?: Explanation;
  decisionPath?: DecisionPath;
  predictionStatus?: 'active' | 'uncertain' | 'blocked';
  overconfidenceFlag?: boolean;
  blockedReason?: string;
  alternateOutcome?: string;
  downgradedFromConfidence?: number;
}
```

**Ensemble Breakdown:**
```typescript
interface EnsembleBreakdown {
  votes: {
    full_time: { prediction: string; confidence: number; };
    half_time: { prediction: string; confidence: number; };
    pattern: { prediction: string; confidence: number; };
  };
  weights_used: { ft: number; ht: number; pt: number; };
  scores: { HOME: number; DRAW: number; AWAY: number; };
  winner: string;
  final_confidence: number;
  conflict_detected: boolean;
  conflict_margin: number;
}
```

**Státusz Badge-ek:**
- **active**: zöld "Megerősített előrejelzés"
- **uncertain**: sárga "Downgrade - Előzetes hiba miatt"
- **blocked**: piros "Letiltott - Lásd az okot"

**Collapse/Expand:**
- Ensemble lebontás (sub-model szavazatok, súlyok, végső pontszámok)
- Magyarázat és elemzés (fő tényezők, döntési fa, konfidencia lebontása)

---

### 3. `src/components/PredictionResults.tsx`

**Felelősség:**
- Bulk predikciós eredmények megjelenítése (több meccs)
- Forma pontszámok (home/away %)
- Detektált minták (badge-ekkel)
- FeedbackForm beágyazása toggle-lel

**Adatáramlás:**
```typescript
interface PredictionResultItem {
  match: { home: string; away: string };
  matchId: string;
  prediction?: { predicted_outcome?: string; confidence_score?: number; };
  patterns: PatternDisplay[];
  formScores?: { home: number; away: number };
}
```

**Feedback Toggle:**
- "Eredmény megadása" gomb → `setExpandedIndex(index)`
- `FeedbackForm` renderelése az adott indexen
- Sikeres submit után: `feedbackSubmitted.add(index)` → checkmark jelzés

---

### 4. `src/components/FeedbackForm.tsx`

**Felelősség:**
- Meccs eredmény rögzítése (félidő + végeredmény)
- Validáció: `halfTimeHome <= fullTimeHome`, `halfTimeAway <= fullTimeAway`
- Edge Function hívása: `submit-feedback`

**Adatáramlás:**
```typescript
const handleSubmit = async (e) => {
  const { error } = await supabase.functions.invoke('submit-feedback', {
    body: {
      matchId,
      homeScore: fullTimeHome,
      awayScore: fullTimeAway,
      halfTimeHomeScore: halfTimeHome,
      halfTimeAwayScore: halfTimeAway
    }
  });
  // ... onSubmitted() callback
}
```

**UI:**
- `ScoreInput`: full-time eredmény (number inputok)
- `HalftimeScoreInput`: félidős eredmény (opcionális)
- Submit gomb: "Eredmény mentése"
- Siker: Alert "Eredmény sikeresen rögzítve! A pattern accuracy frissült."

---

### 5. `src/pages/MonitoringPage.tsx`

**Felelősség:**
- Auto Reinforcement státusz kártya
- Legutóbbi újratanítás metrikái
- Kézi újratanítás trigger

**Query Hooks:**
```typescript
const { data: latestRun } = useQuery({
  queryKey: ['latest-retraining-run'],
  queryFn: async () => {
    const { data } = await supabase
      .from('model_retraining_runs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    return data;
  },
  refetchInterval: 30000, // 30 sec
});

const retrainingMutation = useMutation({
  mutationFn: async ({ reason }: { reason: string }) => {
    const { data } = await supabase
      .from('model_retraining_requests')
      .insert({
        requested_by: user.id,
        reason,
        priority: 'normal',
        status: 'pending'
      });
    return data;
  }
});
```

**Megjelenítés:**
- Státusz badge: pending/running/completed/failed
- Metrikák: dataset_size, accuracy, precision, recall, F1-score
- Kézi trigger form: textarea (reason) + "Retrain Now" gomb

---

### 6. `src/components/admin/feedback/FeedbackInboxPanel.tsx`

**Felelősség:**
- Összes felhasználói visszajelzés listázása
- Megoldott/függő státusz kezelés
- CSV export funkció
- Predikció részletek megtekintése (modal)

**Query:**
```typescript
const { data: feedback } = useQuery({
  queryKey: ["admin", "feedback"],
  queryFn: async () => {
    const { data } = await supabase
      .from("feedback")
      .select(`
        *,
        user_profiles(email, full_name),
        predictions(
          confidence_score,
          predicted_outcome,
          actual_outcome,
          explanation,
          matches(
            home_team:teams(name),
            away_team:teams(name),
            match_date
          )
        )
      `)
      .order("created_at", { ascending: false });
    return data;
  }
});
```

**Műveletek:**
- **View Prediction**: Modal megnyitása predikció részletekkel
- **Mark Resolved / Reopen**: `UPDATE feedback SET resolved = true/false`
- **Export CSV**: Papa.unparse() → blob → download
- Audit log: `logAudit("feedback_viewed", { feedback_id, prediction_id })`

---

### 7. `src/components/admin/model-status/PredictionReviewPanel.tsx`

**Felelősség:**
- Blokkolt előrejelzések listázása
- Admin felülvizsgálat: elfogadás/elutasítás
- Auto-refresh 30 másodpercenként

**Service Call:**
```typescript
import { getBlockedPredictions, submitPredictionReview } from 
  "@/integrations/admin-prediction-review/service";

const { data: response } = useQuery({
  queryKey: ["blocked-predictions", offset, limit],
  queryFn: () => getBlockedPredictions(limit, offset),
  refetchInterval: 30000
});

const reviewMutation = useMutation({
  mutationFn: submitPredictionReview, // { predictionId, action: 'accepted'|'rejected', notes }
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["blocked-predictions"] });
    toast.success("Előrejelzés sikeresen elfogadva/elutasítva");
  }
});
```

**Műveletek:**
- **Elfogadás**: zöld gomb → `action='accepted'` → UPDATE `prediction_status='active'`
- **Elutasítás**: piros gomb → `action='rejected'` → INSERT `prediction_review_log`
- Felülvizsgáló email automatikusan mentésre kerül

---

## Supabase Edge Functions

### 1. `get-predictions`

**Elérési út:** `/functions/v1/get-predictions`

**Paraméterek:**
- `status`: (opcionális) `'scheduled'` | `'finished'` – szűrés meccs státusz alapján
- `limit`: (opcionális) integer, alapértelmezett 20

**Adatáramlás:**
```typescript
SELECT *,
  match:matches(
    *,
    home_team:teams!home_team_id(id, name),
    away_team:teams!away_team_id(id, name),
    league:leagues(id, name)
  )
FROM predictions
ORDER BY created_at DESC
LIMIT $limit
```

**Válasz:**
```json
{
  "predictions": [
    {
      "id": "uuid",
      "predicted_outcome": "home_win",
      "confidence_score": 75.5,
      "match": {
        "home_team": { "name": "Arsenal" },
        "away_team": { "name": "Chelsea" },
        "match_date": "2025-01-15T18:00:00Z"
      }
    }
  ]
}
```

---

### 2. `predictions-track`

**Elérési út:** `/functions/v1/predictions-track`

**Metódus:** `POST`

**Body:**
```json
{
  "matchId": "uuid",
  "predictedOutcome": "home_win",
  "confidenceScore": 75.5,
  "cssScore": 72.3,
  "predictionFactors": { "form": 0.6, "h2h": 0.3 },
  "bttsPrediction": true,
  "overUnderPrediction": 2.5,
  "predictedHomeScore": 2,
  "predictedAwayScore": 1
}
```

**Validáció:** `PredictionInputSchema` (Zod)

**Adatáramlás:**
```typescript
INSERT INTO predictions (
  match_id, predicted_outcome, confidence_score, css_score,
  prediction_factors, btts_prediction, over_under_prediction,
  predicted_home_score, predicted_away_score
) VALUES (...)
RETURNING *
```

---

### 3. `predictions-update-results`

**Elérési út:** `/functions/v1/predictions-update-results`

**Felelősség:**
- UPDATE predictions: `actual_outcome`, `was_correct`, `calibration_error`
- Pattern accuracy frissítése

**Kalibráció:**
```typescript
const calibrationError = Math.abs(confidenceScore - (wasCorrect ? 1 : 0));
```

---

### 4. `submit-feedback`

**Elérési út:** `/functions/v1/submit-feedback`

**RBAC védelem:** `requireAdminOrAnalyst`

**Adatáramlás:**
1. **Validáció:** halftime ≤ fulltime
2. **UPDATE matches:**
   ```sql
   UPDATE matches SET 
     home_score = $homeScore,
     away_score = $awayScore,
     halftime_home_score = $halfTimeHomeScore,
     halftime_away_score = $halfTimeAwayScore,
     status = 'finished'
   WHERE id = $matchId
   ```
3. **Tényleges kimenetel:**
   ```typescript
   const actualOutcome = homeScore > awayScore ? 'home_win' 
     : homeScore < awayScore ? 'away_win' : 'draw';
   ```
4. **UPDATE predictions:**
   ```sql
   UPDATE predictions SET
     actual_outcome = $actualOutcome,
     was_correct = $wasCorrect,
     calibration_error = $calibrationError,
     evaluated_at = NOW()
   WHERE match_id = $matchId
   ```
5. **Pattern accuracy frissítés:**
   ```typescript
   SELECT template_id FROM detected_patterns WHERE match_id = $matchId
   FOR EACH template_id:
     SELECT * FROM pattern_accuracy WHERE template_id = $template_id
     newTotal = total_predictions + 1
     newCorrect = correct_predictions + (wasCorrect ? 1 : 0)
     newRate = (newCorrect / newTotal) * 100
     UPDATE pattern_accuracy SET
       total_predictions = newTotal,
       correct_predictions = newCorrect,
       accuracy_rate = newRate
     IF newTotal >= 10:
       adjustment = newRate > 60 ? 0.5 : newRate < 45 ? -0.5 : 0
       CALL adjust_template_confidence(template_id, adjustment)
   ```
6. **Audit log:** `logAuditAction('submit_feedback', 'match', matchId, ...)`

---

### 5. `admin-prediction-review`

**Elérési út:** `/functions/v1/admin-prediction-review`

**RBAC védelem:** `requireAdmin`

**Műveletek:**

**GET:** Blokkolt predikciók listázása
```sql
SELECT p.*, m.home_team, m.away_team, prl.reviewer_email
FROM predictions p
JOIN matches m ON p.match_id = m.id
LEFT JOIN prediction_review_log prl ON p.id = prl.prediction_id
WHERE p.prediction_status IN ('blocked', 'uncertain')
ORDER BY p.created_at DESC
LIMIT $limit OFFSET $offset
```

**POST:** Felülvizsgálat submit
```json
{
  "predictionId": "uuid",
  "action": "accepted",  // or "rejected"
  "notes": "Manuálisan ellenőrizve, konfidencia elfogadható."
}
```

**Adatáramlás:**
1. **INSERT prediction_review_log:**
   ```sql
   INSERT INTO prediction_review_log (
     prediction_id, reviewer_id, action, notes, reviewed_at
   ) VALUES (...)
   ```
2. **UPDATE predictions (ha elfogadva):**
   ```sql
   UPDATE predictions SET
     prediction_status = 'active',
     blocked_reason = NULL
   WHERE id = $predictionId
   ```
3. **Audit log:** `logAuditAction('prediction_reviewed', ...)`

---

## Adatbázis Táblák

### 1. `predictions`

**Fájl:** `supabase/migrations/20251031233306_6ef40928-1ce0-4e54-b3d0-a94f249b7d99.sql`

**Oszlopok:**
```sql
CREATE TABLE predictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  predicted_outcome TEXT NOT NULL, -- 'home_win' | 'away_win' | 'draw'
  confidence_score NUMERIC(5,2) NOT NULL,
  css_score NUMERIC(5,2),
  actual_outcome TEXT,
  was_correct BOOLEAN,
  calibration_error NUMERIC(6,4),
  prediction_factors JSONB,
  ensemble_breakdown JSONB,
  btts_prediction BOOLEAN,
  over_under_prediction NUMERIC(3,1),
  predicted_home_score INTEGER,
  predicted_away_score INTEGER,
  prediction_status TEXT DEFAULT 'active', -- 'active' | 'uncertain' | 'blocked'
  blocked_reason TEXT,
  alternate_outcome TEXT,
  downgraded_from_confidence NUMERIC(5,2),
  explanation JSONB,
  decision_path JSONB,
  evaluated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Indexek:**
- `idx_predictions_match_id` ON (match_id)
- `idx_predictions_status` ON (prediction_status)

**RLS Policies:**
- SELECT: authenticated users
- INSERT/UPDATE: service_role, admins

---

### 2. `feedback`

**Fájl:** `supabase/migrations/20260101004000_feedback_inbox.sql`

**Oszlopok:**
```sql
CREATE TABLE feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prediction_id UUID REFERENCES predictions(id) ON DELETE CASCADE,
  user_suggestion TEXT NOT NULL,
  submitted_by UUID REFERENCES auth.users(id),
  metadata JSONB,
  resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Trigger:** `update_feedback_updated_at` (ON UPDATE)

**RLS Policies:**
- SELECT: admins, analysts
- INSERT: authenticated users
- UPDATE: admins

---

### 3. `prediction_review_log`

**Fájl:** `supabase/migrations/20260101002000_prediction_review_log.sql`

**Oszlopok:**
```sql
CREATE TABLE prediction_review_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prediction_id UUID REFERENCES predictions(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL CHECK (action IN ('accepted', 'rejected', 'flagged')),
  notes TEXT,
  blocked_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**RLS Policies:**
- SELECT/INSERT: admins only

---

### 4. `model_retraining_runs`

**Fájl:** `supabase/migrations/20251227120000_auto_reinforcement_model_retraining.sql`

**Oszlopok:**
```sql
CREATE TABLE model_retraining_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source TEXT NOT NULL, -- 'auto_daily' | 'manual' | 'decay_triggered'
  dataset_size INTEGER,
  fine_tune_flag BOOLEAN DEFAULT TRUE,
  status TEXT DEFAULT 'pending', -- 'pending' | 'running' | 'completed' | 'failed'
  metrics JSONB, -- { "accuracy": 0.85, "precision": 0.82, "recall": 0.84, "f1_score": 0.83 }
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  log_url TEXT,
  error_message TEXT,
  triggered_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Indexek:**
- `idx_retraining_runs_status` ON (status)
- `idx_retraining_runs_source` ON (source)
- `idx_retraining_runs_started_at` ON (started_at DESC)

---

### 5. `model_retraining_requests`

**Oszlopok:**
```sql
CREATE TABLE model_retraining_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requested_by UUID REFERENCES auth.users(id),
  reason TEXT,
  priority TEXT DEFAULT 'normal', -- 'low' | 'normal' | 'high'
  status TEXT DEFAULT 'pending', -- 'pending' | 'processing' | 'completed' | 'cancelled'
  processed_at TIMESTAMPTZ,
  retraining_run_id UUID REFERENCES model_retraining_runs(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Indexek:**
- `idx_retraining_requests_status` ON (status) WHERE status = 'pending'
- `idx_retraining_requests_priority` ON (priority, created_at)

---

### 6. `system_logs`

**Fájl:** `supabase/migrations/20260101001000_system_logs.sql`

**Oszlopok:**
```sql
CREATE TABLE system_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  component TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('info', 'warning', 'error')),
  message TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Indexek:**
- `idx_system_logs_component_created` ON (component, created_at DESC)
- `idx_system_logs_status` ON (status)

**RLS Policies:**
- SELECT: admins, analysts
- INSERT: service_role only
- System logs are append-only, no DELETE

---

### 7. `matches`

**Releváns oszlopok:**
```sql
CREATE TABLE matches (
  id UUID PRIMARY KEY,
  home_team_id UUID REFERENCES teams(id),
  away_team_id UUID REFERENCES teams(id),
  league_id UUID REFERENCES leagues(id),
  match_date TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'scheduled', -- 'scheduled' | 'finished'
  home_score INTEGER,
  away_score INTEGER,
  halftime_home_score INTEGER,
  halftime_away_score INTEGER,
  ...
);
```

---

### 8. `detected_patterns` és `pattern_accuracy`

**detected_patterns:**
```sql
CREATE TABLE detected_patterns (
  id UUID PRIMARY KEY,
  match_id UUID REFERENCES matches(id),
  template_id UUID REFERENCES pattern_templates(id),
  confidence_boost NUMERIC(5,2),
  pattern_data JSONB,
  ...
);
```

**pattern_accuracy:**
```sql
CREATE TABLE pattern_accuracy (
  id UUID PRIMARY KEY,
  template_id UUID REFERENCES pattern_templates(id),
  total_predictions INTEGER DEFAULT 0,
  correct_predictions INTEGER DEFAULT 0,
  accuracy_rate NUMERIC(5,2) DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT NOW()
);
```

**RPC:** `adjust_template_confidence(p_template_id, p_adjustment)`
- UPDATE pattern_templates SET confidence_boost = confidence_boost + p_adjustment

---

## Python ML Backend

### 1. `prediction_engine.py`

**Felelősség:**
- Registry-driven model lookup (singleton cache)
- Feature validation (model_config.yaml schema)
- Probabilistic inference helpers
- CLI harness

**Főbb függvények:**
```python
def _load_model_config() -> Dict[str, Any]:
    """Betölti model_config.yaml-t (vagy JSON fallback)."""
    
def _load_model_registry() -> Dict[str, Any]:
    """Betölti model_registry.json-t."""
    
def get_active_model():
    """Visszaadja a singleton model instance-t."""
    global _MODEL_INSTANCE
    if _MODEL_INSTANCE is None:
        registry = _load_model_registry()
        model_path = registry['active_model']['path']
        _MODEL_INSTANCE = joblib.load(model_path)
    return _MODEL_INSTANCE

def predict(features: Dict[str, Any]) -> Dict[str, float]:
    """Predikció készítése a features alapján."""
    model = get_active_model()
    # validate features against model_config schema
    # model.predict_proba(features_df)
    # return { "HOME": 0.55, "DRAW": 0.25, "AWAY": 0.20 }
```

**CLI használat:**
```bash
python prediction_engine.py \
  --home_team "Arsenal" \
  --away_team "Chelsea" \
  --home_form 75 \
  --away_form 68 \
  --h2h_wins 3
```

---

### 2. `ml_pipeline/ensemble_predictor.py`

**Felelősség:**
- Weighted voting: FT=0.5, HT=0.3, PT=0.2
- Dynamic re-weighting (null model handling)
- Conflict detection (top 2 scores < 10% diff)

**Osztály:**
```python
class EnsemblePredictor:
    DEFAULT_WEIGHTS = {"ft": 0.5, "ht": 0.3, "pt": 0.2}
    CONFLICT_THRESHOLD = 0.1
    
    def __init__(self, weights: Optional[Dict[str, float]] = None):
        self.weights = weights or self.DEFAULT_WEIGHTS.copy()
        
    def predict(
        self,
        full_time_prediction: Optional[str] = None,
        full_time_confidence: Optional[float] = None,
        half_time_prediction: Optional[str] = None,
        half_time_confidence: Optional[float] = None,
        pattern_prediction: Optional[str] = None,
        pattern_confidence: Optional[float] = None,
    ) -> Dict:
        # 1. Normalize outcomes (HOME/DRAW/AWAY)
        # 2. Calculate weighted scores for each outcome
        # 3. Determine winner (max score)
        # 4. Detect conflicts (top 2 scores differ < 10%)
        # 5. Return ensemble breakdown
        return {
            "winner": "home_win",
            "final_confidence": 0.68,
            "scores": {"HOME": 0.68, "DRAW": 0.20, "AWAY": 0.12},
            "conflict_detected": False,
            "conflict_margin": 0.48,
            "votes": {...},
            "weights_used": {...}
        }
```

**Conflict logic:**
```python
sorted_scores = sorted(scores.values(), reverse=True)
conflict_margin = sorted_scores[0] - sorted_scores[1]
conflict_detected = conflict_margin < CONFLICT_THRESHOLD  # 0.1
```

---

### 3. `ml_pipeline/auto_reinforcement.py`

**Felelősség:**
- Orchestrate auto-retraining pipeline
- Handle manual requests
- Emit system logs at key stages

**Főbb függvény:**
```python
def run_auto_reinforcement(
    lookback_days: int = 7,
    source: str = 'auto_daily',
    request_id: Optional[str] = None
) -> bool:
    """
    1. Fetch pending manual requests (if request_id provided)
    2. Create retraining run record (INSERT model_retraining_runs)
    3. Call prepare_retraining_data() → dataset_path, error_count
    4. Check MIN_ERROR_SAMPLES_FOR_RETRAINING (10)
    5. If insufficient: log warning, return False
    6. Run train_model.py subprocess with --fine_tune
    7. Parse JSON output (metrics)
    8. UPDATE model_retraining_runs (status='completed', metrics, log_url)
    9. Upload training logs to Supabase Storage
    10. insert_system_log('auto_reinforcement', 'info', 'Training completed')
    """
```

**Subprocess hívás:**
```python
import subprocess
cmd = [
    "python", "train_model.py",
    "--dataset", dataset_path,
    "--config", "model_config.yaml",
    "--fine_tune", "true",
    "--epochs", "5",
    "--learning_rate", "0.001"
]
result = subprocess.run(cmd, capture_output=True, text=True)
output_json = json.loads(result.stdout)
metrics = output_json['metrics']
model_path = output_json['model_path']
```

**System log példák:**
```python
insert_system_log(
    component='auto_reinforcement',
    status='info',
    message='Auto-reinforcement started',
    details={'source': source, 'lookback_days': lookback_days}
)

insert_system_log(
    component='auto_reinforcement',
    status='warning',
    message='Insufficient error samples for retraining',
    details={'error_count': 7, 'required': 10}
)

insert_system_log(
    component='auto_reinforcement',
    status='error',
    message='Training failed',
    details={'error': str(e), 'traceback': traceback.format_exc()}
)
```

---

### 4. `ml_pipeline/data_loader.py`

**Felelősség:**
- Download evaluation_log.csv from Supabase Storage
- Filter: incorrect + confidence > 70% + last N days
- Create retraining dataset (CSV)

**Főbb függvény:**
```python
def prepare_retraining_data(
    lookback_days: int = 7,
    confidence_threshold: float = 0.7
) -> Tuple[Optional[str], int]:
    """
    1. Download evaluation_log.csv from Supabase Storage
    2. Load into pandas DataFrame
    3. Filter: 
       - was_correct == False
       - confidence_score > confidence_threshold
       - created_at > NOW() - lookback_days
    4. Count errors
    5. If error_count < MIN_ERROR_SAMPLES_FOR_RETRAINING: return (None, error_count)
    6. Save to /tmp/retraining_dataset_{timestamp}.csv
    7. Return (dataset_path, error_count)
    """
    client = get_supabase_client()
    local_path = download_from_storage(client, STORAGE_BUCKET, EVALUATION_LOG_PATH, "/tmp/eval_log.csv")
    
    df = pd.read_csv(local_path)
    cutoff_date = datetime.now() - timedelta(days=lookback_days)
    
    errors = df[
        (df['was_correct'] == False) &
        (df['confidence_score'] > confidence_threshold) &
        (pd.to_datetime(df['created_at']) > cutoff_date)
    ]
    
    error_count = len(errors)
    if error_count < MIN_ERROR_SAMPLES_FOR_RETRAINING:
        return (None, error_count)
    
    dataset_path = f"/tmp/retraining_dataset_{int(time.time())}.csv"
    errors.to_csv(dataset_path, index=False)
    return (dataset_path, error_count)
```

---

### 5. `ml_pipeline/train_model.py`

**Felelősség:**
- CLI for training/fine-tuning models
- JSON output for automation
- System log instrumentation

**CLI paraméterek:**
```bash
python ml_pipeline/train_model.py \
  --dataset PATH/TO/DATASET.csv \
  --config PATH/TO/MODEL_CONFIG.yaml \
  --fine_tune [true|false] \
  --model_path PATH/TO/EXISTING/MODEL.pkl \
  --output_dir ./models/retrained \
  --learning_rate 0.001 \
  --epochs 5
```

**JSON output:**
```json
{
  "status": "success",
  "metrics": {
    "accuracy": 0.8523,
    "precision": 0.8234,
    "recall": 0.8411,
    "f1_score": 0.8321
  },
  "model_path": "./models/retrained/model_20250115_143022.pkl"
}
```

**System log hívások:**
```python
insert_system_log('train_model', 'info', 'Training started', {'dataset_size': len(df)})

insert_system_log('train_model', 'info', 'Dataset prepared', {
    'features': list(X.columns),
    'samples': len(X)
})

insert_system_log('train_model', 'info', 'Training completed', {
    'metrics': metrics,
    'model_path': model_path
})

# Error handler:
except Exception as e:
    insert_system_log('train_model', 'error', 'Training failed', {
        'error': str(e),
        'traceback': traceback.format_exc()
    })
    print(json.dumps({"status": "error", "error": str(e)}))
    sys.exit(1)
```

---

### 6. `ml_pipeline/supabase_client.py`

**Felelősség:**
- Supabase admin client wrapper
- Storage operations (download/upload)
- System log helper (graceful failure)

**Főbb függvények:**
```python
def get_supabase_client():
    """Supabase admin client (service_role)."""
    from supabase import create_client
    return create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

def download_from_storage(client, bucket: str, path: str, dest: str) -> str:
    """Download file from Supabase Storage."""
    data = client.storage.from_(bucket).download(path)
    with open(dest, 'wb') as f:
        f.write(data)
    return dest

def upload_to_storage(client, bucket: str, path: str, content: bytes) -> str:
    """Upload file to Supabase Storage."""
    client.storage.from_(bucket).upload(path, content, {"content-type": "text/plain"})
    return path

def insert_system_log(
    component: str,
    status: str,  # 'info' | 'warning' | 'error'
    message: str,
    details: Optional[Dict] = None
) -> None:
    """Insert system log (graceful failure)."""
    try:
        client = get_supabase_client()
        client.table('system_logs').insert({
            'component': component,
            'status': status,
            'message': message,
            'details': details or {}
        }).execute()
    except Exception as e:
        # Log to stderr but do NOT raise exception
        logger.error(f"Failed to insert system log: {e}")
```

---

### 7. Konfiguráció Fájlok

#### `model_config.yaml`

```yaml
model:
  type: RandomForestClassifier
  params:
    n_estimators: 100
    max_depth: 10
    random_state: 42

features:
  - name: home_form
    type: numeric
    required: true
  - name: away_form
    type: numeric
    required: true
  - name: h2h_home_wins
    type: integer
    required: false
  - name: league_avg_goals
    type: numeric
    required: false

target: outcome  # 'home_win' | 'draw' | 'away_win'
```

#### `model_registry.json`

```json
{
  "active_model": {
    "path": "./models/main_model_v1.pkl",
    "version": "1.0.0",
    "trained_at": "2025-01-10T12:00:00Z",
    "metrics": {
      "accuracy": 0.85,
      "precision": 0.82
    }
  },
  "archive": [
    {
      "path": "./models/retrained/model_20250105.pkl",
      "version": "0.9.0"
    }
  ]
}
```

#### `ml_pipeline/config.py`

```python
import os
from pathlib import Path

# Supabase
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "")

# Storage
STORAGE_BUCKET = "model-artifacts"
EVALUATION_LOG_PATH = "evaluation_log.csv"
LOGS_STORAGE_PREFIX = "training-logs"

# Training
DEFAULT_LOOKBACK_DAYS = 7
MIN_ERROR_SAMPLES_FOR_RETRAINING = 10
ERROR_CONFIDENCE_THRESHOLD = 0.7
DEFAULT_FINE_TUNE_EPOCHS = 5
DEFAULT_LEARNING_RATE = 0.001

# Paths
ML_PIPELINE_DIR = Path(__file__).parent
PROJECT_ROOT = ML_PIPELINE_DIR.parent
MODELS_DIR = PROJECT_ROOT / "models"
RETRAINED_MODELS_DIR = MODELS_DIR / "retrained"
TEMP_DIR = Path("/tmp")

# Environment
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
DEBUG = os.getenv("DEBUG", "false").lower() == "true"
```

---

## Feedback Loop és Admin Triage

### Adatfolyam Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│ 1. FEEDBACK SUBMISSION (User)                                       │
└────────────────────┬────────────────────────────────────────────────┘
                     │
                     │ FeedbackForm → submit-feedback Edge Function
                     ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 2. MATCH & PREDICTION UPDATE                                        │
├─────────────────────────────────────────────────────────────────────┤
│  • UPDATE matches (home_score, away_score, status='finished')       │
│  • Determine actual_outcome (home_win/draw/away_win)                │
│  • UPDATE predictions (actual_outcome, was_correct, calibration)    │
│  • UPDATE pattern_accuracy (detected_patterns loop)                 │
│  • CALL adjust_template_confidence RPC (if >= 10 predictions)       │
└────────────────────┬────────────────────────────────────────────────┘
                     │
                     │ If was_correct == false && confidence > 70%
                     ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 3. EVALUATION LOG APPEND                                            │
├─────────────────────────────────────────────────────────────────────┤
│  • Append row to evaluation_log.csv in Supabase Storage             │
│  • Columns: prediction_id, match_id, predicted_outcome,             │
│    actual_outcome, confidence_score, was_correct, created_at        │
└────────────────────┬────────────────────────────────────────────────┘
                     │
                     │ (Optional) If prediction_status='blocked'
                     ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 4. ADMIN TRIAGE (PredictionReviewPanel)                             │
├─────────────────────────────────────────────────────────────────────┤
│  • Admin látja a blokkolt előrejelzéseket                           │
│  • Csapatok, kimenetel, konfidencia, blokk oka                      │
│  • Alternatív kimenetel javaslat                                    │
│  • Downgrade konfidencia (eredeti → jelenlegi)                      │
│  • Műveletek:                                                        │
│    - Elfogadás: UPDATE prediction_status='active'                   │
│    - Elutasítás: INSERT prediction_review_log (action='rejected')   │
│  • INSERT prediction_review_log (minden műveletnél)                 │
│  • reviewer_id = current_user.id                                    │
└────────────────────┬────────────────────────────────────────────────┘
                     │
                     │ Daily/Manual trigger
                     ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 5. AUTO-REINFORCEMENT (ml_pipeline/auto_reinforcement.py)           │
├─────────────────────────────────────────────────────────────────────┤
│  • Download evaluation_log.csv                                      │
│  • Filter: incorrect + confidence > 70% + last 7 days               │
│  • If error_count >= 10: proceed with training                      │
│  • Create retraining dataset                                        │
│  • Run train_model.py --fine_tune                                   │
│  • UPDATE model_retraining_runs (metrics, log_url)                  │
│  • Upload training logs to Storage                                  │
└─────────────────────────────────────────────────────────────────────┘
```

### Blokkolt Predikciók Feloldása

**Scenario 1: Ensemble Conflict**
- Predikció generálása közben: `ensemble_breakdown.conflict_detected = true`
- `prediction_status = 'uncertain'`
- `blocked_reason = "Ensemble konfliktus: top 2 pontszám különbség < 10%"`
- Admin review: megnézi az alternatív kimenetet, ellenőrzi a forma adatokat
- **Elfogadás:** `UPDATE prediction_status='active'` → predikció látható a UI-n
- **Elutasítás:** predikció rejtve marad, de log rögzítésre kerül

**Scenario 2: Overconfidence Flag**
- Predikció generálása közben: `confidence_score > 95%` (példa küszöb)
- `prediction_status = 'uncertain'`
- `downgraded_from_confidence = 95.5`, `confidence_score = 70.0` (downgrade)
- `blocked_reason = "Túlzott magabiztosság - konfidencia leszorítva"`
- Admin review: ellenőrzi a historical accuracy-t, mintázatokat
- **Elfogadás:** predikció aktiválva (downgraded konfidenciával)

**Scenario 3: Pattern Conflict**
- Több detektált minta ellentmondásos boostokkal
- `prediction_status = 'blocked'`
- `blocked_reason = "Ellentmondó minták: home_winning_streak (+5%) vs recent_form_advantage vendég (+3%)"`
- Admin review: manuális elemzés, esetleg minta letiltása
- **Elutasítás:** predikció nem kerül kiajánlásra

---

## Auto-Reinforcement Workflow

### Napi Automatikus Futtatás

**Trigger:** GitHub Actions – cron schedule `'0 2 * * *'` (napi 2:00 UTC)

**Fájl:** `.github/workflows/auto-reinforcement.yml`

```yaml
name: Auto Model Reinforcement

on:
  schedule:
    - cron: '0 2 * * *'  # Napi 2:00 UTC
  workflow_dispatch:      # Kézi trigger is

jobs:
  retrain:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Python 3.11
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      
      - name: Install dependencies
        run: pip install -r ml_pipeline/requirements.txt
      
      - name: Run auto-reinforcement
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_KEY: ${{ secrets.SUPABASE_SERVICE_KEY }}
        run: python -m ml_pipeline.auto_reinforcement
      
      - name: Upload training logs
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: training-logs-${{ github.run_number }}
          path: /tmp/training-*.log
          retention-days: 30
      
      - name: Comment on issue if failed
        if: failure()
        uses: actions/github-script@v6
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: 1,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '❌ Auto-reinforcement failed. Check logs: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}'
            })
```

**Lépések:**
1. Checkout kód
2. Python 3.11 telepítés
3. `pip install -r ml_pipeline/requirements.txt`
4. Export SUPABASE_URL, SUPABASE_SERVICE_KEY (GitHub Secrets)
5. `python -m ml_pipeline.auto_reinforcement`
6. Upload training logs (artifacts, 30 nap megőrzés)
7. Hiba esetén: Issue #1 kommentálás

---

### Kézi Trigger (UI)

**Folyamat:**
1. Felhasználó navigál `MonitoringPage.tsx`-re
2. "Auto Reinforcement" kártya → "Retrain Now" gomb kattintás
3. Modal megnyílik: textarea (reason) + "Confirm" gomb
4. Submit → `retrainingMutation.mutate({ reason: "Manuális kérés: csökkenő accuracy" })`
5. INSERT `model_retraining_requests`:
   ```sql
   INSERT INTO model_retraining_requests (
     requested_by, reason, priority, status
   ) VALUES (
     $user_id, $reason, 'normal', 'pending'
   )
   ```
6. Query refetch → új kérés megjelenik az admin panelen
7. GitHub Actions workflow (vagy háttér worker) észleli a pending requestet
8. `auto_reinforcement.py` futtatása `request_id` paraméterrel
9. Retraining run létrehozása:
   ```sql
   INSERT INTO model_retraining_runs (
     source, triggered_by, status
   ) VALUES (
     'manual', $user_id, 'pending'
   )
   ```
10. Tanítás → UPDATE `model_retraining_runs` (status='completed', metrics)
11. UPDATE `model_retraining_requests` (status='completed', retraining_run_id)
12. UI auto-refresh → új run megjelenik a "Latest Run Status" kártyán

---

### Workflow Sequence Diagram

```
User (MonitoringPage)                    GitHub Actions / Worker                 Supabase DB
       |                                            |                                  |
       |  1. Click "Retrain Now"                   |                                  |
       |------------------------------------------->|                                  |
       |                                            |                                  |
       |  2. INSERT model_retraining_requests      |                                  |
       |---------------------------------------------------------------->|             |
       |                                            |                                  |
       |                                            |  3. Detect pending request       |
       |                                            |<---------------------------------|
       |                                            |                                  |
       |                                            |  4. CREATE retraining run        |
       |                                            |--------------------------------->|
       |                                            |                                  |
       |                                            |  5. Download evaluation_log.csv  |
       |                                            |<---------------------------------|
       |                                            |                                  |
       |                                            |  6. Filter errors (7 days, >70%)|
       |                                            |                                  |
       |                                            |  7. Check MIN_ERROR_SAMPLES      |
       |                                            |                                  |
       |                                            |  8. Run train_model.py           |
       |                                            |  (subprocess)                    |
       |                                            |                                  |
       |                                            |  9. Parse JSON output (metrics)  |
       |                                            |                                  |
       |                                            | 10. UPDATE retraining run        |
       |                                            |--------------------------------->|
       |                                            |                                  |
       |                                            | 11. Upload training logs         |
       |                                            |--------------------------------->|
       |                                            |                                  |
       |                                            | 12. UPDATE request (completed)   |
       |                                            |--------------------------------->|
       |                                            |                                  |
       | 13. Query refetch (auto 30s)              |                                  |
       |<----------------------------------------------------------------|             |
       |                                            |                                  |
       | 14. Display updated metrics                |                                  |
       |                                            |                                  |
```

---

## Rendszer Naplózás

### `system_logs` Tábla

**Oszlopok:**
- `id` (UUID)
- `component` (TEXT): pl. 'auto_reinforcement', 'train_model', 'data_loader'
- `status` (TEXT): 'info' | 'warning' | 'error'
- `message` (TEXT): Rövid leírás
- `details` (JSONB): Extra metaadatok (stack trace, paraméterek)
- `created_at` (TIMESTAMPTZ)

**Indexek:**
- `idx_system_logs_component_created` ON (component, created_at DESC)
- `idx_system_logs_status` ON (status)

**RLS Policies:**
- **SELECT:** admins, analysts
- **INSERT:** service_role only
- Felhasználók NEM látják a system logs-ot közvetlenül

---

### Python Instrumentáció

**auto_reinforcement.py:**
```python
# Start
insert_system_log(
    component='auto_reinforcement',
    status='info',
    message='Auto-reinforcement started',
    details={'source': source, 'lookback_days': lookback_days}
)

# Dataset prepared
insert_system_log(
    component='auto_reinforcement',
    status='info',
    message='Dataset prepared',
    details={'error_count': error_count, 'dataset_path': dataset_path}
)

# Insufficient samples
insert_system_log(
    component='auto_reinforcement',
    status='warning',
    message='Insufficient error samples for retraining',
    details={'error_count': error_count, 'required': MIN_ERROR_SAMPLES_FOR_RETRAINING}
)

# Training success
insert_system_log(
    component='auto_reinforcement',
    status='info',
    message='Training completed successfully',
    details={'metrics': metrics, 'model_path': model_path}
)

# Error
except Exception as e:
    insert_system_log(
        component='auto_reinforcement',
        status='error',
        message='Auto-reinforcement failed',
        details={'error': str(e), 'traceback': traceback.format_exc()}
    )
```

**train_model.py:**
```python
# Start
insert_system_log('train_model', 'info', 'Training started', {'dataset_size': len(df)})

# Dataset prepared
insert_system_log('train_model', 'info', 'Dataset prepared', {
    'features': list(X.columns),
    'samples': len(X)
})

# Success
insert_system_log('train_model', 'info', 'Training completed', {
    'metrics': metrics,
    'model_path': model_path
})

# Error
except Exception as e:
    insert_system_log('train_model', 'error', 'Training failed', {
        'error': str(e),
        'traceback': traceback.format_exc()
    })
```

---

### Admin UI (SystemLogTable)

**Komponens:** `src/components/admin/model-status/SystemLogTable.tsx`

**Felelősség:**
- Lekérdezi az utolsó 10 log bejegyzést
- Auto-refresh 30 másodpercenként
- Kézi "Frissítés" gomb
- Színkódolás státusz szerint

**Query:**
```typescript
const { data: logs } = useQuery({
  queryKey: ['system-logs'],
  queryFn: async () => {
    const { data } = await supabase
      .from('system_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    return data;
  },
  refetchInterval: 30000
});
```

**Megjelenítés:**
- Táblázat: Component | Status | Message | Created At
- Státusz badge színek:
  - **error**: destructive (piros)
  - **warning**: amber
  - **info**: secondary (szürke)
- Details mező: hover/expand → JSON viewer

**Mounting:**
```typescript
// src/components/admin/model-status/ModelStatusDashboard.tsx
<SystemOverviewCard />
<SystemLogTable />  {/* Új komponens */}
<PredictionReviewPanel />
```

---

## Parancsok és Tesztek

### Python Pipeline Parancsok

#### 1. Auto-Reinforcement Futtatása

```bash
# Napi automata futtatás (GitHub Actions szimuláció)
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_SERVICE_KEY="your-service-role-key"

python -m ml_pipeline.auto_reinforcement
```

**Opcionális paraméterek:** Módosítható a `config.py`-ban vagy környezeti változókkal.

---

#### 2. Model Training (standalone)

```bash
python ml_pipeline/train_model.py \
  --dataset data/training_dataset.csv \
  --config model_config.yaml \
  --fine_tune true \
  --model_path models/main_model_v1.pkl \
  --output_dir ./models/retrained \
  --epochs 5 \
  --learning_rate 0.001
```

**JSON output:**
```json
{
  "status": "success",
  "metrics": {
    "accuracy": 0.8523,
    "precision": 0.8234,
    "recall": 0.8411,
    "f1_score": 0.8321
  },
  "model_path": "./models/retrained/model_20250115_143022.pkl"
}
```

**Help:**
```bash
python ml_pipeline/train_model.py --help
```

---

#### 3. Data Loader Teszt

```bash
# Ellenőrzi az evaluation log letöltését és szűrést
python -m ml_pipeline.data_loader
```

**Várható output:**
```
INFO: Downloading evaluation log from Supabase Storage...
INFO: Loaded 234 prediction records
INFO: Filtering: incorrect + confidence > 70% + last 7 days
INFO: Found 45 error samples
INFO: Dataset saved to /tmp/retraining_dataset_1736945678.csv
```

---

#### 4. Ensemble Predictor Teszt

```python
from ml_pipeline.ensemble_predictor import EnsemblePredictor

predictor = EnsemblePredictor()
result = predictor.predict(
    full_time_prediction='HOME',
    full_time_confidence=0.75,
    half_time_prediction='DRAW',
    half_time_confidence=0.55,
    pattern_prediction='HOME',
    pattern_confidence=0.68
)

print(result)
# {
#   "winner": "home_win",
#   "final_confidence": 0.68,
#   "conflict_detected": False,
#   ...
# }
```

---

### Unit Tesztek

**Fájlok:** `ml_pipeline/tests/`

#### 1. `test_data_loader.py`

```bash
pytest ml_pipeline/tests/test_data_loader.py -v
```

**Tesztelendő funkciók:**
- Filtering logic (incorrect + confidence > threshold)
- Date range filtering (last N days)
- Minimum sample check
- CSV dataset creation

---

#### 2. `test_train_model.py`

```bash
pytest ml_pipeline/tests/test_train_model.py -v
```

**Tesztelendő funkciók:**
- Training subprocess call
- JSON output parsing
- Metrics calculation (accuracy, precision, recall, F1)
- CLI argument parsing

---

#### 3. `test_system_log.py`

```bash
pytest ml_pipeline/tests/test_system_log.py -v
```

**Tesztelendő funkciók:**
- `insert_system_log()` sikeres hívás
- Graceful failure (Supabase unavailable)
- No exception raised on log failure
- Details JSON serialization

---

#### 4. `test_ensemble_predictor.py`

```bash
pytest ml_pipeline/tests/test_ensemble_predictor.py -v
```

**Tesztelendő funkciók:**
- Weighted voting logic
- Dynamic re-weighting (null model handling)
- Conflict detection (top 2 scores < 10% diff)
- Outcome normalization

---

### Összes Teszt Futtatása

```bash
# Minden Python teszt
pytest ml_pipeline/tests/ -v

# Coverage riporttal
pytest ml_pipeline/tests/ --cov=ml_pipeline --cov-report=html

# Specifikus teszt osztály
pytest ml_pipeline/tests/test_auto_reinforcement.py::TestAutoReinforcement -v
```

---

### E2E Tesztek (Playwright)

**Frontend komponensek tesztelése:**

```bash
npx playwright test
```

**Releváns tesztek:**
- `PredictionsView` betöltés
- `FeedbackForm` submit
- `PredictionReviewPanel` admin műveletek
- `MonitoringPage` auto-refresh

---

## Összefoglalás

Ez a dokumentáció átfogó képet nyújt a WinMix TipsterHub predikciós és feedback pipeline-járól:

1. **Frontend:** React komponensek, amelyek megjelenítenek predikciókat, gyűjtenek visszajelzéseket, és adminisztrálják a blokkolt előrejelzéseket.
2. **Supabase Edge Functions:** Deno-alapú API végpontok, amelyek kezelik az adatbázis műveleteket, validációkat, és RBAC védelmet.
3. **Adatbázis:** PostgreSQL táblák RLS policy-kkal, amelyek tárolják a predikciókat, visszajelzéseket, újratanítási futtatásokat, és rendszer naplókat.
4. **Python ML Backend:** Prediction engine, ensemble predictor, auto-reinforcement orchestration, és training pipeline.
5. **Feedback Loop:** Felhasználó visszajelzés → pattern accuracy frissítés → evaluation log → admin triage → auto-retraining.
6. **Auto-Reinforcement:** Napi GitHub Actions workflow + kézi trigger, amely automatikusan újratanítja a modellt hibaadatok alapján.
7. **Rendszer Naplózás:** Központi `system_logs` tábla, Python instrumentáció, admin UI megjelenítés.

**Kapcsolódó Dokumentációk:**
- [AUTO_REINFORCEMENT.md](./AUTO_REINFORCEMENT.md) – Részletes auto-reinforcement konfiguráció
- [EXPLAINABILITY_SAFEGUARDS.md](./EXPLAINABILITY_SAFEGUARDS.md) – Ensemble safeguards és confidence downgrade
- [TRAINING_PIPELINE.md](../TRAINING_PIPELINE.md) – Model training folyamat
- [API_REFERENCE.md](./API_REFERENCE.md) – Edge Functions API dokumentáció

**Parancsok Gyors Referencia:**
```bash
# Auto-reinforcement futtatása
python -m ml_pipeline.auto_reinforcement

# Model training (standalone)
python ml_pipeline/train_model.py --help

# Tesztek
pytest ml_pipeline/tests/ -v

# Ensemble predictor CLI
python -m ml_pipeline.ensemble_predictor
```

**GitHub Actions:**
- `.github/workflows/auto-reinforcement.yml` – Napi 2:00 UTC
- Manual trigger: Actions tab → "Auto Model Reinforcement" → "Run workflow"

---

**Utolsó frissítés:** 2025-01-15

**Dokumentum verzió:** 1.0.0

**Karbantartók:** WinMix Dev Team
