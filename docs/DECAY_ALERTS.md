# Prediction Decay Alerts (Pontosság Csökkenés Riasztások)

## Overview

The Prediction Decay Alerts system provides automated monitoring of model prediction accuracy, detecting significant performance degradation and triggering actionable alerts for the operations team.

## Features

### 1. Daily Accuracy Tracking
- Aggregates prediction accuracy metrics daily from evaluated predictions
- Calculates rolling 3-day and 7-day accuracy windows
- Computes accuracy drop percentage to detect degradation trends
- Stores detailed breakdown by league, outcome type, etc. in JSONB payload

### 2. Decay Detection Algorithm
The system monitors for accuracy decay using the following criteria:

**Detection Threshold:**
- Drop percentage ≥ 20% triggers an alert
- Requires at least 7 days of data for accurate detection

**Severity Levels:**
- **Warning** (20-30% drop): Minor performance degradation
- **Critical** (30-40% drop): Significant performance issues
- **Severe** (≥40% drop): Critical system failure requiring immediate action

**Calculation Method:**
```typescript
drop_percentage = ((7_day_accuracy - 3_day_accuracy) / 7_day_accuracy) * 100
```

Example:
- 7-day average: 75%
- 3-day recent: 60%
- Drop: ((75 - 60) / 75) * 100 = 20% → Warning level alert

### 3. Alert Lifecycle

**Status Flow:**
1. **Pending** - Initial state when decay is detected
2. **Acknowledged** - Team has viewed the alert
3. **Auto Retrain Triggered** - Automatic model retraining initiated
4. **Overridden** - Alert dismissed with reason (e.g., seasonal anomaly)

### 4. Monitoring UI

The Prediction Decay Card is displayed on the Monitoring page and shows:
- 7-day average accuracy
- 3-day recent accuracy (with trend indicator)
- Performance drop percentage
- Alert severity with color coding
- Period covered by the alert
- Action buttons (Auto Retrain / Override)

**Color Coding:**
- 🔴 Red border: Severe (≥40% drop)
- 🟠 Orange border: Critical (30-40% drop)
- 🟡 Yellow border: Warning (20-30% drop)
- 🟢 Green: No alerts (healthy state)

## Database Schema

### prediction_accuracy_daily
Stores daily aggregated accuracy metrics with rolling averages.

```sql
CREATE TABLE public.prediction_accuracy_daily (
  id UUID PRIMARY KEY,
  date DATE UNIQUE NOT NULL,
  total_predictions INTEGER NOT NULL,
  correct_predictions INTEGER NOT NULL,
  accuracy_pct NUMERIC(5,2) NOT NULL,
  rolling_3day_accuracy NUMERIC(5,2),
  rolling_7day_accuracy NUMERIC(5,2),
  accuracy_drop_pct NUMERIC(5,2),
  raw_payload JSONB,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

### prediction_decay_events
Records decay events requiring attention.

```sql
CREATE TABLE public.prediction_decay_events (
  id UUID PRIMARY KEY,
  window_start DATE NOT NULL,
  window_end DATE NOT NULL,
  three_day_accuracy NUMERIC(5,2) NOT NULL,
  seven_day_avg_accuracy NUMERIC(5,2) NOT NULL,
  drop_percentage NUMERIC(5,2) NOT NULL,
  severity TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  action_taken TEXT,
  override_reason TEXT,
  overridden_by UUID REFERENCES auth.users(id),
  triggered_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ
);
```

## Edge Function: model-decay-monitor

**Endpoint:** `model-decay-monitor`

**Schedule:** Daily at 3:00 AM UTC (via scheduled_jobs)

**Process:**
1. Fetches evaluated predictions from last 30 days
2. Aggregates by date (total predictions, correct predictions)
3. Calculates rolling windows for each date
4. Upserts daily statistics to `prediction_accuracy_daily`
5. Checks latest metrics for decay (≥20% drop)
6. Creates `prediction_decay_events` record if threshold exceeded
7. Avoids duplicate events for the same period

**Response:**
```json
{
  "message": "Decay metrics computed successfully",
  "stats_computed": 30,
  "decay_events_created": 1,
  "latest_metrics": {
    "date": "2025-12-26",
    "accuracy_3day": 65.5,
    "accuracy_7day": 82.3,
    "drop_percentage": 20.4
  }
}
```

## Frontend Component

### PredictionDecayCard

**Location:** `src/components/monitoring/PredictionDecayCard.tsx`

**Features:**
- Real-time display of pending decay alerts
- Auto-refresh every 60 seconds
- Auto Retrain button - triggers model retraining
- Override button - opens dialog for dismissal with reason
- Loading and empty states

**Usage:**
```tsx
import { PredictionDecayCard } from '@/components/monitoring/PredictionDecayCard';

<PredictionDecayCard />
```

## User Actions

### Auto Retrain
Initiates automatic model retraining with high priority:
1. Updates event status to `auto_retrain_triggered`
2. Records action timestamp
3. Marks event as resolved
4. (Future) Triggers `model-auto-retrain` edge function

### Override Alert
Dismisses the alert with documented reason:
1. Opens dialog for reason input
2. Requires text explanation (e.g., "Seasonal anomaly during holiday period")
3. Updates event status to `overridden`
4. Records user ID and timestamp
5. Marks event as resolved

## Scheduled Job Configuration

The decay monitor runs as a scheduled job:

```json
{
  "job_name": "model_decay_monitor",
  "job_type": "monitoring",
  "cron_schedule": "0 3 * * *",
  "enabled": true,
  "config": {
    "description": "Daily accuracy decay detection and alert generation",
    "function_name": "model-decay-monitor",
    "retention_days": 30,
    "alert_threshold": 20
  }
}
```

**To seed the job:**
```bash
node scripts/seed-decay-monitor-job.mjs
```

## Testing

### Manual Testing

1. **Create test predictions with varying accuracy:**
```sql
-- Insert predictions with known accuracy patterns
-- Day 1-7: 80% accuracy
-- Day 8-10: 60% accuracy (triggers alert)
```

2. **Trigger the edge function manually:**
```bash
curl -X POST https://your-project.supabase.co/functions/v1/model-decay-monitor \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY"
```

3. **Verify alert in UI:**
- Navigate to `/monitoring` page
- Check for Prediction Decay Card
- Verify metrics and severity display
- Test Auto Retrain button
- Test Override dialog

### Expected Behaviors

**Healthy State (no decay):**
- Green checkmark icon
- "No Decay Alerts" message
- No action buttons displayed

**Warning State (20-30% drop):**
- Yellow border
- Warning badge
- Metrics displayed
- Both action buttons enabled

**Critical State (30-40% drop):**
- Orange border
- Critical badge (default variant)
- Metrics highlighted
- Both action buttons enabled

**Severe State (≥40% drop):**
- Red border
- Severe badge (destructive variant)
- Metrics in danger colors
- Both action buttons enabled

## Troubleshooting

### No decay events created despite poor accuracy

**Possible causes:**
1. Not enough data (need at least 7 days)
2. Drop percentage below 20% threshold
3. Predictions not marked as evaluated (`evaluated_at` is NULL)

**Solution:**
- Check `predictions` table for `was_correct` and `evaluated_at` columns
- Verify at least 7 days of evaluated predictions exist
- Run edge function manually to see debug output

### Frontend shows loading state indefinitely

**Possible causes:**
1. Database RLS policies blocking access
2. Network errors
3. Supabase connection issues

**Solution:**
- Check browser console for errors
- Verify user authentication
- Check RLS policies for `prediction_decay_events`

### Auto Retrain doesn't trigger

**Note:** The auto-retrain integration is marked as TODO in the codebase. Currently:
- Event status updates correctly
- Action is logged with timestamp
- Actual model retraining requires Task 4 integration

## Future Enhancements

1. **Integration with Auto Reinforcement (Task 4)**
   - Trigger actual model retraining via `model-auto-retrain` function
   - Track retraining job status
   - Display progress in UI

2. **Historical Decay Tracking**
   - View for past decay events
   - Trend analysis over time
   - Pattern recognition in decay causes

3. **Multi-League Breakdown**
   - Separate alerts per league
   - League-specific thresholds
   - Comparative analysis

4. **Notification System**
   - Email/Slack notifications for critical alerts
   - Escalation rules
   - On-call rotation integration

5. **Predictive Decay Detection**
   - ML model to predict decay before it reaches threshold
   - Early warning system
   - Proactive retraining

## Related Documentation

- [Explainability Safeguards](./EXPLAINABILITY_SAFEGUARDS.md)
- [Scheduled Jobs](../IMPLEMENTATION_SUMMARY.md#phase-3-scheduled-jobs)
- [Monitoring System](../REPOSITORY_OVERVIEW.md#monitoring)
- [RLS Policies](../README.md#security)
