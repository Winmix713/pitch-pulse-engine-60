# Model Lifecycle Documentation

This document explains the model registry system, JSON schema, and lifecycle management for machine learning models in this application.

## Overview

The model registry provides a centralized, type-safe way to manage model versions, metadata, and deployment status. It separates heavy binary artifacts from lightweight metadata, ensuring efficient version control and clear deployment state management.

## JSON Schema

The model registry is stored in `models/model_registry.json` and follows this schema:

### Model Registry Entry

Each model entry contains the following fields:

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `id` | UUIDv4 string | Unique identifier for the model entry | `"550e8400-e29b-41d4-a716-446655440000"` |
| `version` | Semantic version string | Version following semantic versioning with 'v' prefix | `"v1.0.0"` |
| `algorithm` | String | Name of the ML algorithm used | `"LogisticRegression"` |
| `metrics` | Object | Performance metrics object | See Metrics Schema below |
| `created_at` | ISO 8601 timestamp | Creation timestamp in UTC | `"2024-01-15T10:30:00.000Z"` |
| `status` | Enum string | Current deployment status | `"active"`, `"candidate"`, or `"archived"` |
| `file_path` | String | Relative path to the binary model file | `"models/v1_champion.pkl"` |

### Metrics Schema

The `metrics` object contains the following performance metrics:

| Field | Type | Range | Description |
|-------|------|-------|-------------|
| `accuracy` | Float | 0.0 - 1.0 | Model accuracy score |
| `f1_score` | Float | 0.0 - 1.0 | F1 score (harmonic mean of precision and recall) |
| `precision` | Float | 0.0 - 1.0 | Precision score |
| `recall` | Float | 0.0 - 1.0 | Recall score |

## Model Lifecycle States

Models progress through three distinct states during their lifecycle:

### 1. `candidate` 🔄
**Purpose**: New models that have been trained and evaluated but not yet promoted to production.

**When to use**: 
- After completing model training and evaluation
- When a model shows promising performance metrics
- During A/B testing or shadow deployment phases

**Transition**: Promoted to `active` after meeting performance criteria and business approval.

### 2. `active` ✅
**Purpose**: The current production model serving live traffic.

**When to use**:
- The primary model for production predictions
- Only one model should typically be in this state
- Must meet all performance and reliability requirements

**Transition**: 
- Can be demoted to `archived` when replaced by a better model
- Can be moved back to `candidate` if performance degrades

### 3. `archived` 📦
**Purpose**: Previous production models that are no longer in active use.

**When to use**:
- Models that have been replaced by newer versions
- Models kept for historical reference or rollback purposes
- Models that failed in production and were removed

**Transition**: Typically remains archived indefinitely for audit purposes.

## Lifecycle Flow

```
    Training Complete
            ↓
     [candidate] ←───┐
            ↓        │
    Performance &   │
    Business Review  │
            ↓        │
        [active] ────┘
            ↓
    Model Replaced
            ↓
      [archived]
```

## Type-Safe Access

The application provides a type-safe access layer through `src/lib/model-registry.ts`:

### Key Functions

- `getAllModels()`: Returns all model entries
- `getActiveModel()`: Returns the current active model (most recent if multiple)
- `getModelsByStatus(status)`: Filters models by status
- `getModelById(id)`: Retrieves a specific model by UUID

### Validation

All registry access uses Zod schema validation to ensure data integrity. Invalid or malformed JSON will throw descriptive error messages rather than causing runtime crashes.

## File Management

### Binary Artifacts
- **Location**: `/models/` directory
- **Formats**: `.pkl`, `.joblib`, `.h5` (automatically ignored by git)
- **Naming**: Use semantic versioning (e.g., `v1_champion.pkl`, `v2_candidate.pkl`)

### Metadata
- **Registry**: `models/model_registry.json` (tracked in git)
- **Logs**: `*.csv` files (tracked in git)
- **Config**: `*.yaml` files (tracked in git)

## Manual Registry Management

### Adding a New Model

1. Train and evaluate your model
2. Save the binary artifact to `/models/` with descriptive naming
3. Add a new entry to `models/model_registry.json`:
   ```json
   {
     "id": "generated-uuid-v4",
     "version": "v1.3.0",
     "algorithm": "YourAlgorithm",
     "metrics": {
       "accuracy": 0.92,
       "f1_score": 0.90,
       "precision": 0.93,
       "recall": 0.87
     },
     "created_at": "2024-01-30T12:00:00.000Z",
     "status": "candidate",
     "file_path": "models/v1_3_candidate.pkl"
   }
   ```

### Promoting a Model

1. Update the current `active` model status to `archived`
2. Update the `candidate` model status to `active`
3. Commit the changes to git

### Rollback Procedure

1. Update the current `active` model status to `candidate` (or `archived` if problematic)
2. Update the previous `archived` model status to `active`
3. Update application configuration to point to the rollback model if needed
4. Commit the changes

## Best Practices

1. **UUID Generation**: Use a proper UUID v4 generator for the `id` field
2. **Semantic Versioning**: Follow `v{major}.{minor}.{patch}` format consistently
3. **Timestamps**: Always use UTC timestamps in ISO 8601 format
4. **Performance Tracking**: Record all relevant metrics for each model version
5. **Atomic Updates**: Make status changes as single, atomic commits
6. **Backup Strategy**: Regular backups of the registry JSON are recommended

## Troubleshooting

### Validation Errors
If you encounter validation errors, check:
- All required fields are present
- UUID format is correct
- Version follows `vX.Y.Z` pattern
- Status is one of: `"active"`, `"candidate"`, `"archived"`
- Metrics values are between 0.0 and 1.0
- Timestamp is valid ISO 8601 format

### Multiple Active Models
If multiple models have `active` status, `getActiveModel()` will return the most recent one based on `created_at`. Consider this when managing deployments.

### Missing Binary Files
Ensure the `file_path` points to an existing file. The registry doesn't verify file existence automatically.
