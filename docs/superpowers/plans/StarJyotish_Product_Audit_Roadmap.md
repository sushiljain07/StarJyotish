# Star Jyotish — Product Audit & Roadmap

*Original audit: May 2026. Updated: July 2026 to reflect current codebase.*

---

## Current State (July 2026)

### What exists and works (verified in code)

**Calculation engine:**
- North Indian chart + KP chart toggle, full Shodashvarga (D1–D60, 16 divisional charts), Bhava Chalit, Sarvatobhadra Chakra
- Ashtakavarga (Bhinna + Sarva), Vimshottari Dasha with Mahadasha/Antardasha timeline, live Transit chart
- Rajyoga detection, KP sub-lord/cuspal-interlink system
- Lahiri ayanamsa, whole-sign houses — consistent, defensible methodology

**AI layer:**
- Claude Sonnet 4.6 (via OpenRouter primary, direct Anthropic fallback), Groq Llama 3.3-70B as automatic second fallback
- Prompts grounded in `astro-skills/` (~1.1 MB: career, gemstones, marriage, nakshatra, numerology, rudraksha, houses, planets, children)
- "Ask the Chart" — up to 10 follow-up Q&A per session (stateless; threading via ChatSession tables pending)
- Three deep-dive report flows: **Career** (D10 + Dasha + Rajyoga), **Relationship** (D9 Navamsa), **Wealth** (D2 + D10)
- Bilingual EN/HI throughout, including AI output

**Auth & accounts:**
- Phone OTP (MSG91/2Factor/console-log fallback) + Google OAuth
- JWT access tokens + rotating httpOnly refresh-token cookies
- Multi-device session management with per-session revocation
- User profile with avatar upload (canvas-compressed)

**Database:**
- PostgreSQL via SQLAlchemy 2.x + Alembic (6 migrations)
- 16 models: User, BirthProfile, Report, AstrologerProfile, Booking, Transaction, Purchase, Wallet, WalletLedgerEntry, Review, AppSetting, AuditLog, Feedback, ChatSession, ChatMessage, OtpCode
- Repository pattern — one repo per model
- All chart/report endpoints work with `DATABASE_URL` unset (optional persistence)

**Frontend:**
- Custom design-token system (saffron gold, deep indigo-night, Fraunces serif + Inter)
- 13 pages: Landing, Home, Result, CareerReport, Login, Profile, NotFound + 6 legal/info pages
- Tab dashboard (Kundli / Advanced / Insights / Ask) with mobile bottom-nav
- i18n: EN/HI throughout via react-i18next

**Operations:**
- CI/CD: GitHub Actions — pytest (full 78-test suite with Postgres service) + eslint + vite build on every push
- Error monitoring: Sentry wired (backend + frontend), opt-in via env var
- Security headers: CSP, HSTS, X-Frame-Options, nosniff, Permissions-Policy on both backend middleware and Vercel headers
- Rate limiting: tiered slowapi (5/min OTP, 10/min LLM, 30/min compute)
- Health endpoints: `/health` + `/health/db`

**SEO & legal:**
- react-helmet-async per-page meta + canonical
- JSON-LD Organization/WebSite + FAQ schema
- sitemap.xml auto-generated at build, robots.txt
- All legal pages live: Privacy Policy, Terms, Refund Policy, Disclaimer

---

## MVP Gap Analysis (updated)

| Feature | Status | Notes |
|---|---|---|
| User Registration / Login | ✅ Done | Phone OTP + Google OAuth |
| OTP Authentication | ✅ Done | MSG91 / 2Factor / console fallback |
| Social Login (Google) | ✅ Done | — |
| JWT + Refresh Tokens | ✅ Done | httpOnly cookies, session revocation |
| User Profile | ✅ Done | Name, avatar, birth details |
| Kundli / Horoscope Generation | ✅ Done | Full chart engine |
| AI Reading | ✅ Done | Grounded in astro-skills library |
| Ask the Chart | ✅ Done (stateless) | Threading via DB tables pending |
| Career / Relationship / Wealth Reports | ✅ Done | Separate analysis services |
| Legal Pages | ✅ Done | Privacy, Terms, Refund, Disclaimer |
| About / Contact / FAQ | ✅ Done | Standalone pages |
| SEO Basics | ✅ Done | Meta, OG, schema, sitemap |
| Security Headers | ✅ Done | CSP, HSTS, nosniff, frame-options |
| Error Monitoring | ✅ Done | Sentry, opt-in |
| CI/CD | ✅ Done | GitHub Actions |
| 404 Page + ErrorBoundary | ✅ Done | — |
| Language Selection | ✅ Done | EN/HI toggle throughout |
| Payment Gateway | 🔒 Blocked | Razorpay pending company registration |
| Kundli / Report History | 🟡 Partial | DB tables exist; UI list view pending |
| Threaded Ask the Chart | 🟡 Partial | ChatSession tables exist; route still stateless |
| Analytics | ❌ Missing | GA4 or Plausible — not started |
| Admin Panel | ❌ Missing | `require_role("admin")` exists; zero routes |
| Frontend Tests | ❌ Missing | Vitest not set up |
| Mobile Layout Fixes | ❌ Missing | 4 components with fixed pixel widths |
| Code Splitting | ❌ Missing | `Result.jsx` is one large bundle |
| WhatsApp Integration | 🔒 Blocked | Meta business verification |
| Astrologer Marketplace | 🔒 Blocked | Schema exists; payments + KYC needed |
| Blog / Content | ❌ Missing | — |
| Audio / Video Calling | ❌ Missing | — |
| Referral / Coupons / Wallet | ❌ Missing | — |
| E-Commerce (gemstones) | ❌ Missing | — |
| Server-side PDF | ❌ Missing | Currently browser print-to-PDF only |
| Redis Rate Limiting | ❌ Missing | In-memory won't scale past 1 instance |
| Staging Environment | ❌ Missing | — |

---

## Production Readiness Scores (updated July 2026)

| Area | Score /10 | Change from May | Notes |
|---|---|---|---|
| UI/UX | 7 | ↑ from 6 | 404 page, ErrorBoundary added; mobile layout still pending |
| Backend | 8 | → same | Clean architecture, auth complete |
| Security | 8 | ↑ from 3 | CSP/HSTS/headers added; auth enforced on account routes |
| Scalability | 5 | → same | In-memory rate limiter still the bottleneck |
| Performance | 6 | → same | No caching on compute paths, no code splitting |
| Documentation | 9 | ↑ from 7 | README fully updated, execution plan current |
| DevOps | 7 | ↑ from 3 | CI/CD live, Sentry live; staging env still missing |
| Testing | 6 | ↑ from 5 | 78 backend tests all pass; zero frontend tests |
| SEO | 9 | → same | Already strong |
| Analytics | 1 | → same | Not started |
| Monitoring | 7 | ↑ from 2 | Sentry live; health endpoints already existed |
| AI Quality | 7 | → same | Real grounding library; threading pending |

**Overall production readiness: ~68%** (up from ~52% at original audit)

---

## Blocked Items (company registration required)

| Feature | Dependency | Earliest unblock |
|---|---|---|
| Razorpay payments | Business PAN, GST, merchant KYC | After incorporation + Razorpay approval |
| WhatsApp Business API | Meta business verification | After incorporation |
| DLT-registered SMS | TRAI registration requires GSTIN | After incorporation (test-mode OTP works now) |
| GST invoicing | GSTIN | After incorporation |
| Astrologer payouts | Razorpay Route + business bank account | After incorporation + Razorpay setup |

---

## Immediate Priorities (no blockers)

These can all be built before company registration:

| Priority | Task | Effort | Impact |
|---|---|---|---|
| 1 | Wire `get_current_user_optional` on report routes | 1 day | Auth hygiene |
| 2 | Thread Ask the Chart via ChatSession | 2 days | Product quality |
| 3 | Frontend test suite (Vitest) | 3–5 days | Quality |
| 4 | Mobile layout fixes (4 components) | 2–3 days | UX |
| 5 | Analytics (+ Privacy Policy update) | 1 day | Business |
| 6 | Admin dashboard | 3–5 days | Operations |
| 7 | Code splitting on Result.jsx | 1 day | Performance |
| 8 | Redis-backed rate limiting | 1 day | Scalability |
| 9 | Staging environment | 1 day | DevOps |
| 10 | `pytest-cov` baseline | 0.5 days | Quality |

---

## Architecture (current)

```
[React/Vite SPA] ──HTTPS──> [Vercel: static frontend + security headers]
                                          │
                                 /api/* requests (CSP-gated)
                                          ▼
                           [Railway: FastAPI backend]
                           [SecurityHeadersMiddleware]
                           [SlowAPIMiddleware (rate limiting)]
                                ┌─────────┼──────────┐
                                ▼         ▼           ▼
                       [Swiss Ephemeris] [Claude/     [PostgreSQL
                        (in-process)     OpenRouter   16 models
                                         + Groq]      6 migrations]
                                    │
                            [astro-skills/
                             ~1.1MB library]

[Sentry] ←─ exceptions ─── [Backend] + [Frontend]
[GitHub Actions] ──── pytest (78 tests) + lint + build → main

── Pending (post-registration) ──────────────────────
[Razorpay] ←── payments ──→ [Backend webhooks]
[MSG91/DLT] ←─ OTP/SMS ──→ [Backend] (test-mode works now)
[Meta WhatsApp Cloud API] ←→ [Backend]
[Redis] ←── rate limit/cache ──→ [Backend]
```

---

## Risks (updated)

| Risk | Mitigation | Status |
|---|---|---|
| In-memory rate limiter breaks at scale | Move to Redis before scaling past 1 Railway instance | Pending |
| No frontend tests | Set up Vitest before codebase grows further | Pending |
| Report routes not auth-enforced | Add `get_current_user_optional` | Pending |
| "Free forever" if paywall flip is delayed | Set explicit date/trigger for enabling `hasPremiumAccess()` | Pending |
| DPDP Act — birth data with no deletion mechanism | Build account deletion + data export in Phase 4 remainder | Pending |
| Apple/Google IAP 30% cut on in-app payments | Route paid consultations through web checkout (Razorpay) | By design |
| RBI PPI licensing if custodial wallet is built | Use Razorpay's own wallet primitives | By design |
| Security headers blocking Google Sign-In | `connect-src` and `frame-src` already include `accounts.google.com` | ✅ Done |
