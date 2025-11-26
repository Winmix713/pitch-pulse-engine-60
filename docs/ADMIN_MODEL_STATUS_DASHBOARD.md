# Admin Model Status Dashboard

## Overview

The Admin Model Status Dashboard is a comprehensive, centralized control center for ML model management, performance monitoring, and data configuration. Located at `/admin/model-status`, it serves as the "Mission Control" for the entire prediction system.

## Architecture

### Backend Layer (Supabase Edge Functions)

Since the frontend cannot directly access the server's file system or execute Python scripts, we've implemented secure Supabase Edge Functions that act as the API layer:

#### Created Edge Functions

1. **`admin-model-system-status`** (GET)
   - Returns parsed content from the `model_registry` and `model_experiments` tables
   - Provides the active model configuration
   - Includes recent predictions for analytics
   - **Security**: Admin/Analyst role required

2. **`admin-model-promote`** (POST)
   - Updates the active model by promoting a new champion
   - Demotes previous champions to retired status
   - **Security**: Admin role only

3. **`admin-model-analytics`** (GET)
   - Parses prediction data and calculates performance metrics
   - Returns structured JSON for charting with time-series data
   - Calculates accuracy, fail rate, and confidence trends
   - Determines system health status (healthy/warning/degraded)
   - **Security**: Admin/Analyst role required

4. **`admin-model-trigger-training`** (POST)
   - Simulates triggering a model training process
   - Creates a new challenger model entry in the registry
   - Returns a non-blocking "Job Started" status immediately
   - **Security**: Admin role only

### Frontend Components

#### 1. Model Management Panel (`ModelManagementPanel.tsx`)

**Features:**
- **Registry View**: Sortable table of all models with columns:
  - Type (Champion/Challenger/Retired)
  - Name
  - Version
  - Accuracy
  - Total Predictions
  - Created At
  - Status (Active/Inactive)
  
- **Active Model Selector**: 
  - Dropdown to view and change the currently live model
  - Prominent display of active model metrics
  - "Promote Model" button to switch the active model
  
- **Training Interface**:
  - "Retrain Model" button
  - Progress indicator during training
  - Auto-refresh after training completion

#### 2. Analytics & Health Monitoring Panel (`AnalyticsPanel.tsx`)

**Features:**
- **Summary Cards**:
  - Total Predictions (last 100 records)
  - Accuracy percentage
  - Fail Rate with color-coded status
  - Average Confidence

- **Automated Alerts**:
  - **System Degraded** banner when fail rate > 30%
  - **Performance Warning** alert when fail rate > 15%
  - Recommendations for retraining

- **Visualizations** (using Recharts):
  - **Confidence Trend** (Line Chart): Shows prediction confidence over time
  - **Accuracy vs Time** (Area Chart): Compares accuracy and prediction volume
  - **Daily Confidence Distribution** (Bar Chart): Average confidence per day

#### 3. Data Configuration Panel (`DataConfigurationPanel.tsx`)

**Features:**
- **Team Editor**: CRUD interface for the `teams` table
  - Edit `form_rating` (0-100)
  - Edit `strength_index` (0-100)
  - Input validation for logical ranges
  - Real-time updates to Supabase

- **Dialog-based Editing**: Clean modal interface for updating team data

### Main Dashboard Page (`ModelStatusDashboard.tsx`)

The main orchestrator that combines all panels into a tabbed interface:

**Features:**
- **System Overview Card**: Quick snapshot of system status
- **Three Main Tabs**:
  1. Model Management
  2. Analytics & Health
  3. Data Configuration
  
- **Auto-refresh**:
  - System status: Every 30 seconds
  - Analytics: Every 60 seconds
  
- **Toast Notifications**: Feedback for all actions
- **Loading States**: Proper skeleton screens during data fetch
- **Error Handling**: User-friendly error messages

## Security & Access Control

- **Route Protection**: Only accessible to users with `admin` or `analyst` roles
- **API Security**: All Edge Functions verify JWT tokens and user roles
- **Granular Permissions**:
  - Model promotion: Admin only
  - Training trigger: Admin only
  - Viewing: Admin and Analyst
  - Team editing: Admin and Analyst

## Navigation Integration

The dashboard is integrated into the application navigation:

1. **Sidebar**: Added icon link with Gauge icon
2. **Admin Dashboard**: Added "Model Control Center" card
3. **Route**: `/admin/model-status` with lazy loading

## Data Flow

```
User Action (Frontend)
    ↓
React Query Mutation
    ↓
Supabase Edge Function
    ↓
Supabase Database Tables
    ↓
Response with Updated Data
    ↓
React Query Cache Invalidation
    ↓
UI Auto-refresh
```

## Database Schema

The dashboard works with existing Supabase tables:

### `model_registry`
- `id`: Model identifier
- `model_name`: Human-readable name
- `model_version`: Version string
- `model_type`: champion | challenger | retired
- `algorithm`: ML algorithm used
- `hyperparameters`: JSON configuration
- `traffic_allocation`: Percentage of traffic
- `total_predictions`: Count of predictions made
- `accuracy`: Current accuracy percentage
- `registered_at`: Creation timestamp
- `is_active`: Boolean status
- `description`: Optional description

### `model_experiments`
- Tracks A/B experiments between champion and challenger models
- Statistical significance testing
- Winner determination

### `predictions`
- Historical prediction data
- Used for calculating analytics and metrics

### `teams`
- Team data with ratings
- `form_rating`: Current form (0-100)
- `strength_index`: Overall strength (0-100)

## Usage

### Accessing the Dashboard

1. Navigate to `/admin/model-status`
2. Must be logged in as Admin or Analyst

### Promoting a Model

1. Go to "Model Management" tab
2. Select a model from the dropdown
3. Click "Promote Model"
4. Confirmation toast appears
5. Dashboard auto-refreshes

### Triggering Training

1. Go to "Model Management" tab
2. Click "Retrain Model"
3. Training job starts (simulated)
4. After ~10 seconds, new candidate model appears in registry

### Editing Team Data

1. Go to "Data Configuration" tab
2. Click edit icon next to a team
3. Update form rating and/or strength index
4. Click "Save Changes"
5. Changes persist to Supabase

### Monitoring Health

1. Go to "Analytics & Health" tab
2. Review summary cards at the top
3. Check for alert banners
4. Analyze charts for trends
5. If fail rate is high, consider retraining

## Future Enhancements

Potential improvements for future versions:

1. **Real Python Integration**: Connect to actual `train_model.py` script
2. **File System Access**: Read from actual `model_config.yaml` and `evaluation_log.csv`
3. **WebSocket Updates**: Real-time training progress
4. **Model Comparison**: Side-by-side model performance comparison
5. **Advanced Filters**: Filter charts by date range, league, etc.
6. **Export Functionality**: Download analytics as CSV/PDF
7. **Model Versioning**: Git-like version control for models
8. **A/B Test Management**: Create and manage experiments from UI
9. **Automated Retraining**: Schedule automatic retraining based on thresholds
10. **Custom Alerts**: Email/Slack notifications for system degradation

## Testing

To test the dashboard:

1. **Unit Tests**: Test individual components with Vitest
2. **Integration Tests**: Test API calls with MSW
3. **E2E Tests**: Use Playwright to test full workflows
4. **Manual Testing**:
   - Create test models in the database
   - Verify promotion workflow
   - Check analytics calculations
   - Test team editing

## Troubleshooting

### Dashboard doesn't load
- Check user role (must be admin or analyst)
- Verify Edge Functions are deployed
- Check browser console for errors

### Charts not displaying
- Ensure predictions table has data with `actual_result` filled
- Check that recharts is installed
- Verify data format matches expected structure

### Model promotion fails
- Ensure user is admin (not just analyst)
- Check model exists in database
- Verify no database constraints are violated

## Audit Trail

The system maintains comprehensive audit logging for all critical administrative actions. Audit entries are stored in the `admin_audit_log` table and include:

### Audit Actions Tracked

1. **Model Management**
   - Model promotion (`model_promoted`)
   - Model retirement (`model_retired`)
   - Training triggered (`model_training_triggered`)

2. **Feedback Management**
   - Feedback viewed (`feedback_viewed`)
   - Feedback exported (`feedback_exported`)
   - Feedback resolved (`feedback_resolved`)
   - Feedback reopened (`feedback_reopened`)

3. **User Management**
   - User created (`user_created`)
   - User deleted (`user_deleted`)
   - Role changed (`role_changed`)

4. **Job Management**
   - Job started (`job_started`)
   - Job stopped (`job_stopped`)

5. **System Configuration**
   - Phase 9 settings updated (`phase9_updated`)

### Audit Log Structure

Each audit entry contains:
- `user_id`: The admin user who performed the action
- `action`: Machine-readable action identifier
- `details`: JSON object with contextual information
- `created_at`: Timestamp of the action
- `ip_address`: Client IP address (when available)

### Access Control

- **Admins**: Can view all audit entries
- **Analysts**: Can view their own audit entries only
- **Users**: No access to audit logs

### Implementation Details

Audit logging is implemented through:
- Frontend React hooks (`useAuditLog`) for consistent logging
- Edge Functions for server-side operations
- Database triggers for automatic logging
- RLS policies to secure audit data

## Related Documentation

- [Model Registry Schema](./MODEL_REGISTRY.md)
- [Supabase Edge Functions](./EDGE_FUNCTIONS.md)
- [Admin Panel Overview](./ADMIN_PANEL_EXTENDED_MVP.md)
- [Authentication Guide](./AUTHENTICATION.md)
- [Security Implementation](./SECURITY_IMPLEMENTATION_SUMMARY.md)
