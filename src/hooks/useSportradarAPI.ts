import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import SportradarAPI from '@/services/sportradarAPI';
import { Match } from '@/types/sportradar';

// Page visibility hook
const usePageVisibility = () => {
  const [isVisible, setIsVisible] = useState(() => 
    typeof document === 'undefined' ? true : !document.hidden
  );

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityChange);
      return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }
  }, []);

  return isVisible;
};

// Create API instance
let apiInstance: SportradarAPI | null = null;

const getAPIInstance = () => {
  if (!apiInstance) {
    apiInstance = new SportradarAPI();
  }
  return apiInstance;
};

// Custom hooks for data fetching
export const useCompetitions = (apiKey: string) => {
  return useQuery({
    queryKey: ['competitions', !!apiKey],
    queryFn: () => getAPIInstance().getCompetitions(),
    enabled: !!apiKey,
    staleTime: 1000 * 60 * 30, // 30 minutes - competitions don't change often
    gcTime: 1000 * 60 * 60, // 1 hour garbage collection
    retry: 2,
  });
};

export const useLiveMatches = (apiKey: string) => {
  const isVisible = usePageVisibility();
  
  return useQuery({
    queryKey: ['liveMatches', !!apiKey],
    queryFn: () => getAPIInstance().getLiveMatches(),
    enabled: !!apiKey && isVisible && navigator.onLine,
    refetchInterval: isVisible && navigator.onLine ? 30000 : false,
    refetchOnWindowFocus: 'always',
    staleTime: 1000 * 10, // Consider data stale after 10 seconds
    retry: 3,
  });
};

export const useMatchSummary = (apiKey: string, matchId: string) => {
  return useQuery({
    queryKey: ['matchSummary', apiKey, matchId],
    queryFn: () => getAPIInstance().getMatchSummary(matchId),
    enabled: !!apiKey && !!matchId,
    refetchInterval: 30000, // Refresh every 30 seconds for live matches
    staleTime: 1000 * 10,
    retry: 2,
  });
};

export const useSeasonSchedule = (apiKey: string, seasonId: string) => {
  return useQuery({
    queryKey: ['seasonSchedule', seasonId, !!apiKey],
    queryFn: () => getAPIInstance().getSeasonSchedule(seasonId),
    enabled: !!apiKey && !!seasonId,
    staleTime: 1000 * 60 * 60, // 1 hour - schedules don't change frequently
    gcTime: 24 * 60 * 60 * 1000, // 24 hours garbage collection
    retry: 2,
  });
};

export const useSeasonStandings = (apiKey: string, seasonId: string) => {
  return useQuery({
    queryKey: ['seasonStandings', seasonId, !!apiKey],
    queryFn: () => getAPIInstance().getSeasonStandings(seasonId),
    enabled: !!apiKey && !!seasonId,
    staleTime: 1000 * 60 * 60, // 1 hour - standings don't change very frequently
    gcTime: 24 * 60 * 60 * 1000, // 24 hours garbage collection
    retry: 2,
  });
};

export const useScheduledMatches = (apiKey: string, dateISO: string) => {
  return useQuery({
    queryKey: ['scheduledMatches', dateISO, !!apiKey],
    queryFn: () => getAPIInstance().getScheduledMatches(dateISO),
    enabled: !!apiKey && !!dateISO,
    staleTime: 1000 * 60 * 60, // 1 hour
    retry: 2,
  });
};

// Utility function to transform API data to our MatchCard format
export const transformMatchData = (match: Match) => {
  const homeTeam = match.sport_event.competitors.find(c => c.qualifier === 'home');
  const awayTeam = match.sport_event.competitors.find(c => c.qualifier === 'away');
  
  const homeScore = match.sport_event_status?.period_scores?.[0]?.home_score;
  const awayScore = match.sport_event_status?.period_scores?.[0]?.away_score;
  
  // Enhanced status mapping
  const mapStatus = (status?: string): 'live' | 'scheduled' | 'finished' => {
    if (!status) return 'scheduled';
    const liveStates = new Set(['live', '1st_half', '2nd_half', 'overtime', 'penalties']);
    const finishedStates = new Set(['closed', 'ended', 'aet', 'ft']);
    
    if (liveStates.has(status)) return 'live';
    if (finishedStates.has(status)) return 'finished';
    return 'scheduled';
  };
  
  return {
    id: match.sport_event.id,
    homeTeam: homeTeam?.name || 'TBD',
    awayTeam: awayTeam?.name || 'TBD',
    homeScore: homeScore !== undefined ? homeScore : undefined,
    awayScore: awayScore !== undefined ? awayScore : undefined,
    status: mapStatus(match.sport_event_status?.match_status || 'scheduled'),
    time: match.sport_event.start_time || new Date().toISOString(),
    competition: match.sport_event.sport_event_context?.competition?.name || 'Unknown',
  };
};

// Test API connection
export const useAPITest = (apiKey: string) => {
  return useQuery({
    queryKey: ['apiTest', !!apiKey],
    queryFn: () => getAPIInstance().testConnection(),
    enabled: !!apiKey,
    retry: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};