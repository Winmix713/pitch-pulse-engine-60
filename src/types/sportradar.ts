export interface Competition {
  id: string;
  name: string;
  category: {
    id: string;
    name: string;
    country_code?: string;
  };
  gender?: string;
  type?: string;
}

export interface Team {
  id: string;
  name: string;
  country?: string;
  country_code?: string;
}

export interface MatchStatus {
  type: string;
  match_status: string;
  match_status_description?: string;
  period_scores?: Array<{
    home_score: number;
    away_score: number;
    type: string;
  }>;
}

export interface SportEvent {
  id: string;
  start_time?: string;
  start_time_confirmed?: boolean;
  competitors: Array<{
    id: string;
    name: string;
    country?: string;
    country_code?: string;
    qualifier: 'home' | 'away';
  }>;
  sport_event_context?: {
    season?: {
      id: string;
      name: string;
    };
    competition?: {
      id: string;
      name: string;
    };
    round?: {
      type?: string;
      number?: number;
    };
  };
}

export interface Match {
  sport_event: SportEvent;
  sport_event_status?: MatchStatus;
}

export interface CompetitionsResponse {
  competitions: Competition[];
}

export interface LiveMatchesResponse {
  matches: Match[];
}

export interface MatchSummaryResponse {
  sport_event: SportEvent;
  sport_event_status: MatchStatus;
  statistics?: {
    totals?: {
      competitors: Array<{
        id: string;
        statistics: Record<string, number>;
      }>;
    };
  };
}

export interface SeasonScheduleResponse {
  schedules: Array<{
    sport_event: SportEvent;
  }>;
}

export interface StandingsResponse {
  standings: Array<{
    type: string;
    groups: Array<{
      id: string;
      name: string;
      group_standings: Array<{
        rank: number;
        competitor: {
          id: string;
          name: string;
        };
        played: number;
        win: number;
        draw: number;
        loss: number;
        goals_for: number;
        goals_against: number;
        goal_diff: number;
        points: number;
      }>;
    }>;
  }>;
}