# <img src="frontend/public/starjyotish.svg" width="24" height="24" alt="" valign="middle" /> Star Jyotish

**Meet Your Personal AI Vedic Astrologer.**

Star Jyotish combines authentic Vedic astrology calculations (Swiss Ephemeris) with AI-generated insights, providing ongoing guidance rather than one-time predictions.

**Live:** [starjyotish.com](https://starjyotish.com)

---

## Product

### User Journey

```
Landing (/)
  → /generate  (enter birth details)
  → /kundli    (full chart viewer + AI)
  
Sign in (/login)
  → /onboarding (first-time: save chart to account)
  → /home       (personal dashboard with inline chart summary)
  → /kundli     (deep-dive from home page sections)
  → /account    (profile, saved charts, subscription)

Learn (/learn)
  → /learn/zodiac
  → /learn/zodiac/aries  (etc.)
```

### Pages

Source of truth: `frontend/src/App.jsx`.

| Route | Description |
|-------|-------------|
| `/` | Landing — product intro, AI demo, how-it-works (signed-in visitors go to `/home`) |
| `/generate` | Birth details form (date, time, place) |
| `/kundli` | Full chart viewer: Birth Chart, Divisional, Planets, Dasha, Transit, Download, Advanced |
| `/insights` | AI reading, Rajyogas, Career and topic reports for a chart |
| `/ask` | Ask AI — chart-specific Q&A (durable conversation + memory when signed in) |
| `/career-report` | Standalone career report |
| `/panchang` | Today's / monthly Panchang for the current location |
| `/week-ahead` | Seven-day outlook |
| `/home` | Signed-in dashboard: identity, inline chart, planets, dasha timeline, yogas, topic snapshots, Ask AI, Knowledge Center links |
| `/onboarding` | First-time chart setup for signed-in users without a profile |
| `/account` | Profile (name, verified email & mobile, avatar, language), saved astrology profile, sessions |
| `/login` | Phone OTP, email OTP or Google sign-in |
| `/admin` | Admin dashboard (role `admin`) — users, astrologers & KYC, settings, testimonials, audit log |
| `/astrologer` | Astrologer dashboard (role `astrologer`) — overview, bookings, profile |
| `/learn` | Knowledge Center hub; `/learn/zodiac` + one page per sign (`/learn/zodiac/aries` …), `/learn/{nakshatras,planets,houses,dashas,yogas,doshas}`, and article series under `/learn/basics/*`, `/learn/paths/*`, `/learn/career/*`, `/learn/marriage/*` |
| `/blog`, `/blog/:slug` | Blog listing and article |
| `/testimonials` | Testimonials |
| `/pricing`, `/about`, `/faq`, `/contact` | Marketing pages |
| `/privacy`, `/terms`, `/refund-policy`, `/disclaimer` | Legal |

-------|-------------|
| `/` | Landing — product intro, AI demo, how-it-works |
| `/generate` | Birth details form (date, time, place) |
| `/kundli` | Full chart viewer: Birth Chart, Divisional, Planets, Dasha, Transit, Download, Advanced, Insights (AI reading, Rajyogas, Career), Ask AI |
| `/home` | Authenticated dashboard: identity, inline chart, planets grid, dasha timeline, yogas, topic snapshots, Ask AI, Knowledge Center links |
| `/onboarding` | First-time chart setup wizard for authenticated users |
| `/account` | Profile (name, avatar, language), saved astrology profiles, subscription status |
| `/login` | Phone OTP or Google OAuth |
| `/learn` | Knowledge Center hub |
| `/learn/zodiac` | Zodiac signs hub |
| `/learn/zodiac/:sign` | Individual sign guide |
| `/blog` | Blog listing |
| `/blog/:slug` | Blog article |
| `/pricing` | Pricing page |
| `/about` | About Star Jyotish |
| `/faq` | Frequently asked questions |
| `/contact` | Contact form |
| `/privacy` | Privacy Policy |
| `/terms` | Terms of Use |
| `/refund-policy` | Refund Policy |
| `/disclaimer` | Disclaimer |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, Vite 5, Tailwind CSS 3 |
| **Routing** | react-router-dom 7 |
| **i18n** | react-i18next (English + Hindi) |
| **SEO** | react-helmet-async, JSON-LD schema, sitemap.xml |
| **Backend** | FastAPI (Python 3.11 in Docker; 3.12 works locally) |
| **Astrology** | pyswisseph (Swiss Ephemeris C binding) |
| **Database** | PostgreSQL, SQLAlchemy 2.x, Alembic (12 migrations) |
| **Auth** | Phone OTP (MSG91 / 2Factor), email OTP (Resend) + Google OAuth, JWT + rotating httpOnly refresh tokens |
| **AI** | One provider chain (`backend/services/llm.py`): OpenRouter (configurable model, defaults to a free tier) → Claude direct → Groq/Llama |
| **Deployment** | Frontend → Vercel, Backend → Railway |
| **Monitoring** | Sentry (frontend + backend, opt-in via env var) |
| **Security** | CSP, HSTS, X-Frame-Options, slowapi rate limiting |
| **Tests** | pytest (backend), Vitest + React Testing Library (frontend); CI on PRs to `main` and `pre-production` |

---

## Chart Features

- **North Indian chart style** (SVG) with KP toggle
- **Navamsa (D9)** always shown alongside Lagna
- **Full Shodashvarga** — all 16 divisional charts (D1–D60)
- **KP Chart** (Krishnamurti Paddhati sub-lord system)
- **Bhava Chalit** chart
- **Ashtakavarga** (Bhinnashtakavarga + Sarvashtakavarga)
- **Transit chart** — current planets over natal
- **Vimshottari Dasha** — Mahadasha / Antardasha / Pratyantar with progress
- **Rajyoga detection** — 19 classical combinations checked against exact positions
- **Planetary table** — sign, house, nakshatra, pada, retrograde, dignity, exaltation

---

## AI Features

- **AI Reading** — full narrative chart reading (OpenRouter primary, Claude direct then Groq fallback). Prompts grounded in `astro-skills/` reference library (~1.1 MB covering career, gemstones, marriage, nakshatra, houses, planets, numerology, children)
- **Ask AI** — up to 10 chart-specific Q&A per session, with suggested starter questions
- **Career Report** — dedicated D10 + Dasha + Rajyoga analysis (English or Hindi)
- **Topic snapshots** — inline career / relationship / health / wealth derivations on the home dashboard (no extra API call — derived from chart data already fetched)

---

## Authentication & Sessions

- Phone OTP, email OTP or Google OAuth sign-in. Adding/changing an account's email or mobile requires a code sent to the new address; sign-in only links accounts by a *verified* email
- **Access token**: 15-minute JWT, memory-only (never `localStorage`)
- **Refresh token**: 30-day rotating opaque token in an `httpOnly, Secure, SameSite=None` cookie — single-use, theft-detection via revocation replay check (a token rotated <30s ago gets a 409 instead, so two tabs refreshing at once don't log the user out)
- Sessions listed and revocable at `/account`
- No idle-timeout (users stay logged in until they explicitly log out or 30 days of inactivity)

---

## Astrology Profiles (Cross-Device Persistence)

When authenticated, birth profiles are saved to the backend (`POST /api/account/birth-profiles/me`) and retrieved on every device (`GET /api/account/birth-profiles/me`). Chart calculation results are cached in `localStorage` for fast loads; on a cold device the chart is silently re-computed from the stored birth details.

Unauthenticated users' chart data is `localStorage`-only.

---

## Project Structure

```
StarJyotish/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── home/            # PersonalHome sub-components
│   │   │   ├── knowledge/       # Knowledge Center components
│   │   │   ├── auth/            # Login-specific components
│   │   │   ├── SiteHeader.jsx   # Fixed top nav — identical on every page
│   │   │   ├── CompactFooter.jsx # Footer for authenticated pages
│   │   │   ├── Footer.jsx       # Full marketing footer (Landing/Learn/Pricing)
│   │   │   └── ...
│   │   ├── pages/               # One file per route
│   │   ├── config/
│   │   │   ├── homeData.js      # Data helpers for PersonalHome
│   │   │   ├── knowledgeGraph.js # Knowledge Center guide graph
│   │   │   └── topics.js        # Chart topic definitions
│   │   ├── services/
│   │   │   └── astrologyProfiles.js  # Profile create/list with backend sync
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx  # Auth state, access token, authedRequest()
│   │   ├── hooks/               # useScrollProgress, useWindowScrolledPast, etc.
│   │   ├── api/                 # fetch wrappers for each backend endpoint
│   │   └── i18n/
│   │       ├── en.json
│   │       └── hi.json
│   └── public/
│       ├── starjyotish.svg
│       ├── icon-192.png
│       └── icon-512.png
│
├── backend/
│   ├── main.py                  # FastAPI app: middleware, CORS, router registration
│   ├── routers/                 # One module per API area (kundli, auth, account, admin, astrologer, panchang, reports…)
│   ├── services/                # Domain logic: astro_calc, divisional_charts, dasha, panchang, llm (provider chain), ai, report generators…
│   ├── models/                  # Pydantic request/response schemas (API shapes)
│   ├── db/
│   │   ├── models/              # SQLAlchemy tables (User, UserSession, BirthProfile, Report, …) — not the same as models/ above
│   │   └── repositories/        # Data access layer
│   ├── alembic/                 # 12 migrations: 0001_initial_schema → 0012_add_newsletter_subscribers
│   └── tests/                   # pytest; DB tests use TEST_DATABASE_URL (see tests/conftest.py)
│
├── docs/
│   ├── vision/                  # PRODUCT_ARCHITECTURE.md, USER_JOURNEY.md, etc.
│   ├── design/                  # DESIGN_PHILOSOPHY.md
│   └── engineering/             # ENGINEERING_PRINCIPLES.md
│
└── astro-skills/                # Vedic astrology reference library for AI prompts
```

---

## Design System

All design tokens are in `frontend/tailwind.config.js`. Key colours:

| Token | Value | Usage |
|-------|-------|-------|
| `night` | `#171B33` | Header bg, dark section bg |
| `primary` | `#D4A017` (saffron gold) | CTAs, active states |
| `primary-light` | light tint | Selected chips, hover backgrounds |
| `parchment` | `#F8F3E7` | Page background |
| `parchment-card` | slightly darker parchment | Card backgrounds |
| `ink` | dark navy | Body text |
| `ink-muted` | muted navy | Secondary text |
| `ink-faint` | light muted | Tertiary text, labels |
| `ink-onnight` | light cream | Text on dark backgrounds |
| `mauve` | muted purple | Rashi chips |
| `vermillion` | muted red | Mahadasha chips, retrograde |

Typography: **Fraunces** (serif, headings) + **Inter** (sans-serif, body).

---

## Local Development

### Prerequisites
- Node.js 20+, Python 3.12+, PostgreSQL 15+

### Frontend
```bash
cd frontend
npm install
cp .env.example .env          # leave VITE_API_URL unset: Vite proxies /api to localhost:8000
npm run dev                   # http://localhost:3000
npm test                      # Vitest
```

### Backend
```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements-dev.txt   # production pins + pytest/httpx
cp .env.example .env          # see backend/.env.example for every variable
alembic upgrade head
uvicorn main:app --reload     # http://localhost:8000
pytest                        # needs TEST_DATABASE_URL for the DB-backed tests
```

### Environment variables

`backend/.env.example` and `frontend/.env.example` are the complete, commented
lists. The ones you need for a working local setup:

**Backend `.env`:**
```
DATABASE_URL=postgresql://user:pass@localhost:5432/starjyotish_dev
TEST_DATABASE_URL=postgresql://user:pass@localhost:5432/starjyotish_test   # pytest only
JWT_SECRET_KEY=<random, see .env.example>
OTP_HASH_SECRET=<a different random value>
COOKIE_SECURE=false           # local http only; leave unset (true) in production
OTP_DEV_MODE=true             # local only: OTP codes returned in the API response. NEVER in production
OPENROUTER_API_KEY= / ANTHROPIC_API_KEY= / GROQ_API_KEY=   # any one is enough for AI features
GOOGLE_CLIENT_ID=             # Google sign-in
MSG91_AUTH_KEY= or TWOFACTOR_API_KEY=   # SMS OTP (production)
RESEND_API_KEY=               # email OTP, email verification, newsletter (production)
FRONTEND_URL=                 # production CORS origins, e.g. https://starjyotish.com,https://www.starjyotish.com
SENTRY_DSN=                   # optional
```

**Frontend `.env`:**
```
VITE_API_URL=                 # unset locally (dev proxy); https://api.starjyotish.com in production
VITE_GOOGLE_CLIENT_ID=
VITE_SENTRY_DSN=              # optional
```

---

## Deployment

| Service | Platform | Notes |
|---------|----------|-------|
| Frontend | Vercel | `https://starjyotish.com`. CSP in `frontend/vercel.json` only allows API calls to `https://api.starjyotish.com` |
| Backend | Railway (Docker, `backend/Dockerfile`) | `https://api.starjyotish.com`. Migrations are **not** run on deploy: run `alembic upgrade head` after deploying a change that adds one |
| Database | Railway PostgreSQL | |
| CI | GitHub Actions (`.github/workflows/ci.yml`) | Backend pytest against Postgres; frontend lint, Vitest, build — on pushes/PRs to `main` and `pre-production` |

---------|----------|---------|
| Frontend | Vercel | Push to `main` (GitHub Actions) |
| Backend | Railway | Push to `main` (GitHub Actions) |
| Database | Railway PostgreSQL | Persistent, Alembic migrated on deploy |

---

## Remaining Work - will keep updating this list as we go

- **Payments** — Razorpay integration pending company registration + GST
- **Reading history tracking** — `GET /api/account/reports/me` exists (reports saved with `save_report: true`); the frontend doesn't send `save_report` or show history yet
- **Idle timeout** — no inactivity logout yet; straightforward to add via `useIdleLogout` hook in `AuthContext.jsx`
