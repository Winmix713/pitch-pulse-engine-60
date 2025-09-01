import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PredictionBadge } from "@/components/ui/prediction-badge";
import { Clock, Calendar } from "lucide-react";

interface MatchCardProps {
  homeTeam: string;
  awayTeam: string;
  homeScore?: number;
  awayScore?: number;
  status: "live" | "scheduled" | "finished";
  time: string;
  competition?: string;
  showPredictions?: boolean;
}

export const MatchCard = ({
  homeTeam,
  awayTeam,
  homeScore,
  awayScore,
  status,
  time,
  competition,
  showPredictions = false
}: MatchCardProps) => {
  const statusColors = {
    live: "bg-destructive text-destructive-foreground",
    scheduled: "bg-muted text-muted-foreground", 
    finished: "bg-secondary text-secondary-foreground"
  };

  const statusLabels = {
    live: "LIVE",
    scheduled: "SCHEDULED",
    finished: "FULL TIME"
  };

  return (
    <Card className="bg-gradient-card shadow-card hover:shadow-pitch transition-all duration-300 hover:scale-[1.02]">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <Badge className={statusColors[status]}>
            {statusLabels[status]}
          </Badge>
          <div className="flex items-center text-muted-foreground text-sm">
            {status === "live" ? (
              <Clock className="w-4 h-4 mr-1" />
            ) : (
              <Calendar className="w-4 h-4 mr-1" />
            )}
            {time}
          </div>
        </div>
        
        {competition && (
          <div className="text-xs text-muted-foreground mb-3 font-medium uppercase tracking-wide">
            {competition}
          </div>
        )}

        {/* Show predictions for scheduled matches */}
        {showPredictions && status === "scheduled" && (
          <div className="mb-4">
            <PredictionBadge homeTeam={homeTeam} awayTeam={awayTeam} />
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="font-semibold text-foreground mb-1">{homeTeam}</div>
            <div className="font-semibold text-foreground">{awayTeam}</div>
          </div>
          
          {(homeScore !== undefined && awayScore !== undefined) ? (
            <div className="text-right">
              <div className="text-2xl font-bold text-primary mb-1">{homeScore}</div>
              <div className="text-2xl font-bold text-primary">{awayScore}</div>
            </div>
          ) : (
            <div className="text-muted-foreground text-sm">
              VS
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};