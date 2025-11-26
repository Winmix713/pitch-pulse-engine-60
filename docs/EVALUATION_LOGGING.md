# Evaluation Logging System Documentation

## Overview

The evaluation logging system provides robust tracking of prediction accuracy over time, enabling data-driven improvements for the prediction engine. It uses an event sourcing approach with CSV-based storage for simplicity and reliability.

## Architecture

### Storage Schema

The evaluation log is stored as `/tmp/evaluation_log.csv` with the following schema:

```
prediction_id,timestamp,model_version,team_a,team_b,predicted_result,actual_result,confidence
```

- **`prediction_id`**: UUIDv4 string for linking initial prediction with later actual result
- **`timestamp`**: ISO 8601 formatted string (UTC) 
- **`model_version`**: Git commit hash or version string for performance tracking
- **`team_a`**: Home team name
- **`team_b`**: Away team name  
- **`predicted_result`**: Initial prediction ("home_win", "away_win", "draw")
- **`actual_result`**: Actual match result (null until reconciled)
- **`confidence`**: Normalized float (0.00–1.00)

### Event Sourcing Logic

The system uses append-only operations for data safety:

1. **Initial Prediction**: Row with `actual_result=null`
2. **Result Reconciliation**: New row with same `prediction_id` but filled `actual_result`

When processing the CSV, group by `prediction_id` and merge rows to compare prediction vs actual.

## Usage

### Automatic Integration

The evaluation logging is automatically integrated into the prediction workflow:

1. **Prediction Generation** (`analyze-match` Edge Function):
   - Generates unique UUID for each prediction
   - Logs initial prediction with `actual_result=null`
   - Returns `prediction_id` in response for display

2. **Result Reconciliation** (`reconcile-prediction-result` Edge Function):
   - Accepts `prediction_id` and `actual_result`
   - Updates database record
   - Logs reconciliation event to CSV

### Manual Testing

Use the test script to verify functionality:

```bash
# Run comprehensive tests
node test-evaluation-logging.cjs

# View the generated log
cat /tmp/evaluation_log.csv
```

### API Usage

#### Create Prediction (Automatic)
```typescript
// Called automatically by analyze-match Edge Function
const predictionId = generatePredictionId();
await logPredictionEvent(
  predictionId,
  "Manchester United", 
  "Liverpool",
  0.75, // confidence 0-1
  "home_win",
  null, // actual_result at prediction time
  modelVersion
);
```

#### Reconcile Result
```bash
# Via Supabase CLI
supabase functions invoke reconcile-prediction-result \
  --data '{"prediction_id":"uuid-here","actual_result":"away_win"}'
```

## Data Analysis

### Processing the Log

When analyzing prediction accuracy:

```python
import pandas as pd

# Read the log
df = pd.read_csv('/tmp/evaluation_log.csv')

# Group by prediction_id and merge
predictions = df.groupby('prediction_id').agg({
    'predicted_result': 'first',
    'actual_result': 'last', 
    'confidence': 'first',
    'model_version': 'first',
    'timestamp': 'first'
}).dropna()  # Only include reconciled predictions

# Calculate accuracy
accuracy = (predictions['predicted_result'] == predictions['actual_result']).mean()
print(f"Overall accuracy: {accuracy:.2%}")

# Accuracy by model version
accuracy_by_version = predictions.groupby('model_version').apply(
    lambda x: (x['predicted_result'] == x['actual_result']).mean()
)
```

### Retention Policy

- **Safe to archive/delete**: Rows older than 90 days
- **Recommended**: Keep at least 30 days for short-term analysis
- **Long-term storage**: Consider moving to database for historical analysis

## Model Version Tracking

The system automatically tracks model versions:

1. **Git Integration**: Attempts to use current git commit hash
2. **Fallback**: Uses `MODEL_VERSION` environment variable or "v1.0"
3. **Purpose**: Track performance changes across code updates

```bash
# Set custom model version
export MODEL_VERSION="v2.1-experimental"

# Or let it auto-detect from git
cd /path/to/repo
git rev-parse HEAD  # -> a1b2c3d
```

## Error Handling

The system includes robust error handling:

- **File Creation**: Auto-creates CSV with header if missing
- **Validation**: Ensures confidence is between 0-1
- **Atomic Writes**: Append-only operations prevent corruption
- **Graceful Degradation**: Logging errors don't crash prediction requests

## Troubleshooting

### Common Issues

1. **Permission Denied**: Ensure Edge Functions can write to `/tmp/`
2. **Missing Header**: File auto-creates on first write
3. **Invalid UUID**: System generates valid UUIDv4 automatically
4. **Timestamp Format**: Always ISO 8601 UTC

### Debug Commands

```bash
# Check log file exists and has header
head -1 /tmp/evaluation_log.csv

# Count total entries
wc -l /tmp/evaluation_log.csv

# View recent entries
tail -10 /tmp/evaluation_log.csv

# Test the system
node test-evaluation-logging.cjs
```

## Integration with Existing Features

The evaluation logging integrates seamlessly with:

- **Phase 4 Analytics**: Enhanced model evaluation capabilities
- **Phase 6 Models**: Version tracking for champion/challenger framework
- **Phase 8 Monitoring**: System health includes logging metrics
- **Phase 9 Intelligence**: Data feeds collaborative learning algorithms

## Security Considerations

- **File Location**: Uses `/tmp/` for container-appropriate storage
- **Data Privacy**: No personal data stored, only prediction metrics
- **Access Control**: Edge Functions enforce admin/analyst requirements
- **Audit Trail**: All reconciliations logged to audit table

## Future Enhancements

Potential improvements to consider:

1. **Database Storage**: Move to Supabase table for better querying
2. **Real-time Analytics**: WebSocket updates for live accuracy tracking
3. **Advanced Metrics**: Calibration curves, Brier scores, ROC analysis
4. **Automated Retention**: Scheduled cleanup of old entries
5. **Export Features**: CSV/JSON export for external analysis tools