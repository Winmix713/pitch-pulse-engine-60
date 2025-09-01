import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useSeasonStandings } from "@/hooks/useSportradarAPI";

interface StandingsTableProps {
  apiKey: string;
  seasonId: string;
  competitionName?: string;
}

export const StandingsTable = ({ apiKey, seasonId, competitionName }: StandingsTableProps) => {
  const { data, isLoading, error } = useSeasonStandings(apiKey, seasonId);

  if (isLoading) {
    return (
      <Card className="bg-gradient-card shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Trophy className="w-5 h-5 mr-2 text-primary" />
            {competitionName || "League Standings"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <Skeleton className="h-6 w-6 rounded" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-8 ml-auto" />
                <Skeleton className="h-4 w-8" />
                <Skeleton className="h-4 w-8" />
                <Skeleton className="h-4 w-8" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-gradient-card shadow-card">
        <CardContent className="pt-6">
          <div className="text-center py-8 text-muted-foreground">
            <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Failed to load standings</p>
            <p className="text-sm">{error.message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data?.standings?.length) {
    return (
      <Card className="bg-gradient-card shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Trophy className="w-5 h-5 mr-2 text-primary" />
            {competitionName || "League Standings"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No standings available</p>
            <p className="text-sm">Check back later for updated standings</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Get the first group's standings (most leagues have one main table)
  const group = data.standings[0]?.groups?.[0];
  const rows = group?.group_standings ?? [];

  const getPositionTrend = (rank: number) => {
    if (rank <= 4) return { icon: TrendingUp, color: "text-primary", label: "Champions League" };
    if (rank <= 6) return { icon: TrendingUp, color: "text-accent", label: "Europa League" };
    if (rank >= rows.length - 2) return { icon: TrendingDown, color: "text-destructive", label: "Relegation" };
    return { icon: Minus, color: "text-muted-foreground", label: "Mid-table" };
  };

  return (
    <Card className="bg-gradient-card shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Trophy className="w-5 h-5 mr-2 text-primary" />
          {competitionName || group?.name || "League Standings"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-sm text-muted-foreground">
                <th className="text-left py-2 px-2">#</th>
                <th className="text-left py-2 px-4 min-w-[200px]">Team</th>
                <th className="text-center py-2 px-2">P</th>
                <th className="text-center py-2 px-2">W</th>
                <th className="text-center py-2 px-2">D</th>
                <th className="text-center py-2 px-2">L</th>
                <th className="text-center py-2 px-2">GF</th>
                <th className="text-center py-2 px-2">GA</th>
                <th className="text-center py-2 px-2">GD</th>
                <th className="text-center py-2 px-3 font-semibold">Pts</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((team) => {
                const trend = getPositionTrend(team.rank);
                const TrendIcon = trend.icon;
                
                return (
                  <tr 
                    key={team.competitor.id} 
                    className="border-b border-border/50 hover:bg-muted/50 transition-colors"
                  >
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{team.rank}</span>
                        <TrendIcon className={`w-3 h-3 ${trend.color}`} />
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium">{team.competitor.name}</div>
                    </td>
                    <td className="text-center py-3 px-2 text-sm">{team.played}</td>
                    <td className="text-center py-3 px-2 text-sm font-medium text-primary">
                      {team.win}
                    </td>
                    <td className="text-center py-3 px-2 text-sm">{team.draw}</td>
                    <td className="text-center py-3 px-2 text-sm text-destructive">
                      {team.loss}
                    </td>
                    <td className="text-center py-3 px-2 text-sm">{team.goals_for}</td>
                    <td className="text-center py-3 px-2 text-sm">{team.goals_against}</td>
                    <td className={`text-center py-3 px-2 text-sm font-medium ${
                      team.goal_diff > 0 ? 'text-primary' : 
                      team.goal_diff < 0 ? 'text-destructive' : 
                      'text-muted-foreground'
                    }`}>
                      {team.goal_diff > 0 ? '+' : ''}{team.goal_diff}
                    </td>
                    <td className="text-center py-3 px-3">
                      <Badge variant="default" className="font-bold">
                        {team.points}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {/* Legend */}
        <div className="mt-6 pt-4 border-t border-border">
          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-primary" />
              <span>Champions League</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-accent" />
              <span>Europa League</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingDown className="w-3 h-3 text-destructive" />
              <span>Relegation</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};