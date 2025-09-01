export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      advanced_system_logs: {
        Row: {
          created_at: string | null
          details: Json | null
          event_type: string
          id: number
          message: string
          server_hostname: string | null
          stack_trace: string | null
          user_context: Json | null
        }
        Insert: {
          created_at?: string | null
          details?: Json | null
          event_type: string
          id?: number
          message: string
          server_hostname?: string | null
          stack_trace?: string | null
          user_context?: Json | null
        }
        Update: {
          created_at?: string | null
          details?: Json | null
          event_type?: string
          id?: number
          message?: string
          server_hostname?: string | null
          stack_trace?: string | null
          user_context?: Json | null
        }
        Relationships: []
      }
      feature_calculation_config: {
        Row: {
          config_group: string
          created_at: string | null
          description: string | null
          id: number
          is_active: boolean | null
          param_name: string
          param_value: Json
          updated_at: string | null
        }
        Insert: {
          config_group: string
          created_at?: string | null
          description?: string | null
          id?: number
          is_active?: boolean | null
          param_name: string
          param_value: Json
          updated_at?: string | null
        }
        Update: {
          config_group?: string
          created_at?: string | null
          description?: string | null
          id?: number
          is_active?: boolean | null
          param_name?: string
          param_value?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      match_predictions: {
        Row: {
          away_team: string
          cache_key: string | null
          confidence: number
          created_at: string | null
          home_team: string
          id: string
          league: string | null
          match_date: string | null
          match_id: number | null
          model_ensemble: string[] | null
          predicted_score: Json | null
          prediction_method: string | null
          probabilities: Json
          recommendations: string[] | null
          risk_level: string | null
          updated_at: string | null
        }
        Insert: {
          away_team: string
          cache_key?: string | null
          confidence?: number
          created_at?: string | null
          home_team: string
          id?: string
          league?: string | null
          match_date?: string | null
          match_id?: number | null
          model_ensemble?: string[] | null
          predicted_score?: Json | null
          prediction_method?: string | null
          probabilities: Json
          recommendations?: string[] | null
          risk_level?: string | null
          updated_at?: string | null
        }
        Update: {
          away_team?: string
          cache_key?: string | null
          confidence?: number
          created_at?: string | null
          home_team?: string
          id?: string
          league?: string | null
          match_date?: string | null
          match_id?: number | null
          model_ensemble?: string[] | null
          predicted_score?: Json | null
          prediction_method?: string | null
          probabilities?: Json
          recommendations?: string[] | null
          risk_level?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      matches: {
        Row: {
          attendance: number | null
          away_corners: number | null
          away_red_cards: number | null
          away_shots: number | null
          away_shots_on_target: number | null
          away_team: string
          away_yellow_cards: number | null
          btts_computed: boolean | null
          comeback_computed: boolean | null
          created_at: string | null
          full_time_away_goals: number
          full_time_home_goals: number
          half_time_away_goals: number | null
          half_time_home_goals: number | null
          home_corners: number | null
          home_red_cards: number | null
          home_shots: number | null
          home_shots_on_target: number | null
          home_team: string
          home_yellow_cards: number | null
          id: number
          league: string
          match_status: Database["public"]["Enums"]["match_status_enum"] | null
          match_time: string
          referee: string | null
          result_computed: string | null
          season: string | null
          updated_at: string | null
          venue: string | null
        }
        Insert: {
          attendance?: number | null
          away_corners?: number | null
          away_red_cards?: number | null
          away_shots?: number | null
          away_shots_on_target?: number | null
          away_team: string
          away_yellow_cards?: number | null
          btts_computed?: boolean | null
          comeback_computed?: boolean | null
          created_at?: string | null
          full_time_away_goals: number
          full_time_home_goals: number
          half_time_away_goals?: number | null
          half_time_home_goals?: number | null
          home_corners?: number | null
          home_red_cards?: number | null
          home_shots?: number | null
          home_shots_on_target?: number | null
          home_team: string
          home_yellow_cards?: number | null
          id?: number
          league?: string
          match_status?: Database["public"]["Enums"]["match_status_enum"] | null
          match_time: string
          referee?: string | null
          result_computed?: string | null
          season?: string | null
          updated_at?: string | null
          venue?: string | null
        }
        Update: {
          attendance?: number | null
          away_corners?: number | null
          away_red_cards?: number | null
          away_shots?: number | null
          away_shots_on_target?: number | null
          away_team?: string
          away_yellow_cards?: number | null
          btts_computed?: boolean | null
          comeback_computed?: boolean | null
          created_at?: string | null
          full_time_away_goals?: number
          full_time_home_goals?: number
          half_time_away_goals?: number | null
          half_time_home_goals?: number | null
          home_corners?: number | null
          home_red_cards?: number | null
          home_shots?: number | null
          home_shots_on_target?: number | null
          home_team?: string
          home_yellow_cards?: number | null
          id?: number
          league?: string
          match_status?: Database["public"]["Enums"]["match_status_enum"] | null
          match_time?: string
          referee?: string | null
          result_computed?: string | null
          season?: string | null
          updated_at?: string | null
          venue?: string | null
        }
        Relationships: []
      }
      model_performance: {
        Row: {
          accuracy_percentage: number | null
          auc_roc: number | null
          avg_confidence: number | null
          avg_probability_accuracy: number | null
          correct_predictions: number | null
          created_at: string | null
          evaluation_period_end: string | null
          evaluation_period_start: string | null
          f1_score: number | null
          id: string
          last_30_days_accuracy: number | null
          last_7_days_accuracy: number | null
          model_name: string
          model_type: string
          precision: number | null
          recall: number | null
          team_name: string | null
          total_predictions: number | null
          updated_at: string | null
        }
        Insert: {
          accuracy_percentage?: number | null
          auc_roc?: number | null
          avg_confidence?: number | null
          avg_probability_accuracy?: number | null
          correct_predictions?: number | null
          created_at?: string | null
          evaluation_period_end?: string | null
          evaluation_period_start?: string | null
          f1_score?: number | null
          id?: string
          last_30_days_accuracy?: number | null
          last_7_days_accuracy?: number | null
          model_name: string
          model_type: string
          precision?: number | null
          recall?: number | null
          team_name?: string | null
          total_predictions?: number | null
          updated_at?: string | null
        }
        Update: {
          accuracy_percentage?: number | null
          auc_roc?: number | null
          avg_confidence?: number | null
          avg_probability_accuracy?: number | null
          correct_predictions?: number | null
          created_at?: string | null
          evaluation_period_end?: string | null
          evaluation_period_start?: string | null
          f1_score?: number | null
          id?: string
          last_30_days_accuracy?: number | null
          last_7_days_accuracy?: number | null
          model_name?: string
          model_type?: string
          precision?: number | null
          recall?: number | null
          team_name?: string | null
          total_predictions?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      performance_metrics: {
        Row: {
          cpu_usage: number | null
          created_at: string | null
          execution_time: unknown
          function_name: string
          id: number
          matches_processed: number
          memory_usage: number | null
        }
        Insert: {
          cpu_usage?: number | null
          created_at?: string | null
          execution_time: unknown
          function_name: string
          id?: number
          matches_processed: number
          memory_usage?: number | null
        }
        Update: {
          cpu_usage?: number | null
          created_at?: string | null
          execution_time?: unknown
          function_name?: string
          id?: number
          matches_processed?: number
          memory_usage?: number | null
        }
        Relationships: []
      }
      prediction_history: {
        Row: {
          actual_result: string | null
          actual_score: Json | null
          confidence_was_justified: boolean | null
          created_at: string | null
          error_margin: number | null
          evaluated_at: string | null
          id: string
          prediction_id: string
          was_correct: boolean | null
        }
        Insert: {
          actual_result?: string | null
          actual_score?: Json | null
          confidence_was_justified?: boolean | null
          created_at?: string | null
          error_margin?: number | null
          evaluated_at?: string | null
          id?: string
          prediction_id: string
          was_correct?: boolean | null
        }
        Update: {
          actual_result?: string | null
          actual_score?: Json | null
          confidence_was_justified?: boolean | null
          created_at?: string | null
          error_margin?: number | null
          evaluated_at?: string | null
          id?: string
          prediction_id?: string
          was_correct?: boolean | null
        }
        Relationships: []
      }
      predictions: {
        Row: {
          actual_result: string | null
          away_team: string
          away_win_probability: number
          cache_key: string
          comeback_probability_away: number | null
          comeback_probability_home: number | null
          confidence_score: number | null
          created_at: string
          draw_probability: number
          expires_at: string | null
          features_used: Json | null
          home_team: string
          home_win_probability: number
          id: string
          league: string
          legend_mode_features: Json | null
          match_date: string
          match_id: number | null
          mental_strength_away: number | null
          mental_strength_home: number | null
          model_version: string | null
          predicted_at: string
          predicted_away_goals: number | null
          predicted_home_goals: number | null
          predicted_total_goals: number | null
          prediction_correct: boolean | null
          prediction_type: string
          probability_accuracy: number | null
          resilience_factor_away: number | null
          resilience_factor_home: number | null
          updated_at: string
        }
        Insert: {
          actual_result?: string | null
          away_team: string
          away_win_probability: number
          cache_key: string
          comeback_probability_away?: number | null
          comeback_probability_home?: number | null
          confidence_score?: number | null
          created_at?: string
          draw_probability: number
          expires_at?: string | null
          features_used?: Json | null
          home_team: string
          home_win_probability: number
          id?: string
          league: string
          legend_mode_features?: Json | null
          match_date: string
          match_id?: number | null
          mental_strength_away?: number | null
          mental_strength_home?: number | null
          model_version?: string | null
          predicted_at?: string
          predicted_away_goals?: number | null
          predicted_home_goals?: number | null
          predicted_total_goals?: number | null
          prediction_correct?: boolean | null
          prediction_type?: string
          probability_accuracy?: number | null
          resilience_factor_away?: number | null
          resilience_factor_home?: number | null
          updated_at?: string
        }
        Update: {
          actual_result?: string | null
          away_team?: string
          away_win_probability?: number
          cache_key?: string
          comeback_probability_away?: number | null
          comeback_probability_home?: number | null
          confidence_score?: number | null
          created_at?: string
          draw_probability?: number
          expires_at?: string | null
          features_used?: Json | null
          home_team?: string
          home_win_probability?: number
          id?: string
          league?: string
          legend_mode_features?: Json | null
          match_date?: string
          match_id?: number | null
          mental_strength_away?: number | null
          mental_strength_home?: number | null
          model_version?: string | null
          predicted_at?: string
          predicted_away_goals?: number | null
          predicted_home_goals?: number | null
          predicted_total_goals?: number | null
          prediction_correct?: boolean | null
          prediction_type?: string
          probability_accuracy?: number | null
          resilience_factor_away?: number | null
          resilience_factor_home?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      season_predictions: {
        Row: {
          completed_at: string | null
          created_at: string | null
          error_message: string | null
          id: string
          league: string | null
          processed_matches: number | null
          progress_percentage: number | null
          results: Json | null
          season: string
          started_at: string | null
          status: string
          total_matches: number | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          league?: string | null
          processed_matches?: number | null
          progress_percentage?: number | null
          results?: Json | null
          season: string
          started_at?: string | null
          status?: string
          total_matches?: number | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          league?: string | null
          processed_matches?: number | null
          progress_percentage?: number | null
          results?: Json | null
          season?: string
          started_at?: string | null
          status?: string
          total_matches?: number | null
        }
        Relationships: []
      }
      system_logs: {
        Row: {
          correlation_id: string | null
          created_at: string
          details: Json | null
          environment: string | null
          error_details: string | null
          event_type: string
          id: number
          message: string
          origin: string | null
          session_id: string | null
          severity: string
          updated_at: string | null
          user_id: string | null
          version: string | null
        }
        Insert: {
          correlation_id?: string | null
          created_at?: string
          details?: Json | null
          environment?: string | null
          error_details?: string | null
          event_type: string
          id?: number
          message: string
          origin?: string | null
          session_id?: string | null
          severity?: string
          updated_at?: string | null
          user_id?: string | null
          version?: string | null
        }
        Update: {
          correlation_id?: string | null
          created_at?: string
          details?: Json | null
          environment?: string | null
          error_details?: string | null
          event_type?: string
          id?: number
          message?: string
          origin?: string | null
          session_id?: string | null
          severity?: string
          updated_at?: string | null
          user_id?: string | null
          version?: string | null
        }
        Relationships: []
      }
      team_models: {
        Row: {
          accuracy: number | null
          created_at: string | null
          id: string
          is_active: boolean | null
          last_trained: string | null
          model_data: Json | null
          model_type: string
          team_name: string
          training_matches: number | null
          updated_at: string | null
          version: string | null
        }
        Insert: {
          accuracy?: number | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_trained?: string | null
          model_data?: Json | null
          model_type: string
          team_name: string
          training_matches?: number | null
          updated_at?: string | null
          version?: string | null
        }
        Update: {
          accuracy?: number | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_trained?: string | null
          model_data?: Json | null
          model_type?: string
          team_name?: string
          training_matches?: number | null
          updated_at?: string | null
          version?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          role?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      feature_calculation_performance_summary: {
        Row: {
          avg_processing_time_seconds: number | null
          calculation_date: string | null
          max_processing_time_seconds: number | null
          performance_category: string | null
          total_events: number | null
        }
        Relationships: []
      }
      materialized_view_monitoring: {
        Row: {
          hasindexes: boolean | null
          ispopulated: boolean | null
          matviewname: unknown | null
          matviewowner: unknown | null
          schemaname: unknown | null
          tablespace: unknown | null
        }
        Relationships: []
      }
      prediction_analysis: {
        Row: {
          actual_result: string | null
          away_team: string | null
          away_win_probability: number | null
          cache_key: string | null
          comeback_probability_away: number | null
          comeback_probability_home: number | null
          confidence_score: number | null
          created_at: string | null
          draw_probability: number | null
          expires_at: string | null
          features_used: Json | null
          home_team: string | null
          home_win_probability: number | null
          id: string | null
          league: string | null
          legend_mode_features: Json | null
          match_date: string | null
          match_id: number | null
          mental_strength_away: number | null
          mental_strength_home: number | null
          model_version: string | null
          predicted_at: string | null
          predicted_away_goals: number | null
          predicted_home_goals: number | null
          predicted_result: string | null
          predicted_total_goals: number | null
          prediction_correct: boolean | null
          prediction_type: string | null
          probability_accuracy: number | null
          resilience_factor_away: number | null
          resilience_factor_home: number | null
          updated_at: string | null
        }
        Insert: {
          actual_result?: string | null
          away_team?: string | null
          away_win_probability?: number | null
          cache_key?: string | null
          comeback_probability_away?: number | null
          comeback_probability_home?: number | null
          confidence_score?: number | null
          created_at?: string | null
          draw_probability?: number | null
          expires_at?: string | null
          features_used?: Json | null
          home_team?: string | null
          home_win_probability?: number | null
          id?: string | null
          league?: string | null
          legend_mode_features?: Json | null
          match_date?: string | null
          match_id?: number | null
          mental_strength_away?: number | null
          mental_strength_home?: number | null
          model_version?: string | null
          predicted_at?: string | null
          predicted_away_goals?: number | null
          predicted_home_goals?: number | null
          predicted_result?: never
          predicted_total_goals?: number | null
          prediction_correct?: boolean | null
          prediction_type?: string | null
          probability_accuracy?: number | null
          resilience_factor_away?: number | null
          resilience_factor_home?: number | null
          updated_at?: string | null
        }
        Update: {
          actual_result?: string | null
          away_team?: string | null
          away_win_probability?: number | null
          cache_key?: string | null
          comeback_probability_away?: number | null
          comeback_probability_home?: number | null
          confidence_score?: number | null
          created_at?: string | null
          draw_probability?: number | null
          expires_at?: string | null
          features_used?: Json | null
          home_team?: string | null
          home_win_probability?: number | null
          id?: string | null
          league?: string | null
          legend_mode_features?: Json | null
          match_date?: string | null
          match_id?: number | null
          mental_strength_away?: number | null
          mental_strength_home?: number | null
          model_version?: string | null
          predicted_at?: string | null
          predicted_away_goals?: number | null
          predicted_home_goals?: number | null
          predicted_result?: never
          predicted_total_goals?: number | null
          prediction_correct?: boolean | null
          prediction_type?: string | null
          probability_accuracy?: number | null
          resilience_factor_away?: number | null
          resilience_factor_home?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      team_form_analysis: {
        Row: {
          avg_goals_conceded: number | null
          avg_goals_scored: number | null
          btts_lower_ci: number | null
          btts_percentage: number | null
          btts_std_dev: number | null
          btts_upper_ci: number | null
          team_name: string | null
          total_matches: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_all_features_batch: {
        Args:
          | {
              p_batch_size?: number
              p_end_date?: string
              p_start_date?: string
            }
          | {
              p_days_lookback?: number
              p_form_lookback_days?: number
              p_h2h_matches_limit?: number
            }
        Returns: Json
      }
      calculate_comeback_stats: {
        Args: { team_name: string }
        Returns: {
          blown_leads: number
          comeback_draws: number
          comeback_frequency: number
          comeback_wins: number
          total_matches: number
        }[]
      }
      calculate_confidence_interval: {
        Args: {
          p_attempts: number
          p_confidence_level?: number
          p_successes: number
        }
        Returns: Json
      }
      calculate_features_for_match: {
        Args: {
          p_h2h_matches_limit?: number
          p_lookback_days?: number
          p_match_id: number
        }
        Returns: Json
      }
      calculate_team_form: {
        Args: { num_matches?: number; team_name: string }
        Returns: number
      }
      check_database_health: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      cleanup_expired_predictions: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      cleanup_old_predictions: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_old_system_logs: {
        Args: { batch_size?: number; retention_days?: number }
        Returns: number
      }
      format_match_result: {
        Args: { away_goals: number; home_goals: number }
        Returns: string
      }
      get_comeback_stats: {
        Args:
          | {
              p_end_time?: string
              p_lookback_days?: number
              p_schema_name?: string
              p_team_name: string
            }
          | { p_lookback_days: number; p_team_name: string }
        Returns: {
          avg_blown_lead_goal_diff: number
          avg_comeback_goal_diff: number
          blown_lead_rate: number
          comeback_difficulty_avg: number
          comeback_success_rate: number
          matches_ahead_at_ht: number
          matches_behind_at_ht: number
          mental_strength_factor: number
          resilience_factor: number
          total_blown_leads: number
          total_comebacks: number
          total_matches_in_period: number
        }[]
      }
      get_feature_config: {
        Args: { p_group: string; p_param?: string }
        Returns: Json
      }
      get_h2h_record: {
        Args: { team1: string; team2: string }
        Returns: {
          draws: number
          team1_goals: number
          team1_wins: number
          team2_goals: number
          team2_wins: number
          total_matches: number
        }[]
      }
      get_h2h_stats: {
        Args:
          | {
              p_away_team: string
              p_home_team: string
              p_match_time: string
              p_matches_limit: number
            }
          | {
              p_end_time?: string
              p_h2h_matches_limit?: number
              p_schema_name?: string
              p_team1_name: string
              p_team2_name: string
            }
        Returns: {
          h2h_avg_team1_goals: number
          h2h_avg_team2_goals: number
          h2h_avg_total_goals: number
          h2h_dominance_score: number
          h2h_draws: number
          h2h_goal_difference: number
          h2h_matches_played: number
          h2h_team1_win_rate: number
          h2h_team1_wins: number
          h2h_team2_win_rate: number
          h2h_team2_wins: number
        }[]
      }
      get_legend_mode_comeback_breakdown: {
        Args: {
          p_away_team: string
          p_home_team: string
          p_lookback_days?: number
        }
        Returns: Json
      }
      get_legend_mode_comeback_stats: {
        Args: { p_lookback_days?: number; p_team_name: string }
        Returns: Json
      }
      get_legend_mode_comeback_stats_v2: {
        Args: { p_config?: Json; p_lookback_days?: number; p_team_name: string }
        Returns: Json
      }
      get_match_result: {
        Args: { away_goals: number; home_goals: number }
        Returns: string
      }
      get_prediction_accuracy_stats: {
        Args: { date_from?: string; date_to?: string; model_type?: string }
        Returns: {
          accuracy_percentage: number
          avg_confidence: number
          avg_probability_accuracy: number
          correct_predictions: number
          prediction_type: string
          total_predictions: number
        }[]
      }
      get_team_form_stats: {
        Args:
          | {
              p_end_time?: string
              p_league: string
              p_lookback_days?: number
              p_schema_name?: string
              p_team_name: string
            }
          | {
              p_league: string
              p_lookback_days: number
              p_match_time: string
              p_team_name: string
            }
        Returns: {
          avg_corners: number
          avg_goals_conceded: number
          avg_goals_scored: number
          avg_red_cards: number
          avg_shots: number
          avg_shots_on_target: number
          avg_yellow_cards: number
          draws: number
          form_score: number
          losses: number
          matches_played: number
          win_rate: number
          wins: number
        }[]
      }
      get_team_stats: {
        Args: { team_name: string }
        Returns: {
          avg_goals_conceded: number
          avg_goals_scored: number
          away_wins: number
          draws: number
          goals_against: number
          goals_for: number
          home_wins: number
          losses: number
          total_matches: number
          wins: number
        }[]
      }
      gtrgm_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_options: {
        Args: { "": unknown }
        Returns: undefined
      }
      gtrgm_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      is_comeback_match: {
        Args: {
          ft_away: number
          ft_home: number
          ht_away: number
          ht_home: number
        }
        Returns: boolean
      }
      is_match_analysis_materialized_stale: {
        Args: { max_hours?: number }
        Returns: boolean
      }
      log_api_event: {
        Args: {
          p_details?: Json
          p_log_level: string
          p_message: string
          p_request_ip?: unknown
          p_response_time_ms?: number
          p_source: string
          p_user_id?: string
        }
        Returns: undefined
      }
      log_event: {
        Args: {
          p_details?: Json
          p_event_type: string
          p_log_level?: Database["public"]["Enums"]["log_level"]
          p_message: string
          p_stack_trace?: string
        }
        Returns: undefined
      }
      log_system_event: {
        Args: {
          p_error_details?: string
          p_event_type: string
          p_message: string
          p_severity?: string
        }
        Returns: undefined
      }
      measure_performance: {
        Args: { p_callback_func_call: string; p_function_name: string }
        Returns: Database["public"]["CompositeTypes"]["feature_calculation_result"]
      }
      optimize_database_performance: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      periodic_materialized_view_maintenance: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      refresh_match_analysis_materialized: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      safe_round: {
        Args: { p_precision?: number; p_value: number }
        Returns: number
      }
      set_limit: {
        Args: { "": number }
        Returns: number
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: { "": string }
        Returns: string[]
      }
      update_enhanced_predictions: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_legend_mode_features: {
        Args: { p_prediction_id: string }
        Returns: undefined
      }
      validate_comeback_inputs: {
        Args: { p_config?: Json; p_lookback_days: number; p_team_name: string }
        Returns: Json
      }
      validate_feature_calculation_params: {
        Args: {
          p_days_lookback: number
          p_form_lookback_days: number
          p_h2h_matches_limit: number
        }
        Returns: boolean
      }
    }
    Enums: {
      log_level: "DEBUG" | "INFO" | "WARNING" | "ERROR" | "CRITICAL"
      match_status_enum: "scheduled" | "in_progress" | "completed" | "postponed"
    }
    CompositeTypes: {
      comeback_stats: {
        leading_at_half_time_wins: number | null
        trailing_at_half_time_wins: number | null
        draw_at_half_time_wins: number | null
        total_matches_analyzed: number | null
      }
      feature_calculation_result: {
        processed_matches: number | null
        failed_matches: number | null
        total_processing_time: unknown | null
      }
      h2h_stats: {
        home_wins: number | null
        away_wins: number | null
        draws: number | null
        total_matches: number | null
        avg_goals_home: number | null
        avg_goals_away: number | null
      }
      team_form_stats: {
        wins: number | null
        draws: number | null
        losses: number | null
        goals_scored: number | null
        goals_conceded: number | null
        avg_goals_scored: number | null
        avg_goals_conceded: number | null
      }
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      log_level: ["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"],
      match_status_enum: ["scheduled", "in_progress", "completed", "postponed"],
    },
  },
} as const
