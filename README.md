# <img src="frontend/public/starjyotish.svg" width="24" height="24" alt="" valign="middle" /> Star Jyotish — Ancient Wisdom. AI Intelligence.

A Vedic birth chart (Kundli) web application powered by Swiss Ephemeris, with AI-generated readings and dedicated Vedic report flows for Career, Relationship, and Wealth. The persistence layer (PostgreSQL + SQLAlchemy + Alembic), phone OTP + Google OAuth authentication, security headers, error monitoring (Sentry), and CI/CD (GitHub Actions) are all in place. Razorpay payments are the primary remaining blocker — pending company registration.

**Live:** [starjyotish.com](https://starjyotish.com)

---

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
- **AI Vedic reading** — Claude (Sonnet via OpenRouter) as primary LLM, automatic fallback to Groq/Llama. Prompts grounded in a local `astro-skills/` reference library (career, gemstones, marriage, nakshatra, rudraksha, houses, planets, numerology, children — ~1.1 MB of structured reference material)
- **Ask the Chart** — up to 10 AI-powered Q&A per chart session
- **Vedic Career Report** — D10 Dashamsha + Dasha + Rajyoga analysis, English or Hindi
- **Relationship Report** — D9 Navamsa analysis
- **Wealth Report** — D2 Hora + D10 analysis

**Account & auth**
- **Phone OTP login** — SMS via MSG91 or 2Factor (console-logs OTP locally without a provider key)
- **Google OAuth** — one-tap sign-in
- **JWT + rotating refresh tokens** — httpOnly cookies, session revocation, multi-device support
- **User profile** — name, avatar (canvas-compressed upload), birth details

**Pages & legal**
- Landing, Generate, Result, Career Report, Login, Account/Profile
- Privacy Policy, Terms of Use, Refund Policy, Disclaimer, About, FAQ, Contact
- 404 Not Found page
- React ErrorBoundary — styled fallback instead of blank-screen crashes

**Other**
- **English / Hindi** language toggle throughout, including AI output
- **Download as PDF** — browser print-to-PDF of the chart summary
- **Responsive design** — desktop top-nav + mobile bottom nav; all chart components (`DivisionalCharts`, `TransitPanel`, `Result`, `KundliDownload`) use `w-full` on mobile with breakpoint-constrained widths on desktop
- **Place autocomplete** via OpenStreetMap Nominatim (no API key needed)
- **SEO** — react-helmet-async per-page meta, JSON-LD Organization/WebSite schema, FAQ schema, sitemap.xml generated at build time, robots.txt
- **Security headers** — CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Permissions-Policy on both backend (FastAPI middleware) and frontend (Vercel headers)
- **Error monitoring** — Sentry wired in backend and frontend, opt-in via env var
- **Rate limiting** — tiered slowapi limits (5/min OTP send, 10/min LLM endpoints, 30/min compute)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite 5, Tailwind CSS 3, react-i18next, react-router-dom 7, react-helmet-async |
| Backend | FastAPI, pyswisseph (Swiss Ephemeris), slowapi |
| Persistence | PostgreSQL, SQLAlchemy 2.x, Alembic (6 migrations, 16 models) |
| Auth | Phone OTP + Google OAuth, JWT (PyJWT), httpOnly refresh-token cookies |
| AI / LLM | Claude (`claude-sonnet-4-6`) via OpenRouter (primary), Groq (`llama-3.3-70b-versatile`) fallback, direct Anthropic API optional |
| Monitoring | Sentry (backend `sentry-sdk[fastapi]`, frontend `@sentry/react`) — opt-in via `SENTRY_DSN` |
| Geocoding | OpenStreetMap Nominatim — free, no key needed |
| Ayanamsa | Lahiri |
| House system | Whole sign (KP module additionally computes sub-lords on the same base chart) |
| CI/CD | GitHub Actions — pytest (with Postgres service) + eslint + Vite build on every push/PR |
| Hosting | Backend → Railway (Docker), Frontend → Vercel |

---

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Python | 3.11+ | https://python.org |
| Node.js | 18+ | https://nodejs.org |
| npm | 9+ | comes with Node.js |
| Git | any | https://git-scm.com |

For the AI features (Reading, Ask, Career/Relationship/Wealth Reports) you need at least one of:
- **OpenRouter API key** (recommended) — https://openrouter.ai — routes to Claude Sonnet 4.6
- **Anthropic API key** (alternative) — https://console.anthropic.com
- **Groq API key** (fallback, free) — https://console.groq.com

Charts, Dasha, KP, Ashtakavarga, Rajyogas, and planet tables work with **no API key at all**.

---

## Quick Start

### 1. Clone

```bash
git clone https://github.com/sushiljain07/StarJyotish.git
cd StarJyotish
```

### 2. Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate        # macOS / Linux
# .venv\Scripts\activate         # Windows

pip install -r requirements.txt

cp .env.example .env
# Edit .env — at minimum add one LLM key (OPENROUTER_API_KEY or GROQ_API_KEY)
```

Start:
```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

API: **http://localhost:8000** · Interactive docs: **http://localhost:8000/docs**

### 3. Database (optional for chart features, required for auth/accounts)

Every chart/report endpoint works with no database — skip for plain local dev. Required for saved profiles, auth, and the account system.

```bash
# Requires a running Postgres instance (local install, Docker, or Railway plugin)
# Add DATABASE_URL to backend/.env first

alembic upgrade head

# Seed dev data (sample user, app settings)
python -m db.seed --with-dev-data
```

Schema changes via Alembic:
```bash
alembic revision --autogenerate -m "describe the change"
alembic upgrade head
```

See `backend/db/README.md` for the full model/repository layout.

### 4. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173** — the dev server proxies `/api` to `http://localhost:8000` automatically.

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENROUTER_API_KEY` | Recommended | Primary LLM (Claude Sonnet 4.6 via OpenRouter). Takes priority over `ANTHROPIC_API_KEY` |
| `ANTHROPIC_API_KEY` | Optional | Direct Anthropic API — used if `OPENROUTER_API_KEY` is unset |
| `GROQ_API_KEY` | Optional | Fallback LLM if neither above is set or Claude errors |
| `FRONTEND_URL` | Production | Deployed frontend origin(s), comma-separated, added to CORS allow-list |
| `DATABASE_URL` | Optional | Postgres connection string. Every chart endpoint works without it |
| `JWT_SECRET_KEY` | Required for login | Signs access tokens. Generate: `python -c "import secrets; print(secrets.token_urlsafe(64))"` |
| `OTP_HASH_SECRET` | Required for login | HMAC key for OTP hashing — generate the same way, different value |
| `COOKIE_SECURE` | Local dev | Set to `false` for `http://localhost` — leave unset in production |
| `MSG91_AUTH_KEY` + `MSG91_TEMPLATE_ID` | Optional | SMS OTP via MSG91 (preferred if both set) |
| `TWOFACTOR_API_KEY` | Optional | SMS OTP via 2Factor |
| `OTP_PROVIDER` | Optional | Set to `2factor` to force 2Factor when both SMS keys are present |
| `GOOGLE_CLIENT_ID` | Required for Google login | OAuth Client ID from Google Cloud Console |
| `SENTRY_DSN` | Optional | Sentry error monitoring. No-op if unset. Get from sentry.io → Python/FastAPI project |
| `SENTRY_ENVIRONMENT` | Optional | Defaults to `production`. Set to `staging` for a staging environment |

Without an OTP SMS key, `/api/auth/otp/send` logs the code to the server console — fully testable locally at zero cost.

### Frontend (build-time, `frontend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | Production | Backend URL, e.g. `https://your-backend.up.railway.app`. Unset for local dev (Vite proxy handles it) |
| `VITE_GOOGLE_CLIENT_ID` | Required for Google login | Same OAuth Client ID as backend's `GOOGLE_CLIENT_ID` |
| `VITE_LOGIN_REQUIRED` | Optional | Set to `true` to require login before generating a chart. Defaults to `false` |
| `VITE_SENTRY_DSN` | Optional | Sentry error monitoring (frontend). No-op if unset. Get from sentry.io → React project |

---

## Running Tests

```bash
cd backend
source .venv/bin/activate
pytest tests/ -v
```

**78 tests total: 48 pass without any config, 30 skip without `DATABASE_URL`** (auth + DB repository tests — they self-skip rather than fail when Postgres isn't configured).

To run the full suite including DB tests:
```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/starjyotish_test \
JWT_SECRET_KEY=any-non-empty-string \
OTP_HASH_SECRET=any-other-non-empty-string \
alembic upgrade head && pytest tests/ -v
# Result: 78 passed, 0 failed
```

AI-dependent tests (`test_ask.py`) skip automatically without a live API key — expected.

CI runs the full 78-test suite on every push via `.github/workflows/ci.yml`.

---

## Project Structure

```
StarJyotish/
├── .github/
│   └── workflows/
│       └── ci.yml                 # pytest (with Postgres) + eslint + vite build on push/PR
│
├── backend/
│   ├── main.py                    # FastAPI app, CORS, middleware mounting, /health + /health/db
│   ├── Dockerfile                 # Railway/Docker deploy (pyswisseph needs a C compiler)
│   ├── alembic.ini                # Alembic config
│   ├── alembic/versions/          # 6 migrations: 0001 initial schema → 0006 widen avatar_url
│   ├── db/                        # Persistence layer — see backend/db/README.md
│   │   ├── models/                # 16 SQLAlchemy models:
│   │   │                          #   User, BirthProfile, Report, AstrologerProfile, Booking,
│   │   │                          #   Transaction, Purchase, Wallet, WalletLedgerEntry,
│   │   │                          #   Review, AppSetting, AuditLog, Feedback,
│   │   │                          #   ChatSession, ChatMessage, OtpCode
│   │   ├── repositories/          # One repository per model (UserRepository, WalletRepository…)
│   │   ├── session.py             # get_db / get_db_optional FastAPI dependencies
│   │   └── seed.py                # python -m db.seed [--with-dev-data]
│   ├── routes/
│   │   └── kundli.py              # /api/kundli, /reading, /ask, /ashtakavarga,
│   │                              #   /transit, /bhava-chalit, /kp, /divisional
│   ├── routers/
│   │   ├── auth.py                # /api/auth/otp/send|verify, /google, /refresh, /logout,
│   │   │                          #   /me, /sessions
│   │   ├── account.py             # /api/account/birth-profiles, /reports, /settings/public
│   │   ├── career_report.py       # /api/career-report
│   │   ├── rajyogas.py            # /api/rajyogas
│   │   └── topic_reports.py       # /api/relationship-report, /api/wealth-report
│   ├── services/
│   │   ├── astro_calc.py          # Swiss Ephemeris chart calculation (Lahiri, whole-sign)
│   │   ├── divisional_charts.py   # D1–D60 divisional chart calculation
│   │   ├── dasha.py               # Vimshottari Dasha calculation
│   │   ├── ashtakavarga.py        # Ashtakavarga calculation
│   │   ├── kp_system.py           # KP sub-lord / cuspal-interlink calculation
│   │   ├── transit_calc.py        # Current transit calculation
│   │   ├── career_analysis.py     # Career report prompt + analysis
│   │   ├── relationship_analysis.py # Relationship report prompt + analysis
│   │   ├── wealth_analysis.py     # Wealth report prompt + analysis
│   │   ├── ai.py                  # Claude (primary) / Groq (fallback) LLM integration
│   │   ├── skill_loader.py        # Loads astro-skills/ reference files into prompts
│   │   ├── geocode.py             # Place → lat/lon/timezone via Nominatim (lru_cache)
│   │   ├── jwt_service.py         # JWT sign/verify
│   │   ├── otp_provider.py        # MSG91 / 2Factor / console-log fallback
│   │   ├── google_oauth.py        # Google ID token verification
│   │   ├── persistence.py         # Best-effort report-save hook (never fails the request)
│   │   ├── rate_limit.py          # Shared slowapi limiter + limit constants
│   │   ├── security_headers.py    # ASGI middleware: CSP, HSTS, nosniff, frame-options
│   │   └── monitoring.py          # Sentry init (no-op if SENTRY_DSN unset)
│   ├── models/                    # Pydantic request/response models
│   │   ├── birth_data.py
│   │   ├── chart_data.py          # ReadingRequest/Response, AskRequest/Response, etc.
│   │   ├── career_models.py
│   │   └── account_models.py
│   ├── dependencies.py            # get_current_user, require_role FastAPI dependencies
│   ├── tests/                     # 78-test pytest suite
│   │   ├── test_astro_calc.py
│   │   ├── test_dasha.py
│   │   ├── test_geocode.py
│   │   ├── test_kundli_route.py
│   │   ├── test_reading.py
│   │   ├── test_ask.py
│   │   ├── test_auth.py           # skips without DATABASE_URL
│   │   └── test_db_repositories.py # skips without DATABASE_URL
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx                # Routes: / /generate /kundli /career-report /login
│   │   │                          #   /account /disclaimer /privacy /terms /refund-policy
│   │   │                          #   /about /faq /contact + catch-all 404
│   │   ├── main.jsx               # React root: SentryErrorBoundary → HelmetProvider → App
│   │   ├── monitoring.js          # Sentry init (no-op if VITE_SENTRY_DSN unset)
│   │   ├── pages/
│   │   │   ├── Landing.jsx        # Marketing landing page
│   │   │   ├── Home.jsx           # Birth details input form
│   │   │   ├── Result.jsx         # Chart results, tab navigation
│   │   │   ├── CareerReport.jsx   # Standalone career report flow
│   │   │   ├── Login.jsx          # Phone OTP + Google login
│   │   │   ├── Profile.jsx        # Account settings + avatar
│   │   │   ├── NotFound.jsx       # 404 catch-all (noindexed)
│   │   │   ├── AboutUs.jsx
│   │   │   ├── ContactUs.jsx
│   │   │   ├── FAQ.jsx
│   │   │   ├── Disclaimer.jsx
│   │   │   ├── PrivacyPolicy.jsx
│   │   │   ├── TermsOfUse.jsx
│   │   │   └── RefundPolicy.jsx
│   │   ├── components/
│   │   │   ├── KundliChart.jsx    # North Indian SVG chart renderer
│   │   │   ├── DivisionalCharts.jsx # All 16 divisional charts (D1–D60)
│   │   │   ├── KPChart.jsx, BhavaChalit.jsx, SarvatobhadraChakra.jsx
│   │   │   ├── AshtakavargaTable.jsx, TransitPanel.jsx, DashaTable.jsx, PlanetTable.jsx
│   │   │   ├── RajyogasTab.jsx, CareerReportTab.jsx, TopicReportTab.jsx
│   │   │   ├── ChartReading.jsx, AskChart.jsx     # AI reading + Q&A
│   │   │   ├── KundliDownload.jsx                 # Print-to-PDF
│   │   │   ├── ErrorFallback.jsx                  # ErrorBoundary fallback UI
│   │   │   ├── Seo.jsx                            # react-helmet-async per-page tags
│   │   │   ├── ProtectedRoute.jsx                 # Redirects unauthenticated users
│   │   │   ├── auth/                              # PhoneOtpForm, GoogleLoginButton, etc.
│   │   │   └── …                                  # NavBar, Footer, BirthForm, PaywallCard, etc.
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx    # JWT auth state, token refresh, login/logout
│   │   ├── config/
│   │   │   ├── auth.js            # isLoginRequired() — reads VITE_LOGIN_REQUIRED
│   │   │   └── entitlements.js    # hasPremiumAccess() — currently returns true (pre-payment)
│   │   ├── api/
│   │   │   ├── astro.js           # API client (all chart/report calls)
│   │   │   └── config.js          # API_BASE from VITE_API_URL
│   │   └── i18n/                  # i18next setup, en.json, hi.json
│   ├── public/
│   │   ├── starjyotish.svg        # App icon / favicon
│   │   ├── icon-192.png, icon-512.png  # PWA manifest icons
│   │   ├── manifest.json          # PWA manifest
│   │   ├── robots.txt             # Allow all, Sitemap: reference
│   │   └── sitemap.xml            # Auto-generated at build time (npm run sitemap)
│   ├── scripts/
│   │   └── generate-sitemap.js    # Sitemap generator (runs as part of npm run build)
│   ├── vercel.json                # SPA rewrite + security headers (CSP, HSTS, etc.)
│   ├── package.json
│   └── vite.config.js             # Dev proxy: /api → localhost:8000
│
└── astro-skills/                  # ~1.1 MB reference library loaded into AI prompts
    ├── index.md                   # Skill compatibility cross-reference table
    ├── career/                    # D10 Dashamsha, Career Compass
    ├── gemstones/                 # Navratna, activation rituals, compatibility
    ├── houses/                    # All 12 houses
    ├── marriage/                  # D9 Navamsa, Guna Milan
    ├── nakshatra/                 # All 27 nakshatras
    ├── numerology/                # Vedic numerology (Mulank/Bhagyank)
    ├── planets/                   # All 9 Vedic grahas
    ├── rudraksha/                 # Mukhi recommendations
    ├── children/                  # D7 Saptamsha
    └── vedic-kundli/              # Core Parashari principles
```

---

## Deployment

Two independent services:

**Backend → Railway**
- Service root: `backend/` — the `Dockerfile` handles `pyswisseph`'s C-compile requirement
- Required env vars: `OPENROUTER_API_KEY` (or `ANTHROPIC_API_KEY`), `GROQ_API_KEY`, `FRONTEND_URL`, `DATABASE_URL` (Railway Postgres plugin), `JWT_SECRET_KEY`, `OTP_HASH_SECRET`, `GOOGLE_CLIENT_ID`
- Optional: `MSG91_AUTH_KEY` + `MSG91_TEMPLATE_ID` (or `TWOFACTOR_API_KEY`) for real SMS, `SENTRY_DSN` for error tracking
- First deploy: run `alembic upgrade head` via Railway's one-off command runner before traffic hits auth endpoints

**Frontend → Vercel**
- Root directory: `frontend/`, build command: `npm run build`, output: `dist/`
- Required env vars: `VITE_API_URL` (Railway backend URL), `VITE_GOOGLE_CLIENT_ID`
- Optional: `VITE_SENTRY_DSN` for error tracking

---

## Roadmap

### ✅ Done

- Swiss Ephemeris chart engine (D1–D60, KP, Ashtakavarga, Dasha, Transit, Rajyoga)
- AI reading + Ask the Chart + Career / Relationship / Wealth reports
- PostgreSQL persistence layer (16 models, 6 Alembic migrations, repository pattern)
- Phone OTP + Google OAuth authentication (JWT + rotating refresh tokens)
- User profile + avatar upload
- SEO infrastructure (react-helmet-async, sitemap, JSON-LD, FAQ schema)
- All legal pages (Privacy Policy, Terms, Refund Policy, Disclaimer)
- About, Contact, FAQ standalone pages
- 404 page + React ErrorBoundary
- Security headers (CSP, HSTS, nosniff, frame-options) on both backend and frontend
- Error monitoring (Sentry) — backend + frontend, opt-in via env var
- Rate limiting — tiered per endpoint type
- CI/CD — GitHub Actions (pytest with Postgres + eslint + build on every push/PR)
- English / Hindi bilingual throughout

### 🔜 Next (no blockers — pre-registration work)

- **Wire auth on report routes** — swap `save_for_phone` for `Depends(get_current_user)` or a `get_current_user_optional` middle path
- **Threaded Ask the Chart** — wire `ask_kundli()` to `ChatSession`/`ChatMessage` tables (tables exist, route doesn't use them yet)
- **Frontend test suite** — Vitest + React Testing Library (zero frontend tests currently)
- **Analytics** — GA4 or Plausible (Privacy Policy already says none are running — update both together)
- **Code splitting** — `Result.jsx` bundles all chart components; `React.lazy()` + `Suspense` would cut initial load
- **Redis-backed rate limiting** — in-memory limiter won't survive multiple Railway instances
- **Admin dashboard** — user/report viewer, `AppSetting` toggles (`require_role("admin")` dependency already exists)
- **Server-side PDF generation** — current PDF is browser print-to-PDF only
- **`pytest-cov`** — coverage tooling not yet configured
- **Wire `config/entitlements.js`** to `/api/settings/public` instead of hardcoded values
- **Staging environment** — separate Railway + Vercel environment for pre-production testing

### 🔒 Blocked (require company registration)

- **Razorpay payments** — `Transaction`/`Purchase`/`Wallet` tables exist; Razorpay order/webhook integration pending merchant KYC
- **WhatsApp Business Cloud API** — Meta requires verified business entity
- **DLT-registered SMS** — production sender ID registration under TRAI requires GSTIN
- **GST invoicing** — requires GSTIN
- **Astrologer marketplace** — `AstrologerProfile`/`Booking`/`Review` tables exist; payout logic pending Razorpay Route setup

---

## License

No license file is currently included — treat as proprietary / all-rights-reserved until one is added.
