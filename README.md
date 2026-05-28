# Kundli App

Vedic astrology birth chart web app — Phase 1.

**Features (Phase 1)**
- North Indian Lagna chart (D1) and Navamsa (D9) — SVG rendered
- Vimshottari Dasha / Mahadasha / Antardasha with progress timeline
- Planetary positions table with nakshatra, pada, retrograde
- English / Hindi language toggle
- Place autocomplete via OpenStreetMap Nominatim

**Planned (Phase 2+)**
- Planetary yoga detection and interpretations
- Ashtakavarga strength tables
- More divisional charts (D10 career, D7 children, etc.)
- Birth chart predictions / life event analysis
- PDF export

## Development

**Backend (Python 3.11+):**
```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

**Tests:**
```bash
cd backend && source .venv/bin/activate && pytest tests/ -v
```

## Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS v3, react-i18next |
| Backend | FastAPI, pyswisseph (Swiss Ephemeris) |
| Geocoding | OpenStreetMap Nominatim — no API key needed |
| Ayanamsa | Lahiri |
| House system | Whole sign |
