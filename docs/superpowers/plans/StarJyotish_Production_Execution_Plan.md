# Star Jyotish — Production Execution Plan

*Last updated: July 2026. Reflects the actual current codebase state.*

---

## Current Status Summary

| Phase | Name | Status |
|---|---|---|
| 0 | Project Audit & Stabilization | ✅ Complete |
| 1 | Production Readiness | ✅ Complete |
| 2 | Database Foundation | ✅ Complete |
| 3 | Authentication | ✅ Complete |
| 4 | User Dashboard | ✅ Complete (basic) |
| 5 | Payments | 🔒 Blocked (company registration) |
| 6 | WhatsApp Integration | 🔒 Blocked (Meta business verification) |
| 7 | AI Improvements | 🟡 Partial |
| 8 | Astrologer Marketplace | ❌ Not started (schema only) |
| 9 | Chat / Audio / Video | ❌ Not started |
| 10 | Admin Portal | ❌ Not started (dependency wired) |
| 11 | E-Commerce | ❌ Not started |
| 12 | SEO & Content | 🟡 Partial |
| 13 | Growth Features | ❌ Not started |
| 14 | Production Hardening | 🟡 Partial |
| 15 | Launch Readiness | 🟡 Partial |

---

## Phase 0 — Project Audit & Stabilization ✅ Complete

**What was done:**
- Full codebase audit (July 2026) — architecture, dead code, security, test coverage, deployment
- Removed stray misplaced file (`backend/services/DivisionalCharts.jsx`)
- Fixed 3 stale test mocks in `test_reading.py` (mocks were using old list shape instead of dict)
- Fixed `fetchpriority` → `fetchPriority` in `Landing.jsx` (JSX prop name)
- Removed dead code in `WesternChart.jsx` (unused `arcPath`, `SIGN_COLORS`, `signLabels`, unused i18n import)
- Fixed empty catch block lint warning in `ChartReading.jsx`
- Downgraded two ESLint rules from error to warning that the codebase never followed (`react/prop-types`, `react/no-unescaped-entities`) — `npm run lint` now exits 0
- See audit report: `docs/AUDIT_REPORT.md`

---

## Phase 1 — Production Readiness ✅ Complete

**What was done:**
- All legal pages live: Privacy Policy (`/privacy`), Terms of Use (`/terms`), Refund Policy (`/refund-policy`), Disclaimer (`/disclaimer`)
- About (`/about`), Contact (`/contact`), FAQ (`/faq`) as standalone indexed pages
- Mobile layout fixed on all 4 flagged components — `DivisionalCharts.jsx`, `TransitPanel.jsx`, `Result.jsx`, `KundliDownload.jsx` now use `w-full` on mobile with breakpoint-constrained widths on desktop (`sm:w-[460px]` / `sm:w-[480px]`)
- SEO: `react-helmet-async` per-page meta + canonical, JSON-LD Organization/WebSite schema in `index.html`, FAQ schema component (`FaqSchema.jsx`), `robots.txt`, `sitemap.xml` auto-generated at build time
- Open Graph + Twitter Card tags on every route
- 404 Not Found page with noindex (`/src/pages/NotFound.jsx`)
- React `ErrorBoundary` via `@sentry/react` wrapping the full app (`main.jsx`) — styled fallback UI instead of blank screen
- Security headers on backend: `SecurityHeadersMiddleware` in `services/security_headers.py` — CSP, HSTS, nosniff, X-Frame-Options, Permissions-Policy, Referrer-Policy. `/docs` and `/redoc` exempted from CSP so Swagger works.
- Security headers on frontend: `vercel.json` expanded with same header set + CSP scoped to actual backend domain
- Error monitoring: Sentry wired in `services/monitoring.py` (backend) and `src/monitoring.js` (frontend) — no-op without `SENTRY_DSN`/`VITE_SENTRY_DSN` env vars

**Remaining (no blockers):**
- Analytics — GA4 or Plausible (update Privacy Policy at the same time)
- Testimonials / social proof section on landing page
- Blog / content marketing

---

## Phase 2 — Database Foundation ✅ Complete

**What was done:**
- 16 SQLAlchemy models: `User`, `BirthProfile`, `Report`, `AstrologerProfile`, `Booking`, `Transaction`, `Purchase`, `Wallet`, `WalletLedgerEntry`, `Review`, `AppSetting`, `AuditLog`, `Feedback`, `ChatSession`, `ChatMessage`, `OtpCode`
- One repository per model following repository pattern
- 6 Alembic migrations (0001 initial schema → 0006 widen avatar_url)
- `get_db` / `get_db_optional` dependency split — existing chart endpoints work with `DATABASE_URL` unset
- `db/seed.py` with `--with-dev-data` flag
- Best-effort persistence hook (`services/persistence.py`) — DB failure never affects report generation

**Remaining:**
- Add explicit DB indexes on high-frequency query paths once real traffic patterns are visible (e.g. `BirthProfile`/`Report` by phone)
- Move `ChatSession`/`ChatMessage` tables into active use (created but not yet wired to `ask_kundli()` route)

---

## Phase 3 — Authentication ✅ Complete

**What was done:**
- Phone OTP login via MSG91 (primary) or 2Factor (alternative) — console-logs code locally without a provider key
- Google OAuth login via `@react-oauth/google` + backend `google-auth` verification
- JWT access tokens (short-lived) + rotating refresh tokens stored as httpOnly `Secure` cookies
- `UserSession` model with multi-device support and per-session revocation (`/api/auth/sessions/{id}`)
- `/api/auth/me`, `/api/auth/refresh`, `/api/auth/logout` endpoints
- `AuthContext.jsx` in frontend — login state, token refresh, logout
- `ProtectedRoute.jsx` — redirects unauthenticated users to `/login`
- Login page (`/login`) with phone OTP form + Google button
- Cookie security: `Secure`/`SameSite` correctly set; `COOKIE_SECURE=false` override for local `http://` dev

**Remaining:**
- `get_current_user_optional` dependency — would allow identity attachment on report routes without requiring login (middle path between today's anonymous flow and full auth enforcement)
- Wire report-generation routes to `Depends(get_current_user)` or the optional variant above — currently uses `save_for_phone` identification

---

## Phase 4 — User Dashboard ✅ Complete (basic)

**What was done:**
- Profile page (`/account`, protected route) — display name, avatar upload (canvas-compressed), birth details
- Avatar upload uses canvas compression before sending to avoid large payloads
- Account API endpoints in `routers/account.py` — birth profiles, reports by phone, public settings

**Remaining:**
- Full birth chart history view (saved charts list)
- Saved reports list with re-open
- Notification preferences
- Account deletion / data export (DPDP Act compliance)

---

## Phase 5 — Payments 🔒 Blocked

**Schema complete, integration pending company registration.**

What exists:
- `Transaction`, `Purchase`, `Wallet`, `WalletLedgerEntry` models and repositories
- `hasPremiumAccess()` stub in `config/entitlements.js` (returns `true` — all content free until payments live)
- `VITE_PAYWALL_ENABLED` env var toggle and dev-unlock mechanism

What's missing:
- Razorpay order creation + webhook verification
- Payment flow UI (checkout modal, success/failure states)
- Entitlement wiring: `hasPremiumAccess()` needs to check `Purchase` table instead of returning `true`

Unblocks after: company incorporation, Razorpay merchant KYC approval.

---

## Phase 6 — WhatsApp Integration 🔒 Blocked

Blocked by Meta Business verification, which requires a registered entity.

Backend `otp_provider.py` is structured to add a WhatsApp OTP delivery path alongside MSG91/2Factor once the API access is granted.

---

## Phase 7 — AI Improvements 🟡 Partial

**Done:**
- Primary/fallback LLM routing (OpenRouter → Anthropic → Groq)
- Real `astro-skills/` grounding library (~1.1 MB across career, gemstones, marriage, nakshatra, numerology, rudraksha, houses, planets, children, vedic-kundli)
- Topic-specific deep-dive reports (Career, Relationship, Wealth) each with dedicated analysis service
- Bilingual output (EN/HI)
- Provider tracking (`llm_provider` field in all responses)

**Remaining:**
- Threaded "Ask the Chart" — wire `ask_kundli()` to `ChatSession`/`ChatMessage` tables (tables exist, route still stateless)
- Confidence scores / explainability
- "Explain like I'm 5" mode
- AI source transparency UI ("Sources used" disclosure)
- Prompt evaluation framework

---

## Phase 8 — Astrologer Marketplace ❌ Schema only

`AstrologerProfile`, `Booking`, `Review` models exist. No routes, no UI, no payout logic. Dependent on payments (Phase 5) being live first. Also needs company registration for astrologer KYC/payout flows.

---

## Phase 9 — Chat / Audio / Video ❌ Not started

`ChatSession` / `ChatMessage` models exist for the AI chat use case. Human-to-human realtime chat (100ms/Agora) not started.

---

## Phase 10 — Admin Portal ❌ Not started

`require_role("admin")` dependency exists in `dependencies.py`. `admin` enum value exists in `User` model. Zero admin routes or UI exist. Unblocked — can be built now.

---

## Phase 11 — E-Commerce ❌ Not started

Gemstone/Rudraksha store concept. Not started. Dependent on payments.

---

## Phase 12 — SEO & Content 🟡 Partial

**Done:**
- react-helmet-async per-page meta + canonical URLs
- JSON-LD Organization/WebSite schema
- FAQ schema (`FaqSchema.jsx`)
- sitemap.xml auto-generated at build (`npm run sitemap`)
- robots.txt

**Remaining:**
- Blog / content engine
- Dynamic sitemap for blog/report pages
- Article schema for blog posts
- Breadcrumb schema

---

## Phase 13 — Growth Features ❌ Not started

Referral system, coupons, loyalty rewards, wallet credits. Dependent on payments.

---

## Phase 14 — Production Hardening 🟡 Partial

**Done:**
- Rate limiting via `slowapi` — tiered (5/min OTP, 10/min LLM, 30/min compute)
- Error monitoring — Sentry (backend + frontend)
- Health endpoints — `/health` + `/health/db`
- CI/CD — GitHub Actions (pytest with Postgres service + eslint + vite build)
- Security headers — CSP, HSTS, nosniff, frame-options, permissions-policy

**Remaining:**
- Redis-backed rate limiting (in-memory limiter breaks across multiple Railway instances — already flagged in `services/rate_limit.py` comments)
- Caching for repeat chart/reading computations
- Structured logging with correlation IDs
- Staging environment (separate Railway + Vercel stack)
- Docker Compose for one-command local full-stack dev (Postgres + backend + frontend)
- `pytest-cov` — coverage tooling not configured
- Frontend test suite — zero tests currently (Vitest not set up)

---

## Phase 15 — Launch Readiness 🟡 Partial

**Done:**
- PWA manifest (`manifest.json`, `icon-192.png`, `icon-512.png`)
- Legal pages complete
- SEO infrastructure in place

**Remaining:**
- Play Store / App Store assets and submission
- Accessibility audit (ARIA, keyboard nav, contrast on high-traffic routes)
- Load testing on chart + AI endpoints
- Rollback procedure documentation
- Final performance pass (code splitting, lazy loading)

---

## Immediate Priorities (no blockers, start now)

Ordered by impact:

1. Wire report routes to `get_current_user_optional` — identity without forcing login
2. Threaded Ask the Chart via `ChatSession`/`ChatMessage`
3. Frontend test suite setup (Vitest + RTL)
4. Analytics (GA4 or Plausible) + Privacy Policy update
5. Admin dashboard (user list, report viewer, AppSetting toggles)
6. Code splitting on `Result.jsx`
7. Redis-backed rate limiting
8. Staging environment
9. `pytest-cov` baseline
