// Minimal Poisson helpers for BTTS and Over 2.5 predictions
const factorial = (n: number): number => (n <= 1 ? 1 : n * factorial(n - 1));
const pois = (lambda: number, k: number): number => 
  (Math.exp(-lambda) * lambda ** k) / factorial(k);

export interface TeamForm {
  avgGoalsFor: number;
  avgGoalsAgainst: number;
}

export interface PredictionInput {
  home: TeamForm;
  away: TeamForm;
  leagueAdjustment?: number; // e.g., 1.0 default
}

export interface PredictionResult {
  btts: number; // 0..1
  over2p5: number; // 0..1
  expectedGoalsTotal: number;
}

// Simple independent Poisson model
export function predictBTTSAndOver2p5({ 
  home, 
  away, 
  leagueAdjustment = 1 
}: PredictionInput): PredictionResult {
  const lambdaHome = Math.max(0.05, (home.avgGoalsFor + away.avgGoalsAgainst) / 2) * leagueAdjustment;
  const lambdaAway = Math.max(0.05, (away.avgGoalsFor + home.avgGoalsAgainst) / 2) * leagueAdjustment;

  const pHome0 = pois(lambdaHome, 0);
  const pAway0 = pois(lambdaAway, 0);
  const pBoth0 = pHome0 * pAway0;

  // BTTS probability = 1 - P(home=0) - P(away=0) + P(home=0 AND away=0)
  const btts = 1 - pHome0 - pAway0 + pBoth0;

  // Over 2.5: sum P(total goals <= 2) and subtract from 1
  let pTotalLe2 = 0;
  for (let i = 0; i <= 2; i++) {
    for (let j = 0; j <= 2 - i; j++) {
      pTotalLe2 += pois(lambdaHome, i) * pois(lambdaAway, j);
    }
  }
  const over2p5 = 1 - pTotalLe2;

  return {
    btts: Math.max(0, Math.min(1, btts)), // clamp to [0,1]
    over2p5: Math.max(0, Math.min(1, over2p5)), // clamp to [0,1]
    expectedGoalsTotal: lambdaHome + lambdaAway,
  };
}

// Mock team form data for demo purposes
export const getMockTeamForm = (teamName: string): TeamForm => {
  // Simple hash-based pseudo-random values for consistent demo data
  const hash = teamName.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  const goalsFor = 1.0 + (Math.abs(hash) % 100) / 50; // 1.0 - 3.0
  const goalsAgainst = 0.8 + (Math.abs(hash * 7) % 80) / 50; // 0.8 - 2.4
  
  return {
    avgGoalsFor: goalsFor,
    avgGoalsAgainst: goalsAgainst,
  };
};