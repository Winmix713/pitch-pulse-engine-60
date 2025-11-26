# Admin Felület Útmutató (HU)

Ez a dokumentum a WinMix TipsterHub adminisztrációs felületének teljes körű bemutatását nyújtja magyar nyelven.

## Tartalom

1. [Áttekintés és Jogosultságok](#áttekintés-és-jogosultságok)
2. [Admin Dashboard](#admin-dashboard)
3. [Users & Roles](#users--roles)
4. [Running Jobs](#running-jobs)
5. [Model Status Dashboard](#model-status-dashboard)
6. [Health Dashboard](#health-dashboard)
7. [Integrations](#integrations)
8. [Stats & Data Quality](#stats--data-quality)
9. [Feedback Inbox](#feedback-inbox)
10. [Prediction Review](#prediction-review)
11. [Phase 9 Settings](#phase-9-settings)
12. [Hibakezelés és Munkafolyamatok](#hibakezelés-és-munkafolyamatok)

---

## Áttekintés és Jogosultságok

### RoleGate.tsx működése

Az admin felület jogosultság-kezelése a `RoleGate` komponensen keresztül történik, amely az adminisztrátori oldalak védelmét biztosítja.

**Fő komponens:** `src/components/admin/RoleGate.tsx`

**Felhasználói szerepkörök:**
- **admin:** Teljes hozzáférés minden admin funkcióhoz
- **analyst:** Korlátozott hozzáférés (monitoring, model status, integrations, stats)
- **user:** Nincs admin hozzáférés
- **viewer:** Csak olvasási jogosultság

**Technikai háttér:**
```typescript
// RoleGate használata az útvonalakban
<RoleGate allowedRoles={["admin", "analyst"]}>
  <AdminComponent />
</RoleGate>
```

**Backend kapcsolat:** Supabase táblák RLS (Row Level Security) szabályokkal ellátva.

---

## Admin Dashboard

**Funkcionális leírás:** Admin felület főoldala, amely platform szintű áttekintést nyújt a rendszer állapotáról.

**Fő komponens:** `src/pages/admin/AdminDashboard.tsx`

**Adatforrás/Hook:** `useQueries` a különböző táblák count-jainak lekérdezésére

**Backend kapcsolat:** Supabase táblák: `user_profiles`, `models`, `matches`

**Kártyák és funkciók:**
- **System Overview:** Élő rendszerállapot
- **Users & Roles:** Felhasználók száma (csak adminoknak)
- **Running Jobs:** Futó jobok száma
- **AI & Predictions:** Modellek száma
- **Model Control Center:** ML modellek menedzselése
- **Phase 9:** Kollaboratív intelligencia státusz
- **Database & Content:** Adatbázis tartalom
- **System:** Biztonság és compliance (hamarosan)

**Technikai háttér:**
```typescript
// Count adatok lekérdezése
const fetchCount = async (table: string): Promise<number | null> => {
  const { count, error } = await supabase
    .from(table)
    .select("id", { count: "exact", head: true });
  return count ?? 0;
};
```

---

## Users & Roles

**Funkcionális leírás:** Felhasználók és jogosultságok menedzselése, meghívók küldése.

**Fő komponens:** `src/pages/admin/users/UsersPage.tsx`

**Adatforrás/Hook:** `useQuery` a felhasználók lekérdezésére, `useMutation` a műveletekre

**Backend kapcsolat:** 
- Supabase táblák: `user_profiles`, `admin_invites`, `admin_audit_log`
- Hook: `useAuditLog` a naplózáshoz

**Főbb funkciók:**
- **Felhasználó lista:** Keresés, lapozás, szerepkör módosítás
- **Meghívó küldés:** Email alapú meghívók admin/analyst/user szerepkörökkel
- **Szerepkör módosítás:** Dropdown menüből
- **Felhasználó törlése:** Confirm dialógussal

**Munkafolyamat:**
1. **Meghívó küldése:** Email cím és szerepkör megadása → Token generálása → Email küldése
2. **Szerepkör módosítás:** Dropdownból választás → Optimistic update → Audit log
3. **Felhasználó törlése:** Confirm dialógus → Törlés → Audit log

**Technikai háttér:**
```typescript
// Szerepkör módosítás
const updateUserRole = async (userId: string, role: AdminUser["role"]) => {
  const { error } = await supabase
    .from("user_profiles")
    .update({ role })
    .eq("id", userId);
};
```

---

## Running Jobs

**Funkcionális leírás:** Automatizálási folyamatok monitorozása és vezérlése.

**Fő komponens:** `src/pages/admin/jobs/RunningJobsPage.tsx`

**Adatforrás/Hook:** `useJobs` hook

**Backend kapcsolat:** Supabase Edge Functions: `jobs-list`, `jobs-manager`

**Főbb funkciók:**
- **Job lista:** Státusz, következő futás, sikerességi ráta
- **Manuális indítás:** Jobok kézi elindítása
- **Leállítás:** Futó jobok leállítása
- **Logok:** Részletes naplómegtekintés

**Státuszok:**
- **Running:** Aktívan fut
- **Scheduled:** Tervezett
- **Stopped:** Leállítva

**Technikai háttér:**
```typescript
// Job indítása
const startJob = async (jobName: string) => {
  const { data } = await supabase.functions.invoke("jobs-manager", {
    body: { action: "start", job_name: jobName }
  });
};
```

---

## Model Status Dashboard

**Funkcionális leírás:** ML modellek menedzselése, teljesítmény-monitorozása és konfigurálása.

**Fő komponens:** `src/pages/admin/ModelStatusDashboard.tsx`

**Adatforrás/Hook:** `useModelRegistry`, `useQuery` a rendszer státuszhoz

**Backend kapcsolat:** Supabase Edge Functions:
- `admin-model-system-status`
- `admin-model-analytics` 
- `admin-model-promote`
- `admin-model-training`

**Főbb funkciók:**
- **Modell registry:** Regisztrált modellek listája
- **Promotion:** Modell promóció aktív státuszba
- **Training trigger:** Manuális újratanítás indítása
- **System logs:** Rendszer logok megjelenítése
- **Analytics:** Teljesítménymetrikák

**Technikai háttér:**
```typescript
// Modell promóció
const promoteModel = async ({ modelId }: { modelId: string }) => {
  const { data } = await supabase.functions.invoke("admin-model-promote", {
    body: { model_id: modelId }
  });
};
```

---

## Health Dashboard

**Funkcionális leírás:** Rendszer állapotának és teljesítményének valós idejű monitorozása.

**Fő komponens:** `src/pages/admin/HealthDashboard.tsx`

**Adatforrás/Hook:** `useHealth`, `useMetrics`

**Backend kapcsolat:** Supabase Edge Functions: `monitoring-health`, `monitoring-metrics`

**Főbb funkciók:**
- **System Health Cards:** Komponensek állapota
- **Performance Metrics:** Latency grafikonok (P50, P95, P99)
- **Component filtering:** Komponens szerinti szűrés

**Technikai háttér:**
```typescript
// Health adatok lekérdezése
const { data } = await supabase.functions.invoke<HealthSummaryResponse>("monitoring-health");
```

**Metrikák:**
- **Latency P50:** 50. percentilis válaszidő
- **Latency P95:** 95. percentilis válaszidő
- **Latency P99:** 99. percentilis válaszidő

---

## Integrations

**Funkcionális leírás:** Külső szolgáltatások konfigurálása és kapcsolat ellenőrzése.

**Fő komponens:** `src/pages/admin/IntegrationsPage.tsx`

**Adatforrás/Hook:** `useEnvSafe`

**Backend kapcsolat:** Supabase tábla: `environment_variables_safe`

**Integrációk:**
| Integration | Típus | Külcsök | Státusz |
|-------------|-------|---------|---------|
| GitHub | Backend | GITHUB_TOKEN, GITHUB_REPOSITORY | Configured/Partial/Missing |
| Linear | Backend | LINEAR_API_KEY, LINEAR_TEAM_ID | Configured/Partial/Missing |
| Slack | Backend | SLACK_WEBHOOK_URL | Configured/Partial/Missing |
| Sentry | Frontend | VITE_SENTRY_DSN, VITE_SENTRY_ENV | Configured/Partial/Missing |
| Cloudflare | Frontend | VITE_CLOUDFLARE_BEACON_TOKEN | Configured/Partial/Missing |

**Technikai háttér:**
```typescript
// Environment változók lekérdezése
const fetchEnvSafe = async (): Promise<EnvironmentVariableSafe[]> => {
  const { data } = await supabase
    .from("environment_variables_safe")
    .select("id,key,value,is_secret,category,created_at,updated_at,created_by");
  return data ?? [];
};
```

---

## Stats & Data Quality

**Funkcionális leírás:** Statisztikai elemzések és adatminőség ellenőrzések.

**Fő komponens:** `src/pages/admin/StatsPage.tsx`

**Adatforrás/Hook:** `useQuery` a mérkőzések és csapatok adataihoz

**Backend kapcsolat:** Supabase táblák: `matches`, `teams`

**Főbb funkciók:**
- **Szűrők:** Csapat, helyszín, dátumtartomány
- **Statisztikák:** Eredmény eloszlás, átlagos gólok, gólszám hisztogram
- **Top scoreline-ok:** Leggyakoribb pontos eredmények
- **Adatminőség ellenőrzés:** Problémás rekordok azonosítása

**Adatminőség ellenőrzések:**
- Érvénytelen dátumok
- Hiányzó pontszámok befejezett meccseknél
- Negatív pontszámok
- Félidő > végső pontszám
- Anomálisan magas gólszám
- Ugyanaz a csapat hazai és vendégnél

---

## Feedback Inbox

**Funkcionális leírás:** Felhasználói visszajelzések és javaslatok kezelése.

**Fő komponens:** `src/pages/admin/FeedbackInboxPage.tsx`

**Adatforrás/Hook:** `FeedbackInboxPanel` komponens

**Backend kapcsolat:** Supabase tábla: `feedback`

**Főbb funkciók:**
- Visszajelzések listázása
- Státusz kezelés (új/feldolgozva)
- Kategóriák szerinti szűrés

---

## Prediction Review

**Funkcionális leírás:** Blokkolt és túlzottan magabiztos előrejelzések felülvizsgálata.

**Fő komponens:** `src/pages/admin/PredictionReviewPage.tsx`

**Adatforrás/Hook:** `PredictionReviewPanel` komponens

**Backend kapcsolat:** Supabase Edge Functions: `admin-prediction-review`

**Főbb funkciók:**
- Blokkolt előrejelzések listázása
- Manuális felülvizsgálat
- Elfogadás/Elutasítás
- Auto-refresh (30 másodpercenként)

**Munkafolyamat:**
1. Rendszer blokkol egy előrejelzést túlzott magabiztosság miatt
2. Admin felülvizsgálja az előrejelzést
3. **Elfogadás:** Blokkolt státusz megtartása
4. **Elutasítás:** Visszaállítás aktív státuszra

---

## Phase 9 Settings

**Funkcionális leírás:** Kollaboratív intelligencia és piaci integrációk konfigurálása.

**Fő komponens:** `src/pages/admin/phase9/Phase9SettingsPage.tsx`

**Adatforrás/Hook:** `usePhase9Settings`

**Backend kapcsolat:** Supabase tábla: `phase9_settings`

**Főbb funkciók:**
- **Collaborative Intelligence:** AI-stratégiai együttműködés
- **Temporal Decay:** Időbeli csökkenés paraméterei
- **Freshness Thresholds:** Adatfrissességi küszöbértékek
- **Market Integrations:** Piaci API kulcsok
- **Cross-League Intelligence:** Kereszt-liga intelligencia

**Technikai háttér:**
```typescript
// Phase 9 beállítások mentése
const saveSettings = async (payload: Partial<AdminPhase9SettingsInput>) => {
  const { error } = await supabase
    .from("phase9_settings")
    .update(payload)
    .eq("id", settingsId);
};
```

---

## Hibakezelés és Munkafolyamatok

### Audit Log

Minden admin művelet naplózásra kerül az `admin_audit_log` táblában:

```typescript
// Audit log bejegyzés
await log("user_created", { email: "user@example.com", role: "analyst" });
await log("role_changed", { userId: "xxx", role: "admin" });
await log("user_deleted", { userId: "xxx", email: "user@example.com" });
```

### Gyakori hibaüzenetek és teendők

| Hibaüzenet | Ok | Teendő |
|-------------|-----|--------|
| "Access denied" | Nincs megfelelő jogosultság | Ellenőrizze a felhasználói szerepkört |
| "Failed to create invite" | Email már létezik | Ellenőrizze az admin_invites táblát |
| "Job start failed" | Job nincs konfigurálva | Ellenőrizze a jobs táblát |
| "Model promotion failed" | Nincs aktív modell | Ellenőrizze a model registry-t |
| "Environment variable missing" | Hiányzó konfiguráció | Adja hozzá az env változót |

### Kritikus munkafolyamatok

#### 1. Modell újratanítás
```
Model Status Dashboard → Trigger Training → ML Pipeline → System Log → Model Registry Update
```

#### 2. Felhasználó tiltása
```
Users Page → Delete User → Confirmation → Profile Delete → Audit Log → Session Invalidation
```

#### 3. Job leállítás vészhelyzetben
```
Running Jobs → Stop Job → Confirmation → Job Manager → Graceful Shutdown → Status Update
```

---

## Technikai Architektúra

### Komponens Hierarchia

```
src/pages/admin/
├── AdminDashboard.tsx           - Főoldal
├── users/
│   └── UsersPage.tsx           - Felhasználókezelés
├── jobs/
│   └── RunningJobsPage.tsx      - Job menedzsment
├── phase9/
│   └── Phase9SettingsPage.tsx   - Phase 9 beállítások
├── ModelStatusDashboard.tsx     - Modell menedzsment
├── HealthDashboard.tsx          - Rendszer monitoring
├── IntegrationsPage.tsx         - Integrációk
├── StatsPage.tsx               - Statisztikák
├── FeedbackInboxPage.tsx       - Visszajelzések
└── PredictionReviewPage.tsx     - Előrejelzés felülvizsgálat
```

### Hook-ok

```
src/hooks/admin/
├── useJobs.ts                  - Job management
├── usePhase9Settings.ts        - Phase 9 settings
├── useHealthMetrics.ts         - Health monitoring
├── useAuditLog.ts              - Audit logging
└── useAdminAuth.ts             - Admin auth helper
```

### Service-k

```
src/integrations/admin-*/
├── admin-model-status/service.ts    - Model status API
└── admin-prediction-review/service.ts - Prediction review API
```

### Edge Functions

| Function | Leírás | Jogosultság |
|----------|--------|-------------|
| jobs-list | Job lista lekérdezése | admin/analyst |
| jobs-manager | Job indítás/leállítás | admin/analyst |
| admin-model-system-status | Modell rendszer státusz | admin/analyst |
| admin-model-analytics | Modell analitika | admin/analyst |
| admin-model-promote | Modell promóció | admin/analyst |
| admin-model-training | Training indítás | admin/analyst |
| monitoring-health | System health adatok | admin/analyst |
| monitoring-metrics | Performance metrikák | admin/analyst |
| admin-prediction-review | Előrejelzés felülvizsgálat | admin/analyst |

### Táblák és RLS

| Tábla | Leírás | RLS Policy |
|-------|--------|------------|
| user_profiles | Felhasználói profilok | is_admin() vagy saját profil |
| admin_invites | Admin meghívók | is_admin() |
| admin_audit_log | Audit napló | is_admin() vagy is_analyst() |
| environment_variables_safe | Env változók | is_admin() |
| phase9_settings | Phase 9 beállítások | is_admin() |
| feedback | Felhasználói visszajelzések | is_admin() vagy is_analyst() |

---

## Összefoglalás

Az admin felület egy átfogó rendszer a WinMix TipsterHub platform teljes körű menedzselésére. A RoleGate komponens biztosítja a jogosultság-kezelést, míg a különböző oldalak specifikus funkciókat látnak el a felhasználókezeléstől kezdve a ML modellek menedzselésén át a monitoringig.

Minden művelet naplózásra kerül, a rendszer biztonságos RLS szabályokkal van ellátva, és a fejlesztők számára egyértelmű fájlszerkezet és API interfészek állnak rendelkezésre a továbbifejlesztéshez.

---

*Ez a dokumentum a WinMix TipsterHub admin felületének teljes körű bemutatását nyújtja. Frissítve: 2026. január 1.*
