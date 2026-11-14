# UX Slice 1: Bugs and Mobile Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the production bugs and mobile layout problems that the 14 Nov UX audit found. Stop spurious sign-outs. Remove dead-end blank pages. Give the Kundli more screen on phones, make chart labels readable, keep floating buttons and small tap targets from getting in the way, and keep the tablet header on one row.

**Architecture:** Frontend changes go in the auth context, the location prompt, the Kundli shell (Result.jsx, NavBar, BottomNav, SiteHeader), the chart SVGs and the floating buttons. One backend change keys the refresh rate limit by session, not by IP. Each task has unit tests. A final real-browser pass at 1440/1280/1024/768/390/360, in English and Hindi, verifies layout signed in and signed out, using the dev-OTP login script.

**Tech Stack:** React 18, Vite, Tailwind 3.4, Vitest + Testing Library, FastAPI + slowapi + pytest, Playwright (browser pass).

**Spec:** `docs/superpowers/audits/2026-11-14-ux-audit.md`. This slice covers issues L1, S1, T1, A1, L2, L3, T2 and E2. The owner's decisions are in this plan's Global Constraints.

## Global Constraints

- The branch is `feat/ux1-bugs-mobile`, stacked on `feat/phase5a-contrast-tokens` (PR #167). The PR targets that branch until #167 merges, then main.
- Owner decision: on phones, /kundli shows **one** bottom bar, the Kundli section bar (NavBar). The app BottomNav is hidden on /kundli and stays on every other page. The two-level Kundli tabs stay.
- Owner decision: on mobile /kundli, the header hides on scroll-down and comes back on scroll-up.
- Every UI change must look right at 1440, 1280, 1024, 768, 390 and 360 px.
- English and Hindi copy stays unchanged unless a task names a new key. Every new key goes into every locale file; the parity test enforces this. No `'hi'` literals.
- Use the 5a tokens. No new hex literals and no `text-primary`/`text-primary-dark` on light surfaces; the ratchet in `src/theme/tokenUsage.test.js` must not go up.
- Tap targets on mobile must be at least 44×44 px. The repo idiom is `min-h-11` with `min-w-11`, or padding that reaches 44.
- Motion stays behind `motion-safe:` or reduced-motion overrides.
- Frontend: `npm test`, `npm run lint` (0 errors) and `npm run build` in `frontend/`. Restore `frontend/public/sitemap.xml` after a build. Backend: `.venv/bin/pytest` in `backend/`. Run `graphify update .` after code changes.

## Review Focus

1. **Signed-out users must still reach /login.** The auth retry must not make a real 401/403 (an expired or absent cookie) spin forever. Test that an expired session ends at /login within a bounded time.
2. **Leaving /kundli on a phone without the app bar.** A user must still reach Home, AI Insights and the other top-level pages. Check that the header logo goes to /home and that the header stays reachable when scrolled up. Add a test that the header comes back on scroll-up and at the top of the page.
3. **The BottomChromeSpacer and ScrollToTop offsets** after the BottomNav is hidden on /kundli. No content may sit under a bar, and there must be no double padding. The existing `BottomChromeSpacer.test.jsx` must cover the /kundli case.
4. **Busy houses after the chart labels get bigger.** A house with 4 or more planets must not overlap at 360 px. Test with the chart fixture that has the most planets in one house.
5. **Lazy panels must not refetch** every time a user switches tabs, and must still show the latest chart after the user generates a new one.

---

### Task 1: Auth survives transient refresh failures (A1)

**Files:**
- Modify: `frontend/src/api/auth.js` (`refreshSession`), `frontend/src/contexts/AuthContext.jsx`, `frontend/src/components/ProtectedRoute.jsx`
- Modify: `backend/routers/auth.py` (refresh route limit key), `backend/services/rate_limit.py`
- Test: `frontend/src/contexts/AuthContext.refresh.test.jsx` (new), `frontend/src/components/ProtectedRoute.test.jsx` (new), `backend/tests/test_auth.py`

**Interfaces:**
- Produces: `AuthContext` value gains `sessionError: null | 'unreachable'` and `retrySession(): Promise<void>`.
- Produces: `refreshSession()` keeps its signature. On a failure whose `err.status` is not 401 or 403 (429, 5xx, or no status, meaning a network error), it retries twice with 600 ms and 1800 ms delays before rejecting. A 401 or 403 rejects at once.

- [ ] **Step 1: Write failing frontend tests.**
  - `refreshSession` retries on 429, then resolves, with fetch mocked to give 429, 429, 200; fetch is called 3 times.
  - On 401 it rejects after 1 call.
  - AuthProvider mount where refresh fails three times with 503: `loading` ends false, `isAuthenticated` is false and `sessionError === 'unreachable'`.
  - ProtectedRoute with `sessionError: 'unreachable'` renders a reconnect state with a retry button (role `button`, using the existing `StateBlock`) and does not navigate to /login. With `sessionError: null` and no user it still redirects to /login.
  - `retrySession()` that succeeds clears `sessionError` and authenticates.

  Use vitest fake timers for the delays.
- [ ] **Step 2: Run them.** `npx vitest run src/contexts/AuthContext.refresh.test.jsx src/components/ProtectedRoute.test.jsx`. Expected: FAIL.
- [ ] **Step 3: Implement.**
  - Retry inside `refreshOnce` so it stays shared by the single-flight in `refreshSession`.
  - In AuthContext, set `sessionError` only on mount or retry failures that are not 401/403.
  - Add i18n keys `session_reconnect_title`, `session_reconnect_body` and `session_reconnect_retry` to every locale. Hindi should be natural Hindi; keep English words where Hindi has no natural word (owner rule).
- [ ] **Step 4: Write the failing backend test** in `test_auth.py`: 25 refresh calls with *different* refresh cookies from one IP are not rate-limited, and 21 calls with the *same* cookie are (status 429 on the 21st).
- [ ] **Step 5: Implement.** In `rate_limit.py`, add `refresh_key(request) -> str`. It returns `"refresh:" + sha256(cookie)[:32]` when the `sj_refresh` cookie is present, and otherwise falls back to `get_remote_address`. Apply it with `@limiter.limit(AUTH_LIMIT, key_func=refresh_key)` on the refresh route only.
- [ ] **Step 6: Run** `npm test` in frontend and `.venv/bin/pytest tests/test_auth.py` in backend. Expected: PASS.
- [ ] **Step 7: Commit** with the message `ux1: transient refresh failures no longer sign users out`.

### Task 2: Location prompt instead of blank pages (S1)

**Files:**
- Modify: `frontend/src/pages/WeekAhead.jsx`, `frontend/src/pages/PersonalHome.jsx` (the `sj-week` Beat)
- Reuse: `frontend/src/components/home/LocationSection.jsx` and `frontend/src/hooks/useCurrentLocation.js` (`status`, `retryGeolocation`, `setManualLocation`)
- Test: `frontend/src/pages/WeekAhead.test.jsx` (new), extend an existing PersonalHome test or create `PersonalHome.week.test.jsx`

**Interfaces:**
- Consumes: `useCurrentLocation()` → `{ location, status, retryGeolocation, setManualLocation }`.

- [ ] **Step 1: Write failing tests.**
  - WeekAhead with the hook mocked to `{location: null, status: 'denied'}` renders the LocationSection picker (its manual-search input or button is present) and no empty body.
  - With `status: 'requesting'` it shows a loading state.
  - Choosing a place calls `setManualLocation`.
  - On PersonalHome with no location, the "This week" Beat renders the same prompt instead of nothing.
- [ ] **Step 2: Run them.** Expected: FAIL.
- [ ] **Step 3: Implement.**
  - WeekAhead: when `!location`, render LocationSection (night surface) wired to the hook. Keep the existing loading and error states once a location exists.
  - PersonalHome: when `!location`, render the same compact prompt inside the `sj-week` Beat.
  - LocationSection takes `birthPlace`. Pass the profile's place, which is only shown as a hint, and keep the hook's rule of never using the birth place as the location.
- [ ] **Step 4: Run** `npm test`. Expected: PASS.
- [ ] **Step 5: Commit** with the message `ux1: ask for a location instead of showing a blank week`.

### Task 3: Kundli analysis panels load when opened (E2)

**Files:**
- Modify: `frontend/src/pages/Result.jsx` (the transit, bhava, ashtakavarga and sarvatobhadra mounts), `frontend/src/components/AshtakavargaTable.jsx`, `frontend/src/components/BhavaChalit.jsx`, `frontend/src/components/TransitPanel.jsx`
- Reuse: `frontend/src/api/reportCache.js` (`fetchReport`, `chartBody`)
- Test: `frontend/src/pages/Result.lazyPanels.test.jsx` (new)

**Interfaces:**
- Produces: in Result.jsx, `const [visited, setVisited] = useState(() => new Set([initialSub]))`. A panel mounts the first time its sub-tab is active and then stays mounted, hidden with `hidden`. Reset `visited` when the chart `input` changes.
- The three panels fetch through `fetchReport(endpoint, chartBody(input), { signal })` and so share its sessionStorage cache. On a 429 they retry once after 1500 ms before showing their error state.

- [ ] **Step 1: Write failing tests.**
  - Render Result on `tab=birth_chart&sub=chart` with fetch mocked: there are no calls to `/api/kundli/ashtakavarga`, `/bhava-chalit` or `/transit`.
  - Switching to the ashtakavarga sub-tab makes one ashtakavarga call. Switching away and back makes no second call.
  - A 429 followed by a 200 renders the table, not the error.
- [ ] **Step 2: Run them.** Expected: FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run** `npm test`. Expected: PASS. Existing Result tests still pass.
- [ ] **Step 5: Commit** with the message `ux1: load kundli analysis panels on demand, cached, with 429 retry`.

### Task 4: One bottom bar on mobile /kundli; header hides on scroll (L1)

**Files:**
- Modify: `frontend/src/components/home/BottomNav.jsx`, `frontend/src/pages/Result.jsx` (`<NavBar … raised={…}>`), `frontend/src/components/SiteHeader.jsx`, `frontend/src/components/layout/useBottomChrome.js` if needed, `frontend/src/index.css` (`--header-h` usage if needed)
- Create: `frontend/src/hooks/useHideOnScroll.js`
- Test: `frontend/src/components/layout/BottomChromeSpacer.test.jsx` (extend), `frontend/src/hooks/useHideOnScroll.test.js` (new), `frontend/src/components/SiteHeader.test.jsx` (new or extend)

**Interfaces:**
- Produces: `useHideOnScroll({ enabled: boolean, threshold = 8 }) -> boolean`, where true means hidden. It hides after scrolling down more than `threshold` px past 80 px from the top, shows on any scroll-up, and always shows at `scrollY < 80`. It is a no-op when not enabled.
- BottomNav returns null and does not register chrome when `pathname === '/kundli'`.
- Result passes `raised={false}` to NavBar, since NavBar now owns the true bottom edge with the safe-area inset.

- [ ] **Step 1: Write failing tests.**
  - BottomNav renders nothing at `/kundli` when authenticated, and renders at `/home`.
  - BottomChromeSpacer at `/kundli`, signed in with NavBar mounted, reserves exactly the sub-nav height plus the safe area, not the nav plus the sub-nav.
  - `useHideOnScroll`: scroll to 300 (down) → hidden. Scroll to 250 (up) → shown. Scroll to 40 → shown. `enabled: false` → never hidden.
  - SiteHeader on `/kundli` at mobile width gets `-translate-y-full` (wrapped in `motion-safe:transition-transform`) when hidden, and never on desktop (the hook is enabled only below `md`, via `matchMedia('(max-width: 767px)')`).
- [ ] **Step 2: Run them.** Expected: FAIL.
- [ ] **Step 3: Implement.**
  - The Result.jsx sticky band (chips and sub-tabs) uses `top: var(--header-h)` or the equivalent. When the header hides, the band should slide up to `top: 0`; use the same hidden flag through a CSS variable or a context.
  - Keep the existing chip collapse-on-scroll behaviour.
- [ ] **Step 4: Run** `npm test`. Expected: PASS.
- [ ] **Step 5: Commit** with the message `ux1: one bottom bar on mobile kundli, header hides on scroll`.

### Task 5: Floating buttons don't cover content (L2)

**Files:**
- Modify: `frontend/src/components/home/AskPersonaPanel.jsx` (the FAB), `frontend/src/components/ScrollToTop.jsx`, `frontend/src/components/layout/BottomChromeSpacer.jsx` (reserve FAB height)
- Test: `frontend/src/components/ScrollToTop.test.jsx` (new or extend), `frontend/src/components/home/AskPersonaPanel.test.jsx` (new)

Decisions:
- ScrollToTop appears only after `scrollY > 2 * innerHeight`. It is never shown while the Ask FAB is mounted on the route; the Ask FAB takes priority.
- Below `sm` (640 px), the Ask FAB collapses to a 48×48 circle showing only the avatar, with `aria-label` from the existing `ask_persona_button` key. At `sm` and above it keeps the pill with its label.
- Hide the 10 px status line (`ask_persona_status`) below `sm`.
- BottomChromeSpacer adds 48 px plus 12 px of space when the Ask FAB is mounted, so the last content block can scroll clear of it.

- [ ] **Step 1: Write failing tests.**
  - ScrollToTop is hidden at `scrollY = innerHeight` and visible at `2.1 * innerHeight`.
  - ScrollToTop is not rendered when the FAB registration is present.
  - The FAB at 360 px (mock `matchMedia`) has an accessible name and no visible status text.
  - The spacer includes the FAB reservation when it is mounted.
- [ ] **Step 2: Run them.** Expected: FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run** `npm test`. Expected: PASS.
- [ ] **Step 5: Commit** with the message `ux1: floating buttons stop covering content on phones`.

### Task 6: Tablet header stays on one row (L3)

**Files:** `frontend/src/components/SiteHeader.jsx`, plus the existing SiteHeader and NavBar tests.

Decisions:
- At `md` to `lg` (768–1023 px), signed-in nav links get `whitespace-nowrap`, `px-2`, `text-sm` and `gap-0.5`.
- The language toggle shows only the active code there; the existing toggle already does this on mobile.
- Do not change which navigation shows at which breakpoint. The Kundli tab bar and BottomNav breakpoints stay as they are.

- [ ] **Step 1: Write a failing test.** At signed-in render, every nav link has `whitespace-nowrap`, and the link container has `md:gap-0.5 lg:gap-1` (or similar).
- [ ] **Step 2: Run it.** Expected: FAIL.
- [ ] **Step 3: Implement.** Measure in the browser pass (Task 9) that the header is 61 px tall at 768 and 900 px, signed in, in both languages.
- [ ] **Step 4: Run** `npm test`. Expected: PASS.
- [ ] **Step 5: Commit** with the message `ux1: signed-in header fits one row on tablets`.

### Task 7: Chart labels readable on phones (T1)

**Files:**
- Create: `frontend/src/hooks/useRenderedScale.js`
- Modify: `frontend/src/components/KundliChart.jsx`, `frontend/src/components/SouthIndiaChart.jsx`, `frontend/src/components/WesternChart.jsx`, `frontend/src/components/SarvatobhadraChakra.jsx`
- Test: `frontend/src/hooks/useRenderedScale.test.js`, `frontend/src/components/chartLegibility.test.jsx` (new)

**Interfaces:**
- Produces: `useRenderedScale(ref, viewBoxWidth) -> number`, the rendered width divided by the viewBox width. It uses a ResizeObserver and returns 1 before measuring.
- Produces: `legibleSize(base: number, scale: number, minPx: number) -> number` in the same file. It returns `Math.max(base, minPx / scale)`.

Rules:
- Planet labels render at ≥ 11 px (`minPx` 11). Sign and house numbers render at ≥ 10 px.
- When `scale < 0.75`, hide the degree superscripts, since the Planets table carries the degrees. Show retrograde and the other status markers as a suffix glyph at ≥ 10 px.
- Busy houses: when a house has more planets than fit at the legible size, wrap them to an extra line inside the house polygon, using the same positioning helper with a smaller line height. Never overlap; Review Focus 4 covers this.
- Sarvatobhadra: give the grid `min-width: 560px` inside a horizontally scrolling container with the existing `ScrollHint`. Text inside renders at ≥ 10 px at that width.

- [ ] **Step 1: Write failing tests.**
  - `legibleSize(15, 0.59, 11) ≈ 18.64`.
  - KundliChart rendered with scale mocked to 0.59 has no degree `<tspan>` superscripts, and planet `<text>` font size × 0.59 ≥ 11.
  - At scale 1 the superscripts are present.
  - For the fixture with 4 or more planets in one house, the planet label y positions differ by at least the line height (no overlap).
  - The SarvatobhadraChakra wrapper has `overflow-x-auto` and an inner `min-w-[560px]`.
- [ ] **Step 2: Run them.** Expected: FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run** `npm test`. Expected: PASS.
- [ ] **Step 5: Commit** with the message `ux1: chart labels legible on phones`.

### Task 8: 44 px tap targets (T2)

**Files:** these, from the audit's T2 list:
- `AshtakavargaTable.jsx` (planet chips, Refresh, "Show Detailed Table")
- `DashaTable.jsx` (level pills)
- `TransitPanel.jsx` (Refresh)
- `PanchangDetail.jsx` (Today/Week/Month, "Set location", "Today")
- `knowledge/LearningPath.jsx` and `knowledge/Breadcrumb.jsx`
- `knowledge/SignNav.jsx` (previous/next)
- `Footer.jsx` (LEARN/COMPANY summaries)
- `pages/Blog.jsx` (filters)
- `pages/Landing.jsx` (question chips, "Ask your own question")
- `home/*` (reaction chips, "Different insight", "Why?", "Keep", the panel close ✕)
- `pages/Profile.jsx` ("Edit", "Change", "Start over")
- `pages/Login.jsx` ("← Back")

Test: `frontend/src/theme/tapTargets.test.jsx` (new).

- [ ] **Step 1: Write a failing test.** Render each listed component, or its page with minimal props, and assert that each named control's className contains `min-h-11`. Text-link controls also need `inline-flex items-center`. Keep it to one table-driven test.
- [ ] **Step 2: Run it.** Expected: FAIL.
- [ ] **Step 3: Implement.** Add `min-h-11` (plus `min-w-11` for icon-only controls) without growing the visual pill. Where the pill should stay small, use padding or `py-` on an `inline-flex` wrapper so the hit area grows and the visual chip doesn't. Don't change the desktop look beyond the hit area.
- [ ] **Step 4: Run** `npm test`. Expected: PASS.
- [ ] **Step 5: Commit** with the message `ux1: 44px tap targets across mobile controls`.

### Task 9: Real-browser verification, roadmap and PR

- [ ] **Step 1:** Start uvicorn and Vite. Run the Playwright script (dev-OTP login, as in the audit) at 1440, 1280, 1024, 768, 390 and 360, in English at every width and Hindi at 1280 and 360, signed in and signed out, on these pages: /home, /week-ahead (with and without location), /kundli (all sub-tabs), /insights, /panchang, /learn/zodiac, /login and /account. Measure and record:
  - Content share on mobile /kundli: target ≥ 75% at rest. The audit baseline was 58%.
  - Header height at 768 and 900 signed in: 61 px.
  - Count of tap targets under 44 px.
  - Chart label rendered size: ≥ 11 px.
  - No horizontal overflow and no page errors.
  - Force a 429 on refresh: the user stays signed in after the retry.

  Look at the screenshots of each changed screen.
- [ ] **Step 2:** In the roadmap, add a "UX slice 1" status line under Phase 5 and a row in the Tracking table.
- [ ] **Step 3:** Run the final whole-branch review on opus and one fix wave. Then push and open a PR against `feat/phase5a-contrast-tokens`; retarget to main if #167 has merged.
