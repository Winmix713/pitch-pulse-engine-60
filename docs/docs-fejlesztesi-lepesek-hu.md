# 🎯 WinMix Tipster Hub - Fejlesztési Lépések és Útmutató

## 📋 Tartalomjegyzék

1. [Dokumentum célja és áttekintés](#dokumentum-célja-és-áttekintés)
2. [Jelenlegi állapot összefoglalása](#jelenlegi-állapot-összefoglalása)
3. [Tervezett fejlesztési fázisok (Phase 3-9)](#tervezett-fejlesztési-fázisok-phase-3-9)
4. [Javasolt fejlesztési stratégia](#javasolt-fejlesztési-stratégia)
5. [Prioritási mátrix és ütemterv](#prioritási-mátrix-és-ütemterv)
6. [Komplexitás-kezelési elvek](#komplexitás-kezelési-elvek)
7. [Technikai követelmények és függőségek](#technikai-követelmények-és-függőségek)
8. [Implementációs útmutatók](#implementációs-útmutatók)
9. [Best Practices és konvenciók](#best-practices-és-konvenciók)
10. [Kockázatok és ajánlások](#kockázatok-és-ajánlások)

---

## 📊 Dokumentum célja és áttekintés

Ez a dokumentum a WinMix Tipster Hub platform átfogó fejlesztési útmutatója, amely integrálja:
- A jelenlegi repository állapotát (Phase 0-2 implementációja)
- A tervezett funkcionális bővítéseket (Phase 3-9)
- Kritikus komplexitás-kezelési stratégiákat
- Gyakorlati fejlesztési ajánlásokat és prioritásokat

**Dokumentum jellege:** Stratégiai fejlesztési terv + Technikai útmutató  
**Célközönség:** Fejlesztők, technikai döntéshozók  
**Utolsó frissítés:** 2024. november 2.

---

## 🏗️ Jelenlegi állapot összefoglalása

### Implementált komponensek (Phase 0-2)

#### 🎨 Frontend réteg
**Technológiai stack:**
- **Framework:** React 18.3 + TypeScript
- **Build tool:** Vite 5.4
- **Routing:** React Router v6
- **UI Library:** shadcn/ui + Radix UI primitívek
- **Styling:** Tailwind CSS 3.4 + tailwindcss-animate
- **State Management:** TanStack Query (React Query v5)
- **Form handling:** React Hook Form + Zod validáció
- **Charts:** Recharts 2.15
- **Icons:** Lucide React

**Implementált oldalak:**
1. **Index (Landing page)** - Hero szekció, CTA
2. **NewPredictions** - 8 mérkőzés kiválasztása és predikciók kérése
3. **Dashboard** - Összesített statisztikák, teljesítmény áttekintés
4. **Teams** - Csapatok listája
5. **TeamDetail** - Részletes csapat statisztikák és történelem
6. **Matches** - Mérkőzések listája
7. **Leagues** - Ligák áttekintése
8. **MatchDetail** - Mérkőzés részletes elemzése, predikció és feedback
9. **NotFound** - 404 oldal

**Főbb UI komponensek:**
- `Sidebar` - Navigációs oldalsáv
- `TopBar` - Felső fejléc
- `HeroSection` - Landing page hero
- `MatchSelection` - 8 mérkőzés kiválasztó varázsló
- `PredictionDisplay` - Predikciók megjelenítése
- `PredictionResults` - Eredmények összefoglalása
- `FeedbackForm` - Feedback begyűjtés
- `CSSBadge` - Confidence Score System jelvény
- `TeamStatisticsTable` - Csapat statisztikák táblázata
- `NarrativeSection` - AI narratíva megjelenítés
- Dashboard komponensek: `StatisticsCards`, `PatternPerformanceChart`, `RecentPredictions`

#### 🗄️ Backend réteg
**Backend infrastruktúra:**
- **Platform:** Supabase (PostgreSQL + Row Level Security)
- **Edge Functions:** Deno runtime
- **API Client:** @supabase/supabase-js v2.78

**Adatbázis séma (16 tábla):**

| Tábla | Célja | Kulcsfontosságú mezők |
|-------|-------|----------------------|
| `leagues` | Ligák és metrikák | name, country, avg_goals_per_match, home_win_percentage |
| `teams` | Csapatok | name, league_id |
| `matches` | Mérkőzések | home/away_team_id, match_date, scores, status |
| `pattern_templates` | Pattern típusok | name, category, base_confidence_boost |
| `detected_patterns` | Detektált patternök | match_id, template_id, confidence_contribution |
| `predictions` | Predikciók | predicted_outcome, confidence_score, feedback mezők |
| `pattern_accuracy` | Pattern pontosság követés | template_id, accuracy_rate, total/correct_predictions |

**Edge Functions (3 db):**

1. **`analyze-match`** (270 sor)
   - Mérkőzés elemzés és predikció generálás
   - Pattern detekció (5 típus: home/away winning streak, H2H dominance, form advantage, high scoring league)
   - Form score kalkuláció (0-100)
   - Confidence score számítás (max 95%)
   - Predikciók és detected_patterns táblák feltöltése

2. **`get-predictions`**
   - Predikciók lekérése match_id alapján
   - Kapcsolódó patternök aggregálása
   - Form score-ok visszaadása

3. **`submit-feedback`**
   - Eredmények rögzítése (actual_outcome, was_correct)
   - Pattern accuracy frissítése
   - Template confidence dinamikus igazítása

**Seed Data:**
- 2 liga: Premier League, La Liga
- 8 csapat (4-4 ligánként)
- 6 mérkőzés (3 scheduled, 3 finished)
- 5 pattern template előre konfigurálva

### Működő funkciók

✅ **Alapműködés:**
1. Felhasználó kiválaszt 8 mérkőzést
2. `analyze-match` futtatása → predikció generálása minden mérkőzésre
3. Predikciók megjelenítése (kimenet, confidence, patternök, narratíva)
4. Mérkőzés után feedback begyűjtése
5. Pattern accuracy frissítése visszajelzések alapján

✅ **Pattern detection rendszer:**
- Home winning streak detection
- Away winning streak detection
- H2H dominance analysis
- Recent form advantage
- League characteristics (high scoring)

✅ **Confidence Score System (CSS):**
- Bázis confidence: 50%
- Pattern-alapú növelés
- Maximum cap: 95%
- Vizuális megjelenítés badge-ekkel

### Hiányosságok és technikai adósságok

⚠️ **Azonosított problémák:**
1. **Nincs automatizált scheduler** - Manuális trigger szükséges
2. **Nincs hosszú távú modell értékelés** - Csak pattern szintű accuracy tracking
3. **Egyszerű pattern detekció** - Nincs fejlett ML vagy meta-pattern discovery
4. **Nincs monitorozás** - Hiányzik system health tracking, performance metrics
5. **Limitált pattern típusok** - Csak 5 előre definiált pattern
6. **Nincs A/B testing** - Champion/Challenger framework hiányzik
7. **Nincs cross-league intelligence** - Minden liga izoláltan kezelve
8. **Nincs market integration** - Odds és value bet kalkuláció nincs

---

## 🚀 Tervezett fejlesztési fázisok (Phase 3-9)

A következő fejlesztési fázisok a WinMix_TipsterHub_Phase_3-9_Components_EN.md alapján.

### 📦 Phase 3: Scheduled Jobs & Automation

**Cél:** Automatizált feladatok ütemezése és végrehajtása (cron-alapú)

#### Database komponensek (2 db)
1. **`scheduled_jobs` tábla**
   - Mezők: `id`, `job_name`, `job_type`, `cron_schedule`, `enabled`, `last_run_at`, `next_run_at`, `config` (JSONB)
   - Példa job típusok: `fetch_fixtures`, `run_predictions`, `refresh_stats`, `cleanup_old_data`

2. **`job_execution_logs` tábla**
   - Mezők: `id`, `job_id`, `started_at`, `completed_at`, `status`, `duration_ms`, `records_processed`, `error_message`
   - Naplózás minden job futásról

#### API Endpoints (5 db)
3. **`GET /api/jobs/list`** - Összes job listázása
4. **`GET /api/jobs/logs?job_id={id}&limit=50`** - Job execution logs
5. **`POST /api/jobs/trigger`** - Manuális trigger (force paraméterrel)
6. **`POST /api/jobs/toggle`** - Job enable/disable
7. **`POST /api/jobs/scheduler`** - Vercel Cron endpoint (ellenőrzi due jobokat)

#### Frontend komponensek (2 db)
8. **`ScheduledJobsPanel`** - Admin panel job kezeléshez
   - Enable/disable kapcsolók
   - Manual trigger gombok
   - Real-time status frissítések
   - Execution logs megtekintése

9. **`JobStatusCard`** - Egyedi job státusz kártya
   - Job név és leírás
   - Státusz badge (running, success, error, disabled)
   - Utolsó/következő futási idő
   - Átlagos futási idő
   - "Run Now" és "View Logs" gombok

**Becsült időigény:** 1 hét  
**Technikai kihívások:** Vercel Cron konfiguráció, concurrency kezelés, error recovery

---

### 📈 Phase 4: Feedback Loop & Model Evaluation

**Cél:** Hosszú távú modell teljesítmény mérése, kalibráció, összehasonlítás

#### Database komponensek (3 db)
10. **`predictions` tábla kiterjesztése**
    - Új mezők: `css_score`, `prediction_factors` (JSONB), `calibration_error`
    - Accuracy metrics: `outcome_correct`, `confidence_calibrated`

11. **`model_performance` tábla**
    - Mezők: `id`, `model_version`, `period_start`, `period_end`, `total_predictions`, `accuracy_overall`, `accuracy_winner`, `accuracy_btts`, `confidence_calibration_score`, `league_breakdown` (JSONB)
    - Aggregált metrikák időszakonként

12. **`model_comparison` tábla**
    - Mezők: `id`, `model_a_id`, `model_b_id`, `comparison_date`, `accuracy_diff`, `p_value`, `winning_model`, `sample_size`
    - Statisztikai szignifikancia tesztelés (Chi-Square)

#### API Endpoints (5 db)
13. **`POST /api/predictions/track`** - Predikció mentése kiterjesztett adatokkal
14. **`POST /api/predictions/update-results`** - Eredmények frissítése, accuracy számítás
15. **`GET /api/models/performance?version={v}&start={date}&end={date}`** - Model performance lekérés
16. **`POST /api/models/compare`** - Két modell összehasonlítása
17. **`POST /api/models/auto-prune`** - Alacsony accuracy-jű feature-ök automatikus eltávolítása

#### Frontend komponensek (2 db)
18. **`/app/analytics` oldal** - Analytics dashboard
    - Overall performance metrics
    - Model comparison section
    - Accuracy breakdown (winner, BTTS, O/U)
    - Confidence calibration görbe
    - League performance összehasonlítás

19. **`ModelPerformanceChart` komponens** - Line chart
    - X: time, Y: accuracy %
    - Többszörös sorozat: overall, home wins, away wins, draws
    - Confidence bands

**Becsült időigény:** 1.5 hét  
**Technikai kihívások:** Statisztikai tesztek implementációja, calibration metrics, historical data aggregálás

---

### 🔍 Phase 5: Pattern Detection (Advanced)

**Cél:** Fejlett pattern felismerés algoritmusokkal

#### Database komponensek (2 db)
20. **`team_patterns` tábla**
    - Mezők: `id`, `team_id`, `pattern_type`, `pattern_name`, `confidence`, `strength` (0-100), `valid_from`, `valid_until`, `prediction_impact`, `historical_accuracy`, `pattern_metadata` (JSONB)
    - Példa patternök: winning_streak, home_fortress, away_warrior, high_scoring_trend, defensive_solid, form_surge

21. **`pattern_definitions` tábla**
    - Mezők: `id`, `pattern_name`, `detection_function`, `min_sample_size`, `min_confidence_threshold`, `priority`, `is_active`
    - Pattern konfigurációk centralizált tárolása

#### API Endpoints (3 db)
22. **`POST /api/patterns/detect`** - Pattern detekció trigger
    - Body: `{ team_name, league_id, pattern_types: [] }`
    - Response: Detected patterns listája

23. **`GET /api/patterns/team/{teamName}`** - Csapat összes patternje
    - Active és expired patternök
    - Pattern részletes adatai

24. **`POST /api/patterns/verify`** - Pattern újraellenőrzése
    - Re-run detection logic
    - Refresh validity

#### Frontend komponensek (2 db)
25. **`TeamPatternsSection` komponens**
    - Csapat detail page-en megjelenő szekció
    - Active patternök listája
    - PatternBadge komponensek használata
    - Expired patterns collapse-olhatóan

26. **`PatternBadge` komponens**
    - Színkódolt badge pattern típus szerint:
      - 🔥 Winning Streak - Piros gradient
      - 🏠 Home Dominance - Kék
      - ⚽ High Scoring - Zöld
      - 🛡️ Defensive Solid - Szürke
      - 📈 Form Surge - Narancs
    - Tooltip: részletes pattern adatok
    - Strength indikátor (pl. 3 flame icon ha strength > 80)

#### Detection algoritmusok (4 db)
27. **`detectStreak()`** - Win/loss streak detekció
    - Paraméterek: team_id, min_streak_length (default: 3)
    - Logika: Consecutive wins/losses in last N matches
    - Confidence kalkuláció: `baseConfidence * (streak_length / min_streak_length)`

28. **`detectHomeDominance()`** - Home advantage pattern
    - Paraméterek: team_id, min_home_win_rate (default: 70%)
    - Logika: Home win rate + avg goals scored/conceded home
    - Strength: Based on sample size és win rate

29. **`detectHighScoring()`** - Gólos trend detekció
    - Paraméterek: team_id, min_avg_goals (default: 3)
    - Logika: Avg goals per match in last 5-10 matches
    - Metadata: goals_for, goals_against, both_teams_score_rate

30. **`detectFormSurge()`** - Form index hirtelen növekedés
    - Paraméterek: team_id, surge_threshold (default: 30%)
    - Logika: Form index last 3 matches vs. previous 3 matches
    - Pattern aktív marad amíg form nem esik vissza

**Becsült időigény:** 2 hét  
**Technikai kihívások:** Algoritmus finomhangolás, false positive csökkentés, performance optimalizálás

---

### 🏆 Phase 6: Champion/Challenger Framework

**Cél:** A/B testing modelleknek, verziókezelés, automatikus promóció

#### Database komponensek (3 db)
31. **`model_registry` tábla**
    - Mezők: `id`, `model_name`, `model_version`, `model_type` (champion/challenger/retired), `algorithm`, `hyperparameters` (JSONB), `traffic_allocation` (%), `total_predictions`, `accuracy`, `registered_at`
    - Egy időben max 1 champion, 1-3 challenger lehet aktív

32. **`model_experiments` tábla**
    - Mezők: `id`, `experiment_name`, `champion_model_id`, `challenger_model_id`, `started_at`, `target_sample_size`, `current_sample_size`, `significance_threshold` (default: 0.05), `accuracy_diff`, `p_value`, `winner_model_id`, `decision` (promote/keep/continue), `completed_at`
    - Kísérlet lifecycle kezelés

33. **`predictions` tábla további kiterjesztése**
    - Új mezők: `model_id`, `model_name`, `model_version`, `is_shadow_mode` (boolean)
    - Shadow mode: Predikció fut de nem jelenik meg felhasználónak

#### API Endpoints (6 db)
34. **`POST /api/models/register`** - Új modell regisztrálása
35. **`GET /api/models/select`** - Model selection (Epsilon-Greedy strategy)
    - 90% champion, 10% challenger (exploration rate konfigurálható)
36. **`POST /api/models/shadow-run`** - Shadow mode futtatás
    - Mindkét modell futtatása, csak champion eredményét mutatja
37. **`POST /api/models/promote`** - Challenger promóció championné
    - Previous champion → retired
    - Register new challenger
38. **`POST /api/experiments/create`** - Új kísérlet indítása
39. **`POST /api/experiments/evaluate`** - Kísérlet értékelés
    - Chi-Square test végrehajtása
    - P-value < threshold → statistical significance
    - Decision: promote/keep champion/continue experiment

#### Frontend komponensek (2 db)
40. **`/app/models` oldal** - Model management dashboard
    - Active models táblázat (champion + challengers)
    - Comparison charts (accuracy, confidence, speed)
    - Traffic allocation pie chart
    - Running experiments táblázat
    - Promote button (manual override)

41. **`ModelCard` komponens**
    - Model neve, verziója
    - Algorithm description
    - Accuracy metrics
    - Prediction count
    - Traffic allocation %
    - Champion/Challenger badge
    - "View Details" gomb → model history

**Becsült időigény:** 2-3 hét  
**Technikai kihívások:** Traffic splitting implementáció, statisztikai tesztek, rollback mechanism, concurrency issues

---

### 🌍 Phase 7: Cross-League Intelligence

**Cél:** Liga-közi korrelációk, meta-patternök, league normalizáció

#### Database komponensek (3 db)
42. **`cross_league_correlations` tábla**
    - Mezők: `id`, `league_a_id`, `league_b_id`, `correlation_type` (form_impact, home_advantage, scoring_trend), `coefficient` (Pearson -1 to 1), `p_value`, `sample_size`, `insight_summary` (TEXT), `last_calculated`
    - Példa insight: "Premier League és Bundesliga form impact korrelál (r=0.73)"

43. **`meta_patterns` tábla**
    - Mezők: `id`, `pattern_name`, `pattern_type`, `supporting_leagues` (array), `evidence_strength` (0-100), `prediction_impact`, `pattern_description`, `discovered_at`
    - Példa meta-pattern: "Top 5 ligában form surge +15% win rate increase"

44. **`league_characteristics` tábla**
    - Mezők: `id`, `league_id`, `avg_goals`, `home_advantage_index`, `competitive_balance_index`, `predictability_score`, `physicality_index`, `trend_data` (JSONB), `season`
    - Normalizált metrikák liga összehasonlításhoz

#### API Endpoints (4 db)
45. **`GET /api/cross-league/correlations?league_a={id}&league_b={id}`**
46. **`POST /api/cross-league/analyze`** - Liga összehasonlító analízis
    - Body: `{ league_ids: [], metrics: ['goals', 'home_adv', 'balance'] }`
    - Response: Rankings, insights, correlations
47. **`POST /api/meta-patterns/discover`** - Meta-pattern discovery futtatás
    - Paraméterek: `min_leagues` (default: 3), `min_evidence` (default: 60)
48. **`POST /api/meta-patterns/apply`** - Meta-pattern alkalmazása match prediction-re
    - Body: `{ pattern_id, match_id }`
    - Response: Adjusted predictions

#### Frontend komponensek (3 db)
49. **`/app/cross-league` oldal** - Cross-league dashboard
    - League comparison matrix
    - Radar chart (multiple leagues)
    - Meta-patterns list
    - Correlation heatmap
    - Insights section

50. **`LeagueComparisonRadarChart` komponens**
    - Metrics: Scoring, Home Advantage, Predictability, Balance, Physicality
    - Multiple leagues overlaid
    - Interactive tooltips

51. **`CorrelationHeatmap` komponens**
    - X-axis: League A, Y-axis: League B
    - Color scale: -1 (red) → 0 (white) → 1 (green)
    - Hover: coefficient, p-value, sample size

#### Algorithms (2 db)
52. **`analyzeCrossLeagueCorrelation()`** - Pearson correlation számítás
    - Input: Two leagues, metric type
    - Process: Időbeli trend extraction, correlation calculation
    - Output: Coefficient, p-value, insight generation

53. **`discoverMetaPatterns()`** - Meta-pattern discovery
    - Input: All leagues
    - Process: Pattern frequency analysis, consistency check
    - Output: Meta-patterns list with evidence strength

**Becsült időigény:** 3 hét  
**Technikai kihívások:** N² complexity kezelés, normalizáció módszertan, insight generation logika

---

### 📊 Phase 8: Monitoring & Visualization

**Cél:** Rendszer health monitoring, performance tracking, computation graph vizualizáció

#### Database komponensek (3 db)
54. **`system_health` tábla**
    - Mezők: `id`, `component_name`, `component_type` (api, edge_function, database, frontend), `status` (healthy, degraded, down), `response_time_ms`, `error_rate`, `cpu_usage`, `memory_usage`, `checked_at`
    - Minden komponens állapotának snapshot-ja

55. **`performance_metrics` tábla**
    - Mezők: `id`, `metric_name`, `metric_type` (latency, throughput, error_rate, accuracy), `metric_category` (prediction, pattern_detection, api_call), `value`, `unit`, `component`, `timestamp`
    - Time-series metrikák tárolása

56. **`computation_graph` tábla**
    - Mezők: `id`, `node_id`, `node_name`, `node_type` (input, transformation, aggregation, output), `dependencies` (array), `execution_time_ms`, `position_x`, `position_y`, `status`, `last_run`
    - React Flow számára szükséges node-ok és edge-ek

#### API Endpoints (4 db)
57. **`GET /api/monitoring/health`** - System health összefoglaló
58. **`GET /api/monitoring/metrics?component={name}&start={date}&end={date}`**
59. **`GET /api/monitoring/computation-graph`** - Computation graph lekérés
60. **`GET /api/monitoring/alerts?severity={level}`** - Alerts lekérés
    - Severity: critical, warning, info

#### Frontend komponensek (4 db)
61. **`/app/monitoring` oldal** - Monitoring dashboard
    - System health cards
    - Performance metrics charts (time-series)
    - Computation map (React Flow)
    - Alerts feed (real-time WebSocket-tel opcionálisan)

62. **`ComputationMapDashboard` komponens** - React Flow
    - Node types: Data Source, Pattern Detection, Prediction Engine, Feedback Loop, API Response
    - Node colors: Green (healthy), Yellow (degraded), Red (error)
    - Hover: Node details (execution time, error rate)
    - Click: Drill-down node history

63. **`SystemHealthCard` komponens** - Összefoglaló kártya
    - Component name
    - Status badge
    - Response time avg/p95/p99
    - Error rate
    - Uptime %

64. **`PerformanceMetricsChart` komponens** - Recharts line chart
    - Multiple series: p50, p95, p99 latency
    - Time window selector (1h, 24h, 7d, 30d)
    - Zoom és pan támogatás

**Becsült időigény:** 2 hét  
**Technikai kihívások:** Real-time data streaming, React Flow layout optimization, metrics aggregáció

---

### 🚀 Phase 9: Advanced Features

**Cél:** Haladó funkciók (collaborative intelligence, market integration, temporal decay, self-improvement)

#### 9.1 Collaborative Intelligence

65. **`user_predictions` tábla**
    - Mezők: `id`, `user_id`, `match_id`, `predicted_winner`, `predicted_home_goals`, `predicted_away_goals`, `confidence`, `created_at`, `actual_winner`, `was_correct`
    - User predikciók tárolása (crowd wisdom)

66. **`crowd_wisdom` tábla**
    - Mezők: `id`, `match_id`, `user_home_win_pct`, `user_draw_pct`, `user_away_win_pct`, `model_home_win_pct`, `model_draw_pct`, `model_away_win_pct`, `divergence_score` (0-100), `crowd_size`
    - Aggregált crowd predictions vs. model

67. **`POST /api/predictions/user`** - User prediction mentése
68. **`GET /api/predictions/crowd/{matchId}`** - Crowd wisdom lekérés
69. **`UserPredictionForm` komponens** - Form user predictions-hez
70. **`CrowdWisdomDisplay` komponens** - "85% of users predict home win" + divergencia indikátor

#### 9.2 Market Integration

71. **`market_odds` tábla**
    - Mezők: `id`, `match_id`, `bookmaker`, `odds_home`, `odds_draw`, `odds_away`, `odds_over_2_5`, `odds_btts`, `implied_prob_home`, `implied_prob_draw`, `implied_prob_away`, `fetched_at`
    - External API-ból (pl. Odds API) importált adatok

72. **`value_bets` tábla**
    - Mezők: `id`, `match_id`, `bet_type`, `model_probability`, `market_probability`, `expected_value`, `kelly_criterion`, `value_rating` (0-100)
    - Value bet detekció: EV = (model_prob * odds) - 1

73. **`GET /api/market/odds/{matchId}`** - Odds fetch external API-ból
74. **`GET /api/market/value-bets?min_rating={rating}`**
75. **`MarketOddsDisplay` komponens** - Bookmaker odds táblázat
76. **`ValueBetHighlights` komponens** - High-value bets kiemelése
    - Color-coded: Green (high value), Yellow (medium), Gray (low)
    - Kelly Criterion calculator

#### 9.3 Temporal Decay

77. **`information_freshness` tábla**
    - Mezők: `id`, `team_name`, `info_type` (form, h2h, stats), `last_updated_at`, `decay_rate`, `freshness_score` (0-1)
    - Exponential decay: freshness = e^(-decay_rate * days_elapsed)

78. **`calculateFreshness()`** function - Freshness score számítás
79. **`checkAndRefreshStaleData()`** scheduled job - Automatikus adatfrissítés ha freshness < threshold

#### 9.4 Self-Improving System

80. **`feature_experiments` tábla**
    - Mezők: `id`, `feature_name`, `feature_logic` (JSONB), `baseline_accuracy`, `with_feature_accuracy`, `accuracy_improvement`, `p_value`, `status` (testing, approved, rejected)
    - Auto-generated feature engineering experiments

81. **`generateNewFeatures()`** function
    - Polynomial features (x², x³)
    - Interaction features (form * h2h_dominance)
    - Ratio features (goals_for / goals_against)
    - Rolling averages (3-game, 5-game)

82. **`testFeature()`** function - A/B test új feature-re
    - Auto-approve ha: improvement > 2% AND p-value < 0.05

83. **`continuousLearning()` scheduled job** - Pipeline:
    1. Generate new features
    2. Test top 5 candidates
    3. Prune low-performing features
    4. Retrain model
    5. Deploy if champion wins

**Phase 9 becsült időigény:** 4 hét  
**Technikai kihívások:** External API integráció, feature engineering automation, model retraining pipeline

---

## 🎯 Javasolt fejlesztési stratégia

Az 1.txt alapján **kritikus kérdés:** Melyik stratégiát válasszuk?

### Stratégia A: MVP+ (Konzervatív, ajánlott)

```
✅ Phase 0-2 (Jelenlegi állapot) - KÉSZ
✅ Phase 3 (Scheduled Jobs) - 1 hét
✅ Phase 4 (Feedback Loop & Evaluation) - 1.5 hét
🛑 STOP → Tesztelés, user feedback, publish

Összesen: ~2.5 hét fejlesztés
```

**Miért ez a legjobb választás:**
1. **Azonnali érték:** Scheduled jobs = automatizálás, nincs manuális trigger
2. **Mérhető eredmények:** Feedback loop = accuracy tracking, bizonyítható teljesítmény
3. **Realisztikus ütemterv:** 2.5 hét, kiégési kockázat minimális
4. **Pivot lehetőség:** Ha nem működik jól, könnyű változtatni kis kódbázison
5. **Portfolio-ready:** Működő, demonstrálható projekt

**Elérhetó funkciók MVP+ után:**
- ✅ Automatikus mérkőzés feldolgozás (cron job)
- ✅ Hosszú távú model performance tracking
- ✅ Pattern accuracy evolution
- ✅ Analytics dashboard alapmetrikákkal
- ✅ Feedback-driven model improvement

**Belépési pont Phase 5-höz később:**
Ha a feedback pozitív és van user traction, akkor Phase 5-6 hozzáadása (további 4-5 hét).

---

### Stratégia B: Ambiciózus (Phase 0-7)

```
✅ Phase 0-2 - KÉSZ
✅ Phase 3 - 1 hét
✅ Phase 4 - 1.5 hét
✅ Phase 5 - 2 hét
✅ Phase 6 - 2.5 hét
✅ Phase 7 - 3 hét
🛑 STOP → Publish

Összesen: ~10 hét fejlesztés
```

**Miért ez kockázatos:**
1. **Komplexitás növekedés:** 5x komponens szám növekedés
2. **Kiégési kockázat:** 60% valószínűség Phase 6-7 alatt
3. **Rejtett költségek:** +6 hónap tesztelés, bug fixing, dokumentáció
4. **Feature creep spirál:** Refactoring szükséges Phase 6-ban

**Csak akkor válaszd ezt, ha:**
- Van dedikált csapatod (2-3 developer)
- Van user traction a Phase 4 után
- Hosszú távú elkötelezettség (9-12 hónap)

---

### Stratégia C: Teljes roadmap (Phase 0-9)

```
✅ Phase 0-9 összes komponens implementálása
Összesen: 83 komponens, ~14.5 hét (papíron)

Realisztikus idő: 38.5 hét (~9 hónap)
Befejezési valószínűség: <25%
```

**Miért NEM ajánlott:**
- **Statisztikailag irreális:** Hobby projekteknek <10% az esélye Phase 0-9 befejezésére
- **Rejtett technikai adósság:** +960 óra testing/docs/refactoring nem benne a tervben
- **Mentális kiégés:** Phase 7 után exponenciálisan nő a kiégési kockázat
- **Túl komplex:** 83 komponens = 83 bug forrás, 83 maintenance pont

**Citát az 1.txt-ből:**
> "A legjobb projekt az, amelyik elkészül."  
> Phase 0-4 = Elkészül, működik, használható, portfolio-ready  
> Phase 0-9 = Lehet, hogy sosem készül el

---

## 📊 Prioritási mátrix és ütemterv

### Prioritási mátrix

| Phase | Üzleti érték | Technikai komplexitás | Függőségek | Ajánlott prioritás |
|-------|--------------|----------------------|-----------|-------------------|
| **Phase 3** | ⭐⭐⭐⭐⭐ | ⭐⭐ | Phase 0-2 | 🔴 **KRITIKUS** |
| **Phase 4** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | Phase 3 | 🔴 **KRITIKUS** |
| **Phase 5** | ⭐⭐⭐⭐ | ⭐⭐⭐ | Phase 3-4 | 🟠 **FONTOS** |
| **Phase 6** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Phase 4-5 | 🟡 **HASZNOS** |
| **Phase 7** | ⭐⭐ | ⭐⭐⭐⭐⭐ | Phase 5-6 | 🟢 **NICE-TO-HAVE** |
| **Phase 8** | ⭐⭐⭐⭐ | ⭐⭐⭐ | Phase 3-7 | 🟡 **HASZNOS** |
| **Phase 9** | ⭐⭐ | ⭐⭐⭐⭐ | Phase 3-8 | 🟢 **NICE-TO-HAVE** |

### MVP+ ütemterv (Ajánlott)

| Hét | Fázis | Fő feladatok | Várható kimenet |
|-----|-------|--------------|----------------|
| **1** | Phase 3 | Scheduled jobs infra, API endpoints, UI panel | Automatikus job futtatás |
| **2-3** | Phase 4 | Model performance tracking, comparison API, analytics UI | Performance dashboard |
| **4** | Tesztelés | Unit tests, integration tests, bug fixing | Stabil release |
| **5** | Deploy & Polish | Production deploy, dokumentáció, user onboarding | Publikus launch |

**Mérföldkövek:**
- ✅ **Hét 1 vége:** Manuálisan trigger-elhető scheduled job működik
- ✅ **Hét 3 vége:** Analytics dashboard live adatokkal
- ✅ **Hét 5 vége:** Production-ready MVP+

---

### Teljes roadmap ütemterv (Opcionális, csak referenciának)

| Fázis | Időtartam (hét) | Kumulatív (hét) | Kockázati szint |
|-------|-----------------|----------------|-----------------|
| Phase 0-2 | - | 0 | ✅ KÉSZ |
| Phase 3 | 1 | 1 | 🟢 Alacsony |
| Phase 4 | 1.5 | 2.5 | 🟢 Alacsony |
| 🛑 **MVP+ STOP** | - | 2.5 | **⬅️ AJÁNLOTT STOP PONT** |
| Phase 5 | 2 | 4.5 | 🟡 Közepes |
| Phase 6 | 2.5 | 7 | 🟠 Magas |
| Phase 7 | 3 | 10 | 🔴 Nagyon magas |
| Phase 8 | 2 | 12 | 🟠 Magas |
| Phase 9 | 4 | 16 | 🔴 Nagyon magas |
| Testing & Polish | 8-16 | 24-32 | - |
| **Teljes projekt** | **24-32 hét** | **6-8 hónap** | 🔴 **Befejezési valószínűség: 25%** |

---

## 🛡️ Komplexitás-kezelési elvek

Az 1.txt alapján a WinMix platform **legnagyobb kihívása a komplexitás spirál**. A következő elvek ezt kezelik:

### 1. Complexity Budget

**Elv:** Minden modul rendelkezzen komplexitás korláttal.

**Implementáció:**
```typescript
// src/lib/complexity-budget.ts
export const COMPLEXITY_BUDGETS = {
  maxExecutionTimeMs: 5000, // Max 5 sec per computation
  maxDependencyDepth: 4, // Max 4 szintű függőség
  maxLogicalBranches: 15, // Max 15 if/else egy funkcióban
  maxCyclomaticComplexity: 10 // McCabe complexity
};

export function checkComplexityBudget(
  module: string,
  metrics: ComplexityMetrics
): { passed: boolean; violations: string[] } {
  // Validation logic
}
```

**Használat:**
- CI/CD pipeline-ban complexity check
- Ha túllépés → warning vagy build fail
- Refactoring trigger, ha budget 80%-on

---

### 2. Safe Mode / Stop Switch

**Elv:** Ha a rendszer instabil, visszavált basic mode-ra.

**Implementáció:**
```typescript
// src/lib/safe-mode.ts
export class SafeMode {
  private errorCount = 0;
  private maxErrors = 10; // 10 error után safe mode
  
  checkSystemHealth(): boolean {
    const errorRate = this.getErrorRate();
    const avgResponseTime = this.getAvgResponseTime();
    
    if (errorRate > 0.05 || avgResponseTime > 10000) {
      this.activateSafeMode();
      return false;
    }
    return true;
  }
  
  activateSafeMode() {
    // Disable advanced patterns
    disableFeature('cross_league_analysis');
    disableFeature('meta_patterns');
    // Keep only basic pattern detection
    console.warn('🔧 Safe Mode activated - using basic predictions only');
  }
}
```

**Trigger pontok:**
- Error rate > 5%
- Response time > 10 sec
- Database connection loss
- External API timeout

---

### 3. Computation Map (Visualization)

**Elv:** Minden számítás lépés nyomon követhető visual map-en.

**Implementáció (Phase 8):**
```typescript
// Computation nodes definition
const computationNodes = [
  { id: 'input', type: 'input', label: 'Match Data' },
  { id: 'form_calc', type: 'transform', label: 'Form Score' },
  { id: 'pattern_detect', type: 'transform', label: 'Pattern Detection' },
  { id: 'confidence_calc', type: 'aggregate', label: 'Confidence Score' },
  { id: 'prediction_output', type: 'output', label: 'Prediction Result' }
];

const edges = [
  { source: 'input', target: 'form_calc' },
  { source: 'form_calc', target: 'pattern_detect' },
  { source: 'pattern_detect', target: 'confidence_calc' },
  { source: 'confidence_calc', target: 'prediction_output' }
];

// React Flow rendering + status colors
```

**Előnyök:**
- Debugging: látható hol lassul a pipeline
- Monitoring: node-onként error rate
- Transparency: fejlesztő és user is érti a flow-t

---

### 4. Feature Flags + A/B Testing

**Elv:** Minden új logika feature flag mögött legyen.

**Implementáció:**
```typescript
// src/lib/feature-flags.ts
export const featureFlags = {
  enableCrossLeagueBoost: false,
  enableMetaPatterns: false,
  enableTemporalDecay: false,
  enableChampionChallenger: false,
  enableCrowdWisdom: false
};

// Usage in prediction logic
if (featureFlags.enableCrossLeagueBoost) {
  confidence += applyCrossLeagueAdjustment(match);
}
```

**Kezelés:**
- Admin UI: feature flag toggles
- A/B test automatizálás (Phase 6)
- Rollback: 1 toggle flip, instant disable

---

### 5. Monthly Complexity Review

**Elv:** Havi rutinszerű refactoring review.

**Review checklist:**
- [ ] Mely patternök használatosak < 5%-ban? → Disable vagy delete
- [ ] Mely API endpoint-ok latency > 2 sec? → Optimize vagy cache
- [ ] Mely frontend komponensek > 300 sor? → Split vagy simplify
- [ ] Mely adatbázis query-k > 1 sec? → Index vagy rewrite
- [ ] Mely feature flag-ek active > 3 hónapja? → Commit vagy remove flag

**Időzítés:** Minden hónap utolsó pénteke, 2 óra dedikált idő

---

### 6. Modularizálás és Dependency Injection

**Elv:** Loose coupling, easy testing, replaceable components.

**Példa:**
```typescript
// src/lib/prediction-engine/interfaces.ts
export interface IPatternDetector {
  detect(match: Match): Promise<Pattern[]>;
}

export interface IConfidenceCalculator {
  calculate(patterns: Pattern[]): number;
}

// src/lib/prediction-engine/prediction-service.ts
export class PredictionService {
  constructor(
    private patternDetector: IPatternDetector,
    private confidenceCalculator: IConfidenceCalculator
  ) {}
  
  async predict(match: Match): Promise<Prediction> {
    const patterns = await this.patternDetector.detect(match);
    const confidence = this.confidenceCalculator.calculate(patterns);
    return { outcome: this.determineOutcome(patterns), confidence };
  }
}

// Easy to swap implementations
const basicDetector = new BasicPatternDetector();
const advancedDetector = new AdvancedPatternDetector();
const service = new PredictionService(advancedDetector, new StandardCalculator());
```

---

## 🔧 Technikai követelmények és függőségek

### Backend követelmények

#### Supabase
**Jelenlegi:** PostgreSQL 15, Row Level Security enabled  
**Phase 3-9 igények:**
- **Új táblák:** +15 tábla (total: 31 tábla)
- **Stored procedures:** ~10 plpgsql function (pattern detection, accuracy update, etc.)
- **Indexek:** ~25 új index (performance optimization)
- **Storage:** ~5 GB (1 év predikciók + patterns + logs esetén)

#### Edge Functions
**Jelenlegi:** 3 Edge Function (Deno runtime)  
**Phase 3-9 igények:**
- **Új Edge Functions:** +10 function (jobs, models, patterns, cross-league, monitoring)
- **External API integráció:** Odds API (Phase 9.2), WebSocket (Phase 8 opcionálisan)
- **Compute:** ~1000 invocations/day MVP+ esetén, ~10,000/day ha Phase 9

#### Scheduled Jobs (Phase 3)
**Megoldás:** Vercel Cron vagy Supabase pg_cron  
**Konfiguráció:**
```toml
# vercel.json
{
  "crons": [
    {
      "path": "/api/jobs/scheduler",
      "schedule": "*/5 * * * *"
    }
  ]
}
```
**Alternatíva:** Supabase pg_cron extension (ingyenes, postgres-native)

---

### Frontend követelmények

#### Új dependencies (Phase 3-9)

| Package | Verzió | Használat | Phase |
|---------|--------|-----------|-------|
| `react-flow-renderer` | ^11.0 | Computation map (Phase 8) | 8 |
| `d3` | ^7.0 | Heatmap, radar chart (Phase 7) | 7 |
| `zustand` | ^4.0 | Global state (feature flags, safe mode) | 3-9 |
| `swr` vagy `react-query` devtools | - | Performance monitoring | 4-8 |
| `@tanstack/react-table` | ^8.0 | Advanced tables (model comparison, logs) | 4-6 |
| `date-fns-tz` | ^2.0 | Timezone handling (scheduled jobs) | 3 |

#### Performance optimalizálás
- **Code splitting:** React.lazy minden route-ra
- **Memoization:** React.memo heavy computation komponensekre
- **Virtual scrolling:** Hosszú listák (jobs logs, predictions history)
- **Debounce/Throttle:** User input kezelés (search, filters)

---

### API Rate Limits és Quota

| Service | Free Tier | Upgrade Threshold |
|---------|-----------|------------------|
| Supabase | 500 MB DB, 2 GB bandwidth | > 10,000 users/month |
| Vercel Cron | 1 scheduled job (Hobby tier) | Phase 3 után (Pro: $20/month) |
| Odds API (Phase 9) | 500 requests/month | $49/month (10,000 req) |

**Cost forecast MVP+:** $0-20/month  
**Cost forecast Phase 0-9:** $50-150/month

---

### Development Environment

**Minimum requirements:**
- Node.js 18+
- npm/yarn/bun
- Supabase CLI (`supabase start` local development)
- Deno 1.3+ (Edge Functions development)

**Recommended IDE setup:**
- VSCode + ESLint + Prettier
- Extensions: Tailwind CSS IntelliSense, PostgreSQL, Deno
- `.vscode/settings.json` konfiguráció a repo-ban

**Testing framework (Phase 4+):**
- Unit tests: Vitest
- Integration tests: Playwright
- API tests: Supertest vagy Postman/Newman

---

## 📝 Implementációs útmutatók

### Phase 3 implementációs lépések (Scheduled Jobs)

#### 1. hét feladatok

**Nap 1-2: Database setup**
```sql
-- supabase/migrations/20241103_phase_3_scheduled_jobs.sql

CREATE TABLE public.scheduled_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_name TEXT NOT NULL UNIQUE,
  job_type TEXT NOT NULL,
  cron_schedule TEXT NOT NULL,
  enabled BOOLEAN DEFAULT true,
  last_run_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.job_execution_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES public.scheduled_jobs(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  status TEXT NOT NULL, -- running, success, error
  duration_ms INTEGER,
  records_processed INTEGER DEFAULT 0,
  error_message TEXT,
  error_stack TEXT
);

CREATE INDEX idx_job_execution_logs_job_id ON public.job_execution_logs(job_id);
CREATE INDEX idx_job_execution_logs_started_at ON public.job_execution_logs(started_at DESC);

-- Seed jobs
INSERT INTO public.scheduled_jobs (job_name, job_type, cron_schedule, enabled) VALUES
('fetch_upcoming_fixtures', 'data_import', '0 2 * * *', true), -- Daily 2 AM
('run_daily_predictions', 'prediction', '0 3 * * *', true), -- Daily 3 AM
('update_team_stats', 'aggregation', '0 4 * * *', true), -- Daily 4 AM
('cleanup_old_logs', 'maintenance', '0 1 * * 0', true); -- Weekly Sunday 1 AM
```

**Nap 3-4: API endpoints**
```typescript
// supabase/functions/jobs-list/index.ts
serve(async (req) => {
  const supabase = createClient(/*...*/);
  
  const { data: jobs, error } = await supabase
    .from('scheduled_jobs')
    .select(`
      *,
      last_execution:job_execution_logs(
        status, started_at, duration_ms
      )
    `)
    .order('created_at', { ascending: true });
  
  if (error) return Response.json({ error }, { status: 500 });
  
  return Response.json({ jobs });
});

// supabase/functions/jobs-trigger/index.ts
serve(async (req) => {
  const { job_id, force } = await req.json();
  
  // Validation + job execution logic
  const job = await getJob(job_id);
  await executeJob(job, force);
  
  return Response.json({ status: 'triggered' });
});

// Additional endpoints: jobs-logs, jobs-toggle, jobs-scheduler
```

**Nap 5: Frontend UI**
```tsx
// src/pages/ScheduledJobs.tsx
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export default function ScheduledJobsPage() {
  const { data: jobs } = useQuery({
    queryKey: ['scheduled-jobs'],
    queryFn: async () => {
      const { data } = await supabase.functions.invoke('jobs-list');
      return data.jobs;
    },
    refetchInterval: 30000 // Refresh every 30 sec
  });
  
  const toggleJob = useMutation({
    mutationFn: async ({ jobId, enabled }) => {
      await supabase.functions.invoke('jobs-toggle', {
        body: { job_id: jobId, enabled }
      });
    }
  });
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Scheduled Jobs</h1>
      <div className="grid gap-4">
        {jobs?.map(job => (
          <JobStatusCard 
            key={job.id} 
            job={job} 
            onToggle={(enabled) => toggleJob.mutate({ jobId: job.id, enabled })}
          />
        ))}
      </div>
    </div>
  );
}

// src/components/JobStatusCard.tsx
export function JobStatusCard({ job, onToggle }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{job.job_name}</CardTitle>
          <Switch checked={job.enabled} onCheckedChange={onToggle} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Badge variant={job.last_execution?.status === 'success' ? 'success' : 'destructive'}>
            {job.last_execution?.status || 'Never run'}
          </Badge>
          <p className="text-sm text-muted-foreground">
            Schedule: {job.cron_schedule}
          </p>
          <p className="text-sm">
            Last run: {job.last_run_at ? formatDistanceToNow(job.last_run_at) : 'N/A'}
          </p>
          <Button size="sm" variant="outline">
            Run Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

**Nap 6-7: Vercel Cron setup + testing**
```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/scheduler",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

**Edge Function hívása Vercel Cron-ból:**
```typescript
// api/cron/scheduler.ts (Vercel Serverless Function)
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  
  // Fetch due jobs
  const { data: dueJobs } = await supabase
    .from('scheduled_jobs')
    .select('*')
    .eq('enabled', true)
    .lte('next_run_at', new Date().toISOString());
  
  // Trigger each job
  for (const job of dueJobs) {
    await supabase.functions.invoke('jobs-trigger', {
      body: { job_id: job.id }
    });
  }
  
  res.status(200).json({ triggered: dueJobs.length });
}
```

---

### Phase 4 implementációs lépések (Feedback Loop & Model Evaluation)

**Kulcsfontosságú kód részletek:**

#### Prediction tracking kiterjesztése
```typescript
// supabase/functions/predictions-track/index.ts
serve(async (req) => {
  const { match_id, predicted_outcome, confidence, patterns, css_score } = await req.json();
  
  // Save prediction with extended metadata
  const { data: prediction, error } = await supabase
    .from('predictions')
    .insert({
      match_id,
      predicted_outcome,
      confidence_score: confidence,
      css_score,
      prediction_factors: {
        patterns_detected: patterns.map(p => p.template_name),
        form_scores: patterns.find(p => p.type === 'form')?.data,
        h2h_data: patterns.find(p => p.type === 'h2h')?.data
      }
    })
    .select()
    .single();
  
  // Update model_performance aggregation
  await updateModelPerformanceMetrics(prediction);
  
  return Response.json({ prediction });
});
```

#### Model performance aggregation
```sql
-- supabase/migrations/20241110_phase_4_model_performance.sql

CREATE TABLE public.model_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_version TEXT NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_predictions INTEGER DEFAULT 0,
  accuracy_overall DECIMAL(5,2),
  accuracy_winner DECIMAL(5,2),
  accuracy_btts DECIMAL(5,2),
  confidence_calibration_score DECIMAL(5,2),
  league_breakdown JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_model_period UNIQUE (model_version, period_start, period_end)
);

-- Auto-aggregation function (triggerelve napi job-ból)
CREATE OR REPLACE FUNCTION public.aggregate_model_performance(
  p_model_version TEXT,
  p_period_start DATE,
  p_period_end DATE
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  v_total_predictions INTEGER;
  v_accuracy_overall DECIMAL(5,2);
BEGIN
  SELECT 
    COUNT(*) AS total,
    (SUM(CASE WHEN was_correct THEN 1 ELSE 0 END)::DECIMAL / COUNT(*)) * 100 AS accuracy
  INTO v_total_predictions, v_accuracy_overall
  FROM public.predictions
  WHERE evaluated_at BETWEEN p_period_start AND p_period_end
    AND was_correct IS NOT NULL;
  
  INSERT INTO public.model_performance (
    model_version, period_start, period_end, total_predictions, accuracy_overall
  ) VALUES (
    p_model_version, p_period_start, p_period_end, v_total_predictions, v_accuracy_overall
  )
  ON CONFLICT (model_version, period_start, period_end)
  DO UPDATE SET
    total_predictions = EXCLUDED.total_predictions,
    accuracy_overall = EXCLUDED.accuracy_overall;
END;
$$;
```

#### Analytics Dashboard komponens
```tsx
// src/pages/Analytics.tsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useQuery } from '@tanstack/react-query';

export default function AnalyticsPage() {
  const { data: performance } = useQuery({
    queryKey: ['model-performance'],
    queryFn: async () => {
      const { data } = await supabase
        .from('model_performance')
        .select('*')
        .order('period_start', { ascending: true })
        .limit(30);
      return data;
    }
  });
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Model Analytics</h1>
      
      {/* Overall Performance */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Performance Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <LineChart width={800} height={400} data={performance}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period_start" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="accuracy_overall" 
              stroke="#8884d8" 
              name="Overall Accuracy (%)"
            />
            <Line 
              type="monotone" 
              dataKey="accuracy_winner" 
              stroke="#82ca9d" 
              name="Winner Accuracy (%)"
            />
          </LineChart>
        </CardContent>
      </Card>
      
      {/* League Breakdown */}
      <LeaguePerformanceTable data={performance} />
      
      {/* Confidence Calibration */}
      <ConfidenceCalibrationChart data={performance} />
    </div>
  );
}
```

---

### Phase 5+ implementációs minták

**Advanced Pattern Detection példa:**
```typescript
// src/lib/patterns/detectFormSurge.ts
export async function detectFormSurge(
  teamId: string,
  surgeThreshold: number = 0.30
): Promise<Pattern | null> {
  const recentMatches = await getRecentMatches(teamId, 6);
  
  const last3Matches = recentMatches.slice(0, 3);
  const previous3Matches = recentMatches.slice(3, 6);
  
  const formIndexLast3 = calculateFormIndex(last3Matches, teamId);
  const formIndexPrevious3 = calculateFormIndex(previous3Matches, teamId);
  
  const improvementRate = (formIndexLast3 - formIndexPrevious3) / formIndexPrevious3;
  
  if (improvementRate >= surgeThreshold) {
    return {
      template_name: 'form_surge',
      confidence_boost: Math.min(improvementRate * 20, 12), // Max +12%
      strength: Math.min(improvementRate * 100, 100),
      pattern_data: {
        form_index_current: formIndexLast3,
        form_index_previous: formIndexPrevious3,
        improvement_rate: improvementRate
      },
      valid_until: addWeeks(new Date(), 2) // 2 hét érvényesség
    };
  }
  
  return null;
}

function calculateFormIndex(matches: Match[], teamId: string): number {
  let index = 0;
  matches.forEach((match, i) => {
    const weight = 1 / (i + 1); // Recent matches higher weight
    const result = getMatchResult(match, teamId);
    if (result === 'win') index += 3 * weight;
    else if (result === 'draw') index += 1 * weight;
  });
  return index;
}
```

---

## 🎨 Best Practices és konvenciók

### Code Style

**TypeScript konvenciók:**
- Strict mode enabled (`"strict": true` in tsconfig.json)
- Explicit return types minden exported function-nél
- Interfaces over types (kivéve union types)
- PascalCase komponensek, camelCase functions/variables
- SCREAMING_SNAKE_CASE konstantok

**React konvenciók:**
- Functional components + hooks (no class components)
- Custom hooks prefix: `use` (pl. `useJobStatus`)
- Props destructuring a function signature-ben
- Children prop explicit típus: `React.ReactNode`
- Event handlers prefix: `handle` (pl. `handleToggleJob`)

**Tailwind CSS konvenciók:**
- Utility-first approach
- Custom colors definiálása `tailwind.config.ts`-ben
- Responsive prefixes: `sm:`, `md:`, `lg:`, `xl:`
- Dark mode support: `dark:` prefix (next-themes használatával)

### File Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui primitives
│   ├── dashboard/      # Dashboard-specific components
│   ├── jobs/           # Phase 3: Job management components
│   └── analytics/      # Phase 4: Analytics components
├── pages/              # Route pages
├── lib/                # Utility functions
│   ├── supabase.ts     # Supabase client
│   ├── patterns/       # Pattern detection algorithms
│   ├── models/         # Model management (Phase 6)
│   └── utils.ts        # General utilities
├── hooks/              # Custom React hooks
├── types/              # TypeScript type definitions
└── data/               # Static data, constants

supabase/
├── functions/          # Edge Functions
│   ├── analyze-match/
│   ├── jobs-*/         # Phase 3: Job endpoints
│   └── models-*/       # Phase 6: Model endpoints
└── migrations/         # Database migrations
```

### Naming Conventions

**Database:**
- Tables: `snake_case`, plural (pl. `scheduled_jobs`)
- Columns: `snake_case` (pl. `job_name`, `created_at`)
- Indexes: `idx_{table}_{column}` (pl. `idx_matches_date`)
- Functions: `snake_case`, verb prefix (pl. `calculate_form_score`)

**API Endpoints:**
- REST: `/api/{resource}/{action}` (pl. `/api/jobs/trigger`)
- HTTP methods: GET (read), POST (create/action), PATCH (update), DELETE (delete)

**Components:**
- Page components: `PascalCase` (pl. `Dashboard.tsx`)
- UI components: `PascalCase` (pl. `JobStatusCard.tsx`)
- Layout components: `PascalCase` (pl. `Sidebar.tsx`)

---

### Error Handling

**Backend (Edge Functions):**
```typescript
try {
  // Business logic
  const result = await processJob(job);
  return Response.json({ result }, { status: 200 });
} catch (error) {
  console.error('Error in job processing:', error);
  
  // Log to job_execution_logs
  await logJobError(job.id, error);
  
  // Return standardized error
  return Response.json(
    { 
      error: 'Job processing failed', 
      details: error instanceof Error ? error.message : 'Unknown error',
      job_id: job.id
    },
    { status: 500 }
  );
}
```

**Frontend:**
```typescript
// Using React Query error handling
const { data, error, isLoading } = useQuery({
  queryKey: ['jobs'],
  queryFn: fetchJobs,
  retry: 3,
  retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  onError: (error) => {
    toast({
      title: 'Failed to fetch jobs',
      description: error instanceof Error ? error.message : 'Unknown error',
      variant: 'destructive'
    });
  }
});

if (error) {
  return <ErrorFallback error={error} retry={() => refetch()} />;
}
```

---

### Testing Strategy

**Unit tests (Vitest):**
```typescript
// src/lib/patterns/__tests__/detectFormSurge.test.ts
import { describe, it, expect } from 'vitest';
import { detectFormSurge } from '../detectFormSurge';
import { mockMatches } from '@/test-utils/fixtures';

describe('detectFormSurge', () => {
  it('should detect form surge when improvement > 30%', async () => {
    const pattern = await detectFormSurge('team-123', 0.30);
    
    expect(pattern).not.toBeNull();
    expect(pattern?.template_name).toBe('form_surge');
    expect(pattern?.confidence_boost).toBeGreaterThan(0);
  });
  
  it('should return null when no surge detected', async () => {
    const pattern = await detectFormSurge('team-stable', 0.30);
    expect(pattern).toBeNull();
  });
});
```

**Integration tests (Playwright):**
```typescript
// tests/e2e/scheduled-jobs.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Scheduled Jobs Page', () => {
  test('should display all jobs', async ({ page }) => {
    await page.goto('/scheduled-jobs');
    
    const jobCards = page.locator('[data-testid="job-card"]');
    await expect(jobCards).toHaveCount(4); // 4 seeded jobs
  });
  
  test('should toggle job enabled status', async ({ page }) => {
    await page.goto('/scheduled-jobs');
    
    const toggle = page.locator('[data-testid="job-toggle"]').first();
    await toggle.click();
    
    await expect(page.locator('.toast')).toContainText('Job updated');
  });
});
```

**Test coverage target:**
- MVP+ (Phase 3-4): 60% coverage (core logic, critical paths)
- Phase 5-7: 70% coverage
- Phase 8-9: 80% coverage (production-critical)

---

### Performance Optimization

**Database query optimization:**
```sql
-- Előtte: Slow query (N+1 problem)
SELECT * FROM predictions;
-- (majd külön query-k minden match-hez)

-- Utána: JOIN-nal optimalizálva
SELECT 
  p.*,
  m.home_team_id,
  m.away_team_id,
  ht.name AS home_team_name,
  at.name AS away_team_name
FROM predictions p
JOIN matches m ON p.match_id = m.id
JOIN teams ht ON m.home_team_id = ht.id
JOIN teams at ON m.away_team_id = at.id
WHERE p.evaluated_at IS NOT NULL
ORDER BY p.created_at DESC
LIMIT 50;
```

**React optimization:**
```typescript
// Memoize expensive computations
const formScore = useMemo(
  () => calculateFormScore(matches, teamId),
  [matches, teamId]
);

// Memoize components
const JobStatusCard = React.memo(({ job, onToggle }) => {
  // Component logic
});

// Debounce user input
const [searchTerm, setSearchTerm] = useState('');
const debouncedSearch = useDebounce(searchTerm, 500);

useEffect(() => {
  if (debouncedSearch) {
    fetchJobs(debouncedSearch);
  }
}, [debouncedSearch]);
```

**Bundle size optimization:**
```typescript
// Code splitting
const ScheduledJobsPage = React.lazy(() => import('./pages/ScheduledJobs'));
const AnalyticsPage = React.lazy(() => import('./pages/Analytics'));

// Routes
<Suspense fallback={<LoadingSpinner />}>
  <Route path="/scheduled-jobs" element={<ScheduledJobsPage />} />
  <Route path="/analytics" element={<AnalyticsPage />} />
</Suspense>
```

---

## ⚠️ Kockázatok és ajánlások

### Azonosított kockázatok

#### 1. Scope Creep (Legnagyobb kockázat)

**Leírás:** A projekt túlnő a kezdeti terven, folyamatosan új feature-ök adódnak hozzá.

**Valószínűség:** 🔴 MAGAS (80%)  
**Hatás:** 🔴 KRITIKUS (projekt feladás)

**Mitigation:**
- ✅ **MVP+ stop pont betartása** (Phase 4 után STOP)
- ✅ **Feature freeze periódusok** (tesztelés időszakában 0 új feature)
- ✅ **User feedback alapján döntés** (csak ha van user traction → Phase 5+)

---

#### 2. Technikai adósság felhalmozódás

**Leírás:** Gyors fejlesztés során "hacky" megoldások, tesztelés elmaradása.

**Valószínűség:** 🟠 KÖZEPES (60%)  
**Hatás:** 🟠 MAGAS (refactoring kényszer Phase 6-7-ben)

**Mitigation:**
- ✅ **Code review checklist** (minden PR előtt)
- ✅ **Test coverage monitoring** (minimum 60% target)
- ✅ **Monthly refactoring sprints** (1 nap/hónap dedikált cleanup)

---

#### 3. Performance degradáció (Phase 7+)

**Leírás:** Cross-league queries, meta-pattern discovery N² complexity → lassú response.

**Valószínűség:** 🟡 ALACSONY Phase 3-4, 🔴 MAGAS Phase 7+  
**Hatás:** 🟠 MAGAS (user experience romlás)

**Mitigation:**
- ✅ **Database indexek** minden foreign key-en
- ✅ **Query optimization** EXPLAIN ANALYZE használatával
- ✅ **Caching layer** Redis vagy Supabase Realtime cache
- ✅ **Pagination** minden list view-ban

---

#### 4. External API dependency (Phase 9)

**Leírás:** Odds API outage, rate limit, API változások.

**Valószínűség:** 🟠 KÖZEPES (50%)  
**Hatás:** 🟡 KÖZEPES (value bets feature leáll)

**Mitigation:**
- ✅ **Graceful degradation** (ha API nem elérhető, alapfunkciók működnek)
- ✅ **Retry logic** exponential backoff-fal
- ✅ **API response caching** (24 óra TTL)
- ✅ **Multiple providers** (fallback Odds API ha primary down)

---

#### 5. Kiégés (Developer burnout)

**Leírás:** Hosszú fejlesztési periódus, komplex problémák → mental exhaustion.

**Valószínűség:** 🔴 MAGAS Phase 6+ (70%)  
**Hatás:** 🔴 KRITIKUS (projekt feladás)

**Mitigation:**
- ✅ **2.5 hetes MVP+ stratégia** (gyors win, motivation boost)
- ✅ **Weekly breaks** (minden hét pénteke: 0 kódolás, csak tervezés/docs)
- ✅ **Celebrate milestones** (Phase befejezés után 1 hét break)
- ✅ **Pair programming** (ha van csapattárs, shared responsibility)

---

### Ajánlások prioritási sorrendben

#### 🥇 1. PRIORITÁS: Kövess MVP+ stratégiát

**Miért kritikus:**
- 95% valószínűséggel befejezhető
- 2.5 hét = kezelhető commitment
- Azonnal értéket teremt (automatizálás + tracking)

**Action items:**
- [ ] Commit MVP+ stratégiához (Phase 3-4 STOP)
- [ ] Kommunikáld stakeholdereknek (ha vannak)
- [ ] Phase 5+ backlog-ba, de NEM roadmap-re

---

#### 🥈 2. PRIORITÁS: Implementálj Complexity Budget-et

**Miért kritikus:**
- Megelőzi a complexity spirált
- Korai warning rendszer
- Tech debt limiter

**Action items:**
- [ ] `src/lib/complexity-budget.ts` létrehozása
- [ ] CI/CD pipeline-ba complexity check integrálása
- [ ] ESLint rule: max complexity 10 (már konfigurálva?)

---

#### 🥉 3. PRIORITÁS: Safe Mode implementálás

**Miért kritikus:**
- Production stability guarantee
- Felhasználói élmény védelem

**Action items:**
- [ ] `src/lib/safe-mode.ts` létrehozása
- [ ] Error rate monitoring implementálása
- [ ] Safe mode trigger logic (Phase 3 alatt)

---

#### 4. PRIORITÁS: Feature Flag rendszer (Phase 3)

**Action items:**
- [ ] `src/lib/feature-flags.ts` létrehozása
- [ ] Admin UI feature toggles-hez
- [ ] A/B testing infrastructure (Phase 6-hoz)

---

#### 5. PRIORITÁS: Monthly Complexity Review rutinja

**Action items:**
- [ ] Naptárba: Minden hónap utolsó pénteke
- [ ] Review checklist dokumentálása
- [ ] Refactoring branch workflow

---

### Long-term javaslatok (Phase 5+ esetén)

**Ha MVP+ sikeres és van user traction:**
1. **Hire/Partner:** Keress társfejlesztőt Phase 6+ előtt
2. **Funding:** Ha commercial potential → investor/grant keresés
3. **Open Source:** Community contributions (pattern algoritmusok, league data)
4. **API-first:** Public API Phase 7+ után (ecosystem building)

**Ha MVP+ sikerül de nincs traction:**
1. **Pivot:** Új use case keresése (pl. csak pattern detection service)
2. **Portfolio:** Pitch material készítése, case study írás
3. **Lessons learned:** Dokumentáld mi működött, mi nem

---

## 📚 Összefoglalás és következő lépések

### TL;DR

**Jelenlegi állapot:** Phase 0-2 kész, működő alapplatform pattern-based predictions-zel.

**Következő lépések:**
1. ✅ **Phase 3** (1 hét): Scheduled Jobs → Automatizálás
2. ✅ **Phase 4** (1.5 hét): Feedback Loop → Performance tracking
3. 🛑 **STOP** → Tesztelés, deploy, user feedback
4. ❓ **Döntési pont:** User traction alapján Phase 5+ vagy pivot

**Kulcs üzenet:** **"A legjobb projekt az, amelyik elkészül."**  
MVP+ = Elkészül, működik, értéket teremt.  
Phase 0-9 = Lehet, hogy sosem készül el.

---

### Következő lépések (Action Plan)

#### Immediate (Következő 24 óra)
- [ ] Review MVP+ strategy, döntés: commit vagy pivot?
- [ ] Phase 3 branch létrehozása: `git checkout -b feature/phase-3-scheduled-jobs`
- [ ] Database migration fájl létrehozása: `scheduled_jobs` és `job_execution_logs` táblák

#### Week 1 (Phase 3)
- [ ] Database setup + seed jobs
- [ ] 5 API endpoint implementálása (list, logs, trigger, toggle, scheduler)
- [ ] `ScheduledJobsPage` és `JobStatusCard` komponensek
- [ ] Vercel Cron konfiguráció
- [ ] Testing + bug fixing

#### Week 2-3 (Phase 4)
- [ ] `model_performance` tábla + aggregáció logika
- [ ] Extended prediction tracking (`css_score`, `prediction_factors`)
- [ ] Analytics dashboard UI
- [ ] Model performance charts (Recharts)
- [ ] Confidence calibration metrics
- [ ] Testing + integration tests

#### Week 4 (Polish & Deploy)
- [ ] End-to-end testing (Playwright)
- [ ] Performance audit (Lighthouse)
- [ ] Documentation update (README, API docs)
- [ ] Production deploy
- [ ] User onboarding flow (ha van)

#### Week 5+ (Post-MVP+)
- [ ] User feedback gyűjtés
- [ ] Analytics monitoring (usage metrics)
- [ ] Bug fixing
- [ ] **Döntési pont:** Phase 5 indítás vagy projekt lezárás

---

### Resources és támogató dokumentumok

**Projekt dokumentációk:**
- `README.md` - Általános projekt leírás
- `WinMix_TipsterHub_Phase_3-9_Components_EN.md` - Komponens lista Phase 3-9
- `1.txt` - Stratégiai elemzés és ajánlások
- `docs-fejlesztesi-lepesek-hu.md` (ez a dokumentum) - Fejlesztési útmutató

**External resources:**
- [Supabase Documentation](https://supabase.com/docs)
- [React Query Documentation](https://tanstack.com/query/latest)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs)
- [Recharts Documentation](https://recharts.org/)

**Recommended reading (complexity management):**
- "The Pragmatic Programmer" - Andy Hunt, Dave Thomas
- "Clean Code" - Robert C. Martin
- "Domain-Driven Design" - Eric Evans (Phase 6+ előtt ajánlott)

---

## 🎉 Záró gondolatok

A WinMix Tipster Hub egy ambiciózus projekt robusztus architektúrával és jól átgondolt roadmap-pel. Az igazi kihívás nem a technikai implementáció, hanem a **komplexitás és scope kezelése**.

**Kulcs sikerhez:**
1. ✅ **MVP+ stratégia követése** → 95% befejezési valószínűség
2. ✅ **Complexity budget betartása** → Fenntartható növekedés
3. ✅ **Feature flags használata** → Biztonságos kísérletezés
4. ✅ **Monthly refactoring** → Tech debt kontroll alatt
5. ✅ **User feedback alapú döntések** → Érték-orientált fejlesztés

**Emlékeztetőül az 1.txt bölcsessége:**
> "Simplicity through Structure" – Az egyszerűség nem kevesebb feature, hanem több rend.

**Következő lépés:** Döntsd el, melyik stratégiát követed, és indítsd el Phase 3-at. 🚀

---

**Dokumentum verzió:** 1.0  
**Utolsó frissítés:** 2024. november 2.  
**Következő review:** Phase 4 befejezése után vagy 2024. december 1.  
**Kapcsolat:** Feedback és kérdések esetén issue nyitás a repository-ban.
