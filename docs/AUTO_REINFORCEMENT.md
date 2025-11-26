# Auto Reinforcement Loop - Model Fine-tuning Guide

## Overview

The Auto Reinforcement Loop is an automated system that monitors prediction accuracy and automatically fine-tunes the ML model when performance degrades. This feature collects high-confidence prediction errors, creates fine-tuning datasets, and retrains the model daily.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│ Daily Schedule (GitHub Actions) / Manual Request (Web UI)      │
└────────────────────────────┬────────────────────────────────────┘
                             │
                   ┌─────────▼────────────┐
                   │ auto_reinforcement.py│
                   └─────────┬────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
┌───────▼────────┐  ┌───────▼──────┐   ┌────────▼─────────┐
│ data_loader.py │  │supabase_...py│   │ train_model.py   │
│ • Load eval log│  │ • Fetch requests
│ • Filter errors│  │ • Update status│   │ • Train model    │
│ • Create dataset│  │ • Upload logs  │   │ • Output metrics │
└────────┬────────┘  └────────┬──────┘   └────────┬─────────┘
         │                    │                    │
         └────────────────────┼────────────────────┘
                              │
                    ┌─────────▼────────────┐
                    │  Supabase Database   │
                    │ • model_retraining_* │
                    │ • Model artifacts    │
                    └──────────────────────┘
```

## Features

### 1. Automatic Daily Retraining
- Runs daily at 2:00 UTC via GitHub Actions
- Evaluates prediction errors from the last 7 days
- Filters errors with confidence > 70% (excludes low-confidence mistakes)
- Requires minimum 10 error samples to trigger retraining

### 2. Manual Retraining Requests
- Users can manually trigger retraining from the Monitoring page
- Requests are queued and prioritized
- Support for user-provided reason/description
- Real-time status updates in UI

### 3. Comprehensive Logging
- All retraining runs stored in `model_retraining_runs` table
- Metrics captured: accuracy, precision, recall, F1-score
- Training logs uploaded to Supabase Storage
- Error tracking for failed runs

## Database Schema

### model_retraining_runs
```sql
id UUID PRIMARY KEY
source TEXT -- 'auto_daily', 'manual', 'decay_triggered'
dataset_size INTEGER -- Number of error samples
fine_tune_flag BOOLEAN -- true for fine-tuning, false for from-scratch
status TEXT -- 'pending', 'running', 'completed', 'failed'
metrics JSONB -- { "accuracy": 0.85, "precision": 0.82, ... }
started_at TIMESTAMPTZ
completed_at TIMESTAMPTZ
log_url TEXT
error_message TEXT
triggered_by UUID
```

### model_retraining_requests
```sql
id UUID PRIMARY KEY
requested_by UUID -- User who requested retraining
reason TEXT -- Optional reason/description
priority TEXT -- 'low', 'normal', 'high'
status TEXT -- 'pending', 'processing', 'completed', 'cancelled'
processed_at TIMESTAMPTZ
retraining_run_id UUID -- Link to actual run
```

## Configuration

### Environment Variables

```bash
# Required
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key

# Optional
LOG_LEVEL=INFO  # DEBUG, INFO, WARNING, ERROR
DEBUG=false
```

### Default Settings (ml_pipeline/config.py)

```python
DEFAULT_LOOKBACK_DAYS = 7              # Days to look back for errors
MIN_ERROR_SAMPLES_FOR_RETRAINING = 10  # Minimum errors to trigger retraining
ERROR_CONFIDENCE_THRESHOLD = 0.7       # Only high-confidence errors included
DEFAULT_FINE_TUNE_EPOCHS = 5           # Training epochs for fine-tuning
DEFAULT_LEARNING_RATE = 0.001          # Learning rate multiplier
```

## Local Development

### Installation

```bash
# Install dependencies
pip install -r ml_pipeline/requirements.txt

# Set environment variables
export SUPABASE_URL="your-url"
export SUPABASE_SERVICE_KEY="your-key"
```

### Running Tests

```bash
# Run all tests
python -m pytest ml_pipeline/tests/ -v

# Run specific test file
python -m pytest ml_pipeline/tests/test_data_loader.py -v

# Run with coverage
python -m pytest ml_pipeline/tests/ --cov=ml_pipeline --cov-report=html
```

### Manual Testing

#### Test Data Loading
```bash
python -m ml_pipeline.data_loader
```

#### Test Training Pipeline
```bash
python ml_pipeline/train_model.py \
  --dataset data/training_dataset.csv \
  --config model_config.yaml \
  --fine_tune true \
  --epochs 5 \
  --learning_rate 0.001
```

#### Test Auto Reinforcement (requires Supabase setup)
```bash
python -m ml_pipeline.auto_reinforcement
```

## Web UI Integration

### Monitoring Page

The Auto Reinforcement section in the Monitoring page provides:

- **Latest Run Status**: Shows status badges (pending, running, completed, failed)
- **Dataset Metrics**: Number of error samples used for retraining
- **Training Metrics**: Accuracy, precision, recall, F1-score
- **Manual Retrain Button**: Trigger retraining on demand with optional reason
- **Auto-refresh**: Updates every 30 seconds

### Manual Retraining Workflow

1. Click "Retrain Now" button on Monitoring page
2. Optionally enter reason for retraining
3. Confirm to submit request
4. Request is added to queue as "pending"
5. Auto reinforcement picks it up and processes it
6. Status updates in real-time as "running" → "completed" or "failed"

## Workflow: Daily Automatic Run

1. **Schedule Trigger** (2:00 UTC):
   - GitHub Actions workflow starts
   - Python environment set up with dependencies

2. **Data Preparation**:
   - Load evaluation log from Supabase Storage
   - Filter predictions: incorrect + high confidence (>70%)
   - Filter by time: last 7 days
   - Check minimum sample size (10)

3. **Training**:
   - Create fine-tune dataset (CSV)
   - Run `train_model.py --fine_tune True`
   - Capture metrics and model path

4. **Result Recording**:
   - Update `model_retraining_runs` with:
     - Status: completed/failed
     - Metrics: JSON with performance scores
     - Completed timestamp
   - Upload training logs to Storage

5. **Notification**:
   - On failure, comment on GitHub issue #1
   - Artifacts retained for 30 days

## Workflow: Manual Request

1. **User Action**:
   - Click "Retrain Now" on Monitoring page
   - Optionally add reason
   - Request created in DB with status: pending

2. **Background Processing**:
   - `auto_reinforcement.py` detects pending request
   - Creates retraining run record
   - Processes same as automatic run
   - Links request to run via `retraining_run_id`

3. **UI Update**:
   - Latest run status displayed in card
   - Form collapses after confirmation
   - Real-time updates via React Query

## Troubleshooting

### Retraining Not Running

**Check logs:**
```bash
# View GitHub Actions logs
- Go to: https://github.com/your-repo/actions
- Check: Auto Model Reinforcement workflow

# Check database
SELECT * FROM model_retraining_runs 
ORDER BY started_at DESC LIMIT 10;
```

**Common issues:**
- Supabase credentials not configured in GitHub Secrets
- Evaluation log not found in Storage
- Too few error samples (< 10)

### Training Fails

**Check error message:**
```bash
SELECT error_message FROM model_retraining_runs 
WHERE status = 'failed' 
ORDER BY started_at DESC;
```

**Common issues:**
- Missing required columns in evaluation log
- Model configuration invalid
- Insufficient memory for training

### Metrics Not Updating

1. Check UI is fetching latest data:
   - Open browser DevTools
   - Check Network tab for queries
   - Verify timestamp in response

2. Check database permissions:
   ```bash
   SELECT * FROM model_retraining_runs 
   WHERE created_at > NOW() - INTERVAL '1 hour'
   ```

## Performance Considerations

### Database Queries
- `model_retraining_runs` indexed on: status, source, created_at, started_at
- `model_retraining_requests` indexed on: status (pending), priority, created_at
- UI queries: Single latest run only (very fast)

### Storage
- Evaluation logs: Typically < 10MB/month
- Training logs: ~1MB per run, retention 30 days
- Models: ~5MB per model, separate storage for retrained versions

### Compute
- Training time: ~2-5 minutes for typical dataset (100-500 samples)
- GitHub Actions: ~15-20 minutes total including setup
- Resource limits: Runs in free tier without issues

## Advanced Configuration

### Custom Training Parameters

Edit `ml_pipeline/config.py`:
```python
DEFAULT_FINE_TUNE_EPOCHS = 10
DEFAULT_LEARNING_RATE = 0.002
MIN_ERROR_SAMPLES_FOR_RETRAINING = 5
DEFAULT_LOOKBACK_DAYS = 14
```

### Custom Data Filtering

Edit `ml_pipeline/data_loader.py`:
```python
def filter_errors_for_retraining(
    df,
    lookback_days=7,
    confidence_threshold=0.75,  # Adjust this
    min_samples=15              # Add this parameter
):
    # ... filtering logic
```

### Custom Training Schedules

Edit `.github/workflows/auto-reinforcement.yml`:
```yaml
schedule:
  - cron: '0 2 * * *'   # Daily at 2:00 UTC
  # - cron: '0 2 * * 1' # Weekly on Monday
  # - cron: '0 2 1 * *' # Monthly on 1st
```

## API Reference

### auto_reinforcement.py

```python
def run_auto_reinforcement(
    lookback_days: int = 7,
    source: str = 'auto_daily',
    request_id: Optional[str] = None
) -> bool:
    """Run the auto reinforcement loop"""
```

### data_loader.py

```python
def prepare_retraining_data(
    lookback_days: int = 7,
    confidence_threshold: float = 0.7
) -> Tuple[Optional[str], int]:
    """Prepare retraining data - returns (dataset_path, error_count)"""
```

### train_model.py

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

## Monitoring and Alerts

### Key Metrics to Track
- Retraining frequency (should be daily if errors exist)
- Error sample volume (trend over time)
- Metrics improvement (accuracy before/after)
- Failure rate (should be 0% for healthy system)

### Recommended Alerts
- Retraining fails 3+ times in 7 days
- Error sample volume > 1000 in 7 days (model degrading)
- Accuracy decreases after retraining

## Related Documentation

- [Explainability Safeguards](./EXPLAINABILITY_SAFEGUARDS.md)
- [Model Training](../TRAINING_PIPELINE.md)
- [Supabase Setup](../README.md#supabase-configuration)

## Support

For issues or questions:
1. Check this documentation
2. Review GitHub Actions workflow logs
3. Check database records for error details
4. Contact the development team
