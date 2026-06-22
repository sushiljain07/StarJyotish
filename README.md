# <img src="frontend/public/astroguru.svg" width="24" height="24" alt="" valign="middle" /> AstroGuru — Vedic Astrology

A Vedic birth chart (Kundli) web application powered by Swiss Ephemeris, with AI-generated readings and a dedicated Vedic career-analysis report. Stateless — no database, authentication, or payments yet (see [Roadmap](#roadmap)).

## Features

**Charts & calculations**
- **North Indian chart style** — SVG rendered, with a KP Chart toggle alongside it
- **Full Shodashvarga** — all 16 divisional charts (D1 Lagna, D9 Navamsa, D10 Dashamsha, …, D60)
- **KP (Krishnamurti Paddhati)** — sub-lord / cuspal-interlink chart
- **Bhava Chalit** chart and **Sarvatobhadra Chakra**
- **Ashtakavarga** — Bhinnashtakavarga + Sarvashtakavarga tables
- **Transit chart** — current planetary positions over the natal chart
- **Vimshottari Dasha** — Mahadasha / Antardasha with progress timeline
- **Rajyoga detection** — special planetary combinations with descriptions
- **Planetary positions** — sign, house, nakshatra, pada, retrograde, dignity

**AI**
- **AI Vedic reading** — Claude (Sonnet) as primary LLM, with automatic fallback to Groq/Llama if no Anthropic key is set or the call fails. Prompts are grounded in a local `astro-skills/` reference library (career, gemstones, marriage, nakshatra, rudraksha, etc.)
- **Ask the Chart** — up to 10 AI-powered Q&A per chart
- **Vedic Career Report** — separate report flow analysing career/business direction from D10, Dasha, and Rajyoga data, in English or Hindi

**Other**
- **English / Hindi** language toggle
- **Download as PDF** — print-to-PDF of the chart summary
- **Responsive design** — desktop browser + mobile bottom nav
- **Place autocomplete** via OpenStreetMap Nominatim (no API key needed)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite 5, Tailwind CSS 3, react-i18next, react-router-dom |
| Backend | FastAPI, pyswisseph (Swiss Ephemeris) |
| AI / LLM | Claude (`claude-sonnet-4-6`) primary, Groq (`llama-3.3-70b-versatile`) fallback |
| Geocoding | OpenStreetMap Nominatim — free, no key needed |
| Ayanamsa | Lahiri |
| House system | Whole sign (KP module additionally computes sub-lords on the same base chart) |

---

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Python | 3.11+ | https://python.org |
| Node.js | 18+ | https://nodejs.org |
| npm | 9+ | comes with Node.js |
| Git | any | https://git-scm.com |

For the AI features (Reading, Ask, Career Report) you need at least one of:
- **Anthropic API key** (primary) — https://console.anthropic.com
- **Groq API key** (fallback, free) — https://console.groq.com

---

## Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/sushiljain07/AstroGuru.git
cd AstroGuru
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
# Open .env and add your Anthropic and/or Groq API key
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

Open **http://localhost:5173** in your browser. The dev server proxies `/api` to `http://localhost:8000` automatically (see `vite.config.js`) — no frontend env var needed for local development.

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENROUTER_API_KEY` | Recommended | Primary LLM (Claude Sonnet 4.6 via OpenRouter) for Reading, Ask, and Career Report. Takes priority over `ANTHROPIC_API_KEY` if both are set |
| `ANTHROPIC_API_KEY` | Optional | Used in place of OpenRouter if `OPENROUTER_API_KEY` is unset — calls Claude directly via Anthropic's API |
| `GROQ_API_KEY` | Optional | Fallback LLM, used if neither of the above is set or Claude errors |
| `FRONTEND_URL` | Production only | Deployed frontend origin, added to the CORS allow-list |

Charts, divisional charts, Dasha, Ashtakavarga, KP, and planet tables work with **no API key at all** — only Reading, Ask, and Career Report need an LLM key.

### Frontend (build-time)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | Production only | Backend base URL, e.g. `https://your-backend.up.railway.app`. Leave unset for local dev (uses the Vite proxy instead) |

---

## Running Tests

```bash
cd backend
source .venv/bin/activate   # if not already active
pytest tests/ -v
```

Most tests pass without any API key configured. A handful of AI-dependent tests in `test_ask.py` require a working `GROQ_API_KEY`/`ANTHROPIC_API_KEY` to pass, and a few in `test_reading.py` are currently out of sync with the reading response shape — worth a look before relying on `pytest tests/` as a full regression gate.

---

## Project Structure

```
astro/
├── backend/
│   ├── main.py                    # FastAPI app entry point, CORS, router mounting
│   ├── Dockerfile                 # for Railway/container deploys (pyswisseph needs a C compiler)
│   ├── routes/
│   │   └── kundli.py              # /api/kundli, /reading, /ask, /ashtakavarga,
│   │                               #   /transit, /bhava-chalit, /kp, /divisional
│   ├── routers/
│   │   ├── career_report.py       # /api/career-report
│   │   └── rajyogas.py            # /api/rajyogas
│   ├── services/
│   │   ├── astro_calc.py          # Swiss Ephemeris chart calculation (Lahiri, whole-sign)
│   │   ├── divisional_charts.py   # D1–D60 divisional chart calculation
│   │   ├── dasha.py               # Vimshottari Dasha calculation
│   │   ├── ashtakavarga.py        # Ashtakavarga calculation
│   │   ├── kp_system.py           # KP sub-lord / cuspal-interlink calculation
│   │   ├── transit_calc.py        # Current transit calculation
│   │   ├── career_analysis.py     # Vedic career report analysis
│   │   ├── geocode.py             # Place → lat/lon/timezone via Nominatim
│   │   ├── skill_loader.py        # Loads astro-skills/ reference files into prompts
│   │   └── ai.py                  # Claude (primary) / Groq (fallback) LLM integration
│   ├── models/                    # birth_data.py, career_models.py, chart_data.py
│   ├── tests/                     # pytest suite
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx                # routes: / , /kundli , /career-report
│   │   ├── pages/
│   │   │   ├── Home.jsx           # birth details input
│   │   │   ├── Result.jsx         # chart results, tab navigation
│   │   │   └── CareerReport.jsx   # standalone career report flow
│   │   ├── components/
│   │   │   ├── KundliChart.jsx                         # North Indian SVG chart renderer
│   │   │   ├── DivisionalCharts.jsx                     # all 16 divisional charts (D1–D60)
│   │   │   ├── KPChart.jsx, BhavaChality.jsx, SarvatobhadraChakra.jsx
│   │   │   ├── AshtakavargaTable.jsx, TransitPanel.jsx, DashaTable.jsx, PlanetTable.jsx
│   │   │   ├── RajyogasTab.jsx, CareerReportTab.jsx
│   │   │   ├── ChartReading.jsx, AskChart.jsx           # AI reading + Q&A
│   │   │   ├── KundliDownload.jsx                       # print-to-PDF summary
│   │   │   ├── BirthForm.jsx, NavBar.jsx, LanguageToggle.jsx
│   │   ├── api/
│   │   │   ├── astro.js           # API client
│   │   │   └── config.js          # API_BASE, reads VITE_API_URL
│   │   └── i18n/                  # i18next setup, en.json, hi.json
│   ├── public/astroguru.svg       # app icon / favicon
│   ├── package.json
│   └── vite.config.js             # dev proxy: /api → localhost:8000
│
└── astro-skills/                  # reference library (career, gemstones, marriage,
                                    #   nakshatra, rudraksha, etc.) loaded into AI prompts
```

---

## Deployment

The app deploys as two independent pieces — see `backend/Dockerfile` and `frontend/src/api/config.js`:

- **Backend → Railway** (or any Docker host). Set the service root directory to `backend`; it has its own `Dockerfile` since `pyswisseph` compiles from source and needs a C toolchain. Set `OPENROUTER_API_KEY` (or `ANTHROPIC_API_KEY`) / `GROQ_API_KEY` and, once the frontend is deployed, `FRONTEND_URL` for CORS.
- **Frontend → Vercel** (or any static host). Set the root directory to `frontend`, build command `npm run build`, output `dist`. Set `VITE_API_URL` to the backend's public URL.

Locally, both pieces talk to each other automatically via the Vite dev proxy — no env vars needed.

---

## Roadmap

- Mobile layout fixes for components still using fixed pixel widths (`DivisionalCharts.jsx`, `TransitPanel.jsx`, `Result.jsx`, `KundliDownload.jsx`)
- Postgres persistence + OTP login (currently fully stateless)
- Razorpay payments
- WhatsApp intake via Meta Cloud API
- Server-side PDF generation (current PDF export is browser print-to-PDF only)

---

## License

No license file is currently included in this repository — treat as proprietary/all-rights-reserved until one is added.
