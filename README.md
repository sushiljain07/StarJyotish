# 🔯 Jyotish — Vedic Astrology

A modern Vedic birth chart (Kundli) web application powered by Swiss Ephemeris and Groq AI.

## Features

- **North Indian Lagna (D1) & Navamsa (D9) charts** — SVG rendered, side-by-side on desktop
- **Vimshottari Dasha** — Mahadasha / Antardasha with progress timeline
- **Planetary positions** — sign, house, nakshatra, pada, retrograde, dignity
- **AI Insights** — personalised Vedic reading powered by Groq (llama-3.3-70b)
- **Ask the Chart** — 2 Groq-powered questions per chart
- **English / Hindi** language toggle
- **Responsive design** — desktop browser + mobile-ready (bottom nav)
- **Place autocomplete** via OpenStreetMap Nominatim (no API key needed)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite 5, Tailwind CSS 3, react-i18next |
| Backend | FastAPI, pyswisseph (Swiss Ephemeris) |
| AI / LLM | Groq REST API (`llama-3.3-70b-versatile`) |
| Geocoding | OpenStreetMap Nominatim — free, no key needed |
| Ayanamsa | Lahiri |
| House system | Whole sign |

---

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Python | 3.11+ | https://python.org |
| Node.js | 18+ | https://nodejs.org |
| npm | 9+ | comes with Node.js |
| Git | any | https://git-scm.com |

You also need a **free Groq API key** for the AI features:
👉 https://console.groq.com → Sign up → API Keys → Create key

---

## Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/astro.git
cd astro
```

### 2. Backend setup

```bash
cd backend

# Create and activate a virtual environment
python3 -m venv .venv
source .venv/bin/activate        # macOS / Linux
# .venv\Scripts\activate         # Windows

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Open .env in your editor and add your Groq API key
```

Edit `backend/.env`:
```
GROQ_API_KEY=gsk_your_key_here
```

Start the backend:
```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

The API will be available at **http://localhost:8000**  
Interactive docs: **http://localhost:8000/docs**

### 3. Frontend setup

Open a **new terminal**:

```bash
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GROQ_API_KEY` | Yes (for AI features) | Groq API key from https://console.groq.com |

The app works without a Groq key — charts, dashas, and planet tables are fully functional. Only the **Insights** and **Ask** tabs require the key.

---

## Running Tests

```bash
cd backend
source .venv/bin/activate   # if not already active
pytest tests/ -v
```

Expected: all tests pass.

---

## Project Structure

```
astro/
├── backend/
│   ├── main.py              # FastAPI app entry point
│   ├── routes/
│   │   └── kundli.py        # API routes (/api/kundli, /reading, /ask)
│   ├── services/
│   │   ├── astro_calc.py    # Swiss Ephemeris chart calculation
│   │   ├── dasha.py         # Vimshottari Dasha calculation
│   │   ├── geocode.py       # Place → lat/lon/timezone via Nominatim
│   │   └── ai.py            # Groq LLM integration (insights + ask)
│   ├── models/
│   │   ├── birth_data.py    # Input models
│   │   └── chart_data.py    # Response models
│   ├── tests/               # pytest test suite
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── Home.jsx     # Birth details input form
    │   │   └── Result.jsx   # Chart results with tab navigation
    │   ├── components/
    │   │   ├── KundliChart.jsx   # SVG North Indian chart renderer
    │   │   ├── DashaTable.jsx    # Mahadasha / Antardasha table
    │   │   ├── PlanetTable.jsx   # Planetary positions table
    │   │   ├── ChartReading.jsx  # AI insights display
    │   │   ├── AskChart.jsx      # 2-question AI chat
    │   │   └── NavBar.jsx        # Responsive navigation
    │   ├── i18n/
    │   │   ├── en.json      # English translations
    │   │   └── hi.json      # Hindi translations
    │   └── api/
    │       └── astro.js     # API client
    ├── package.json
    └── tailwind.config.js
```

---

## Planned Features

- Planetary yoga detection and interpretations
- Ashtakavarga strength tables
- More divisional charts (D10, D7, etc.)
- Configurable LLM provider (Groq / OpenAI / Gemini)
- PDF export
- Saved charts

---

## License

MIT

