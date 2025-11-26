# Rare Patterns Insights (HIGH VALUE PATTERNS)

## Overview

The Rare Patterns Insights feature identifies statistically rare (<5% occurrence) but highly reliable (≥80% accuracy) prediction patterns. These insights provide valuable intelligence about emerging winning strategies and edge cases in sports prediction.

## Feature Highlights

- **Rarity Detection**: Identifies patterns occurring in less than 5% of all predictions
- **Reliability Assurance**: Filters for patterns with ≥80% accuracy
- **Statistical Rigor**: Requires minimum 5 samples for statistical credibility
- **Automatic Expiry**: Patterns automatically expire after 30 days
- **Visual Prominence**: Displays as "HIGH VALUE PATTERN" badges on prediction cards with detailed tooltips

## Technical Architecture

### 1. Pattern Discovery Process

#### Data Input
- **Source**: Prediction evaluation logs (CSV format)
- **Required Columns**: `predicted_result`, `actual_result`, `confidence`
- **Optional Columns**: `btts_prediction`, `template_name`, `timestamp`, `team_a`, `team_b`

#### Pattern Signature
Patterns are identified using a composite key:
```
pattern_key = predicted_outcome + "_" + btts_prediction + "_" + template_name
```

Example: `HOME_true_counterattack_template`

#### Calculation Logic
```
frequency = (pattern_occurrences / total_predictions) * 100
accuracy = (correct_predictions / total_pattern_predictions) * 100
```

#### Filtering Criteria
```
patterns_of_interest = {
  frequency < 5.0% AND
  accuracy >= 80.0% AND
  sample_size >= 5
}
```

### 2. Python Script: `ml_pipeline/rare_pattern_finder.py`

Main entry point for discovering rare patterns from evaluation logs.

#### Usage

**Command Line:**
```bash
python ml_pipeline/rare_pattern_finder.py <log_file> \
  --frequency-threshold 0.05 \
  --accuracy-threshold 0.80 \
  --min-samples 5 \
  --output patterns.json
```

**As Python Module:**
```python
from ml_pipeline.rare_pattern_finder import find_rare_patterns

patterns = find_rare_patterns(
    evaluation_log_path="evaluation_log.csv",
    frequency_threshold=0.05,  # 5%
    accuracy_threshold=0.80,   # 80%
    min_sample_size=5
)

print(f"Found {len(patterns)} rare patterns")
for pattern in patterns:
    print(f"  {pattern['label']}: {pattern['accuracy_pct']}% accuracy")
```

#### Output Format

```json
[
  {
    "pattern_key": "HOME_true_counterattack",
    "label": "Home Win + BTTS + Counterattack",
    "frequency_pct": 3.2,
    "accuracy_pct": 87.5,
    "sample_size": 8,
    "supporting_matches": [
      {
        "match_id": 12345,
        "date": "2025-01-15",
        "teams": "Team A vs Team B"
      }
    ],
    "discovered_at": "2025-11-20T10:30:00Z",
    "expires_at": "2025-12-20T10:30:00Z",
    "highlight_text": "Rare but reliable: Home teams win with BTTS in counterattack scenarios"
  }
]
```

### 3. Database Schema

#### Table: `high_value_patterns`

```sql
CREATE TABLE public.high_value_patterns (
  id UUID PRIMARY KEY,
  pattern_key TEXT UNIQUE NOT NULL,
  label TEXT NOT NULL,
  frequency_pct NUMERIC(5,2) NOT NULL,  -- CHECK: < 5.0
  accuracy_pct NUMERIC(5,2) NOT NULL,   -- CHECK: >= 80.0
  sample_size INTEGER NOT NULL,          -- CHECK: >= 5
  supporting_matches JSONB NOT NULL,     -- Array of match data
  discovered_at TIMESTAMPTZ NOT NULL,    -- Creation timestamp
  expires_at TIMESTAMPTZ NOT NULL,       -- 30-day expiry
  highlight_text TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### Indexes

- `idx_hvp_active`: Performance for active patterns queries
- `idx_hvp_expiry`: Performance for expiry checks
- `idx_hvp_pattern_key`: Unique pattern lookup

#### Automatic Expiry

Expired patterns (where `expires_at < now()`) are automatically deactivated:

```sql
UPDATE high_value_patterns
SET is_active = false, updated_at = now()
WHERE is_active = true AND expires_at < now();
```

This is triggered daily and when syncing new patterns.

#### Row-Level Security

```sql
-- Read: Authenticated users can read active patterns
CREATE POLICY "Authenticated users can read patterns"
  ON public.high_value_patterns FOR SELECT
  USING (auth.role() = 'authenticated' OR is_active = true);

-- Write: Only service role can create/update patterns
CREATE POLICY "Service role can write patterns"
  ON public.high_value_patterns FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');
```

### 4. Edge Function: `rare-pattern-sync`

Supabase Edge Function for syncing discovered patterns to the database.

#### Endpoint
```
POST /functions/v1/rare-pattern-sync
```

#### Request Schema (Zod Validation)

```typescript
{
  patterns: [
    {
      pattern_key: string,
      label: string,
      frequency_pct: number (0-5),
      accuracy_pct: number (80-100),
      sample_size: number (≥5),
      supporting_matches: [
        {
          match_id?: number,
          date: string,
          teams: string
        }
      ],
      discovered_at: string (ISO 8601),
      expires_at: string (ISO 8601),
      highlight_text?: string
    }
  ]
}
```

#### Example Request

```bash
curl -X POST https://your-supabase.functions.supabase.co/functions/v1/rare-pattern-sync \
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "patterns": [
      {
        "pattern_key": "HOME_true_counterattack",
        "label": "Home Win + BTTS + Counterattack",
        "frequency_pct": 3.2,
        "accuracy_pct": 87.5,
        "sample_size": 8,
        "supporting_matches": [
          {"match_id": 12345, "date": "2025-01-15", "teams": "Team A vs Team B"}
        ],
        "discovered_at": "2025-11-20T10:30:00Z",
        "expires_at": "2025-12-20T10:30:00Z",
        "highlight_text": "Rare but reliable pattern"
      }
    ]
  }'
```

#### Response

**Success (200):**
```json
{
  "message": "Pattern sync completed successfully",
  "synced": 5,
  "timestamp": "2025-11-20T10:35:00Z"
}
```

**Validation Error (400):**
```json
{
  "error": "Invalid request schema",
  "details": [...]
}
```

#### Implementation Details

1. **Validation**: All patterns validated against Zod schema
2. **Upsert**: Patterns upserted by `pattern_key` (updates existing)
3. **Expiry**: Automatically deactivates patterns past their `expires_at`
4. **Service Role**: Function requires `service_role` permissions

### 5. Frontend Component: `HighValuePatternBadge`

React component for displaying rare patterns on prediction cards.

#### Location
```
src/components/common/HighValuePatternBadge.tsx
```

#### Props

```typescript
interface HighValuePatternBadgeProps {
  pattern: HighValuePattern;
  showTooltip?: boolean;  // Default: true
}

interface HighValuePattern {
  pattern_key: string;
  label: string;
  frequency_pct: number;
  accuracy_pct: number;
  sample_size: number;
  highlight_text?: string;
  supporting_matches?: Array<{
    match_id?: number;
    date: string;
    teams: string;
  }>;
  discovered_at?: string;
  expires_at?: string;
}
```

#### Visual Design

- **Badge**: Gradient amber-to-orange with sparkles icon
- **Tooltip**: Comprehensive info including:
  - Pattern label
  - Frequency, accuracy, sample size metrics
  - Highlight text
  - Supporting match list (first 3)
  - Discovery and expiry dates

#### Usage Example

```tsx
import { HighValuePatternBadge } from '@/components/common/HighValuePatternBadge';

function PredictionCard({ prediction }) {
  const [patterns] = useState<HighValuePattern[]>([...]);

  return (
    <Card>
      {/* ... prediction content ... */}
      
      {patterns.map(pattern => (
        <HighValuePatternBadge key={pattern.pattern_key} pattern={pattern} />
      ))}
    </Card>
  );
}
```

#### Styling

- **Container**: Gradient background (amber-500 to orange-600)
- **Text**: White text with shadow for contrast
- **Icon**: Sparkles (lucide-react)
- **Hover**: Darker gradient with smooth transition
- **Tooltip**: Dark background with proper contrast ratios

## Integration Points

### Analytics Dashboard
- Display patterns in analytics summary cards
- Show top 5 patterns by accuracy
- Link to pattern history

### Phase 9 System
- Feed patterns to self-improving model
- Use pattern confidence for model training
- Track pattern effectiveness over time

### Prediction Cards
- Show badge when prediction matches a rare pattern
- Highlight in bright, eye-catching gradient

## Automation & Scheduling

### Daily Pattern Discovery Workflow

**Trigger**: 02:00 UTC daily

**Steps**:
1. Export evaluation log from database
2. Run `rare_pattern_finder.py`
3. POST results to `rare-pattern-sync` edge function
4. Deactivate patterns beyond 30-day TTL
5. Log results for monitoring

### Manual Sync CLI

```bash
# Run pattern discovery immediately
python ml_pipeline/rare_pattern_finder.py evaluation_log.csv | \
  curl -X POST https://your-supabase.functions.supabase.co/functions/v1/rare-pattern-sync \
    -H "Authorization: Bearer YOUR_KEY" \
    -H "Content-Type: application/json" \
    -d @-
```

## Data Flow Diagram

```
evaluation_log.csv
    ↓
rare_pattern_finder.py
(discovery & filtering)
    ↓
patterns.json
(high value insights)
    ↓
rare-pattern-sync
(edge function)
    ↓
high_value_patterns table
(database storage)
    ↓
Frontend Component
(HighValuePatternBadge)
    ↓
Prediction Cards & Analytics
(user visibility)
```

## Expiry & Lifecycle

### Pattern Lifecycle

1. **Discovery** (T0): Pattern identified and inserted with `discovered_at = now()`
2. **TTL Set** (T0): `expires_at = now() + 30 days`
3. **Active** (T0 - T+30): Pattern is `is_active = true`
4. **Expired** (T+30): Pattern marked `is_active = false`
5. **Archived** (T+90): Eligible for hard deletion (optional)

### 30-Day Expiry Rationale

- Patterns become stale as matchplay evolves
- 30 days = ~10 match days in most leagues
- Long enough to accumulate sufficient data
- Short enough to maintain freshness

### Automatic Deactivation

Triggered at:
- Pattern sync completion (via edge function)
- Daily scheduled job (02:00 UTC)
- On-demand via CLI: `python ml_pipeline/deactivate_expired.py`

## Monitoring & Observability

### Key Metrics

- **Patterns Discovered**: Count by day/week
- **Average Pattern Accuracy**: Should remain ≥80%
- **Expiry Rate**: Patterns naturally expiring after 30 days
- **Pattern Adoption**: Predictions matching high-value patterns

### Logging

All discovery operations logged with:
- Pattern count
- Discovery timestamp
- Processing duration
- Any validation errors

### Alerts

- Alert if pattern accuracy drops below 75% (data quality issue)
- Alert if discovery fails (missing evaluation log)
- Alert if sync to database fails

## Testing

### Unit Tests

```bash
# Test badge component rendering
npm run test -- HighValuePatternBadge.test.tsx

# Test Python script
python -m pytest ml_pipeline/test_rare_pattern_finder.py
```

### Integration Tests

```bash
# Test end-to-end workflow
npm run test -- rare-pattern-sync.integration.test.ts
```

### Manual Testing

1. Create sample evaluation log with known patterns
2. Run discovery script
3. Verify pattern detection accuracy
4. Check database insertion via edge function
5. Verify UI rendering with test data

## Best Practices

### For Analysis Teams
- Review patterns weekly for strategic insights
- Monitor false positives (patterns breaking after discovery)
- Adjust thresholds if patterns too rare or too frequent
- Document league-specific pattern behaviors

### For Developers
- Always validate schema before sync
- Monitor expiry job for performance issues
- Keep pattern discovery logs for audit trail
- Test new pattern signatures in staging first

### For Operations
- Schedule pattern discovery during low-traffic hours
- Monitor database size (patterns table)
- Plan for archival strategy after 90 days
- Backup evaluation logs before processing

## Troubleshooting

### No Patterns Discovered

**Symptoms**: Pattern finder returns empty array

**Causes**:
- Evaluation log too small (< 100 predictions)
- Thresholds too strict (frequency < 2%, accuracy > 90%)
- No evaluated predictions in log

**Solutions**:
- Relax thresholds temporarily for testing
- Check evaluation log row count
- Verify predictions have actual results

### Pattern Sync Fails

**Symptoms**: Edge function returns 400 or 500

**Causes**:
- Schema validation failure (wrong field types)
- Service role authentication issue
- Database permissions problem

**Solutions**:
- Check pattern JSON schema against validation rules
- Verify `SUPABASE_SERVICE_ROLE_KEY` set correctly
- Check RLS policies on `high_value_patterns` table

### Patterns Show as Expired Too Soon

**Symptoms**: Patterns inactive after < 30 days

**Causes**:
- Clock skew on server
- Manual deactivation job ran unexpectedly
- `expires_at` calculation error

**Solutions**:
- Verify server time synchronization
- Check job logs for unexpected runs
- Regenerate pattern with correct `expires_at`

## Performance Considerations

### Database Queries

```sql
-- Get active patterns (typical query)
SELECT * FROM high_value_patterns 
WHERE is_active = true AND expires_at > now()
ORDER BY accuracy_pct DESC
LIMIT 10;
-- Uses: idx_hvp_active, idx_hvp_expiry
-- Expected: < 5ms
```

### Script Performance

- Discovery script: O(n log n) where n = prediction count
- Typical: ~1000 predictions/second
- 100k predictions: ~10 seconds
- 1M predictions: ~100 seconds

### Edge Function Performance

- Validation: O(m) where m = patterns count
- Upsert: O(m) with database index
- Typical: < 500ms for 50 patterns

## Security Considerations

- **RLS Enforced**: Only service role can write patterns
- **Validation**: All inputs validated with Zod
- **SQL Injection**: Protected via parameterized queries
- **Rate Limiting**: Consider adding to edge function for public access
- **Audit Trail**: All syncs logged with timestamp and user info

## Future Enhancements

- Pattern clustering (group similar patterns)
- Machine learning for pattern prediction
- A/B testing framework for new patterns
- User feedback on pattern quality
- Real-time pattern monitoring dashboard
- Pattern version history and rollback
