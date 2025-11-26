import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import {
  getSchedule,
  getMatchDetails,
  getStandings,
  getTeamProfile,
  getLeagueHierarchy,
  type SportradarAPIParams
} from '@/services/sportradarAPI';

/**
 * Hook to fetch match schedule
 */
export function useSchedule(
  date: string,
  leagueId?: string,
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['sportradar', 'schedule', date, leagueId],
    queryFn: () => getSchedule(date, leagueId),
    staleTime: 60000, // 1 minute
    ...options
  });
}

/**
 * Hook to fetch match details
 */
export function useMatchDetails(
  matchId: string,
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['sportradar', 'match', matchId],
    queryFn: () => getMatchDetails(matchId),
    staleTime: 30000, // 30 seconds
    enabled: !!matchId,
    ...options
  });
}

/**
 * Hook to fetch team standings
 */
export function useStandings(
  seasonId: string,
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['sportradar', 'standings', seasonId],
    queryFn: () => getStandings(seasonId),
    staleTime: 300000, // 5 minutes
    enabled: !!seasonId,
    ...options
  });
}

/**
 * Hook to fetch team profile
 */
export function useTeamProfile(
  teamId: string,
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['sportradar', 'team', teamId],
    queryFn: () => getTeamProfile(teamId),
    staleTime: 600000, // 10 minutes
    enabled: !!teamId,
    ...options
  });
}

/**
 * Hook to fetch league hierarchy
 */
export function useLeagueHierarchy(
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['sportradar', 'leagues'],
    queryFn: () => getLeagueHierarchy(),
    staleTime: 3600000, // 1 hour
    ...options
  });
}
