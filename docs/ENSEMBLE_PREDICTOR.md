# Ensemble Predictor (Együttes Előrejelző) Rendszer

## Áttekintés

Az Ensemble Predictor rendszer három al-modell kimeneteit egyesítő aggregáló réteg, amely súlyozott szavazást alkalmazva javítja a predikciós pontosságot.

## Al-modellek

### 1. Full-time Model (FT) - Súly: 0.5 (50%)
Teljes mérkőzés elemzés alapú előrejelzés:
- **Adatforrás**: Csapatok teljes forma-pontszámai (utolsó 5 mérkőzés)
- **H2H figyelembevétel**: Korábbi egymás elleni mérkőzések eredményei
- **Logika**:
  - Forma különbség normalizálása (-1 és 1 között)
  - H2H győzelmek aránya
  - Kombinált pontszám: 70% forma + 30% H2H
  - Konfidencia: 0.55 - 0.92 tartomány

### 2. Half-time Model (HT) - Súly: 0.3 (30%)
Félidős minták alapú előrejelzés:
- **Adatforrás**: Csapatok félidős teljesítménye (utolsó 5 mérkőzés)
- **Logika**:
  - Félidős gólkülönbségek átlaga csapatonként
  - Normalizált különbség (-1 és 1 között)
  - Küszöbértékek: ±0.12 (nyertes), <0.04 (döntetlen)
  - Konfidencia: 0.35 - 0.80 tartomány

### 3. Pattern Model (PT) - Súly: 0.2 (20%)
Minta-felismerés alapú előrejelzés:
- **Adatforrás**: Detektált mintázatok (győzelmi szériák, dominancia, formák)
- **Logika**:
  - Hazai előny mintázatok összesítése
  - Vendég előny mintázatok összesítése
  - Különbség >4: hazai/vendég győzelem
  - Konfidencia: 0.40 - 0.90 tartomány

## Súlyozott Szavazás

### Alapképlet
Minden kimenetelre (HOME, DRAW, AWAY):

```
Score_outcome = Σ (Model_confidence × Weight_model)
```

ahol a modell az adott kimenetelt jósolta.

### Példa Számítás

Adott:
- FT: home_win, 0.75 konfidencia
- HT: draw, 0.55 konfidencia  
- PT: home_win, 0.60 konfidencia

Pontszámok:
- HOME = (0.75 × 0.5) + (0.60 × 0.2) = 0.495
- DRAW = (0.55 × 0.3) = 0.165
- AWAY = 0.0

**Nyertes**: home_win (0.495 konfidencia)
**Konfliktus**: nem (margin = 0.495 - 0.165 = 0.33 > 0.1)

## Konfliktus Detektálás

### Kritérium
Konfliktus jelzése, ha a két legmagasabb pontszám különbsége < 0.1 (10%)

### Példa Konfliktusra
- HOME: 0.52
- DRAW: 0.48
- AWAY: 0.0

**Margin**: 0.52 - 0.48 = 0.04 < 0.1 → **Conflict detected**

### Kezelés
- `prediction_status`: 'uncertain' (normál esetben 'active')
- `blocked_reason`: "Ensemble konfliktus: a két legmagasabb pontszám közötti különbség 4.0% (küszöb: 10%)."
- `alternate_outcome`: második legjobb kimenetel

## Dinamikus Újrasúlyozás

### Ha egy modell `null`
Automatikus újrasúlyozás a maradék modellek között.

**Példa**:
- FT: home_win, 0.75 ✓
- HT: null ✗
- PT: home_win, 0.70 ✓

Eredeti súlyok: FT=0.5, HT=0.3, PT=0.2
Aktív súlyok összege: 0.5 + 0.2 = 0.7

Újrasúlyozott:
- FT: 0.5 / 0.7 ≈ 0.714 (71.4%)
- HT: 0.0
- PT: 0.2 / 0.7 ≈ 0.286 (28.6%)

## Adatbázis Struktúra

### `ensemble_breakdown` JSONB mező

```json
{
  "weights_used": {"ft": 0.5, "ht": 0.3, "pt": 0.2},
  "votes": {
    "full_time": {"prediction": "home_win", "confidence": 0.75},
    "half_time": {"prediction": "draw", "confidence": 0.45},
    "pattern": {"prediction": "home_win", "confidence": 0.60}
  },
  "scores": {
    "HOME": 0.495,
    "DRAW": 0.135,
    "AWAY": 0.0
  },
  "winner": "home_win",
  "final_confidence": 0.495,
  "conflict_detected": false,
  "conflict_margin": 0.36
}
```

## Implementációk

### Python
`ml_pipeline/ensemble_predictor.py`

```python
from ml_pipeline import EnsemblePredictor

predictor = EnsemblePredictor()
result = predictor.predict(
    full_time_prediction="home_win",
    full_time_confidence=0.75,
    half_time_prediction="draw",
    half_time_confidence=0.55,
    pattern_prediction="home_win",
    pattern_confidence=0.60
)
```

### TypeScript (Edge Functions)
`supabase/functions/_shared/ensemble.ts`

```typescript
import { EnsemblePredictor } from "../_shared/ensemble.ts";

const predictor = new EnsemblePredictor();
const result = predictor.predict({
  full_time_prediction: "home_win",
  full_time_confidence: 0.75,
  half_time_prediction: "draw",
  half_time_confidence: 0.55,
  pattern_prediction: "home_win",
  pattern_confidence: 0.60
});
```

### TypeScript (Frontend)
`8888/utils/ensemblePredictor.ts`

```typescript
import { EnsemblePredictor } from '@/utils/ensemblePredictor';

const predictor = new EnsemblePredictor();
// ... ugyanaz, mint fent
```

## Tesztelés

### Python tesztek
```bash
pytest tests/test_ensemble_predictor.py -v
```

### TypeScript tesztek
```bash
npm run test src/__tests__/ensemblePredictor.test.ts
```

## UI Megjelenítés

A `PredictionDisplay` komponens az ensemble eredményeket az alábbiak szerint jeleníti meg:

1. **Fő predikció kártya**: Végső nyertes és konfidencia
2. **Ensemble Breakdown (kiemelhető)**:
   - Konfliktus figyelmeztetés (ha van)
   - Sub-model szavazatok (FT, HT, PT) súlyokkal
   - Végső pontszámok (HOME, DRAW, AWAY) progress bar-okkal
   - Nyertes kimenetel összefoglalója

## Elfogadási Kritériumok

✅ Python és TypeScript implementációk determinisztikusak  
✅ `ensemble_breakdown` minden új előrejelzésnél mentésre kerül  
✅ Unit tesztek lefedik a súlyozási logikát és edge case-eket  
✅ UI világosan mutatja az ensemble lebontást  
✅ Dokumentáció frissítve a súlyozási paraméterekkel  

## Konfigurálás

A súlyok módosítása:

```python
predictor = EnsemblePredictor(weights={"ft": 0.4, "ht": 0.4, "pt": 0.2})
```

```typescript
const predictor = new EnsemblePredictor({ ft: 0.4, ht: 0.4, pt: 0.2 });
```

vagy futás közben:

```python
predictor.update_config({"ft": 0.6, "ht": 0.25, "pt": 0.15})
```

```typescript
predictor.updateConfig({ ft: 0.6, ht: 0.25, pt: 0.15 });
```

## Hibajavítás

### Gyakori problémák

**Probléma**: "At least one sub-model prediction must be provided"
**Megoldás**: Ellenőrizd, hogy legalább egy model_prediction és model_confidence párral rendelkezel.

**Probléma**: "confidence must be in range [0, 1]"  
**Megoldás**: Konfidencia értékek 0.0 és 1.0 között legyenek (nem százalékban).

**Probléma**: "Invalid outcome"
**Megoldás**: Csak ezek az értékek engedélyezettek: 'home_win', 'draw', 'away_win', 'HOME', 'DRAW', 'AWAY'.

## Jövőbeli Fejlesztések

- Adaptív súlyozás: modellek teljesítménye alapján dinamikus súlybeállítás
- Több al-modell támogatása
- Gépi tanulással optimalizált súlyok
- Csapat-specifikus súlyozás
