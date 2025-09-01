import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MatchCard } from "@/components/ui/match-card";
import { StatsCard } from "@/components/ui/stats-card";
import { StandingsTable } from "@/components/ui/standings-table";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Trophy, 
  Target, 
  Users, 
  Calendar,
  Activity,
  TrendingUp,
  Settings,
  LogOut,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  useCompetitions, 
  useLiveMatches, 
  useScheduledMatches,
  useAPITest, 
  transformMatchData 
} from "@/hooks/useSportradarAPI";

interface SoccerDashboardProps {
  apiKey: string;
  onLogout: () => void;
}

export const SoccerDashboard = ({ apiKey, onLogout }: SoccerDashboardProps) => {
  const { toast } = useToast();
  
  // Get today and yesterday dates for fixtures/results
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  
  // API data hooks
  const { data: competitionsData, isLoading: competitionsLoading, error: competitionsError } = useCompetitions(apiKey);
  const { data: liveMatchesData, isLoading: liveMatchesLoading, error: liveMatchesError } = useLiveMatches(apiKey);
  const { data: fixturesData, isLoading: fixturesLoading, error: fixturesError } = useScheduledMatches(apiKey, today);
  const { data: resultsData, isLoading: resultsLoading, error: resultsError } = useScheduledMatches(apiKey, yesterday);
  const { data: isAPIConnected, isLoading: apiTestLoading } = useAPITest(apiKey);

  // Transform data
  const liveMatches = liveMatchesData?.matches?.map(transformMatchData) || [];
  const fixtures = fixturesData?.schedules?.map(schedule => transformMatchData({ 
    sport_event: schedule.sport_event, 
    sport_event_status: undefined 
  })).filter(match => match.status === 'scheduled') || [];
  const results = resultsData?.schedules?.map(schedule => transformMatchData({ 
    sport_event: schedule.sport_event, 
    sport_event_status: undefined 
  })).filter(match => match.status === 'finished') || [];

  // Get a demo season ID for standings (use first competition's current season if available)
  const demoSeasonId = competitionsData?.competitions?.[0]?.id || "sr:season:106037"; // Premier League 2023/24 as fallback

  // Calculate stats from real data
  const stats = {
    liveMatches: liveMatches.length,
    totalGoals: liveMatches.reduce((sum, match) => 
      sum + (match.homeScore || 0) + (match.awayScore || 0), 0),
    competitions: competitionsData?.competitions?.length || 0,
    teams: new Set([
      ...liveMatches.flatMap(m => [m.homeTeam, m.awayTeam]),
      ...fixtures.flatMap(m => [m.homeTeam, m.awayTeam])
    ]).size
  };

  useEffect(() => {
    if (isAPIConnected === true) {
      toast({
        title: "Kapcsolat létrejött",
        description: "Sikeresen csatlakoztál a Sportradar API-hoz",
      });
    } else if (isAPIConnected === false) {
      toast({
        title: "Kapcsolati hiba",
        description: "Nem sikerült csatlakozni a Sportradar API-hoz. Ellenőrizd az API kulcsot.",
        variant: "destructive",
      });
    }
  }, [isAPIConnected, toast]);

  // Handle API errors with better messaging
  useEffect(() => {
    const errors = [
      { error: liveMatchesError, context: "élő meccsek" },
      { error: competitionsError, context: "bajnokságok" },
      { error: fixturesError, context: "következő meccsek" },
      { error: resultsError, context: "eredmények" }
    ];
    
    errors.forEach(({ error, context }) => {
      if (error) {
        toast({
          title: "Adatlekérdezési hiba",
          description: error.message || `Hiba történt a ${context} lekérdezésekor`,
          variant: "destructive",
        });
      }
    });
  }, [liveMatchesError, competitionsError, fixturesError, resultsError, toast]);

  const handleLogout = () => {
    localStorage.removeItem("sportradar_api_key");
    onLogout();
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-pitch rounded-lg flex items-center justify-center">
                <Trophy className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-hero bg-clip-text text-transparent">
                  Soccer Data Hub
                </h1>
                <p className="text-sm text-muted-foreground">
                  Powered by Sportradar API
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Élő meccsek"
            value={liveMatchesLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : stats.liveMatches}
            subtitle="jelenleg zajlik"
            icon={Activity}
            trend="up"
          />
          <StatsCard
            title="Gólok összesen"
            value={liveMatchesLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : stats.totalGoals}
            subtitle="élő meccsekben"
            icon={Target}
            trend="up"
          />
          <StatsCard
            title="Bajnokságok"
            value={competitionsLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : stats.competitions}
            subtitle="elérhető verseny"
            icon={Trophy}
            trend="neutral"
          />
          <StatsCard
            title="Csapatok"
            value={liveMatchesLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : stats.teams}
            subtitle="élő meccsekben"
            icon={Users}
            trend="neutral"
          />
        </div>

        {/* Main Content */}
        <Tabs defaultValue="live" className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList className="grid w-full max-w-md grid-cols-4">
              <TabsTrigger value="live">Live</TabsTrigger>
              <TabsTrigger value="fixtures">Fixtures</TabsTrigger>
              <TabsTrigger value="results">Results</TabsTrigger>
              <TabsTrigger value="standings">Standings</TabsTrigger>
            </TabsList>
            
            <Badge variant="outline" className="hidden sm:flex">
              <Activity className="w-3 h-3 mr-1" />
              Real-time updates
            </Badge>
          </div>

          <TabsContent value="live" className="space-y-6">
            <Card className="bg-gradient-card shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-destructive" />
                  Live Matches
                </CardTitle>
              </CardHeader>
              <CardContent>
                {liveMatchesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-2 text-muted-foreground">Élő meccsek betöltése...</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                    {liveMatches.map((match, index) => (
                      <MatchCard key={match.id || index} {...match} />
                    ))}
                    {liveMatches.length === 0 && (
                      <div className="col-span-full text-center py-8 text-muted-foreground">
                        <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Jelenleg nincsenek élő meccsek</p>
                        <p className="text-sm">Az adatok 30 másodpercenként frissülnek</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fixtures" className="space-y-6">
            <Card className="bg-gradient-card shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-primary" />
                  Upcoming Fixtures
                </CardTitle>
              </CardHeader>
              <CardContent>
                {fixturesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-2 text-muted-foreground">Következő meccsek betöltése...</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                    {fixtures.map((match, index) => (
                      <MatchCard key={match.id || index} {...match} showPredictions={true} />
                    ))}
                    {fixtures.length === 0 && (
                      <div className="col-span-full text-center py-8 text-muted-foreground">
                        <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Nincsenek közelgő meccsek mára</p>
                        <p className="text-sm">Ellenőrizd a következő napokat</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="results" className="space-y-6">
            <Card className="bg-gradient-card shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-primary" />
                  Recent Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                {resultsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-2 text-muted-foreground">Eredmények betöltése...</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                    {results.map((match, index) => (
                      <MatchCard key={match.id || index} {...match} />
                    ))}
                    {results.length === 0 && (
                      <div className="col-span-full text-center py-8 text-muted-foreground">
                        <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Nincsenek befejezett meccsek tegnaptól</p>
                        <p className="text-sm">Ellenőrizd az előző napokat</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="standings" className="space-y-6">
            <StandingsTable 
              apiKey={apiKey} 
              seasonId={demoSeasonId}
              competitionName={competitionsData?.competitions?.[0]?.name}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
    </ErrorBoundary>
  );
};