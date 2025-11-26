# Explainability Safeguards and Overconfidence Blocker

## Overview

The Explainability Safeguards feature adds human-readable explanations to predictions and implements an **Overconfidence Blocker** that prevents predictions with >95% confidence from being served as active if similar high-confidence predictions have failed in the past 30 days.

## Features

### 1. Prediction Explanations

Every prediction now includes structured explanations containing:

- **Summary**: High-level explanation of prediction rationale
- **Key Factors**: Top contributing factors with weights and details
- **Decision Tree**: Step-by-step decision logic
- **Confidence Breakdown**: Base confidence, pattern boost, and final confidence

#### Explanation JSON Schema

```json
{
  "summary": "HOME favored due to superior form and home advantage",
  "key_factors": [
    {
      "factor": "Recent Form",
      "weight": 0.35,
      "contribution": "+12%",
      "details": "Home team won 4 of last 5 matches"
    },
    {
      "factor": "Head-to-Head",
      "weight": 0.25,
      "contribution": "+8%",
      "details": "Home team won 3 of last 5 H2H encounters"
    }
  ],
  "decision_tree": [
    "Step 1: Analyzed recent form (5 matches)",
    "Step 2: Evaluated H2H history (weighted 0.25)",
    "Step 3: Applied home advantage factor (+6%)"
  ],
  "confidence_breakdown": {
    "base_confidence": 0.88,
    "pattern_boost": 0.07,
    "final_confidence": 0.95
  }
}
```

### 2. Decision Path Visualization

Decision trees are represented as JSON nodes that can be visualized:

```json
{
  "nodes": [
    {
      "id": 1,
      "type": "root",
      "condition": "Form differential > 0.3",
      "result": true,
      "next_node": 2
    },
    {
      "id": 2,
      "type": "branch",
      "condition": "Home advantage >= 0.15",
      "result": true,
      "outcome": "home_win",
      "confidence_contribution": 0.12
    }
  ]
}
```

### 3. Overconfidence Blocker

The blocker prevents repeated mistakes by detecting patterns:

#### Trigger Conditions
- Prediction confidence > 95%
- Same home team, away team, and predicted outcome found in history
- Similar prediction failed (was_correct = false) in the past 30 days

#### Actions Taken
1. **Downgrade Status**: `'active'` → `'uncertain'`
2. **Reduce Confidence**: New confidence = MIN(0.88, original_confidence * 0.92)
3. **Flag for Review**: Set `overconfidence_flag = true`
4. **Suggest Alternative**: Recommend second-best outcome
5. **Add Reason**: Store explanation of downgrade with timestamp

#### Downgrade Formula
```
downgraded_confidence = MIN(0.88, original_confidence * 0.92)
```

## Database Schema

### New Columns in `public.predictions` Table

```sql
ALTER TABLE public.predictions ADD COLUMN IF NOT EXISTS
  explanation JSONB,                              -- Structured explanation
  decision_path JSONB,                            -- Decision tree representation
  prediction_status TEXT DEFAULT 'active',        -- 'active', 'uncertain', 'blocked'
  overconfidence_flag BOOLEAN DEFAULT false,      -- Flagged for overconfidence
  blocked_reason TEXT,                            -- Human-readable reason
  alternate_outcome TEXT,                         -- Alternative outcome suggestion
  downgraded_from_confidence NUMERIC(5,4),        -- Original confidence before downgrade
  blocked_at TIMESTAMPTZ,                         -- When downgrade occurred
  reviewed_by UUID REFERENCES auth.users(id);     -- Reviewer ID (if manual)
```

### Indexes

```sql
CREATE INDEX idx_predictions_status ON public.predictions(prediction_status);
CREATE INDEX idx_predictions_overconfidence ON public.predictions(overconfidence_flag) 
  WHERE overconfidence_flag = true;
CREATE INDEX idx_predictions_confidence_score ON public.predictions(confidence_score DESC);
CREATE INDEX idx_predictions_created_recent ON public.predictions(created_at DESC) 
  WHERE confidence_score > 0.95 AND prediction_status IN ('active', 'uncertain');
```

### Helper View

The `public.high_confidence_predictions_needing_review` view identifies predictions that may need overconfidence downgrade:

```sql
SELECT 
  p.id,
  p.match_id,
  p.predicted_outcome,
  p.confidence_score,
  p.prediction_status,
  p.overconfidence_flag,
  p.created_at,
  (SELECT COUNT(*) FROM ... ) AS recent_similar_failures
FROM public.predictions p
WHERE p.confidence_score > 0.95
  AND p.prediction_status = 'active'
  AND p.overconfidence_flag = false;
```

## Backend Implementation

### TypeScript/JavaScript

#### PredictionEngine Methods

**1. generateExplanation()**
```typescript
generateExplanation(
  features: Record<string, number>,
  ensembleResult: PredictionResult & { confidence_score?: number }
): PredictionExplanation
```

Generates structured explanation with:
- Factor analysis and weights
- Decision tree steps
- Confidence breakdown

**2. buildDecisionPath()**
```typescript
buildDecisionPath(featureImportance: Record<string, number>): DecisionPath
```

Creates decision tree representation from feature importance scores.

**3. checkOverconfidence()**
```typescript
checkOverconfidence(
  teamPair: [string, string],
  outcome: string,
  confidence: number,
  historicalPredictions: Array<{
    predicted_outcome: string;
    confidence_score: number;
    was_correct: boolean;
    created_at: string;
  }>
): OverconfidenceCheckResult
```

Returns:
```typescript
{
  should_block: boolean;
  reason?: string;
  downgraded_confidence?: number;
  alternate_outcome?: string;
  prior_failure_date?: string;
}
```

### SQL Functions

**check_overconfidence_and_apply_downgrade()**
- Checks for recent similar failures in past 30 days
- Returns downgrade recommendations
- Should be called before inserting predictions

**apply_overconfidence_downgrade()**
- Updates prediction with downgrade status and reason
- Sets confidence score, flags, and timestamps
- Can be called manually or automatically

## Frontend Integration

### PredictionDisplay Component Updates

New props:
```typescript
interface PredictionDisplayProps {
  // ... existing props
  explanation?: PredictionExplanation;
  decisionPath?: DecisionPath;
  predictionStatus?: 'active' | 'uncertain' | 'blocked';
  overconfidenceFlag?: boolean;
  blockedReason?: string;
  alternateOutcome?: string;
  downgradedFromConfidence?: number;
}
```

### Status Badges

- **Active** (Green): "Megerősített előrejelzés" - Normal prediction
- **Uncertain** (Yellow): "Downgrade - Előzetes hiba miatt" - Downgraded due to prior failure
- **Blocked** (Red): "Letiltott - Lásd az okot" - Blocked from serving

### UI Components

#### Downgrade Alert
```tsx
{predictionStatus === 'uncertain' && (
  <Alert variant="warning">
    <AlertTriangle className="h-4 w-4" />
    <AlertTitle>Konfidencia Downgrade</AlertTitle>
    <AlertDescription>
      Eredeti: {downgradedFromConfidence}% → Jelenlegi: {confidence}%
      <br />Alternatíva: {alternateOutcome}
    </AlertDescription>
  </Alert>
)}
```

#### Explanation Accordion
Shows expandable sections for:
- Summary and key factors
- Decision tree steps
- Confidence breakdown

#### Decision Path Visualization
Interactive tree display showing:
- Node hierarchy
- Conditions at each level
- Confidence contributions
- Final outcomes

## Testing

### Unit Tests

Located in `src/__tests__/predictionEngine.overconfidence.test.ts`

Coverage includes:
- Low confidence predictions (no block)
- No prior failures (no block)
- Recent similar failures (block with downgrade)
- 30-day window enforcement
- Alternate outcome suggestions
- Downgrade formula verification
- Multiple failures handling
- Explanation generation
- Decision path building

### Integration Tests

Test full flow:
1. Insert prediction with high confidence
2. Mark as incorrect
3. Submit new similar prediction
4. Verify downgrade applied
5. Verify UI displays correctly

## Usage Guide

### Step 1: Generate Explanation

```typescript
import { predictionEngine } from '@/utils/predictionEngine';

const features = {
  'recent_form': 0.35,
  'h2h_history': 0.25,
  'home_advantage': 0.20
};

const explanation = predictionEngine.generateExplanation(features, ensembleResult);
```

### Step 2: Build Decision Path

```typescript
const decisionPath = predictionEngine.buildDecisionPath(featureImportance);
```

### Step 3: Check for Overconfidence

```typescript
const overconfidenceCheck = predictionEngine.checkOverconfidence(
  ['Manchester City', 'Liverpool'],
  'home_win',
  0.97,
  historicalPredictions
);

if (overconfidenceCheck.should_block) {
  // Apply downgrade
  updatePrediction({
    prediction_status: 'uncertain',
    confidence_score: overconfidenceCheck.downgraded_confidence,
    overconfidence_flag: true,
    blocked_reason: overconfidenceCheck.reason,
    alternate_outcome: overconfidenceCheck.alternate_outcome
  });
}
```

### Step 4: Display in UI

```tsx
<PredictionDisplay
  prediction={prediction}
  explanation={explanation}
  decisionPath={decisionPath}
  predictionStatus={prediction.prediction_status}
  overconfidenceFlag={prediction.overconfidence_flag}
  blockedReason={prediction.blocked_reason}
  alternateOutcome={prediction.alternate_outcome}
  downgradedFromConfidence={prediction.downgraded_from_confidence}
/>
```

## Acceptance Criteria Checklist

- [x] Database migration creates all new columns and indexes
- [x] SQL functions for overconfidence checking and downgrading
- [x] TypeScript types for explanation, decision path, and enhanced predictions
- [x] PredictionEngine.generateExplanation() creates structured explanations
- [x] PredictionEngine.buildDecisionPath() generates decision trees
- [x] PredictionEngine.checkOverconfidence() detects overconfidence patterns
- [x] PredictionDisplay component accepts and displays new props
- [x] Status badges for active/uncertain/blocked predictions
- [x] Alert component for downgrade notifications
- [x] Accordion/expandable sections for explanation and decision path
- [x] Unit tests covering overconfidence logic
- [x] Unit tests covering explanation generation
- [x] Unit tests covering decision path building
- [x] Documentation with schema, API, and usage examples

## Performance Considerations

### Indexes
The `idx_predictions_created_recent` partial index helps efficiently find high-confidence recent predictions that need review.

### Query Optimization
The overconfidence check queries:
1. Last 30 days only (recent predictions)
2. Specific team pair and outcome (narrow scope)
3. Confidence >= 95% (few results expected)

### Caching
Consider caching recent failures in-memory for faster checks if needed.

## Future Enhancements

1. **Machine Learning Integration**: Learn optimal thresholds from historical data
2. **Pattern Detection**: Identify team-specific weaknesses
3. **Seasonal Adjustments**: Account for league dynamics changes
4. **User Feedback Loop**: Improve explanations based on user interactions
5. **Confidence Calibration**: Auto-adjust confidence based on prediction accuracy
6. **A/B Testing**: Test different downgrade thresholds

## Troubleshooting

### Predictions Not Being Downgraded

1. Check that `confidence_score > 0.95` in query
2. Verify `was_correct = false` on historical predictions
3. Check 30-day window: `created_at >= NOW() - INTERVAL '30 days'`
4. Verify matching on `home_team_id`, `away_team_id`, `predicted_outcome`

### Missing Explanations

1. Ensure `generateExplanation()` is called before saving
2. Check that features are passed correctly
3. Verify confidence_score is included in ensembleResult
4. Store JSONB in database without mutations

### UI Not Displaying

1. Verify props are passed to PredictionDisplay
2. Check that data types match interface definitions
3. Inspect component state with React DevTools
4. Verify Alert and Accordion components are imported

## References

- TypeScript Implementation: `8888/utils/predictionEngine.ts`
- Component: `src/components/PredictionDisplay.tsx`
- Database Migration: `supabase/migrations/20251120120000_explainability_safeguards_overconfidence_blocker.sql`
- Tests: `src/__tests__/predictionEngine.overconfidence.test.ts`
- Types: `8888/types/sportradar.ts`
