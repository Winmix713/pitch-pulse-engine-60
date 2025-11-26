# WinMix TipsterHub – src/pages oldalak rövid bemutatása (HU)

Dátum: 2025-11-07
Ág: docs-describe-src-pages-hu

Ez a dokumentum a src/pages és src/pages/admin könyvtárban található oldalak funkcionális áttekintését adja, magyar nyelven. Minden elemnél feltüntetjük a fő célját, az elérési útvonalat (route), a hozzáférési szintet, és – ahol releváns – a fontosabb backend kapcsolódásokat.

Megjegyzés: több funkció fázis-flaghez kötött (Phase 5–9). Ezeket a Feature Flag oldal mutatja (VITE_FEATURE_PHASEx). A route-térképért lásd: src/components/AppRoutes.tsx.

---

## src/pages

- Auth (mappa)
  - Login.tsx
    - Cél: Bejelentkezés Supabase auth-on keresztül.
    - Route: /login
    - Hozzáférés: Publikusan elérhető (AuthGate requireAuth=false)
    - Megjegyzés: Sikeres login után /dashboard-ra navigál.
  - Signup.tsx
    - Cél: Regisztráció (email + jelszó), teljes név megadásával.
    - Route: /signup
    - Hozzáférés: Publikusan elérhető
    - Megjegyzés: Sikeres regisztráció után /login-ra irányít.

- admin (mappa)
  - Általános: Admin/analyst szerepkörhöz kötött aloldalak gyűjtője. Részletek lejjebb az „src/pages/admin” fejezetben.

- Analytics.tsx
  - Cél: Modell teljesítmény (accuracy), napi bontású trendek és kalibrációs hiba áttekintése.
  - Route: /analytics
  - Hozzáférés: Auth szükséges; Phase 8 flag bekapcsolása ajánlott
  - Backend: Supabase „predictions” tábla; időbeli aggregáció; CSS score elérhetőség kijelzése.

- CrossLeague.tsx
  - Cél: Liga-közi intelligencia – korrelációk, radar diagram, meta-patternök.
  - Route: /crossleague
  - Hozzáférés: Auth szükséges; Phase 7
  - Backend: Edge Functions – cross-league-analyze, cross-league-correlations, meta-patterns-discover.

- Dashboard.tsx
  - Cél: Összefoglaló irányítópult: legutóbbi predikciók, mintázat (pattern) teljesítmény, streak.
  - Route: /dashboard
  - Hozzáférés: Auth szükséges
  - Backend: Supabase „predictions”, „pattern_accuracy”, kapcsolt táblák (matches, teams, leagues).

- EnvVariables.tsx
  - Cél: Környezeti változók kezelése (lista, szűrés, CRUD, import/export .env).
  - Route: /admin/environment
  - Hozzáférés: Csak admin
  - Backend: Supabase „environment_variables” tábla; admin-import-env Edge Function.

- FeatureFlagsDemo.tsx
  - Cél: A fázis alapú feature flagek aktuális állapotának demonstrálása.
  - Route: /feature-flags
  - Hozzáférés: Publikusan elérhető
  - Megjegyzés: Mutatja a VITE_FEATURE_PHASE5–9 változók értékeit és használati példát.

- Index.tsx
  - Cél: Nyitóoldal (landing) – hero, CTA az új predikciók indításához.
  - Route: /
  - Hozzáférés: Publikusan elérhető

- Leagues.tsx
  - Cél: Bajnoki tabella (mock adatokkal) – liga választóval.
  - Route: /leagues
  - Hozzáférés: Publikusan elérhető

- MatchDetail.tsx
  - Cél: Egy mérkőzés részletes nézete: AI elemzés indítása, predikció és feedback.
  - Route: /match/:id
  - Hozzáférés: Publikusan elérhető (read-only), elemzés indítása Auth mellett javasolt
  - Backend: Edge Function analyze-match; Supabase „matches”, „predictions”.

- Matches.tsx
  - Cél: Közelgő mérkőzések egyszerű listája (mock), liga-váltóval.
  - Route: /matches
  - Hozzáférés: Publikusan elérhető

- MatchesPage.tsx
  - Cél: Mérkőzés-kezelő admin felület (lista, szűrés, létrehozás/szerkesztés/törlés, CSV import/export).
  - Route: /admin/matches
  - Hozzáférés: Admin, Analyst
  - Backend: Supabase „matches”, „leagues”, „teams”; admin-import-matches-csv Edge Function.

- Models.tsx
  - Cél: Model management (alap) – regisztráció, challenger promóció, kísérlet indítás/értékelés.
  - Route: /models
  - Hozzáférés: Auth szükséges; jellemzően Phase 6
  - Backend: Supabase „model_experiments”; models/service integráció (epsilon-greedy kiválasztás).

- ModelsPage.tsx
  - Cél: Bővített admin/analyst model-kezelő: szűrés, szerkesztés, aktiválás/inaktiválás, törlés, statisztikák.
  - Route: /admin/models
  - Hozzáférés: Admin, Analyst
  - Backend: Supabase „model_experiments”; models/service (register/update/delete/promote).

- Monitoring.tsx
  - Cél: Rendszer-monitorozás áttekintő: komponens-egészség, teljesítmény metrikák, computation graph, riasztások.
  - Route: /monitoring
  - Hozzáférés: Auth szükséges; Phase 8
  - Backend: Edge Functions – monitoring-health, monitoring-metrics, monitoring-computation-graph, monitoring-alerts.

- MonitoringPage.tsx
  - Cél: Admin/analyst fókuszú, kibővített monitoring – több dashboard szekció és gyorslinkek.
  - Route: /admin/monitoring
  - Hozzáférés: Admin, Analyst; Phase 8
  - Backend: U.a. monitoring Edge Functions mint fent.

- NewPredictions.tsx
  - Cél: 8 mérkőzés kiválasztása és új predikciók indítása.
  - Route: /predictions/new
  - Hozzáférés: Auth szükséges

- NotFound.tsx
  - Cél: 404 – nem létező útvonal.
  - Route: * (catch-all)
  - Hozzáférés: Publikusan elérhető; hibát logol a konzolba.

- Phase9.tsx
  - Cél: Phase 9 „Advanced Features” fő komponens megjelenítése (Phase9Dashboard).
  - Route: /phase9
  - Hozzáférés: Auth + Phase 9 flag

- PredictionsView.tsx
  - Cél: Legutóbbi predikciók listanézete, frissítés és „Új predikciók” CTA.
  - Route: /predictions
  - Hozzáférés: Publikusan elérhető (read-only)
  - Backend: Supabase „predictions” kapcsolt lekéréssel (matches, teams, leagues).

- ScheduledJobs.tsx
  - Cél: Ütemezett feladatok kártyás áttekintése (kompakt nézet).
  - Route: Nincs közvetlenül route-olva (legacy/kompakt verzió)
  - Hozzáférés: –
  - Backend: Edge Functions – jobs-list, jobs-logs, jobs-toggle, jobs-trigger.

- ScheduledJobsPage.tsx
  - Cél: Teljes értékű ütemezett feladatkezelő (lista, szűrés, CRUD, futtatás, naplók, cron validálás).
  - Route: /jobs (legacy admin route AppRoutes-ban); jellemzően admin környezetben használatos
  - Hozzáférés: Admin, Analyst
  - Backend: Edge Functions – jobs-list, jobs-create, jobs-update, jobs-delete, jobs-validate-cron, jobs-logs, jobs-trigger.

- TeamDetail.tsx
  - Cél: Csapat részletes nézete – form, statisztikák, mintázatok, előrejelzések (Poisson/Elo jellegű becslések), CSS.
  - Route: /teams/:teamName
  - Hozzáférés: Publikusan elérhető
  - Backend: Lokális számítások + (komponensek) TeamPatternsSection; mintaadatok.

- Teams.tsx
  - Cél: Csapatok táblázatos megjelenítése ligánként, alapstatisztikákkal (mock generálás).
  - Route: /teams
  - Hozzáférés: Publikusan elérhető

---

## src/pages/admin

- jobs (mappa)
  - RunningJobsPage.tsx
    - Cél: Futó/ütemezett jobok admin áttekintése és kontrollja (Start/Stop, státuszok, log linkek).
    - Route: /admin/jobs
    - Hozzáférés: Admin, Analyst
    - Backend: useJobs hook + Edge Functions (list/trigger/stop…)

- phase9 (mappa)
  - Phase9SettingsPage.tsx
    - Cél: Phase 9 konfiguráció (collaborative intelligence, temporal decay, market integráció, cross-league beállítások).
    - Route: /admin/phase9
    - Hozzáférés: Admin, Analyst
    - Backend: usePhase9Settings hook (Supabase tárolás)

- users (mappa)
  - UsersPage.tsx
    - Cél: Admin felhasználó- és jogosultságkezelés (szűrés, szerep módosítás, meghívó, törlés, lapozás).
    - Route: /admin/users
    - Hozzáférés: Csak admin
    - Backend: Supabase „user_profiles”, „admin_invites”; audit log hook.

- AdminDashboard.tsx
  - Cél: Admin kezdőoldal – fő kategóriakártyák (Users, Jobs, Models, Phase9, Database, System), számlálók.
  - Route: /admin
  - Hozzáférés: Admin, Analyst
  - Backend: Supabase count-lekérések; useJobs, usePhase9Settings, useAuth integrációk.

- HealthDashboard.tsx
  - Cél: Egészség és teljesítmény admin nézet – komponenskártyák + metrikagrafikon komponensválasztóval.
  - Route: /admin/health
  - Hozzáférés: Admin, Analyst
  - Backend: monitoring-health, monitoring-metrics Edge Functions.

- IntegrationsPage.tsx
  - Cél: Integrációk állapota és javaslatok (GitHub, Linear, Slack, Cloudflare Observability, Neon, Notion, Prisma, Render, Sentry, Webflow).
  - Route: /admin/integrations
  - Hozzáférés: Admin, Analyst
  - Backend: Supabase „environment_variables_safe”; frontenden VITE_ kulcsok ellenőrzése; Sentry/Cloudflare enable detektálás.

---

Kiegészítő megjegyzések
- Több domainnél kétféle oldal található: egy egyszerűbb nyilvános/kezdő („Matches”, „Models”, „Monitoring”), és egy bővített admin változat („MatchesPage”, „ModelsPage”, „MonitoringPage”, illetve ütemezett joboknál „ScheduledJobsPage”). Hosszabb távon érdemes konvergálni a kanonikus útvonalakra.
- A legtöbb védett oldal AuthGate + (szükség esetén) RoleGate komponenseken keresztül szabályozza a hozzáférést.
- A Supabase Edge Functions végpontok a projekt „supabase/functions” alatt találhatók; a hívásokat a Supabase kliensen keresztül végezzük.
