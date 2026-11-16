# UX Slice 3: Laptop Layout and Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (faster mode, to be confirmed by the owner). Steps use checkbox (`- [ ]`) syntax.

**Goal:** On laptops, every page should sit on one shared frame, /home should use the width, and the audit's remaining polish items should be fixed. Mobile must not get worse.

**Architecture:**
- Task 1 defines the frame:
  - one width (`max-w-5xl`) and one gutter, in `components/layout/frame.js`;
  - used by SiteHeader, Footer, CompactFooter and PageContainer;
  - one header/footer rule per page type, enforced by a source-scan test.
- Tasks 2–7 then fix disjoint sets of files, in parallel worktrees.
- Task 8 is the browser pass, the whole-branch review and the docs update.

**Tech Stack:** React 18, Vite, Tailwind 3.4, i18next 26 (v4 plural suffixes), Vitest, Playwright for the browser pass.

**Spec:**
- `docs/superpowers/audits/2026-11-14-ux-audit.md`: the laptop findings (lines 141–146), plus L4, X1–X11 and E1.
- The roadmap's "Left from UX slice 1/2" lists in `docs/superpowers/plans/2026-11-04-frontend-ux-roadmap.md`.
- The owner decisions in Global Constraints.

## Global Constraints

- **Branch** `feat/ux3-laptop-polish`, from `main` at 1770c5d. The PR targets `main`.
- **Owner decisions (15 Nov):**
  - (a) **One frame width, `max-w-5xl` (1024px), on every page.** Marketing pages move from 6xl to 5xl.
  - (b) **App pages fill the frame:** /panchang, /week-ahead, /account and /home put their left edge on the logo and use 2 columns from `lg` where the content allows. **Long-text pages keep a centred prose column:** About, FAQ, Contact, the legal pages, blog articles and Learn articles.
  - (c) **The Landing testimonial defaults are real customers, quoted with consent.** Translate them.
  - (d) **The social icons stay as they are** (do-nothing placeholders). The owner will add links later, so X3 is out of scope.
- **Earlier owner decisions still hold:**
  - selected tabs are gold;
  - two-level Kundli tabs;
  - one bottom bar on mobile /kundli;
  - no coined Hindi words (keep the English word in Devanagari).
- **Layout rule:** layout changes apply at `lg` (≥1024px) and up. Below `lg`, DOM order and rendering stay as they are today. Phone layouts (360/390) must look the same before and after, apart from the items that target them (L4, X2).
- **Text sizes:** readable text is ≥11px (`text-2xs`). Never use `text-[10px]` or `text-3xs` for headings.
- **Colours:** use tokens only. The guards in `src/theme/colourGuards.test.js` and `tokenUsage.test.js` must stay green.
- **i18n:**
  - Every new key goes in both `en.json` and `hi.json`. `i18n/parity.test.js` must pass.
  - Add new keys next to related existing keys, not at the end of the file, to limit merge conflicts between worktrees.
  - Hindi copy follows `hindi-wording` (natural Hindi, English word in Devanagari when no natural word exists).
- **Before each commit:** `npm run build` regenerates `frontend/public/sitemap.xml`. Restore it with `git checkout frontend/public/sitemap.xml`.
- **Test command:** `cd frontend && npx vitest run <files>`. Run the full `npx vitest run` before each merge.

## Already done or out of scope

These were checked against the code on 15 Nov.

**Already fixed:**
- X5: the Sarvatobhadra legend matches the markers (ux2 fix B, guarded by `chartColour.test.jsx:74`).
- E1, React prop warning: fixed in f950af3.
- SouthIndia, Western and Shodashvarga: deleted in 2e9914e.
- `main` flex-1: already set in WorkspaceLayout and StaticPageLayout. No band showed at 1280 or 1440 (Task 8 re-checks this).
- The `useRenderedScale` late-mount audit: the only other caller, KundliChart, always mounts its svg, so there is nothing to fix.

**Out of scope:**
- X3, the social icons (owner decision d).
- The 12 baselined hex values, and consuming `PLANET_COLORS_NIGHT`. These stay in the roadmap.
- The refresh-session cleanup and the per-IP refresh limit, which are backend work.
- Printed labels at 10px.
- Desktop-size pills on touch tablets.

## Review Focus

1. **Hindi at laptop widths.** Two columns on /home, /panchang and /week-ahead must not clip Devanagari headings (longer and taller than English). The browser pass checks `hi` at 1280.
2. **A /home beat with no data.** A beat that renders `null` (no week, no reports, no coming-up events) must not leave an empty column or a gap in the rail. Task 3 tests a rail with all three empty.
3. **Insights opened directly, with no router state.** From a reload or a shared link, the back link must still reach the chart (sessionStorage `sj_last_chart`) and autostart must not fire. Task 4 tests both.
4. **Rapid tab switching in Divisional charts.** A slow reply for D9 must not overwrite D10 after the user switched. Task 5 tests it with an aborted request.
5. **A stale manual location after sign-in.** A city chosen by hand while signed out must still be used after 12h and after signing in, rather than showing an empty Panchang. Task 2 tests both.

---

### Task 1: One frame, one header/footer rule

Covers: the laptop grid finding, the /learn header/footer mismatch, and X10.

**Files:**
- Create: `frontend/src/components/layout/frame.js`
- Modify:
  - `components/SiteHeader.jsx` (drop the `width` prop; lines 53, 119, 192)
  - `components/Footer.jsx` (5 × `max-w-6xl mx-auto px-6`)
  - `components/CompactFooter.jsx:43`
  - `components/ui/PageContainer.jsx`
  - `components/layout/WorkspaceLayout.jsx:62` (remove `width="5xl"`)
  - `pages/Learn.jsx:194` (`CompactFooter` → `Footer`)
  - `pages/Blog.jsx:197-219` (delete its own newsletter block; Footer keeps one)
- Test:
  - `components/layout/widths.test.jsx` (rewrite)
  - `components/layout/chromeRule.test.js` (new)

**Interfaces:**
- Produces:
  - `FRAME = 'max-w-5xl mx-auto w-full'`
  - `GUTTER = 'pl-[max(1rem,var(--safe-left))] pr-[max(1rem,var(--safe-right))]'` (moved from SiteHeader's `SAFE_GUTTER`)
  - `PageContainer({ width: 'frame' | 'narrow', className, children })`:
    - `frame` (the default) is `FRAME + GUTTER`;
    - `narrow` is `max-w-2xl mx-auto w-full px-4`, for forms;
    - the old `default` and `wide` values map to `frame`.
  - Tasks 2 and 3 use `PageContainer` or `FRAME`/`GUTTER`.

- [ ] **Step 1: Write the failing tests.**
  - `widths.test.jsx`: for each of WorkspaceLayout at `/home`, `<SiteHeader />`, `<Footer />` and `<CompactFooter />`, every `header > div` and `footer div[class*="max-w-"]` contains `max-w-5xl`, and none contains `max-w-6xl`.
  - `chromeRule.test.js` is a source scan over `src/pages/**/*.jsx` and `src/components/**/*Layout.jsx`. Its tests:
    - `it('marketing pages pair SiteHeader with Footer')`: any file rendering `<SiteHeader` but not inside WorkspaceLayout renders `<Footer` and not `<CompactFooter`.
    - `it('only WorkspaceLayout renders CompactFooter')`.
    - `it('only one newsletter form per page')`: no file under `src/pages` calls `subscribeNewsletter`.
- [ ] **Step 2: Run them and see them fail:** `npx vitest run src/components/layout`. Expect: FAIL on 6xl, on Learn's CompactFooter and on Blog's newsletter.
- [ ] **Step 3: Implement.**
  - Create `frame.js`.
  - SiteHeader, Footer and CompactFooter use `${FRAME} ${GUTTER}` for every inner row, which replaces the Footer's `px-6`.
  - Update PageContainer as described in Interfaces.
  - Change Learn's footer and delete Blog's newsletter block, along with its now-unused imports and state.
- [ ] **Step 4: Run them and see them pass, then run the full suite.** Expect: all green. Update any snapshot or test that asserted `max-w-6xl` (`SiteHeader.test.jsx`) to the new rule.
- [ ] **Step 5: Commit:** `ux3: one 5xl frame and gutter; marketing pages use Footer; one newsletter form`

### Task 2: App pages fill the frame (Panchang, Week Ahead, Account) and Panchang's location

Covers: the reading-page alignment, X11, and the 10px Panchang headings. This task gets a full review because it changes location logic.

**Files:**
- Modify:
  - `pages/PanchangDetail.jsx` (hero 530, content 563, TodayTab 304–390, headings 46 and 233, anon location 506–517)
  - `pages/WeekAhead.jsx` (69, 88, day list from 104)
  - `pages/Profile.jsx:184`
  - `services/currentLocation.js` (`isLocationStale`, line 42)
- Test:
  - `services/currentLocation.test.js` (create, or extend if it exists)
  - `pages/PanchangDetail.layout.test.jsx` (new)

**Interfaces:**
- Consumes: `PageContainer` / `FRAME` + `GUTTER` from Task 1.
- Produces: `isLocationStale(loc)` returns `false` whenever `loc.source === 'manual'`.

- [ ] **Step 1: Write the failing tests.**
  - `currentLocation.test.js`:
    - `isLocationStale({ source: 'manual', savedAt: Date.now() - 13*3600e3 })` is `false`.
    - `isLocationStale({ source: 'geo', savedAt: Date.now() - 13*3600e3 })` is `true`.
    - Test name: `'a manual city saved signed-out is copied to the user key on first read after sign-in'`. Seed `sj_current_location_v1:anon` (manual), then `getCurrentLocation('u1')` returns it, and the `:u1` key now holds it.
  - `PanchangDetail.layout.test.jsx` (mock the panchang fetch and auth as anonymous):
    - With a stale manual location in localStorage and geolocation rejecting, the page renders the stat cards, not `LocationPrompt`.
    - The hero and content wrappers contain `max-w-5xl` and no `max-w-2xl`.
    - The TodayTab sections wrapper has `lg:grid-cols-2`.
    - No element's class contains `text-[10px]`.
- [ ] **Step 2: Run them and see them fail.**
- [ ] **Step 3: Implement.**
  - **Location:**
    - `isLocationStale` exempts manual locations.
    - `getCurrentLocation(userId)` falls back to the `:anon` entry when the user key is empty, and copies it across.
    - In PanchangDetail's anonymous path, when geolocation fails, fall back to the saved location (even if stale) before showing the prompt.
    - Do not fall back to the birth city. `useCurrentLocation.js:4-7` documents that decision.
  - **Layout:**
    - The Panchang hero and content use the frame.
    - TodayTab: Pancha anga goes in the left column; sky timings and windows go in the right column at `lg`.
    - The Week and Month tables span the frame.
    - WeekAhead: the hero and content use the frame; the day cards become `lg:grid-cols-2`.
    - Profile: the frame, with its independent cards in `lg:grid-cols-2 lg:gap-6`. The forms inside the cards keep their own width.
  - **Headings:** `text-[10px]` → `text-2xs`.
- [ ] **Step 4: Run them and see them pass, then run the full suite.**
- [ ] **Step 5: Commit:** `ux3: Panchang, Week Ahead and Account fill the frame; manual city never expires`

### Task 3: Two-column /home

Covers: the /home laptop finding and the charts carousel with no arrows.

**Files:**
- Modify:
  - `pages/PersonalHome.jsx` (wrapper 219, beats 224–305)
  - `components/home/HomeMasthead.jsx:345`
  - `components/home/ChartsStrip.jsx:30`
- Test: `pages/PersonalHome.layout.test.jsx` (new)

**Interfaces:**
- Consumes: `FRAME`, `GUTTER` from Task 1.
- Produces: `Beat` keeps its current props and gains `className`.

- [ ] **Step 1: Write the failing tests.** Render with the existing PersonalHome test mocks (see `pages/PersonalHome.week.test.jsx`). Assertions:
  - The page wrapper and the masthead inner box contain `max-w-5xl`.
  - The beats container has `lg:grid` and `lg:grid-cols-[minmax(0,1fr)_20rem]`.
  - `#sj-window`, `#sj-week` and the coming-up beat sit inside an element with `lg:sticky` (the rail).
  - Beat DOM order is unchanged: your-day, window, week, charts, reports, coming-up, sky, idea. This keeps the mobile order.
  - When week, reports and coming-up all render nothing, the rail still contains `#sj-window` and there is no empty `[data-rail]` child.
  - `ChartsStrip` renders previous and next buttons named `t('carousel_prev')` and `t('carousel_next')` (new keys), `hidden md:flex`. Clicking next calls `scrollBy` on the scroller.
- [ ] **Step 2: Run them and see them fail.**
- [ ] **Step 3: Implement.**
  - **Container:** the parent is `flex flex-col lg:grid lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-x-8`.
  - **Columns:** the main column and the rail are each `contents lg:block`. Each Beat carries an `order-N lg:order-none` class, so phones keep today's sequence.
    - The main column has the gold thread and holds your-day, charts, reports, sky and idea.
    - The rail (`data-rail`, `lg:sticky lg:top-[76px] lg:self-start`) holds window, week and coming-up, with a thread of its own.
  - **Masthead:** uses the frame.
  - **Charts carousel:** arrows scroll by 80% of `clientWidth` and are hidden when there is nothing to scroll in that direction.
- [ ] **Step 4: Run them and see them pass, then run the full suite** (the /home night-colour guards must stay green).
- [ ] **Step 5: Commit:** `ux3: two-column /home from lg; charts carousel arrows`

### Task 4: Kundli ↔ Insights

Covers: X1, the way back from /insights, the summary chips on Life Areas and Download, and the 10px headings in Result and Insights. This task gets a full review because it changes navigation logic.

**Files:**
- Modify:
  - `pages/Result.jsx` (navigation 300 and 386, chips 345–370, headings 394 and 404)
  - `pages/Insights.jsx` (header 152–163, ChartReading mount 181, heading 155)
  - `components/ChartReading.jsx:124-131`
- Test:
  - `pages/Insights.test.jsx`
  - `pages/Result.chrome.test.jsx`
  - `components/ReadingTeaser.test.jsx`

**Interfaces:**
- Produces:
  - `ChartReading` accepts a new prop, `autostart?: boolean`.
  - Router state is `{ data, input, autostart?: true }`.
  - New key `insights_back_to_chart`: en "Back to chart", hi "चार्ट पर वापस".

- [ ] **Step 1: Write the failing tests.**
  - **Insights:**
    - `'anonymous reader arriving with autostart starts the reading without a second tap'`: the reading request fires once and no Reveal button renders.
    - `'reload without router state does not autostart'`: the state comes from sessionStorage only, and the idle Reveal button shows.
    - `'back link returns to /kundli with the chart'`: a link named "Back to chart" has `href` `/kundli`. Clicking it lands on /kundli with the same chart, for both router state and sessionStorage sources.
    - After autostart, the location state no longer carries `autostart` (replace navigation), so Back and Forward don't restart the reading.
  - **Result:**
    - Clicking "Reveal my reading" navigates with `autostart: true`.
    - At phone width on `?tab=divisional` and `?tab=download`, the `ChipsToggle` button renders and toggles the chips.
  - **Both:** no `text-[10px]` in Result.jsx or Insights.jsx (source scan).
- [ ] **Step 2: Run them and see them fail.**
- [ ] **Step 3: Implement.**
  - Result passes `autostart: true` from the teaser only. The Insights card at line 300 does not.
  - Insights reads `location.state?.autostart`, passes it down, then clears it with `navigate(..., { replace: true, state: { ...rest } })`, the same way `clearPresetQuestion` does at lines 139–142.
  - ChartReading's condition becomes `(isAuthenticated || autostart) && status === 'idle' …`.
  - Put the back link at the left of the Insights sticky header, with `min-h-11`.
  - Add the chips toggle row for main tabs without a sub-tab row, when `belowMd`.
  - `text-[10px]` → `text-2xs`.
- [ ] **Step 4: Run them and see them pass, then run the full suite.**
- [ ] **Step 5: Commit:** `ux3: one tap to reveal a reading; back to chart from Insights; chips on every Kundli tab`

### Task 5: Chart components

Covers: L4, the chart numerals at 10.8px, and DivisionalCharts' fetching and headings. Result.jsx is not touched.

**Files:**
- Modify:
  - `components/PlanetTable.jsx` (header 79–82, body 112–127)
  - `components/KundliChart.jsx` (lines 141, 144)
  - `components/BhavaChalit.jsx:148`
  - `components/DivisionalCharts.jsx` (fetch 102–119, heading 199)
- Test:
  - `components/PlanetTable.sticky.test.jsx`
  - `components/chartLegibility.test.jsx`
  - `components/DivisionalCharts.test.jsx` (new)

**Interfaces:** `fetchReport(endpoint, body, { signal, retryOn429 })` from `api/reportCache.js:59`. Check whether the endpoint string can carry `?division=`. If it can't, put `division` in the body, provided the backend accepts it; otherwise keep the query string.

- [ ] **Step 1: Write the failing tests.**
  - PlanetTable: the header cells read Planet, House, Sign, Degree in that order.
  - chartLegibility: rendered at scale 0.5, the rashi numeral `font-size` and the status label `font-size` are ≥ 11.
  - DivisionalCharts:
    - `'switching chart while a request is in flight keeps the latest chart'`: D9 resolves after D10, and D10's data is shown.
    - `'reopening a chart uses the cache'`: `fetch` is called once for D9 opened twice.
    - `'a 429 is retried once'`.
  - No `text-[10px]` in BhavaChalit or DivisionalCharts.
- [ ] **Step 2: Run them and see them fail.**
- [ ] **Step 3: Implement.**
  - PlanetTable: swap the House column to second place in the header and body.
  - KundliChart: change the minimum argument to `11` at lines 141 and 144.
  - DivisionalCharts: use `fetchReport` with an `AbortController` ref that aborts the previous request; ignore `AbortError`.
  - Headings: `text-[10px]` → `text-2xs`.
- [ ] **Step 4: Run them and see them pass, then run the full suite.**
- [ ] **Step 5: Commit:** `ux3: house column second; chart numerals ≥11px; divisional charts cached and race-free`

### Task 6: Forms and sign-in

Covers: X2, X8 and the E1 GSI warning. This task gets a full review because it touches auth.

**Files:**
- Modify:
  - `pages/Home.jsx:78`
  - `components/BirthForm.jsx` (form at 80; checks at 48–57)
  - `pages/Login.jsx` (96–104)
  - `components/auth/PhoneOtpForm.jsx:20`
  - `main.jsx` (20, 30)
  - `components/auth/GoogleLoginButton.jsx`
- Test:
  - `components/BirthForm.test.jsx`
  - `components/auth/PhoneOtpForm.test.jsx`
  - `pages/Login.test.jsx` (create if missing)

**Interfaces:**
- Produces:
  - `export const GOOGLE_ENABLED: boolean` in a new `src/config/google.js`, alongside `GOOGLE_CLIENT_ID`. `main.jsx` and `Login.jsx` import both from there.
  - New key `form_error_required`: en "Please fill in your name, date of birth and birth place.", hi "कृपया अपना नाम, जन्म तिथि और जन्म स्थान भरें।"

- [ ] **Step 1: Write the failing tests.**
  - **BirthForm:**
    - The `<form>` has `noValidate`.
    - Submitting with an empty name shows an `role="alert"` with `form_error_required` and does not call `onSubmit`. Assert this under `i18n.changeLanguage('hi')` too: the Hindi text appears.
    - Same for a missing date and a missing place.
  - **Login:**
    - `login_disclaimer` text appears exactly once.
    - With `GOOGLE_ENABLED=false` (mock `config/google`), there is no Google button, no "or" divider, and no `GoogleOAuthProvider` wrapper is required.
  - **PhoneOtpForm:** the disabled submit button's class has no `bg-primary/40` and uses `disabled:bg-line disabled:text-ink-muted`.
- [ ] **Step 2: Run them and see them fail.**
- [ ] **Step 3: Implement.**
  - Home.jsx:78 becomes `relative z-10 flex-1 px-4 -mt-4 pb-8`.
  - Add `noValidate` and replace the silent `return` with `setError(t('form_error_required'))`.
  - Delete Login.jsx:104.
  - Use the disabled token style in PhoneOtpForm.
  - Render `GoogleOAuthProvider` only when `GOOGLE_ENABLED`.
  - Check the browser pass: the contrast walker reports 0 failures on /login.
- [ ] **Step 4: Run them and see them pass, then run the full suite.**
- [ ] **Step 5: Commit:** `ux3: translated form errors; one privacy line; solid disabled button; no GSI without a client id`

### Task 7: Content, i18n and leftovers

Covers: X4, X6, X7, X9, the gold Admin and Astrologer tabs, NavBar's unused `raised` mode, and the other 10px headings.

**Files:**
- Modify:
  - `components/home/ReportsStrip.jsx` (117, 143)
  - `components/landing/CareerReportPreview.jsx:47-58`
  - `components/Testimonials.jsx:20-25`
  - `components/AskChart.jsx:118` and `components/home/AskPersonaPanel.jsx:200` (key only)
  - `pages/AdminDashboard.jsx:918-921`, `pages/AstrologerDashboard.jsx:348-351`
  - `components/NavBar.jsx:18-28`, `components/layout/useBottomChrome.js` (`raisedSubNav`), `pages/Result.jsx:452` (drop `raised={false}`; a one-line change, so merge after Task 4)
  - `pages/learn/categories/Yogas.jsx`, `components/knowledge/SignNav.jsx` (10px)
  - `locales/en.json`, `locales/hi.json`
- Test:
  - `theme/ux2Selection.test.js` (add the two dashboards)
  - `i18n/parity.test.js`
  - `components/Testimonials.test.jsx` (new)
  - `components/landing/CareerReportPreview.test.jsx` (new)
  - `components/NavBar.test.jsx`
  - `components/layout/BottomChromeSpacer.test.jsx`

**Interfaces:**
- Produces these keys:
  - `ask_questions_remaining_one` / `_other`, replacing `ask_questions_remaining`. Hindi `_one` and `_other` both read `"{{count}} प्रश्न शेष"`.
  - `career_preview_hz_{now,next12,y1_3,y3_5}_body`.
  - `testimonial_default_{1..4}_{text,detail}`.

- [ ] **Step 1: Write the failing tests.**
  - ReportsStrip renders the text "Open →" exactly once per link, with no "→ →".
  - CareerReportPreview: each of the four horizons renders a non-empty body line beneath its label.
  - Testimonials:
    - With the API returning `[]` under `hi`, the default cards show the Hindi `testimonial_default_1_text`.
    - Names and cities stay as written (proper nouns).
    - API-returned testimonials render unchanged.
  - AskChart with `count=1` shows "1 question remaining"; with 5 it shows "5 questions remaining".
  - ux2Selection: AdminDashboard and AstrologerDashboard use `AnimatedTabRow` (or `bg-primary text-night` on the active tab), with no `bg-parchment-card text-primary-ink` on the active tab.
  - NavBar and useBottomChrome: no `raised` prop or `raisedSubNav` remains (source scan). Delete the `raised` test cases.
  - No `text-[10px]` remains anywhere under `src/` outside SVG chart internals. Make this a repo-wide scan, so it becomes the guard.
- [ ] **Step 2: Run them and see them fail.**
- [ ] **Step 3: Implement.**
  - Delete the literal ` →` in ReportsStrip.
  - Career preview: add a sample one-liner per horizon. English:
    - "Consolidate skills in your current role"
    - "A visible step up around mid-year"
    - "Leadership or a field change"
    - "Long-term authority and recognition"

    Write natural Hindi for each.
  - Testimonials: the defaults read `t()` keys. Hindi translations are faithful renderings of the customers' words, with nothing added.
  - Dashboards: use `AnimatedTabRow variant="pill"`.
  - Remove `raised`.
  - 10px → `text-2xs`.
- [ ] **Step 4: Run them and see them pass, then run the full suite.**
- [ ] **Step 5: Commit:** `ux3: content fixes, plurals, gold dashboard tabs, no 10px headings`

### Task 8: Browser pass, whole-branch review and docs

**Files:**
- Modify:
  - `docs/superpowers/plans/2026-11-04-frontend-ux-roadmap.md` (record UX3 and its leftovers)
  - the memory file `star-jyotish-frontend-ux-roadmap.md`

- [ ] **Step 1: Browser pass** (Playwright, dev-OTP login via the API cookie, `sj_last_chart` seeded for /kundli). Check at 1440×900, 1280×800 and 1024×768, then at 390 and 360:
  - **The frame.** On `/`, `/learn`, `/blog`, `/about`, `/faq`, `/pricing`, `/panchang`, `/week-ahead`, `/account`, `/home`, `/kundli` and `/insights`, the header inner, footer inner and first content block share the same left and right edges (±1px). The exceptions are hero bands and the centred prose pages, whose column is centred in the frame.
  - **The footer.** The footer bottom equals `docH` on every page, so there is no band under it.
  - **/home.** It has two columns at ≥1024px and one at 390, in the same order as before.
  - **Hindi.** At 1280, /home, /panchang and /week-ahead have no clipped Devanagari.
  - **Regressions.** The contrast walker reports 0 AA failures on every page above. In the console there is no React warning and no GSI warning.
  - **The flows.**
    - X1: an anonymous user taps once to see the reading.
    - The Insights back link works, including after a reload.
    - Life Areas and Download show the chips toggle at 390.
    - Planets shows the House column at 360.
- [ ] **Step 2: Fix wave.** Fix anything the browser pass finds, as one commit per page group.
- [ ] **Step 3: Whole-branch review** on opus, then one fix wave.
- [ ] **Step 4: Docs.** Update the roadmap and the memory, run `graphify update .`, and commit `docs: roadmap records UX slice 3`.

## Execution order (faster mode)

- **Wave 1:** Task 1 alone (everything depends on `frame.js`).
- **Wave 2, in parallel worktrees:**
  - Task 2 (Panchang, WeekAhead, Profile, location)
  - Task 3 (/home)
  - Task 4 (Result, Insights, ChartReading)
  - Task 5 (chart components)
  - Task 6 (forms and auth)

  None of these share a source file; they overlap only in the locale JSON.
- **Wave 3:** Task 7. It touches Result.jsx:452 after Task 4 and the locale files after everyone else.
- **Wave 4:** Task 8.
- **Reviews:**
  - Tasks 2, 4 and 6 get the full review (location, navigation and auth logic).
  - Tasks 1, 3, 5 and 7 get one lighter review each.
