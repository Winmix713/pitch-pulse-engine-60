import { supabase } from '@/integrations/supabase/client';

export interface SportradarAPIParams {
  [key: string]: string | number | boolean;
}

/**
 * Call the Sportradar proxy edge function
 * This handles API key management and CORS issues
 */
export async function callSportradarAPI<T = any>(
  endpoint: string,
  params: SportradarAPIParams = {}
): Promise<T> {
  try {
    const { data, error } = await supabase.functions.invoke('sportradar-proxy', {
      body: {
        endpoint,
        params
      }
    });

    if (error) {
      console.error('Sportradar API error:', error);
      throw new Error(error.message || 'Failed to fetch from Sportradar API');
    }

    return data as T;
  } catch (err) {
    console.error('Sportradar proxy error:', err);
    throw err;
  }
}

/**
 * Get match schedule for a specific date
 */
export async function getSchedule(date: string, leagueId?: string) {
  const params: SportradarAPIParams = {};
  if (leagueId) params.league_id = leagueId;
  
  return callSportradarAPI(
    `/soccer/trial/v4/en/schedules/${date}/schedule.json`,
    params
  );
}

/**
 * Get match details by ID
 */
export async function getMatchDetails(matchId: string) {
  return callSportradarAPI(
    `/soccer/trial/v4/en/matches/${matchId}/summary.json`
  );
}

/**
 * Get team standings
 */
export async function getStandings(seasonId: string) {
  return callSportradarAPI(
    `/soccer/trial/v4/en/seasons/${seasonId}/standings.json`
  );
}

/**
 * Get team profile
 */
export async function getTeamProfile(teamId: string) {
  return callSportradarAPI(
    `/soccer/trial/v4/en/teams/${teamId}/profile.json`
  );
}

/**
 * Get league hierarchy
 */
export async function getLeagueHierarchy() {
  return callSportradarAPI(
    `/soccer/trial/v4/en/tournaments.json`
  );
}
