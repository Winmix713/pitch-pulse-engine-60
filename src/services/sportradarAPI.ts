import { supabase } from '@/integrations/supabase/client';
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
  private apiKey?: string; // kept for compatibility
  
  constructor(opts: { apiKey?: string; baseURL?: string; isProxy?: boolean } = {}) {
    this.apiKey = opts.apiKey; // kept for compatibility but not used anymore
  }

  private async request<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    try {
      const { data, error } = await supabase.functions.invoke('sportradar-proxy', {
        body: { endpoint, params }
      });

      if (error) {
        throw new APIError(`Supabase function error: ${error.message}`, 500, 'FUNCTION_ERROR');
      }

      if (data.error) {
        const status = data.error === 'API Error: 401' ? 401 :
                      data.error === 'API Error: 403' ? 403 :
                      data.error === 'API Error: 404' ? 404 :
                      data.error === 'API Error: 429' ? 429 : 500;
        
        const errorMessages: { [key: number]: string } = {
          401: 'Érvénytelen API kulcs. Ellenőrizd a beállításokat.',
          403: 'Nincs hozzáférés ehhez az adathoz. Ellenőrizd az előfizetésedet.',
          404: 'Az adott erőforrás nem található.',
          429: 'Túl sok kérés. Várj egy kicsit, majd próbáld újra.'
        };

        throw new APIError(
          errorMessages[status] || `API hiba: ${data.message}`, 
          status, 
          status === 429 ? 'RATE_LIMIT' : 'API_ERROR'
        );
      }

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
    return this.request('/soccer/trial/v4/en/competitions.json');
  }

  // Get live matches (using live summaries endpoint)
  getLiveMatches(): Promise<LiveMatchesResponse> {
    return this.request('/soccer/trial/v4/en/sport_events/live/summaries.json');
  }

  // Get match summary by ID
  getMatchSummary(matchId: string): Promise<MatchSummaryResponse> {
    const numericId = extractNumericId(matchId);
    return this.request(`/soccer/trial/v4/en/sport_events/${numericId}/summary.json`);
  }

  // Get season schedule
  getSeasonSchedule(seasonId: string): Promise<SeasonScheduleResponse> {
    const numericId = extractNumericId(seasonId);
    return this.request(`/soccer/trial/v4/en/seasons/${numericId}/schedule.json`);
  }

  // Get season standings
  getSeasonStandings(seasonId: string): Promise<StandingsResponse> {
    const numericId = extractNumericId(seasonId);
    return this.request(`/soccer/trial/v4/en/seasons/${numericId}/standings.json`);
  }

  // Get scheduled matches for a specific date (using daily summaries)
  getScheduledMatches(dateISO: string): Promise<SeasonScheduleResponse> {
    // dateISO: YYYY-MM-DD
    return this.request(`/soccer/trial/v4/en/schedules/${dateISO}/summaries.json`);
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