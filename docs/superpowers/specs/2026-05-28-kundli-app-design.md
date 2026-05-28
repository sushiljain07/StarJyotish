# Kundli App — Design Spec
**Date:** 2026-05-28  
**Status:** Approved

---

## Overview

A web-based Vedic astrology app where users enter birth date, time, and place to generate a full Kundli report. The v1 scope covers: North Indian Lagna chart, Navamsa (D9) chart, Vimshottari Dasha/Mahadasha table, and a planetary positions table. The UI supports both English and Hindi.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite, Tailwind CSS, `react-i18next` |
| Backend | FastAPI (Python) |
| Astro Engine | `pyswisseph` (Swiss Ephemeris — same engine as AstroSage) |
| Geocoding | OpenStreetMap Nominatim (free, no API key) |
| Structure | Monorepo (`/frontend` + `/backend`) |

---

## Architecture

### Request Flow
```
User fills birth form
  → React → POST /api/kundli
    → FastAPI validates input
    → Nominatim: place name → lat/lon/timezone
    → pyswisseph: calculate planetary positions + houses
    → Dasha service: compute Vimshottari sequence
    → Return JSON response
  → React renders charts + tables
```

### Repository Structure
```
/astro
  /frontend/
    /src/
      /components/
        BirthForm.jsx        # date, time, place inputs
        KundliChart.jsx      # reusable SVG North Indian chart
        DashaTable.jsx       # Mahadasha + Antardasha view
        PlanetTable.jsx      # planets, signs, degrees, nakshatras
        LanguageToggle.jsx   # EN ↔ हि switcher
      /pages/
        Home.jsx             # landing page with birth form
        Result.jsx           # tabbed results dashboard
      /i18n/
        en.json              # English strings
        hi.json              # Hindi strings
      /api/
        astro.js             # fetch wrapper for backend calls
  /backend/
    main.py
    /routes/
      kundli.py              # POST /api/kundli endpoint
    /services/
      astro_calc.py          # pyswisseph calculations
      dasha.py               # Vimshottari dasha computation
      geocode.py             # Nominatim integration
    /models/
      birth_data.py          # Pydantic input model
      chart_data.py          # Pydantic response models
  README.md
```

---

## Frontend Design

### Theme: Light + Saffron
- Background: `#fff8f0`
- Primary accent: `#b5451b` (saffron/rust)
- Secondary: `#d4a853` (gold)
- Borders/cards: `#fff0e0`, `#e8c080`

### Layout: Tabbed Dashboard
1. **Landing page (`/`)** — centered birth form with date picker, time picker, and place autocomplete (Nominatim suggestions as user types)
2. **Results page (`/kundli`)** — 4 tabs:
   - **Birth Chart** — North Indian Lagna chart SVG
   - **Navamsa (D9)** — same SVG component with D9 data
   - **Dasha** — Vimshottari Mahadasha + Antardasha table
   - **Planets** — tabular planetary positions

### Language Toggle
- EN ↔ हि toggle in the header, persisted to `localStorage`
- Translates: planet names, rashi names, nakshatra names, house labels, UI strings

---

## North Indian Kundli Chart (SVG)

### Construction (verified against reference)
The chart is built from 3 layers of lines on a square canvas:
1. **Outer square** — the chart boundary
2. **Two full diagonals** — corner-to-corner (creates the X pattern)
3. **Inner diamond** — connecting midpoints of opposite sides

This creates exactly 12 triangular/rhombus regions.

### House Positions (key points for 300×300 canvas)
- Outer corners: D(10,10), A(290,10), B(290,290), C(10,290)
- Side midpoints: M_top(150,10), M_right(290,150), M_bottom(150,290), M_left(10,150)
- Inner intersections: P1(80,80), P2(220,220), P3(220,80), P4(80,220), Center(150,150)

| House | Shape | Vertices |
|-------|-------|---------|
| 1 | Triangle | D, M_left, P1 |
| 2 | Rhombus | M_left, P1, Center, P4 |
| 3 | Triangle | C, M_left, P4 |
| 4 | Triangle | C, M_bottom, P4 |
| 5 | Rhombus | M_bottom, P4, Center, P2 |
| 6 | Triangle | B, M_bottom, P2 |
| 7 | Triangle | B, M_right, P2 |
| 8 | Rhombus | M_right, P2, Center, P3 |
| 9 | Triangle | A, M_right, P3 |
| 10 | Triangle | A, M_top, P3 |
| 11 | Rhombus | M_top, P3, Center, P1 |
| 12 | Triangle | D, M_top, P1 |

### Reuse
`KundliChart` accepts a `chartData` prop (planets + houses array). The same component renders both D1 (Lagna) and D9 (Navamsa) by passing different data. Planet abbreviations are sourced from i18n strings.

---

## Backend & Calculations

### Endpoint
```
POST /api/kundli
Content-Type: application/json

Body:
{
  "date": "1990-05-15",
  "time": "14:30",
  "place": "New Delhi, India"
}

Response:
{
  "ascendant": { "sign": "Aries", "degree": 14.3, "nakshatra": "Ashwini" },
  "planets": [
    { "name": "Sun", "sign": "Taurus", "degree": 0.8, "house": 2,
      "nakshatra": "Krittika", "nakshatra_pada": 1, "retrograde": false }
    // ... 9 planets total (Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, Ketu)
  ],
  "houses": [
    { "number": 1, "sign": "Aries", "degree": 14.3 }
    // ... 12 houses
  ],
  "navamsa": {
    "ascendant": { "sign": "...", "degree": ... },
    "planets": [ ... ]
  },
  "dasha": {
    "current_mahadasha": { "planet": "Venus", "start": "2019-04-15", "end": "2039-04-15" },
    "current_antardasha": { "planet": "Moon", "start": "2023-06-01", "end": "2025-02-01" },
    "antardashas": [ ... ],
    "full_sequence": [ { "planet": "Sun", "start": "...", "end": "...", "years": 6 }, ... ]
  }
}
```

### Calculation Parameters
- **Ayanamsa:** Lahiri (standard for Vedic/Indian astrology)
- **House system:** Whole sign (most common for North Indian Kundli interpretation)
- **Planets:** Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu (mean node), Ketu (mean node)
- **Dasha system:** Vimshottari (120-year cycle, seed from Moon's nakshatra at birth)

### Geocoding
- Nominatim API: `https://nominatim.openstreetmap.org/search?q={place}&format=json`
- Returns lat/lon; timezone resolved via `timezonefinder` Python library using lat/lon
- Birth datetime converted to UTC before passing to Swiss Ephemeris

---

## Dasha Table Design

### Current Mahadasha card
- Planet name (large), date range, years remaining
- Progress bar showing elapsed portion of the Mahadasha

### Antardasha table
- Columns: Planet, Start, End, Duration, mini progress bar
- Current antardasha highlighted in saffron
- Past periods shown in muted color
- Future periods shown in light color

### Full Mahadasha sequence
- Horizontal pill list of all 9 Mahadashas in birth order
- Current one highlighted; others in muted style

---

## Error Handling

| Scenario | Handling |
|----------|---------|
| Place not found | Show inline error "Place not found, try a city name" |
| Invalid date/time | Client-side validation before API call |
| Backend unreachable | Show error banner with retry button |
| Missing birth time | Warn user that chart accuracy requires exact time |

---

## Bilingual Support (EN / हि)

All user-visible strings are i18n keys. Key translation sets:
- **Planets:** Sun/सूर्य, Moon/चंद्र, Mars/मंगल, Mercury/बुध, Jupiter/गुरु, Venus/शुक्र, Saturn/शनि, Rahu/राहु, Ketu/केतु
- **Rashis:** Aries/मेष, Taurus/वृषभ, ... Pisces/मीन
- **Nakshatras:** Ashwini/अश्विनी, ... Revati/रेवती (27 nakshatras)
- **UI labels:** tab names, form labels, button text

---

## Out of Scope (v1)

- Other divisional charts (D2, D3, D7, D10, D12, etc.)
- Yogini / Ashtottari Dasha systems
- Ashtakavarga
- Panchang details
- User accounts / saving charts
- PDF export
- Mobile app
