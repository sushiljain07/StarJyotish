# Phase 4: Mobile and Navigation Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** On a phone the app feels native. Nothing is hidden under the bottom bars or the notch, every control is easy to tap, the AI page has one name and a stable layout, and the app passes the basic accessibility checks (tabs, dialogs, the OTP form, landmarks, reduced motion).

**Architecture:** Most of this is layout and CSS on existing components. Two pieces are structural:
- **Bottom chrome:** a single source of truth for the fixed bars. CSS custom properties hold the heights. A `<BottomChromeSpacer>` sits inside each footer, so the footer's own background reaches the bottom bars and no parchment strip shows.
- **`/insights`:** restructured around three fixed sub-tabs (Reading | Ask | Reports) with a topic picker inside Reports. `/ask` becomes a redirect.

**Tech Stack:** React 18, react-router 6, Tailwind 3.4.19, i18next, Vitest + Testing Library (jsdom); playwright-core with `/usr/bin/google-chrome` for the browser check.

**Spec:** the Phase 4 section of `docs/superpowers/plans/2026-11-04-frontend-ux-roadmap.md`. The finding IDs N-*/P-* come from the review it cites.

## Global Constraints

- **The Kundli page keeps its two-level tab navigation** (main tabs + sub-tab pills + bottom NavBar). Don't flatten it or make it hub-and-spoke (owner decision).
- **Every new user-visible string is an i18n key in `en.json` and `hi.json`.**
  - The guardrails check this: parity, the hardcoded-English ratchet with baseline `frontend/src/i18n/baselines/hardcoded-baseline.json` (must not grow), no `'hi'`/`'en'` literals outside `src/i18n/`, and `expectNoEnglish`.
  - Hindi follows `docs/i18n-glossary.md`, including the loanword rule: when there's no natural Hindi word, write the English word in Devanagari.
- **English output stays unchanged**, except the changes the owner decided below.
- **Tap targets:** at least **44×44 CSS px** for every control named in Task 3. Use `min-h-11` / `min-w-11` (Tailwind 3.4: 2.75rem = 44px).
- **Motion:** anything that animates continuously uses `motion-safe:` (or is disabled under `motion-reduce:`).
- Every storage access is wrapped in try/catch.
- **Gate before each commit:** from `frontend/`, `npx vitest run` passes, `npx eslint <changed files>` reports 0 errors, and `npx vite build` succeeds.
- **Commits:** author `sushiljain07@gmail.com` (repo-local), and every message ends with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Run `graphify update .` after code commits.

## Owner decisions (10 Nov 2026)

1. **One name for the AI page: "AI Insights"** (Hindi "AI इनसाइट्स").
   - Applies to: the nav item (`nav_ai_guidance`), the page eyebrow (`insights_header`), the Kundli card title (`kundli_insights_title`), and the `/insights` SEO title (`insights_seo_title`).
   - The sub-tab keeps "Reading".
   - This is an approved English change.
2. **`/insights` has three fixed sub-tabs, Reading | Ask | Reports.**
   - Ask moves inside `/insights?sub=ask`, and `/ask` redirects there, keeping router state such as `presetQuestion`.
   - Reports has an in-page topic picker (Career, Health, Relationship, Finance). It shows that topic's report, and for Career also a Career | Rajyogas toggle.
3. **Signed-in app pages use `max-w-5xl`** for the header inner, the content and the footer. Marketing pages keep `max-w-6xl`. Long reading text is capped at `max-w-prose`.

## Review Focus

1. **A notched iPhone, signed in, on `/kundli`.** The raised NavBar must sit fully above the BottomNav, including the safe-area inset. Scroll-to-top must not cover a footer link, and the footer's last link must stay tappable above both bars. Pinned in Task 1 (style assertions) and Task 8 (browser geometry).
2. **A user opening `/ask` from an old link or a bookmark, with a preset question.** They must land on `/insights?sub=ask` with the question pre-filled. A reload must keep them on Ask. Pinned in Task 4.
3. **Reports opened on a topic.** Only that topic's report component mounts, and an AI report mounts only once its view is opened, so there are no invisible LLM calls (the Phase 1 rule). Switching topics must not fire requests for topics not opened. Pinned in Task 4.
4. **A keyboard user on the Kundli tabs and the jump-nav sheet.**
   - Arrow keys move between tabs.
   - Escape closes the sheet.
   - Focus stays inside the sheet while it's open and returns to the trigger afterwards.
   Pinned in Task 6.
5. **The 640–767px band** (a large phone in landscape or a small tablet). Exactly one main-tab row shows: either the top row or the NavBar, never both. Pinned in Task 2.

---

### Task 1: Safe areas and bottom chrome geometry

**Files:**
- Modify: `frontend/index.html:16` (add `viewport-fit=cover` to the viewport meta)
- Modify: `frontend/src/index.css`. Define `:root { --bottom-nav-h: 60px; --sub-nav-h: 52px; --safe-bottom: env(safe-area-inset-bottom, 0px); }` and `.pb-safe`. Delete the dead `pb-safe-offset-5` class from `CompactFooter.jsx:42`.
- Modify: `src/components/NavBar.jsx:23,29`. When raised, `style.bottom = 'calc(var(--bottom-nav-h) + var(--safe-bottom))'`; otherwise bottom 0 with safe padding as today. Add `aria-label`, `aria-current` and `type="button"`.
- Modify: `src/components/home/BottomNav.jsx:84-99`. Use `min-h-[var(--bottom-nav-h)]`, and remove the empty fragment and the stale spacer comment.
- Create: `src/components/layout/BottomChromeSpacer.jsx`. It is `md:hidden`, and its height is `calc(var(--bottom-nav-h) + var(--safe-bottom) + 1rem)` when BottomNav shows (signed in). It adds `+ var(--sub-nav-h)` when the route also shows the raised NavBar (`/kundli` while signed in). When signed out on `/kundli` it is `calc(var(--sub-nav-h) + var(--safe-bottom))`, and otherwise 0. It renders inside the footer, so it inherits the footer's background.
- Modify: `CompactFooter.jsx` and `Footer.jsx` (render `<BottomChromeSpacer />` as the footer's last child); `layout/WorkspaceLayout.jsx:92-96` (delete the old spacer and `EXTRA_BOTTOM_NAV_ROUTES`); `knowledge/KnowledgeLayout.jsx`, `pages/Learn.jsx` and `pages/learn/**` hubs (they get the spacer through their footer).
- Modify: `src/components/ScrollToTop.jsx:15`. Mobile `bottom` is `calc(<spacer height for this route> + 0.75rem)`, so it floats above the bars, inside the spacer zone and never over footer links. Desktop stays `md:bottom-5`.
- Modify: `src/components/home/AskPersonaPanel.jsx:129`. Place the FAB on the same chrome variables, so it never stacks on top of ScrollToTop. ScrollToTop goes above the FAB when both exist: give it the FAB's height plus 0.75rem.
- Modify: `src/components/TabIcon.jsx`, adding a `download` icon (a tray with a down arrow, 24×24, `currentColor`, matching the stroke style). `src/pages/Result.jsx:56,59`: the Birth Chart tab uses `icon: 'kundli'` (the existing diamond), and the Download tab uses `icon: 'download'`. Drop the `<img>` and CSS-filter path in `NavBar.jsx:10-15` and `Result.jsx:229-231` if nothing else uses it.
- Test: `src/components/layout/BottomChromeSpacer.test.jsx`, `src/components/NavBar.test.jsx`, `src/components/ScrollToTop.test.jsx` (all new)

**Interfaces:**
- Produces `useBottomChrome() → { bottomNav: boolean, subNav: boolean, raisedSubNav: boolean, spacerHeight: string }` in `src/components/layout/useBottomChrome.js`. It reads `useAuth()` and `useLocation()`, and the route list for the sub-nav is `['/kundli']`. Task 2 and the FAB consume it.

- [ ] **Step 1: Write the failing tests.**
  - `useBottomChrome` in each case:
    - signed in on `/home` gives `bottomNav` true, `subNav` false, and `spacerHeight` contains `--bottom-nav-h`, not `--sub-nav-h`;
    - signed in on `/kundli` contains both;
    - signed out on `/kundli` gives `subNav` true and `bottomNav` false;
    - signed out on `/` gives `'0px'`.
  - `NavBar`: `raised` makes `style.bottom` contain `var(--bottom-nav-h)` and `var(--safe-bottom)`; the nav has an `aria-label`, and the active tab has `aria-current="page"`.
  - `ScrollToTop`'s mobile bottom offset string contains `--bottom-nav-h` when signed in.
  - `index.html` (read with fs) contains `viewport-fit=cover`.
  - `Result`: the Download tab renders the `download` TabIcon, and no main tab uses an `<img>` icon.
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run the full gate.** Expected: PASS.
- [ ] **Step 5: Commit:** `Fit the bottom bars to the safe area and stop them covering the footer`.

### Task 2: /kundli chrome: one main-tab row per width, and chips that get out of the way

**Files:**
- Modify: `src/components/AnimatedTabRow.jsx:70`. The underline variant becomes `hidden md:flex` (was `hidden sm:flex`), so 640–767px shows only the NavBar. `NavBar` stays `md:hidden`.
- Create: `src/hooks/useScrollDirection.js`, returning `'up' | 'down'`. It uses a passive scroll listener, with a 8px jitter threshold and `'up'` while `scrollY < 120`.
- Modify: `src/pages/Result.jsx:217-247`. Below `md`, `SummaryChips` collapse (`max-h-0 opacity-0 overflow-hidden`, with `motion-safe:transition-all`) when the scroll direction is `'down'`, and expand on `'up'`. They are always visible at `md` and wider. The sub-tab pill row stays visible.
- Test: `src/hooks/useScrollDirection.test.js`, `src/pages/Result.chrome.test.jsx` (new; reuse the child-component mocks from `Result.test.jsx`)

- [ ] **Step 1: Write the failing tests.**
  - `useScrollDirection`: set `window.scrollY` and dispatch `scroll` events. 0 gives `'up'`; 300 then 400 gives `'down'`; then 380 gives `'up'`; a 4px move changes nothing.
  - `Result.chrome`: the top `AnimatedTabRow` container has class `md:flex` and no `sm:flex`. After a down-scroll the chips wrapper has `max-h-0`, and after an up-scroll it doesn't.
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run the gate.** Expected: PASS.
- [ ] **Step 5: Commit:** `One main-tab row per width on the Kundli page; chips hide while scrolling down`.

### Task 3: 44px tap targets

**Files and the change in each:**
- `AnimatedTabRow.jsx:93` (pill) and its underline tab: `min-h-11`; the pill keeps its look by adding `inline-flex items-center`.
- `SegmentedToggle.jsx:18`: `min-h-11 px-3`.
- `AccountMenu.jsx:60`: the trigger is a `min-w-11 min-h-11` button around the existing 32px avatar. Menu links are `min-h-11`.
- `SiteHeader.jsx:113,121`: the sign-in and CTA pills get `min-h-11`; the hamburger gets `min-w-11 min-h-11`.
- `CompactFooter.jsx:50` and `Footer.jsx:27-31,170-173` links: `inline-flex items-center min-h-11`. Reduce the row `gap-y` so the visual spacing stays roughly the same.
- `LanguageSwitcher.jsx:39,50,69`: `min-w-11 min-h-11` for both sizes.
- `PhoneOtpForm.jsx`: the resend and change-number buttons get `min-h-11`.
- `NavBar` items get `min-h-11` (BottomNav is already 60px).

- [ ] **Step 1: Write the failing test** `src/components/tapTargets.test.jsx`. Render each component above, select its interactive elements by role, and assert each has `min-h-11` or a larger fixed height class from an explicit map (BottomNav `min-h-[var(--bottom-nav-h)]`). It is a class-level check; Task 8 measures the real sizes in a browser.
- [ ] **Step 2: Run.** Expected: FAIL, listing the components.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run the gate.** Expected: PASS.
- [ ] **Step 5: Commit:** `Make every nav, tab and footer control at least 44px`.

### Task 4: One name for the AI page; /insights with Reading | Ask | Reports; reachability

**Files:**
- Modify: en/hi values (approved English change):
  - `nav_ai_guidance` "AI Insights" / "AI इनसाइट्स";
  - `insights_header` "AI Insights" / "AI इनसाइट्स";
  - `kundli_insights_title` "AI Insights" / "AI इनसाइट्स";
  - `insights_seo_title` "AI Insights" / "AI इनसाइट्स".
- New keys:
  - `insights_subtab_ask` "Ask" / "पूछें";
  - `insights_subtab_reports` "Reports" / "रिपोर्ट्स";
  - `insights_topic_picker_label` "Choose a topic" / "विषय चुनें";
  - `insights_career_view_report` "Career report" / "करियर रिपोर्ट";
  - `insights_career_view_rajyogas`, which reuses the `nav_rajyogas` wording.
- Modify: `src/pages/Insights.jsx`:
  - `SUBTABS` is always `[reading, ask, reports]`.
  - The URL params are `?sub=reading|ask|reports`, `&topic=career|health|relationship|finance`, `&view=report|rajyogas` (career only).
  - Old links map to the new form: `?sub=career` becomes `sub=reports&topic=career&view=report`; `?sub=rajyogas` becomes `sub=reports&topic=career&view=rajyogas`; `?sub=health|relationship|finance` becomes `sub=reports&topic=<same>`. The mapping uses `replace`.
  - The Reports panel has a topic `SegmentedToggle` (aria label `insights_topic_picker_label`). The default topic is `input.topic` if it is one of the four, else career.
  - Each report component mounts only after its topic+view has been opened, then stays mounted (generalise the `careerOpened` pattern into a `Set` of opened panel ids).
  - Reading's `onOpenRajyogas` goes to `sub=reports&topic=career&view=rajyogas`.
  - The Ask panel renders `<AskChart input initialQuestion={presetQuestion} />`, lazy, as in `AskPage.jsx`.
- Modify: `src/App.jsx:110`. `/ask` renders `<AskRedirect>`, which does `<Navigate to="/insights?sub=ask" replace state={location.state} />`. Delete `AskPage.jsx`, and drop its Seo keys only if nothing else uses them (grep).
- Modify: `src/config/nav.js`. Remove the `/ask` alias if the redirect makes it unnecessary (keep it if a test relies on it lighting the tab). Add `{ id: 'generate', key: 'nav_cta_compact', fallback: 'Generate Kundli', to: '/generate' }` first in `PUBLIC_NAV_ITEMS`, so the signed-out hamburger and the desktop header include it. Change the desktop header from `slice(0, 2)` to `slice(0, 3)`, so it shows Generate Kundli, Panchang and Explore (nothing drops off).
- Modify: `src/components/AccountMenu.jsx:85-92`. "About Star Jyotish" goes to `/about`, not `/`.
- Modify: `CareerReportRedirect.jsx:11` (`/insights?sub=reports&topic=career&view=report`) and every other link into `/insights?sub=…` or `/ask` (grep `sub=` and `'/ask'`).
- Test: extend `src/pages/Insights.test.jsx`; add `src/pages/askRedirect.test.jsx`; extend `src/components/AccountMenu.test.jsx` and `src/components/SiteHeader.test.jsx`; keep `journey.hindi.test.jsx` green, updating its `/ask` case to the new route.

- [ ] **Step 1: Write the failing tests:**
  - With no topic, `/insights` shows three sub-tabs labelled Reading, Ask, Reports (en) and passes `expectNoEnglish` in hi.
  - `?sub=reports` with no topic and `input.topic` undefined selects Career. The career report component is not mounted until `view=report` is active. Mock `CareerReportTab` and assert it isn't called.
  - Picking Health mounts `TopicReportTab` with `topic='health'`. Switching back to Career doesn't unmount Health. Relationship and Finance are never mounted.
  - The legacy `?sub=rajyogas` is replaced by `sub=reports&topic=career&view=rajyogas`, and `RajyogasTab` shows.
  - `/ask` with state `{ input, presetQuestion: 'Q?' }` lands on `/insights?sub=ask`, and `AskChart` receives `initialQuestion='Q?'`.
  - The nav label, page eyebrow and Kundli card all read "AI Insights" (en) and "AI इनसाइट्स" (hi).
  - The signed-out header menu contains a "Generate Kundli" link to `/generate`.
  - The AccountMenu About link `href` is `/about`.
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run the gate.** Expected: PASS. Also run `npx vitest run src/i18n` so the parity and ratchet checks are seen green.
- [ ] **Step 5: Commit:** `One name for AI Insights; fixed Reading, Ask and Reports tabs; Generate Kundli for visitors`.

### Task 5: Layout details: scroll padding, dvh, wide tables, widths

**Files:**
- Modify: `src/index.css`, adding `html { scroll-padding-top: 72px }`. Hash targets clear the 60px sticky header. Remove the now-redundant `scroll-mt-20` on the legal pages; keep `scroll-mt-40` in `CareerReportTab.jsx:904`, which also clears its sticky sub-bar.
- Modify: all 20 `min-h-screen` uses become `min-h-dvh`. Tailwind 3.4 ships `min-h-dvh`, which needs no fallback because Tailwind emits `100dvh` and all supported browsers have it.
- Modify: `PlanetTable.jsx:73-74` and `AshtakavargaTable.jsx:117,153,186`. The first column is `sticky left-0 z-10` with the table's row background, and the table is `whitespace-nowrap`.
- Create: `src/components/ui/ScrollHint.jsx`, wrapping an `overflow-x-auto` region. It shows a right-edge fade gradient (`pointer-events-none`, `aria-hidden`) while `scrollLeft + clientWidth < scrollWidth - 4`, updating on scroll and resize. Use it in `PlanetTable`, `DashaTable`, `AshtakavargaTable`, `BhavaChalit` and `SarvatobhadraChakra`.
- Modify: widths, per owner decision 3:
  - `SiteHeader.jsx:82` takes a `width` prop (`'5xl' | '6xl'`, default `'6xl'`), and `WorkspaceLayout` passes `'5xl'`;
  - `CompactFooter.jsx:42` becomes `max-w-5xl`;
  - the AI reading text containers (`ChartReading`, `TopicReportTab` and `CareerReportTab` prose blocks) get `max-w-prose`, with headings and cards left at full width.
- Test: `src/components/ui/ScrollHint.test.jsx`; `src/index.css.test.js` (read the css with fs and assert the `scroll-padding-top` rule); `src/components/layout/widths.test.jsx` (WorkspaceLayout header inner and footer both `max-w-5xl`; a marketing page header `max-w-6xl`).

- [ ] **Step 1: Write the failing tests.**
  - `ScrollHint`: stub `scrollWidth` 800, `clientWidth` 300, `scrollLeft` 0, and the fade is present. Set `scrollLeft` 500, dispatch `scroll`, and it is gone.
  - The PlanetTable first `th` and `td` have `sticky`.
  - No `min-h-screen` remains in `src/` (a grep test).
  - The widths and css tests.
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run the gate.** Expected: PASS.
- [ ] **Step 5: Commit:** `Scroll padding, dynamic viewport height, sticky table columns and aligned page widths`.

### Task 6: Accessibility: tabs, toggle, dialog, OTP form, landmarks, motion

**Files:**
- **`AnimatedTabRow.jsx`:**
  - The container gets `role="tablist"` (plus `aria-label` from a new optional `label` prop); each button gets `role="tab"`, `type="button"` and `aria-selected`.
  - Use roving `tabIndex`: 0 on the active tab, -1 on the others.
  - ArrowLeft/ArrowRight move focus and select, wrapping around; Home/End go to the first and last tab.
  - The indicator is `aria-hidden`.
  - Remove `aria-current`.
- **`SegmentedToggle.jsx`:** a `role="group"` with `aria-labelledby` pointing to its label span (give it an `id` via `useId`). Buttons get `type="button"` and `aria-pressed`.
- **`SectionJumpNav.jsx:95-110`:**
  - The dialog gets `aria-labelledby` pointing to the title `id`.
  - On open, focus moves to the first link. Escape closes it. Tab and Shift+Tab cycle inside the sheet.
  - On close, focus returns to the trigger.
  - The trigger gets `aria-haspopup="dialog"` and `aria-expanded`.
  - Lock body scroll while it's open (`document.body.style.overflow`, restored on close).
- **`PhoneOtpForm.jsx`:**
  - Use `useId` ids for each input, and give each `<label>` a matching `htmlFor`.
  - Step-1 input: `autoComplete="tel"` (email mode `"email"`) and `name`.
  - OTP input: `autoComplete="one-time-code"` and `name="otp"`.
  - The error `<p>` gets `role="alert"`, and the input gets `aria-describedby` pointing to it when it's present.
- **Landmarks:**
  - `StaticPageLayout`, `KnowledgeLayout`, `Landing`, `Learn`, `Blog`, `BlogArticle`, `Pricing`, `TestimonialsPage` and `Login` wrap their primary content in `<main id="main">`.
  - `WorkspaceLayout.jsx:73` and `Onboarding.jsx:223` get `id="main"`.
  - Create `src/components/layout/SkipLink.jsx`: `<a href="#main" className="sr-only focus:not-sr-only …">{t('skip_to_content')}</a>` (en "Skip to content", hi "मुख्य सामग्री पर जाएँ"). Render it first in `App.jsx`.
- **Spinners:** in every non-admin `animate-spin` use (the list in the Phase 4 code map: `Insights.jsx:21`, `TransitPanel.jsx:59`, `BlogArticle.jsx:149`, `TopicReportTab.jsx:324`, `DivisionalCharts.jsx:208`, `KPChart.jsx:66`, `ShodashvargaPanel.jsx:147,162`, `ChartReading.jsx:153`, `CareerReportTab.jsx:733`, `ChartHighlight.jsx:124`, `AshtakavargaTable.jsx:80`, `BhavaChalit.jsx:75`, `onboarding/LoadingState.jsx:29`), make `animate-spin` → `motion-safe:animate-spin`. The wrapper gets `role="status"`, and the emoji gets `aria-hidden`. Admin/astrologer dashboards are out of scope.
- Test: `AnimatedTabRow.test.jsx`, `SegmentedToggle.test.jsx`, `SectionJumpNav.test.jsx`, `PhoneOtpForm.test.jsx`, `layout/SkipLink.test.jsx` (all new); a grep test that no non-admin file has a bare `animate-spin` without `motion-safe:`.

- [ ] **Step 1: Write the failing tests:**
  - **Tabs:** `getByRole('tablist')`. With three tabs, ArrowRight from the first focuses and selects the second, and ArrowLeft from the first wraps to the last. Only the active tab has `tabIndex 0`.
  - **Toggle:** `aria-pressed` is true only on the selected button, and the group's accessible name equals the label.
  - **Sheet:**
    - opening it focuses the first link;
    - Tab from the last focusable element wraps to the first;
    - Escape closes it and focus is back on the trigger;
    - `getByRole('dialog', { name: <title> })` finds it;
    - the body overflow is `hidden` while open and restored after.
  - **OTP form:**
    - `getByLabelText(<phone label>)` returns the input;
    - the OTP input has `autocomplete="one-time-code"`;
    - submitting a short code shows a `role="alert"` with the error;
    - `aria-describedby` points to the error.
  - **Skip link:** the skip link is the first focusable element and its `href` is `#main`. `Landing` and `StaticPageLayout` render a `main#main`.
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run the gate.** Expected: PASS.
- [ ] **Step 5: Commit:** `Accessible tabs, toggles, jump-nav dialog and OTP form; skip link and reduced-motion spinners`.

### Task 7: Replace alert() with inline messages

**Files:**
- Modify: `src/pages/ContactUs.jsx:70`. Clicking WhatsApp shows an inline `role="status"` note under the button with `t('contact_whatsapp_alert')` (an existing key). It is dismissible, and it disappears after 8 seconds or on the next click.
- Modify: `src/components/PaywallCard.jsx:28`. The same pattern, with a new key `paywall_checkout_soon`: en "Checkout is coming soon — your full report will unlock right here." (the current text verbatim), hi "चेकआउट जल्द आ रहा है — आपकी पूरी रिपोर्ट यहीं अनलॉक होगी।". Keep the Razorpay TODO comment.
- Test: `src/pages/ContactUs.test.jsx`, `src/components/PaywallCard.test.jsx` (both new)

- [ ] **Step 1: Write the failing tests.** Spy on `window.alert`. Clicking the button shows the message in a `role="status"` element and `alert` is never called. The message is in Hindi under `hi`.
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement.** Also add a grep test that `src/` (excluding tests) has no `alert(` call.
- [ ] **Step 4: Run the gate.** Expected: PASS. The ratchet baseline may shrink: if `PaywallCard.jsx` was listed, regenerate it with `UPDATE_BASELINE=1` and confirm only that entry dropped.
- [ ] **Step 5: Commit:** `Show coming-soon notices inline instead of browser alerts`.

### Task 8: Browser check and ship

**Files:**
- Create (scratchpad, not committed): `phase4-check.mjs`. It runs playwright-core with `NODE_PATH=/home/sushilk/logiqids-quest/node_modules` and `executablePath: '/usr/bin/google-chrome'`.
- Modify: `docs/superpowers/plans/2026-11-04-frontend-ux-roadmap.md` (the Phase 4 status and the Tracking row)

- [ ] **Step 1: Gate.** From `frontend/`: `npx vitest run && npx vite build`. From `backend/`: `.venv/bin/pytest -q`.
- [ ] **Step 2: Browser check.** Run the local backend plus `VITE_API_URL= npx vite`, sign in with a seeded test session (or check signed out where sign-in isn't possible, and say so). At 390×844, 700×900 and 1440×900, in en and hi, over `/generate`, `/kundli` (each main tab), `/insights` (each sub-tab), `/home`, `/panchang` and `/about`:
  - **No horizontal page scroll:** `document.documentElement.scrollWidth <= innerWidth`.
  - **Tap targets:** every visible `a, button, [role=tab]` inside the header, the footer, the NavBar, the BottomNav and the tab rows measures ≥ 44×44, or list the offenders.
  - **Scrolled to the bottom:** the ScrollToTop button's rect doesn't intersect any footer link rect, and the last footer link's rect is entirely above the top of the fixed bars.
  - **At 700px on `/kundli`:** exactly one of {the top main-tab row, the NavBar} is visible.
  - **Safe-area test:** emulate a 34px inset by injecting `:root{--safe-bottom:34px}`. The raised NavBar's bottom edge equals the BottomNav's top edge (±1px).
  - **Keyboard:** Tab from page load focuses the skip link first.
  - Take screenshots of each page, viewport and language.
- [ ] **Step 3: Fix and re-check.** Any failure gets a fix plus a vitest pin in the owning area, then re-check. Commit as `Fix layout issues found in the Phase 4 browser check`.
- [ ] **Step 4: Update the roadmap** and commit.
- [ ] **Step 5: PR.** This step comes after the final whole-branch review: push `feat/phase4-mobile-nav-polish` and open a PR to `main`, "Phase 4: mobile and navigation polish", with the check results.
