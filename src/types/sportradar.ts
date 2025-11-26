// Sportradar API Types

export interface EnsembleBreakdown {
  model_name: string;
  weight: number;
  prediction: {
    outcome: string;
    probability: number;
  };
  confidence: number;
}

export interface SportradarTeam {
  id: string;
  name: string;
  alias?: string;
  market?: string;
}

export interface SportradarMatch {
  id: string;
  scheduled: string;
  status: string;
  home_team: SportradarTeam;
  away_team: SportradarTeam;
  home_score?: number;
  away_score?: number;
  venue?: {
    id: string;
    name: string;
    city?: string;
    country?: string;
  };
}

export interface SportradarStandings {
  season: {
    id: string;
    name: string;
    year: number;
  };
  standings: Array<{
    team: SportradarTeam;
    rank: number;
    points: number;
    wins: number;
    losses: number;
    draws: number;
    games_played: number;
  }>;
}

export interface SportradarLeague {
  id: string;
  name: string;
  alias?: string;
  category?: {
    id: string;
    name: string;
    country_code?: string;
  };
}
