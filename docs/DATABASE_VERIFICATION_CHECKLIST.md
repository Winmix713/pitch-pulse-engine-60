# Database Verification Checklist for Supabase Project: wclutzbojatqtxwlvtab

## Overview
This document outlines all database objects that should be present in the target Supabase instance after applying all migrations. This checklist should be verified before updating the .env credentials.

## Tables (19 total)

### Core Tables (Phase 1)
- [ ] `public.leagues` - League information with metrics (Premier League, La Liga, etc.)
  - Columns: id, name, country, season, avg_goals_per_match, home_win_percentage, btts_percentage, created_at
  - Constraints: UNIQUE(name, season)
  
- [ ] `public.teams` - Team information per league
  - Columns: id, name, league_id, created_at
  - Foreign Key: league_id → leagues(id)
  
- [ ] `public.matches` - Match data and results
  - Columns: id, league_id, home_team_id, away_team_id, match_date, home_score, away_score, status, created_at
  - Foreign Keys: league_id, home_team_id, away_team_id
  - Indexes: idx_matches_date, idx_matches_status, idx_matches_home_team, idx_matches_away_team
  
- [ ] `public.pattern_templates` - Pattern type definitions
  - Columns: id, name, description, category, base_confidence_boost, is_active, created_at
  - Constraint: UNIQUE(name)
  
- [ ] `public.detected_patterns` - Detected patterns for specific matches
  - Columns: id, match_id, template_id, confidence_contribution, pattern_data, detected_at
  - Foreign Keys: match_id, template_id
  - Constraint: UNIQUE(match_id, template_id)
  - Index: idx_detected_patterns_match
  
- [ ] `public.predictions` - Match predictions with feedback capability
  - Columns: id, match_id, predicted_outcome, confidence_score, predicted_home_score, predicted_away_score, btts_prediction, over_under_prediction, created_at, actual_outcome, was_correct, evaluated_at
  - **Extended (Phase 4)**: css_score, prediction_factors (JSONB), calibration_error
  - Foreign Key: match_id
  - Constraint: UNIQUE(match_id)
  - Indexes: idx_predictions_match, idx_predictions_evaluated
  
- [ ] `public.pattern_accuracy` - Accuracy tracking per pattern template
  - Columns: id, template_id, total_predictions, correct_predictions, accuracy_rate, last_updated
  - Foreign Key: template_id
  - Constraint: UNIQUE(template_id)

### Scheduled Jobs (Phase 3)
- [ ] `public.scheduled_jobs` - Registry of background jobs
  - Columns: id, job_name, job_type, cron_schedule, enabled, last_run_at, next_run_at, config (JSONB), created_at, updated_at
  - Constraint: UNIQUE(job_name)
  - Indexes: idx_scheduled_jobs_enabled, idx_scheduled_jobs_next_run_at
  
- [ ] `public.job_execution_logs` - Execution history of scheduled jobs
  - Columns: id, job_id, started_at, completed_at, status, duration_ms, records_processed, error_message, error_stack, created_at
  - Foreign Key: job_id → scheduled_jobs(id)
  - Indexes: idx_job_execution_logs_job_id, idx_job_execution_logs_started_at, idx_job_execution_logs_status

### Model Evaluation (Phase 4)
- [ ] `public.model_performance` - Aggregated model performance metrics
  - Columns: id, model_version, period_start, period_end, total_predictions, accuracy_overall, accuracy_winner, accuracy_btts, confidence_calibration_score, league_breakdown (JSONB), created_at
  - Constraint: UNIQUE(model_version, period_start, period_end)
  - Indexes: idx_model_performance_version, idx_model_performance_period
  
- [ ] `public.model_comparison` - Comparison between models
  - Columns: id, model_a_id, model_b_id, comparison_date, accuracy_diff, p_value, winning_model, sample_size, created_at

### Pattern Detection (Phase 5)
- [ ] `public.team_patterns` - Detected team-level patterns
  - Columns: id, team_id, pattern_type, pattern_name, confidence, strength, valid_from, valid_until, prediction_impact, historical_accuracy, pattern_metadata (JSONB), created_at, updated_at
  - Foreign Key: team_id → teams(id)
  - Indexes: idx_team_patterns_team_id, idx_team_patterns_valid_until, idx_team_patterns_type
  
- [ ] `public.pattern_definitions` - Central configuration for pattern detection
  - Columns: id, pattern_name, detection_function, min_sample_size, min_confidence_threshold, priority, is_active, created_at, updated_at
  - Constraint: UNIQUE(pattern_name)
  - Indexes: idx_pattern_definitions_active, idx_pattern_definitions_priority

### Cross-League Intelligence (Phase 7)
- [ ] `public.cross_league_correlations` - Correlations between leagues
  - Columns: id, league_a_id, league_b_id, correlation_type, coefficient, p_value, sample_size, insight_summary, last_calculated
  - Foreign Keys: league_a_id, league_b_id → leagues(id)
  - Constraint: UNIQUE(league_a_id, league_b_id, correlation_type)
  - Indexes: idx_cross_corr_league_pair, idx_cross_corr_type, idx_cross_corr_updated_at
  
- [ ] `public.meta_patterns` - Global patterns across multiple leagues
  - Columns: id, pattern_name, pattern_type, supporting_leagues (UUID[]), evidence_strength, prediction_impact, pattern_description, discovered_at
  - Indexes: idx_meta_patterns_type, idx_meta_patterns_strength
  
- [ ] `public.league_characteristics` - Normalized league metrics
  - Columns: id, league_id, avg_goals, home_advantage_index, competitive_balance_index, predictability_score, physicality_index, trend_data (JSONB), season, created_at, updated_at
  - Foreign Key: league_id → leagues(id)
  - Constraint: UNIQUE(league_id, season)
  - Indexes: idx_league_characteristics_league, idx_league_characteristics_season

### Monitoring & Visualization (Phase 8)
- [ ] `public.system_health` - Component health snapshots
  - Columns: id, component_name, component_type, status, response_time_ms, error_rate, cpu_usage, memory_usage, checked_at
  - Indexes: idx_system_health_component_name, idx_system_health_checked_at
  
- [ ] `public.performance_metrics` - Time-series performance metrics
  - Columns: id, metric_name, metric_type, metric_category, value, unit, component, timestamp
  - Index: idx_performance_metrics_component_timestamp, idx_performance_metrics_type
  
- [ ] `public.computation_graph` - Data processing pipeline nodes
  - Columns: id, node_id, node_name, node_type, dependencies (TEXT[]), execution_time_ms, position_x, position_y, status, last_run
  - Constraint: UNIQUE(node_id)
  - Index: idx_computation_graph_status

### Collaborative Intelligence & Advanced Features (Phase 9)
- [ ] `public.user_predictions` - User-submitted predictions
  - Columns: id, match_id, user_id, predicted_outcome, confidence_score, predicted_home_score, predicted_away_score, btts_prediction, over_under_prediction, reasoning, created_at, updated_at
  - Foreign Key: match_id → matches(id)
  - Constraint: UNIQUE(match_id, user_id)
  - Indexes: idx_user_predictions_match, idx_user_predictions_user, idx_user_predictions_created_at
  
- [ ] `public.crowd_wisdom` - Aggregated crowd predictions
  - Columns: id, match_id, total_predictions, home_win_predictions, draw_predictions, away_win_predictions, average_confidence, consensus_prediction, consensus_confidence, model_vs_crowd_divergence, last_calculated_at, created_at, updated_at
  - Foreign Key: match_id → matches(id)
  - Constraint: UNIQUE(match_id)
  - Index: idx_crowd_wisdom_match, idx_crowd_wisdom_last_calculated
  
- [ ] `public.market_odds` - External bookmaker odds
  - Columns: id, match_id, bookmaker, home_win_odds, draw_odds, away_win_odds, over_2_5_odds, under_2_5_odds, btts_yes_odds, btts_no_odds, last_updated, api_source, raw_response (JSONB), created_at, updated_at
  - Foreign Key: match_id → matches(id)
  - Constraint: UNIQUE(match_id, bookmaker)
  - Indexes: idx_market_odds_match, idx_market_odds_last_updated, idx_market_odds_bookmaker
  
- [ ] `public.value_bets` - Detected value bets
  - Columns: id, match_id, bookmaker, bet_type, bookmaker_odds, model_probability, implied_probability, expected_value, kelly_fraction, confidence_level, is_active, created_at, updated_at
  - Foreign Key: match_id → matches(id)
  - Indexes: idx_value_bets_match, idx_value_bets_active, idx_value_bets_ev, idx_value_bets_created_at
  
- [ ] `public.information_freshness` - Data freshness tracking for temporal decay
  - Columns: id, table_name, record_id, data_type, last_updated, decay_rate, freshness_score, is_stale, stale_threshold_days, created_at, updated_at
  - Constraint: UNIQUE(table_name, record_id)
  - Indexes: idx_information_freshness_table_record, idx_information_freshness_stale, idx_information_freshness_updated
  
- [ ] `public.feature_experiments` - Auto-generated feature engineering experiments
  - Columns: id, experiment_name, feature_type, base_features (JSONB), generated_feature (JSONB), feature_expression, test_start_date, test_end_date, sample_size, control_accuracy, test_accuracy, improvement_delta, statistical_significance, p_value, is_active, is_approved, created_at, updated_at
  - Indexes: idx_feature_experiments_active, idx_feature_experiments_approved, idx_feature_experiments_improvement, idx_feature_experiments_type

## Functions/Stored Procedures (7 total)

- [ ] `public.adjust_template_confidence()` - Adjusts pattern template confidence
  - Parameters: p_template_id (UUID), p_adjustment (DECIMAL)
  - Language: plpgsql
  - Security: DEFINER
  
- [ ] `public.touch_updated_at()` - Generic trigger function for updated_at columns
  - Language: plpgsql
  - Used by: trg_touch_scheduled_jobs_updated_at
  
- [ ] `public.touch_updated_at_team_patterns()` - Trigger for team_patterns.updated_at
  - Language: plpgsql
  
- [ ] `public.touch_updated_at_pattern_definitions()` - Trigger for pattern_definitions.updated_at
  - Language: plpgsql
  
- [ ] `public.calculate_freshness_score()` - Calculate temporal freshness decay
  - Parameters: last_updated (TIMESTAMPTZ), decay_rate (DECIMAL), current_time (TIMESTAMPTZ)
  - Returns: DECIMAL (0-1)
  - Language: plpgsql
  
- [ ] `public.update_crowd_wisdom()` - Aggregates crowd predictions
  - Parameters: p_match_id (UUID)
  - Returns: VOID
  - Language: plpgsql
  
- [ ] `public.touch_league_characteristics_updated_at()` - Trigger for league_characteristics.updated_at
  - Language: plpgsql

## Triggers (9 total)

- [ ] `trg_touch_scheduled_jobs_updated_at` on `scheduled_jobs`
- [ ] `trg_touch_team_patterns_updated_at` on `team_patterns`
- [ ] `trg_touch_pattern_definitions_updated_at` on `pattern_definitions`
- [ ] `trg_user_predictions_updated_at` on `user_predictions`
- [ ] `trg_crowd_wisdom_updated_at` on `crowd_wisdom`
- [ ] `trg_market_odds_updated_at` on `market_odds`
- [ ] `trg_value_bets_updated_at` on `value_bets`
- [ ] `trg_information_freshness_updated_at` on `information_freshness`
- [ ] `trg_feature_experiments_updated_at` on `feature_experiments`
- [ ] `trg_touch_league_characteristics_updated_at` on `league_characteristics`

## Row Level Security (RLS)

All tables should have RLS enabled with open access policies for prototype:

- [ ] `public.leagues` - RLS enabled, policies: SELECT, INSERT, UPDATE, DELETE (all users)
- [ ] `public.teams` - RLS enabled, policies: SELECT, INSERT, UPDATE, DELETE (all users)
- [ ] `public.matches` - RLS enabled, policies: SELECT, INSERT, UPDATE, DELETE (all users)
- [ ] `public.pattern_templates` - RLS enabled, policies: SELECT, INSERT, UPDATE, DELETE (all users)
- [ ] `public.detected_patterns` - RLS enabled, policies: SELECT, INSERT, UPDATE, DELETE (all users)
- [ ] `public.predictions` - RLS enabled, policies: SELECT, INSERT, UPDATE, DELETE (all users)
- [ ] `public.pattern_accuracy` - RLS enabled, policies: SELECT, INSERT, UPDATE, DELETE (all users)
- [ ] `public.scheduled_jobs` - RLS enabled, policies: SELECT, INSERT, UPDATE, DELETE (all users)
- [ ] `public.job_execution_logs` - RLS enabled, policies: SELECT, INSERT, UPDATE, DELETE (all users)
- [ ] `public.model_performance` - RLS enabled, policies: SELECT, INSERT, UPDATE, DELETE (all users)
- [ ] `public.model_comparison` - RLS enabled, policies: SELECT, INSERT, UPDATE, DELETE (all users)
- [ ] `public.team_patterns` - RLS enabled (if needed)
- [ ] `public.pattern_definitions` - RLS enabled (if needed)
- [ ] `public.cross_league_correlations` - RLS enabled (if needed)
- [ ] `public.meta_patterns` - RLS enabled (if needed)
- [ ] `public.league_characteristics` - RLS enabled (if needed)
- [ ] `public.system_health` - RLS enabled (if needed)
- [ ] `public.performance_metrics` - RLS enabled (if needed)
- [ ] `public.computation_graph` - RLS enabled (if needed)
- [ ] `public.user_predictions` - RLS enabled
- [ ] `public.crowd_wisdom` - RLS enabled
- [ ] `public.market_odds` - RLS enabled
- [ ] `public.value_bets` - RLS enabled
- [ ] `public.information_freshness` - RLS enabled
- [ ] `public.feature_experiments` - RLS enabled

## Edge Functions (31 total)

- [ ] `analyze-match` - Core match analysis function
- [ ] `submit-feedback` - Feedback submission
- [ ] `get-predictions` - Retrieve predictions
- [ ] `patterns-detect` - Detect patterns
- [ ] `patterns-team` - Team pattern analysis
- [ ] `patterns-verify` - Verify patterns
- [ ] `cross-league-analyze` - Cross-league analysis
- [ ] `cross-league-correlations` - Calculate cross-league correlations
- [ ] `jobs-list` - List scheduled jobs
- [ ] `jobs-logs` - Retrieve job logs
- [ ] `jobs-scheduler` - Schedule jobs
- [ ] `jobs-toggle` - Enable/disable jobs
- [ ] `jobs-trigger` - Trigger jobs manually
- [ ] `meta-patterns-apply` - Apply meta patterns
- [ ] `meta-patterns-discover` - Discover meta patterns
- [ ] `models-auto-prune` - Auto-prune underperforming models
- [ ] `models-compare` - Compare models
- [ ] `models-performance` - Get model performance
- [ ] `monitoring-alerts` - Send monitoring alerts
- [ ] `monitoring-computation-graph` - Get computation graph data
- [ ] `monitoring-health` - Get system health
- [ ] `monitoring-metrics` - Get performance metrics
- [ ] `phase9-collaborative-intelligence` - Collaborative intelligence features
- [ ] `phase9-market-integration` - Market integration features
- [ ] `phase9-self-improving-system` - Self-improving system features
- [ ] `phase9-temporal-decay` - Temporal decay features
- [ ] `predictions-track` - Track predictions
- [ ] `predictions-update-results` - Update prediction results
- [ ] `_shared` - Shared utilities

## Initial Seed Data

The following seed data should be present:

- [ ] Pattern templates (5): home_winning_streak, away_winning_streak, h2h_dominance, recent_form_advantage, high_scoring_league
- [ ] Example leagues (2): Premier League (England), La Liga (Spain)
- [ ] Example teams (8): Manchester City, Arsenal, Liverpool, Chelsea, Real Madrid, Barcelona, Atletico Madrid, Sevilla
- [ ] Example matches (6): Mix of scheduled and finished matches
- [ ] Scheduled jobs (4): fetch_upcoming_fixtures, run_daily_predictions, update_team_stats, cleanup_old_logs
- [ ] Pattern definitions (4): winning_streak, home_dominance, high_scoring_trend, form_surge
- [ ] Information freshness records (4): Sample data for decay calculation
- [ ] System health records (5): Sample system health snapshots
- [ ] Performance metrics (39): Sample performance data over 2 hours
- [ ] Computation graph nodes (5): Data processing pipeline

## Notes for Verification

### How to Verify
1. **Tables**: Check if `SELECT table_name FROM information_schema.tables WHERE table_schema='public'` returns all 19 tables
2. **Functions**: Check if `SELECT proname FROM pg_proc WHERE pronamespace=2200` returns all 7 functions
3. **Triggers**: Check if triggers are defined on the appropriate tables
4. **RLS**: Check if `SELECT * FROM pg_policies` shows policies for all tables
5. **Indexes**: Verify indexes exist with `\di` command
6. **Seed Data**: Query each table to ensure seed data is present

### Common Issues to Check
- [ ] No RLS policies applied (table not accessible)
- [ ] Missing columns added in Phase 4 (predictions table)
- [ ] Missing triggers or functions
- [ ] Missing indexes (performance issue)
- [ ] Seed data not populated
- [ ] Foreign key constraints not created
- [ ] JSONB columns not properly initialized

## Verification Completion Status

**Date Verified**: _______________
**Verified By**: _______________
**All Checks Passed**: [ ] Yes [ ] No

**Issues Found**: 
(List any missing or incomplete objects here)

**Action Taken**: 
(Document how issues were resolved)

---

## .env Update

Once ALL verifications pass, update the .env file with:
```
VITE_SUPABASE_PROJECT_ID="wclutzbojatqtxwlvtab"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndjbHV0emJvamF0cXR4d2x2dGFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxOTYzODQsImV4cCI6MjA3Nzc3MjM4NH0.GcFqrEtZhgEHq0ycfXPFwebBcUrOiO2LlOrLEWhkmnE"
VITE_SUPABASE_URL="https://wclutzbojatqtxwlvtab.supabase.co"
```

**Status**: [ ] Pending [ ] Complete [ ] Failed

