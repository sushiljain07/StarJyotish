# <img src="frontend/public/starjyotish.svg" width="24" height="24" alt="" valign="middle" /> Star Jyotish — Ancient Wisdom. AI Intelligence.

A Vedic birth chart (Kundli) web application powered by Swiss Ephemeris, with AI-generated readings and a dedicated Vedic career-analysis report. The persistence layer (Postgres + SQLAlchemy + Alembic) and phone/OTP + Google login are in place; Razorpay payments are still pending (see [Roadmap](#roadmap)). Every chart/report endpoint still works with zero database configured, exactly as before.

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
| Persistence | PostgreSQL, SQLAlchemy 2.x, Alembic — optional, see [Database setup](#3-database-setup-optional) |
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
git clone https://github.com/sushiljain07/StarJyotish.git
cd StarJyotish
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

### 3. Database setup (optional)

Every chart/report endpoint works with no database configured — skip this
section entirely for plain local development. Set it up when you want
saved birth profiles, report history, or to work on the astrologer
marketplace / payments tables (`backend/db/`).

```bash
cd backend

# Point DATABASE_URL at a Postgres instance (see backend/.env.example for
# the exact line to add — a local install, Docker, or a Railway add-on
# all work the same way).

# Apply all migrations
alembic upgrade head

# Seed default app_settings (paywall flag, pricing, etc.) — and optionally
# a sample verified astrologer + client user for local development
python -m db.seed --with-dev-data
```

Schema changes go through Alembic, not `Base.metadata.create_all()`:
```bash
# After changing/adding a model in backend/db/models/
alembic revision --autogenerate -m "describe the change"
alembic upgrade head
```

See `backend/db/README.md` for the full layout (models, repositories,
session handling) and the design notes behind it.

### 4. Frontend setup

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
| `DATABASE_URL` | Optional | Postgres connection string for `backend/db/` + Alembic. Every chart/report endpoint works with this unset |
| `JWT_SECRET_KEY` | Required for login | Signs access tokens (`services/jwt_service.py`). Generate with `python -c "import secrets; print(secrets.token_urlsafe(64))"` |
| `OTP_HASH_SECRET` | Required for login | HMAC key for hashing OTP codes at rest (`db/repositories/otp_repository.py`) — generate the same way as `JWT_SECRET_KEY`, with a different value |
| `COOKIE_SECURE` | Local dev only | Set to `false` for local HTTP dev — browsers refuse to send a `Secure` cookie over plain `http://`, which would otherwise break the refresh-token cookie entirely on localhost. Leave unset (defaults to `true`) in any real deployment |
| `MSG91_AUTH_KEY` + `MSG91_TEMPLATE_ID` | Optional | Sends OTP SMS via MSG91 (`services/otp_provider.py`). Preferred over 2Factor if both are set |
| `TWOFACTOR_API_KEY` | Optional | Sends OTP SMS via 2Factor instead of MSG91 |
| `OTP_PROVIDER` | Optional | Set to `2factor` to force 2Factor even when an MSG91 key is also present |
| `GOOGLE_CLIENT_ID` | Required for Google login | Same OAuth Client ID as the frontend's `VITE_GOOGLE_CLIENT_ID` — verifies that Google ID tokens were actually issued for this app |

With no OTP provider key set, `/api/auth/otp/send` logs the code to the server console instead of sending an SMS — OTP login is fully testable locally with zero SMS spend.

Charts, divisional charts, Dasha, Ashtakavarga, KP, and planet tables work with **no API key at all** — only Reading, Ask, and Career Report need an LLM key.

### Frontend (build-time)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | Production only | Backend base URL, e.g. `https://your-backend.up.railway.app`. Leave unset for local dev (uses the Vite proxy instead) |
| `VITE_GOOGLE_CLIENT_ID` | Required for Google login | Same OAuth Client ID as the backend's `GOOGLE_CLIENT_ID`. The button still renders without it, but Google will reject the sign-in |
| `VITE_LOGIN_REQUIRED` | Optional | Set to `true` to force login before generating a chart (`config/auth.js`). Defaults to `false` — today's open flow — if unset |

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
│   ├── main.py                    # FastAPI app entry point, CORS, router mounting, /health + /health/db
│   ├── Dockerfile                 # for Railway/container deploys (pyswisseph needs a C compiler)
│   ├── alembic.ini, alembic/      # migrations — env.py reads DATABASE_URL; versions/0001_initial_schema.py, 0002_add_audit_feedback_chat.py
│   ├── db/                        # persistence layer — see db/README.md
│   │   ├── base.py, mixins.py, session.py
│   │   ├── models/                # User, BirthProfile, Report, AstrologerProfile, Booking,
│   │   │                           #   Transaction, Purchase, Notification, UserSession, Wallet,
│   │   │                           #   WalletLedgerEntry, Review, AppSetting, AuditLog, Feedback,
│   │   │                           #   ChatSession, ChatMessage
│   │   ├── repositories/           # one repository per model, e.g. UserRepository, WalletRepository
│   │   └── seed.py                # `python -m db.seed [--with-dev-data]`
│   ├── routes/
│   │   └── kundli.py              # /api/kundli, /reading, /ask, /ashtakavarga,
│   │                               #   /transit, /bhava-chalit, /kp, /divisional
│   ├── routers/
│   │   ├── career_report.py       # /api/career-report
│   │   ├── rajyogas.py            # /api/rajyogas
│   │   ├── topic_reports.py       # /api/relationship-report, /api/wealth-report
│   │   └── account.py             # /api/settings/public, /api/account/birth-profiles/{phone},
│   │                               #   /api/account/reports/{phone} — reads from db/
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
│   │   ├── persistence.py         # best-effort report-saving hook used by the routes above
│   │   └── ai.py                  # Claude (primary) / Groq (fallback) LLM integration
│   ├── models/                    # birth_data.py, career_models.py, chart_data.py, account_models.py
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
│   ├── public/starjyotish.svg       # app icon / favicon
│   ├── package.json
│   └── vite.config.js             # dev proxy: /api → localhost:8000
│
└── astro-skills/                  # reference library (career, gemstones, marriage,
                                    #   nakshatra, rudraksha, etc.) loaded into AI prompts
```

---

## Deployment

The app deploys as two independent pieces — see `backend/Dockerfile` and `frontend/src/api/config.js`:

- **Backend → Railway** (or any Docker host). Set the service root directory to `backend`; it has its own `Dockerfile` since `pyswisseph` compiles from source and needs a C toolchain. Set `OPENROUTER_API_KEY` (or `ANTHROPIC_API_KEY`) / `GROQ_API_KEY` and, once the frontend is deployed, `FRONTEND_URL` for CORS. If using the persistence layer, add a Postgres plugin and set `DATABASE_URL`, then run `alembic upgrade head` once (e.g. via Railway's one-off command runner) before traffic hits the new account/auth endpoints. For login, also set `JWT_SECRET_KEY` and `OTP_HASH_SECRET` (required), plus `GOOGLE_CLIENT_ID` and an OTP SMS provider key (`MSG91_AUTH_KEY`/`MSG91_TEMPLATE_ID` or `TWOFACTOR_API_KEY`) for Google login and real (non-console-logged) OTP delivery.
- **Frontend → Vercel** (or any static host). Set the root directory to `frontend`, build command `npm run build`, output `dist`. Set `VITE_API_URL` to the backend's public URL.

Locally, both pieces talk to each other automatically via the Vite dev proxy — no env vars needed.

---

## Roadmap

- Mobile layout fixes for components still using fixed pixel widths (`DivisionalCharts.jsx`, `TransitPanel.jsx`, `Result.jsx`, `KundliDownload.jsx`)
- ~~Postgres persistence~~ — done (`backend/db/`)
- ~~Phone/OTP + Google login~~ — done (`backend/routers/auth.py`, `frontend/src/contexts/AuthContext.jsx`); `config/auth.js`'s `isLoginRequired()` still defaults to `false` (set `VITE_LOGIN_REQUIRED=true` when ready to require it), and existing chart/report routes still also accept `save_for_phone`/path-param identification rather than requiring a session — wiring those to `Depends(get_current_user)` is a separate follow-up, not done here
- Razorpay payments — `Transaction`/`Purchase`/`Wallet` tables and repositories exist (`backend/db/`); the Razorpay order/webhook integration itself doesn't yet
- WhatsApp intake via Meta Cloud API
- Server-side PDF generation (current PDF export is browser print-to-PDF only)
- Wire the frontend's `config/entitlements.js` and `config/auth.js` stubs to the new `/api/settings/public` endpoint instead of their hardcoded values
- Wire `routes/kundli.py`'s `ask_kundli()` to `ChatSession`/`ChatMessage` (`backend/db/`) so "Ask the Chart" becomes a threaded conversation instead of independent Q&As — the tables/repository exist, the route isn't using them yet

---

## License

No license file is currently included in this repository — treat as proprietary/all-rights-reserved until one is added.
