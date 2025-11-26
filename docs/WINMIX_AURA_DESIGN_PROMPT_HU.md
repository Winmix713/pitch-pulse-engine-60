# WinMix – Profi Frontend Design Prompt (Aura-ready)

Ez a dokumentum a WinMix rendszer teljes, professzionális és egységes frontend redesign-jához készült. Az alábbi ellenőrzőlista a döntéseket rögzíti, majd a végén megtalálható a kész, bemásolható Aura prompt.

A prompt összeállítása során az alábbi források irányelveit és legjobb gyakorlatait vettem figyelembe:
- https://www.aura.build/learn/introduction
- https://www.aura.build/learn/tips-for-prompting
- https://www.aura.build/learn/prompt-for-typography
- https://www.aura.build/learn/prompt-for-styling
- https://www.aura.build/learn/prompt-for-animation
- https://www.aura.build/learn/prompt-for-layout

---

## 1) Alapkoncepció és Keretrendszer

Mit szeretnénk létrehozni?
- Egy egységes, modern design rendszer és kulcskomponens-készlet a teljes WinMix felülethez (dashboardok, táblázatok, kártyák, űrlapok, navigáció, modalok, grafikon-container, hős szekció a landinghez).

Technológiai keretrendszer:
- React + TypeScript (Vite)
- Tailwind CSS (már használt; shadcn-ui utility minták)
- Nincs extra külső CSS/JS dependency (csak a meglévő Tailwind + tailwindcss-animate)
- Előny: a repo-ban már definiált HSL-alapú CSS változók és Tailwind theme használata

Megjegyzés a kódgeneráláshoz:
- Kimenet: TSX (React) + Tailwind osztályok; sem inline style, sem külső UI könyvtár ne legyen szükséges.
- Elérhetőség: WCAG AA, fókuszállapotok, ARIA attribútumok.

---

## 2) Elrendezés (Layout) és Struktúra

Fő szerkezeti minták (példák):
- Alap layout: fix, bal oldali Sidebar + felső Topbar (opcionális) + scrollozható Main content.
- Dashboard kártya: ikon/indikátor, cím, érték, szekunder meta, CTA.
- Táblázat: ragadós fejlécek, reszponzív horizontális scroll, sort/filter zóna felül.
- Űrlap: cím + leírás, mezők gridben, elsődleges és másodlagos gombok, validációs üzenetek.
- Modal/Drawer: cím, tartalom, műveletgombok, ESC/kívülre kattintás zárás.
- Hero section (landing): headline, subheading, primer CTA + szekunder CTA, illusztráció/visual.

Reszponzivitás:
- Desktop (≥ 1280px):
  - Három- és négyoszlopos rácsok; Sidebar fix 280–320px; Main max-width: 1400px.
  - Kártyák rácsban, segédpanel jobb oldalon (optional).
- Tablet (≥ 768px és < 1280px):
  - Kétoszlopos rács; Sidebar keskeny (80–96px) ikon-only, tooltip címkékkel.
  - Navigáció kinyitható flyoutként.
- Mobil (< 768px):
  - Egyoszlopos, elemek egymás alatt, középre igazított fontos CTA-k.
  - Alsó navigációs sáv (opcionális), hamburger menü.

---

## 3) Stílus és Vizuális Megjelenés

Stílusirány:
- Modern, professzionális, minimalista, prémium érzet sötét UI-val; üvegszerű részletek (visszafogott glassmorphism), finom glow/shine highlight-ok.

Színséma (összhangban a meglévő HSL tokenekkel):
- Háttér (base): HSL 11 11% 6%  | HEX: #0B0B0A
- Kártya háttér: HSL 11 11% 8%  | HEX: #111110
- Elsődleges (emerald): HSL 160 84% 39% | HEX: #10B981 környéke
- Másodlagos (narancs): HSL 18 100% 60% | HEX: #F97316
- Szöveg (foreground): HSL 210 40% 98% | HEX: #F9FAFB
- Muted felületek: HSL 215 20% 17% | HEX: #1F2937
- Border/Input: HSL 215 20% 17% | HEX: #1F2937
- Ring: HSL 160 84% 39%

Térközök és szegélyek:
- Spacing skála: 4px alap (4/8/12/16/24/32/48/64)
- Belső margó (kártyák): 20–24px
- Külső margó (kártyák között): 16–24px
- Lekerekítés: 16px (alap), kicsi: 10px, nagy: 24px (repo: --radius: 1rem támogatott)
- Árnyék: finom, lágy „ambient” + hoverkor enyhe erősödés; large kiemeléshez soft glow (emerald/narancs)

Glass/Glow utilok (repo utilokra építve):
- .glass-card, .glass-card-hover, .glow-emerald, .glow-orange használata mértékkel.

---

## 4) Tipográfia

Címsorok (Heading):
- Betűtípus: Inter (vagy Geist alternatíva), rendszerfont fallback.
- Méret skála: H1 44–56px, H2 32–40px, H3 24–28px, H4 20–22px.
- Vastagság: 700 (H1–H3), 600 (H4), tight/normal letter-spacing.
- Szín: foreground (#F9FAFB), elsődleges kiemeléshez emerald gradient opció.

Törzsszöveg (Body):
- Betűtípus: Inter
- Méret: 16px (alap), 14px (szekunder), 18px (kiemelt)
- Vastagság: 400–500
- Szín: foreground 80–90% opacitással, muted szövegek 65–70% opacitással
- Sorköz: 1.5

Kiemelések:
- Kód/értékek monospaced: ui-monospace, SFMono, Menlo fallback.

---

## 5) Interaktivitás és Animációk

Interaktív elemek:
- Gombok, linkek, beviteli mezők, toggle/switch, dropdown, tabok, táblázatsor hover, kártya hover.

Viselkedés:
- Hover: 6–10% sötétedés/világosodás, finom árnyék/glow; link underline-on-hover.
- Focus: egyértelmű kontrasztos ring (emerald), 2–3px fókuszgyűrű, outline-offset biztonságos.
- Disabled: kontraszt csökkentés, pointer-events: none, aria-disabled.

Animáció:
- Melyik: kártyák, CTA gombok, üzenetsávok, hero elemek.
- Mikor: oldalbetöltéskor finom „fade-in/slide-in”; scrollnál when-in-view.
- Típus: „fade-in”, „slide-in-bottom/right”, enyhe „scale-up” CTA hoverkor.
- Időzítés: ease-out, 200–600ms; preferáljuk a repo Tailwind keyframe-jeit:
  - animate-fade-in, animate-slide-in-bottom, animate-slide-in-right, animate-pulse-subtle
- Reduced motion: respektáljuk a prefers-reduced-motion szabályt (Tailwind támogatott utilokkal).

---

# Végső Aura Prompt (bemásolható)

Kérlek, generálj egy egységes, modern, sötét témájú UI design rendszert és kulcskomponenseket a WinMix alkalmazáshoz az alábbi részletes követelmények alapján. A kimenet React + TypeScript (TSX) és Tailwind CSS osztályok használatával készüljön, külső UI könyvtár és inline style nélkül. Használd a megadott tokeneket és a reszponzív elrendezési szabályokat.

1) Technológia és szabályok
- React + TSX, Tailwind CSS (tailwindcss-animate elérhető). Ne használj inline style-t vagy külső komponenskönyvtárat. A komponensek legyenek hozzáférhetőek (ARIA, fókuszállapot, billentyű-navigáció, WCAG AA). Tilos: fixed pixeles layout mobilon, gyenge kontrasztú fókusz, túlzó animációk.

2) Színek és tokenek (használható HEX vagy HSL)
- background: hsl(11 11% 6%)  | #0B0B0A
- card: hsl(11 11% 8%)        | #111110
- primary (emerald): hsl(160 84% 39%) | ~#10B981
- secondary (orange): hsl(18 100% 60%) | #F97316
- foreground: hsl(210 40% 98%) | #F9FAFB
- muted: hsl(215 20% 17%)      | #1F2937
- border/input: hsl(215 20% 17%)
- ring: hsl(160 84% 39%)
- Radius: alap 16px (repo: --radius: 1rem)
- Árnyék: finom ambient + hoverkor enyhe erősödés; kiemeléshez soft emerald/narancs glow.

3) Tipográfia
- Headings: Inter, H1 48–56px, H2 36–40px, H3 24–28px, H4 20–22px; 700/600 font-weight; szín: foreground; opcionális emerald text-gradient kiemelés.
- Body: Inter 16px (alap), 14px (szekunder), 18px (kiemelt), 400–500 weight; line-height: 1.5; muted szöveg 65–70% opacitás.

4) Layout és reszponzivitás
- Desktop: Sidebar fix (280–320px), Main max-w-[1400px]; 3–4 oszlopos kártyarács; ragadós táblázatfejlécek; jobb oldali segédpanel opcionális.
- Tablet: 2 oszlop; Sidebar ikon-only (80–96px), tooltip címkékkel; navigáció flyout.
- Mobil: 1 oszlop; elemek egymás alatt; fontos CTA középre; hamburger menü vagy alsó nav.

5) Interakció és animáció
- Hover: 6–10% sötétedés/világosodás, finom árnyék/glow; link underline-on-hover.
- Focus: kontrasztos emerald ring (2–3px), biztonságos outline-offset.
- Animációk: használd a Tailwind animációkat (animate-fade-in, animate-slide-in-bottom/right, animate-pulse-subtle). Időtartam 200–600ms, ease-out. Tartsd tiszteletben a prefers-reduced-motion beállítást.

6) Komponensek, amiket kérek
- Sidebar navigáció (ikon + label; aktív állapot; összehúzható tablet módban; ARIA nav landmark)
- Topbar (projekt név, gyors akciók, felhasználói menü)
- Dashboard kártya (ikon, title, fő érték, szekunder meta, CTA)
- Táblázat (ragadós fejlécek, reszponzív scroll, sort/filter zóna)
- Űrlap elemek (Input, Select, Textarea, Switch, Radio/Checkbox, validációs üzenetek)
- Modal/Drawer (cím, tartalom, primer/szekunder gombok, ESC és backdrop close)
- Hero szekció (headline, subheading, primer + szekunder CTA, vizuális illusztráció)
- „Grafikon-kártya” container (chart placeholder, cím, legend, timeframe switch)

7) Kód elvárások
- Minden komponens külön TSX fájlban; Tailwind utility-k konzisztensen; ne használj inline style-t. Adj mintapéldát a használatra (props) és állapotokra (loading, empty, error).
- A fókusz- és hibaállapotokat vizuálisan és ARIA-val is jelezd. Lehetőleg role, aria-*, id/for kapcsolat, és keyboard trap modal esetén.

8) Példa viselkedések
- Button: primer (emerald) és szekunder (muted/outline); hover 8% sötétedés; disabled állapot.
- Card: .glass-card alap, .glass-card-hover hoverre; finom „animate-fade-in” amikor megjelenik.
- Table row: enyhe háttérkiemelés hoverkor; sort ikon állapotváltás.

Kérlek, a fenti specifikáció alapján állíts össze egy komplett, importálható komponenskészletet (TSX + Tailwind), amely azonnal alkalmazható a WinMix felületén.

---

## Gyors „prompt only” változat

Generálj React + TypeScript (TSX) és Tailwind CSS alapú, sötét témájú design rendszert a WinMixhez: Sidebar, Topbar, Dashboard Cards, Table (ragadós fejlécek), Form elemek, Modal/Drawer, Hero szekció, Chart-kártya. Színek (HSL/HEX): background hsl(11 11% 6%) #0B0B0A, card hsl(11 11% 8%), primary hsl(160 84% 39%) ~#10B981, secondary hsl(18 100% 60%) #F97316, foreground hsl(210 40% 98%) #F9FAFB, muted hsl(215 20% 17%). Tipográfia: Inter, Headings H1 48–56px/700, H2 36–40px/700, H3 24–28px/700, Body 16px/1.5 400–500. Layout: Desktop 3–4 oszlop, Tablet 2 oszlop (Sidebar ikon-only), Mobil 1 oszlop. Interakció: hover 6–10% sötétedés, fókusz emerald ring 2–3px. Animáció: Tailwind animate-fade-in/slide-in-bottom/right, 200–600ms ease-out, respects prefers-reduced-motion. Kimenet kizárólag TSX + Tailwind, ARIA és WCAG AA elvárásokkal, inline style nélkül.
