import { 
  CompetitionsResponse, 
  LiveMatchesResponse, 
  MatchSummaryResponse, 
  SeasonScheduleResponse,
  StandingsResponse 
} from '@/types/sportradar';

export class APIError extends Error {
  status?: number;
  code?: string;
  
  constructor(message: string, status?: number, code?: string) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.code = code;
  }
}

const extractNumericId = (urnOrId: string): string =>
  urnOrId.includes(':') ? urnOrId.split(':').pop()! : urnOrId;

// Exponential backoff with jitter for 429
function backoffDelay(attempt: number, base = 500): number {
  const exp = Math.min(8, attempt); // cap growth
  const jitter = Math.random() * 100;
  return base * 2 ** exp + jitter;
}

class SportradarAPI {
  private apiKey: string;
  private baseURL: string;
  
  constructor(opts: { apiKey?: string; baseURL?: string } = {}) {
    this.apiKey = opts.apiKey || import.meta.env.VITE_SPORTRADAR_API_KEY || '';
    this.baseURL = opts.baseURL || import.meta.env.VITE_SPORTRADAR_BASE_URL || 'https://api.sportradar.com/soccer/trial/v4/en';
  }

  private async request<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    try {
      if (!this.apiKey) {
        throw new APIError('API kulcs hiányzik. Ellenőrizd a beállításokat.', 401, 'NO_API_KEY');
      }

      const url = new URL(`${this.baseURL}${endpoint}`);
      url.searchParams.append('api_key', this.apiKey);
      
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            url.searchParams.append(key, String(value));
          }
        });
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errorMessages: { [key: number]: string } = {
          401: 'Érvénytelen API kulcs. Ellenőrizd a beállításokat.',
          403: 'Nincs hozzáférés ehhez az adathoz. Ellenőrizd az előfizetésedet.',
          404: 'Az adott erőforrás nem található.',
          429: 'Túl sok kérés. Várj egy kicsit, majd próbáld újra.',
          500: 'Szerver hiba. Próbáld újra később.'
        };

        throw new APIError(
          errorMessages[response.status] || `API hiba: ${response.statusText}`, 
          response.status, 
          response.status === 429 ? 'RATE_LIMIT' : 'API_ERROR'
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError(`Hálózati hiba: ${error instanceof Error ? error.message : 'Ismeretlen hiba'}`, 500, 'NETWORK_ERROR');
    }
  }

  // Get all competitions
  getCompetitions(): Promise<CompetitionsResponse> {
    return this.request('/competitions.json');
  }

  // Get live matches (using live summaries endpoint)
  getLiveMatches(): Promise<LiveMatchesResponse> {
    return this.request('/sport_events/live/summaries.json');
  }

  // Get match summary by ID
  getMatchSummary(matchId: string): Promise<MatchSummaryResponse> {
    const numericId = extractNumericId(matchId);
    return this.request(`/sport_events/${numericId}/summary.json`);
  }

  // Get season schedule
  getSeasonSchedule(seasonId: string): Promise<SeasonScheduleResponse> {
    const numericId = extractNumericId(seasonId);
    return this.request(`/seasons/${numericId}/schedule.json`);
  }

  // Get season standings
  getSeasonStandings(seasonId: string): Promise<StandingsResponse> {
    const numericId = extractNumericId(seasonId);
    return this.request(`/seasons/${numericId}/standings.json`);
  }

  // Get scheduled matches for a specific date (using daily schedules)
  getScheduledMatches(dateISO: string): Promise<SeasonScheduleResponse> {
    // dateISO: YYYY-MM-DD
    return this.request(`/schedules/${dateISO}/summaries.json`);
  }

  // Test API connection
  async testConnection(): Promise<boolean> {
    try {
      await this.getCompetitions();
      return true;
    } catch (error) {
      return false;
    }
  }
}

export default SportradarAPI;