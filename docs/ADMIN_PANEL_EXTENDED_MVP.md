# Admin Panel Extended MVP

This directory contains the Extended MVP implementation for the WinMix TipsterHub admin panel.

## Features Implemented

### 1. Models Page (`/admin/models`)
- **Enhanced Model Management**: Full CRUD operations for AI models
- **Activate/Deactivate**: Toggle model status with visual indicators
- **Promote Champions**: Promote challenger models to champion status
- **Duplicate Models**: Create copies of existing models
- **Retire Models**: Retire old or unused models
- **Traffic Distribution**: Visual pie chart of model traffic allocation
- **Experiments**: A/B testing framework for model comparison
- **Search & Filter**: Find models by name, type, or status
- **Real-time Updates**: Auto-refresh every 20 seconds

### 2. Scheduled Jobs Page (`/admin/jobs`)
- **Full CRUD Operations**: Create, read, update, delete scheduled jobs
- **Cron Schedule Management**: Visual cron expression builder with presets
- **Job Types**: Support for data import, prediction, aggregation, maintenance, monitoring
- **Real-time Status**: Live job status with execution logs
- **Manual Execution**: Run jobs on-demand with force option
- **Performance Metrics**: Track success rates and execution times
- **Configuration Editor**: JSON-based job configuration

### 3. Monitoring Page (`/admin/monitoring`)
- **System Health Overview**: Real-time component status dashboard
- **Performance Metrics**: Interactive charts for latency and performance
- **Alert Management**: Critical warnings and system notifications
- **Quick Links**: Direct access to admin tools and documentation
- **Resource Monitoring**: CPU, memory, and database usage
- **Computation Graph**: Visual representation of system dependencies

### 4. Environment Variables Page (`/admin/environment`)
- **Secure Variable Management**: CRUD operations for environment variables
- **Secret Masking**: Automatic detection and masking of sensitive values
- **Category Organization**: Group variables by function (database, API, email, etc.)
- **Import/Export**: Bulk import from .env files, export to .env format
- **Access Control**: Admin-only access with audit logging
- **Search & Filter**: Find variables by key, description, or category

### 5. Matches Page (`/admin/matches`)
- **Match Management**: Full CRUD for match data
- **CSV Import**: Bulk import matches from CSV files
- **CSV Export**: Export match data for backup or analysis
- **League Integration**: Automatic league and team mapping
- **Status Tracking**: Track match status (scheduled, live, completed, cancelled)
- **Score Management**: Update match scores and halftime results
- **Venue Information**: Store and manage match venues

## Database Schema

### New Tables Added

#### `environment_variables`
- Stores application configuration and secrets
- Supports categorization and secret masking
- Full audit trail via triggers

#### `audit_log`
- Comprehensive audit logging for all admin actions
- Tracks user, action, table, and data changes
- IP address and user agent logging

### Enhanced Tables

#### `scheduled_jobs`
- Added full CRUD support
- Enhanced configuration with JSON payloads
- Improved status tracking

#### `model_registry`
- Added activation/deactivation functionality
- Enhanced metadata support
- Better version management

#### `matches`
- Added comprehensive CRUD operations
- Enhanced score tracking
- Better league integration

## Security Features

### Authentication & Authorization
- **Role-based Access Control**: Admin, analyst, user roles
- **Protected Routes**: All admin pages require appropriate roles
- **Session Management**: Automatic token refresh and validation

### Audit Logging
- **Comprehensive Tracking**: All admin actions are logged
- **Data Change History**: Before/after values for updates
- **User Attribution**: Every action linked to user ID
- **Security Metadata**: IP addresses and user agents

### Data Protection
- **Secret Masking**: Sensitive environment variables are masked in UI
- **Input Validation**: All inputs validated server-side
- **SQL Injection Protection**: Parameterized queries throughout
- **XSS Prevention**: Proper output escaping

## API Endpoints

### Environment Variables
- `POST /functions/v1/admin-import-env` - Import from .env files
- Full CRUD via Supabase direct access

### Matches
- `POST /functions/v1/admin-import-matches-csv` - Import matches from CSV
- Full CRUD via Supabase direct access

### Scheduled Jobs
- `POST /functions/v1/jobs-create` - Create new jobs
- `POST /functions/v1/jobs-update` - Update existing jobs
- `POST /functions/v1/jobs-delete` - Delete jobs
- Enhanced existing endpoints for better functionality

### Models
- Enhanced service functions for full CRUD
- Improved experiment management
- Better model lifecycle management

## UI Components

### Enhanced Components
- **ModelCard**: Added action buttons, status badges, descriptions
- **JobStatusCard**: Added edit/delete actions, better status display
- **SystemHealthCard**: Enhanced with more metrics and alerts

### New Components
- **AdminStats**: Statistical overview cards
- **AuditLog**: Comprehensive audit trail viewer
- **QuickLinks**: Admin tool shortcuts
- **SecretInput**: Password input with toggle visibility

## Performance Optimizations

### Frontend
- **Lazy Loading**: Components loaded on-demand
- **Optimized Queries**: Efficient data fetching with TanStack Query
- **Caching**: Aggressive caching for static data
- **Real-time Updates**: WebSocket connections where appropriate

### Backend
- **Database Indexes**: Optimized queries for all admin tables
- **Efficient Triggers**: Minimal impact audit logging
- **Connection Pooling**: Optimized database connections
- **Edge Functions**: Serverless compute for admin operations

## Testing

### Unit Tests
- Model management functions
- Job scheduling logic
- Environment variable handling
- Import/export functionality

### Integration Tests
- Full admin workflows
- Database operations
- API endpoint testing
- Authentication flows

### Security Tests
- Authorization bypass attempts
- Input validation testing
- SQL injection prevention
- XSS protection verification

## Deployment

### Database Migration
```sql
-- Run the migration to add new tables
-- File: supabase/migrations/20251206000000_admin_extended_mvp.sql
```

### Edge Functions
```bash
# Deploy new admin functions
supabase functions deploy admin-import-env
supabase functions deploy admin-import-matches-csv
supabase functions deploy jobs-create
supabase functions deploy jobs-update
supabase functions deploy jobs-delete
```

### Environment Variables
- Set required environment variables for new functions
- Configure proper access permissions
- Set up monitoring and alerting

## Documentation

### User Guide
- [Admin Panel User Guide](./docs/admin-user-guide.md)
- [Security Best Practices](./docs/admin-security.md)
- [Troubleshooting Guide](./docs/admin-troubleshooting.md)

### Developer Documentation
- [API Reference](./docs/admin-api.md)
- [Database Schema](./docs/admin-database.md)
- [Component Library](./docs/admin-components.md)

## Future Enhancements

### Phase 2 Features
- **Advanced Analytics**: More sophisticated monitoring and reporting
- **Workflow Automation**: Complex multi-step job workflows
- **User Management**: Admin user management and permissions
- **Backup Management**: Automated backup and restore functionality

### Phase 3 Features
- **Multi-tenant Support**: Support for multiple organizations
- **API Rate Limiting**: Advanced rate limiting and quota management
- **Compliance Reporting**: GDPR and compliance reporting features
- **Integration Marketplace**: Third-party integrations

## Support

For issues or questions:
1. Check the troubleshooting guide
2. Review the audit logs for error details
3. Contact the development team with specific error messages
4. Include browser console errors and network request details

## Security Considerations

- Always use HTTPS in production
- Regularly rotate secret keys
- Monitor audit logs for suspicious activity
- Keep dependencies updated
- Follow the principle of least privilege
- Regular security audits recommended