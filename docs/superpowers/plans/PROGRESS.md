# Kundli App — Progress Summary

> Last updated: 2026-05-31  
> Use this file to resume work in a new session.

---

## Stack

| Layer | Tech |
|-------|------|
| Backend | Python 3.12, FastAPI, Swiss Ephemeris (`pyswisseph`), `python-dotenv` |
| Frontend | React 18, Vite, Tailwind CSS v3, i18next (EN + HI) |
| AI Reading | Groq API — `llama-3.3-70b-versatile` (free tier) |
| Dev server | Vite on port 5173 (proxies `/api/*` → `localhost:8000`) |

---

## How to Run

```bash
# Backend
cd backend
.venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000

# Frontend (dev)
cd frontend
npm run dev
```

**Required:** `backend/.env` (not committed):
```
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxx
```

---

## What Has Been Built

### 1. Core Kundli Engine (backend)
- `POST /api/kundli` — takes `{date, time, place}`, returns full chart JSON
- Geocoding via Nominatim (place → lat/lon/timezone)
- Swiss Ephemeris for planet positions (12 planets incl. outer)
- Whole-sign house system
- Navamsa chart calculation
- Vimshottari Dasha calculation (mahadasha + antardasha)

### 2. North Indian Lagna Chart (frontend)
- `KundliChart.jsx` — 500×500 SVG, correct North Indian diamond layout
- **H1 at top-centre**, houses increment **anti-clockwise**
- Rashi numbers displayed in each cell (1=Aries … 12=Pisces)
- Lagna (La) marker with degree in H1
- Planet abbreviations with degree superscripts
- Status symbols: `↑` exalted · `↓` debilitated · `*` retrograde · `^` combust · `□` vargottama
- Planet colour coding + legend below chart

### 3. UX Improvements
- `BirthForm.jsx` — Day/Month/Year dropdowns for date; HH/MM/AM-PM dropdowns for time
- AM/PM → 24-hr conversion before API call
- Place autocomplete (unchanged)
- Chart font sizes increased (13px planet text, 9px superscripts, 13px rashi)

### 4. Result Dashboard (5 tabs)
| Tab | Content |
|-----|---------|
| Birth Chart | North Indian Lagna chart (KundliChart) |
| Navamsa | Navamsa chart (same component) |
| Dasha | Vimshottari mahadasha/antardasha table |
| Planets | Detailed planet positions table |
| Reading | AI-generated Vedic reading (7 sections) |

### 5. AI Chart Reading
- `POST /api/kundli/reading` — takes `{date, time, place, language}`
- Calls Groq API with structured Vedic prompt
- Returns 7 sections parsed from `===SectionName===` delimiters:

| Section | Icon | Description |
|---------|------|-------------|
| Chart Overview | 📜 | Lagna, Rashi, Sun sign, current Dasha — highlighted amber card |
| Personality & Appearance | 🧬 | |
| Career & Wealth | 💼 | |
| Relationships & Marriage | 💞 | |
| Health | 🌿 | |
| Spiritual Inclination | 🕉️ | |
| Current Period (Dasha) | ⏳ | |

- Bilingual: EN / HI (pass `language: 'hi'` for Hindi)
- 3-attempt retry with exponential backoff on 429
- On-demand (user clicks "Generate Reading")

---

## Key Files

```
backend/
  main.py                    # FastAPI app, loads .env
  models/
    birth_data.py            # BirthInput model
    chart_data.py            # ChartResponse, ReadingRequest/Response models
  routes/
    kundli.py                # POST /api/kundli, POST /api/kundli/reading
  services/
    astro_calc.py            # Swiss Ephemeris wrapper (12 planets, navamsa)
    dasha.py                 # Vimshottari Dasha
    geocode.py               # Nominatim geocoding
    gemini.py                # Groq API caller, prompt builder, section parser
  tests/
    test_astro_calc.py
    test_kundli_route.py
    test_reading.py          # 20 tests for reading feature
  .env                       # GROQ_API_KEY (not committed)

frontend/src/
  components/
    BirthForm.jsx            # Date/time/place dropdowns
    KundliChart.jsx          # North Indian SVG chart
    ChartReading.jsx         # AI reading component (4 states)
    DashaTable.jsx
    PlanetTable.jsx
  pages/
    Home.jsx
    Result.jsx               # 5-tab dashboard
  i18n/
    en.json
    hi.json
  api/astro.js               # fetchKundli()
```

---

## Git History

```
e985ecf  feat: AI chart reading via Groq (was Gemini, switched due to API issues)
ff34569  docs: add AI chart reading implementation plan
eb92c40  docs: add AI chart reading feature design spec
376d874  docs: README with setup instructions and Phase 2 roadmap
7b6aa96  feat: API client, Home page, and tabbed Result dashboard
80ba8a3  feat: app shell, KundliChart SVG, DashaTable, PlanetTable, BirthForm components
2b05ea5  chore: Vite + React + Tailwind v3 frontend scaffold with EN/HI i18n
fb7a6b4  feat: POST /api/kundli endpoint
7cc0e63  feat: Vimshottari Dasha service
2975970  feat: astro calculation service
```

> **Note:** Commit `e985ecf` says "Gemini" but the service was switched to **Groq** in-session (not yet committed). `backend/services/gemini.py` uses the Groq REST API.

---

## Uncommitted Changes (as of 2026-05-31)

These changes are done but not yet committed:

| File | Change |
|------|--------|
| `backend/services/gemini.py` | Switched from Gemini to Groq API; added `Chart Overview` section |
| `frontend/src/components/ChartReading.jsx` | Added `Chart Overview` to section order; distinct amber card style |
| `backend/.env` | `GROQ_API_KEY` set (user's key, not committed) |

**Run to commit:**
```bash
cd /home/sushilk/astro
git add backend/services/gemini.py frontend/src/components/ChartReading.jsx
git commit -m "feat: switch AI reading from Gemini to Groq; add Chart Overview section"
```

---

## Potential Next Steps

- [ ] Remove `/api/gemini-models` debug endpoint from `routes/kundli.py`
- [ ] Rebuild frontend for production (`cd frontend && npm run build`)
- [ ] Add more chart types (Divisional charts D-9 already done as Navamsa)
- [ ] Add Yoga detection (Raj Yoga, Dhana Yoga, etc.)
- [ ] Improve Hindi translations in reading prompt
- [ ] Mobile-responsive chart layout
- [ ] Save/share kundli feature
- [ ] Print/PDF export
