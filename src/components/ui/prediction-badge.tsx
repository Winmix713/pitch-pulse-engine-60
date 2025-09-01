import { Badge } from "@/components/ui/badge";
import { TrendingUp } from "lucide-react";
import { predictBTTSAndOver2p5, getMockTeamForm, type TeamForm } from "@/lib/predictions";

interface PredictionBadgeProps {
  homeTeam: string;
  awayTeam: string;
  homeForm?: TeamForm;
  awayForm?: TeamForm;
  className?: string;
}

export const PredictionBadge = ({ 
  homeTeam, 
  awayTeam, 
  homeForm, 
  awayForm,
  className 
}: PredictionBadgeProps) => {
  // Use provided forms or fallback to mock data for demo
  const homeTeamForm = homeForm || getMockTeamForm(homeTeam);
  const awayTeamForm = awayForm || getMockTeamForm(awayTeam);
  
  const prediction = predictBTTSAndOver2p5({ 
    home: homeTeamForm, 
    away: awayTeamForm, 
    leagueAdjustment: 1 
  });

  const bttsPercent = Math.round(prediction.btts * 100);
  const over2p5Percent = Math.round(prediction.over2p5 * 100);

  // Color coding based on probability
  const getBadgeVariant = (percent: number) => {
    if (percent >= 70) return "default"; // high probability
    if (percent >= 50) return "secondary"; // medium probability
    return "outline"; // low probability
  };

  return (
    <div className={`flex gap-2 ${className}`}>
      <Badge 
        variant={getBadgeVariant(bttsPercent)} 
        className="text-xs flex items-center gap-1"
      >
        <TrendingUp className="w-3 h-3" />
        BTTS {bttsPercent}%
      </Badge>
      <Badge 
        variant={getBadgeVariant(over2p5Percent)} 
        className="text-xs flex items-center gap-1"
      >
        <TrendingUp className="w-3 h-3" />
        O2.5 {over2p5Percent}%
      </Badge>
    </div>
  );
};