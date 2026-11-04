# Phase 2: Core Flows Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A user never loses their chart, never retypes their details, and never waits twice for the same report.

**Architecture:** Frontend only, on branch `fix/phase2-core-flows` off `main` (after #161).
- **Chart state:** a session store (`services/lastChart.js`) plus one resolver (`resolveChartState`). `/kundli`, `/insights` and `/ask` survive refresh, deep links and sign-in. Tab state moves into the URL.
- **Report requests:** a cache-and-abort layer (`api/reportCache.js` + `hooks/useLatestRequest.js`) replaces the raw `fetch` in the four report components.
- **Forms:** one `PlaceCombobox` replaces four hand-rolled suggestion lists.

**Tech Stack:** React 18, react-router 7 (`useSearchParams`), i18next, Vitest + Testing Library (jsdom).

**Spec:** `docs/superpowers/plans/2026-11-04-frontend-ux-roadmap.md`, Phase 2 (findings P-H6, N-H1, N-H2, N-M2, P-M1, P-M2, I-9, plus the "AI reading is buried" screenshot finding).

## Global Constraints

- New user-visible text goes through `t()`, with keys in **both** `en.json` and `hi.json` (copy tables below).
- Every `localStorage`/`sessionStorage` access is wrapped in try/catch, and the app works when storage throws.
- The Kundli two-level navigation is unchanged: main tabs Birth Chart / Life Areas / Analysis / Download, sub-tab pill rows, bottom NavBar. Only where its state lives changes.
- Gate before each commit, from `frontend/`:
  - `npx vitest run` passes;
  - `npx eslint <changed files>` reports 0 errors.
- Commit author is `sushiljain07@gmail.com` (already set repo-locally). End messages with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Run `graphify update .` after the code changes.

## Review Focus

1. **Storage blocked.** With `sessionStorage` throwing, generating a chart and opening `/kundli` still works. The `navigate` state path is untouched, and refresh then redirects as it does today. Pinned in Task 4.
2. **A cached report in the wrong language.** Switching EN→HI after a reading loaded must show the Hindi reading, not the cached English one. Switching back is instant, from cache. Pinned in Task 6.
3. **Regenerate after a cached report.** Regenerate must call the server even though a cached copy exists. Pinned in Task 6.
4. **Place typed but not picked while suggestions are showing.** Submit is blocked with a message. When there are no suggestions (service down, or a rare place), free text is allowed, because the backend geocodes it. Pinned in Task 2.
5. **Old links with router state.** `navigate('/kundli', { state: { activeTab: 'advanced' } })` from PersonalHome, Landing and nav must still open the right tab when the URL has no `?tab`. Pinned in Task 5.

---

### Task 1: Validate birth dates, link labels, and offer "I don't know my birth time"

**Files:**
- Create: `frontend/src/utils/birthDate.js`
- Modify: `frontend/src/components/BirthForm.jsx` (whole form), `frontend/src/components/onboarding/BirthTimeSelector.jsx` (add `type="button"` to the accuracy buttons, so they don't submit a surrounding `<form>`)
- Modify: `en.json`, `hi.json`
- Test: `frontend/src/utils/birthDate.test.js`, `frontend/src/components/BirthForm.test.jsx`

**Interfaces:**
- Produces:
  - `isValidBirthDate(year: number, month: number, day: number, today = new Date()) -> boolean`. Returns true when the date exists (round-trip through `new Date(y, m-1, d)`) and is not after `today` (local date).
  - `BirthForm`'s `onSubmit(input)`, where `input = { name, date: 'YYYY-MM-DD', time: 'HH:MM', place, timeAccuracy: 'exact'|'approximate'|'unknown' }`. When `timeAccuracy === 'unknown'`, `time` is `UNKNOWN_BIRTH_TIME_DEFAULT` (`'12:00'`, from `services/astrologyProfiles.js:39`).

**Copy:**

| key | en | hi |
|---|---|---|
| `form_error_invalid_date` | That date doesn't exist. Please check the day and month. | यह तारीख मौजूद नहीं है। कृपया दिन और महीना जाँचें। |
| `form_error_future_date` | Birth date can't be in the future. | जन्म तिथि भविष्य की नहीं हो सकती। |
| `form_time_accuracy_label` | How sure are you of the birth time? | आप जन्म समय के बारे में कितने आश्वस्त हैं? |

The accuracy option labels and notes reuse the existing `onboarding_time_exact|approximate|unknown` and `onboarding_time_*_note` keys.

- [ ] **Step 1: Write failing tests.**
  - `birthDate.test.js`:
    - `isValidBirthDate(1990, 2, 31)` is false;
    - `isValidBirthDate(2000, 2, 29)` is true;
    - `isValidBirthDate(1900, 2, 29)` is false;
    - a date one day after a fixed `today = new Date(2026, 10, 4)` is false, and that same `today` is true.
  - `BirthForm.test.jsx`, rendering `<BirthForm onSubmit={spy} />` with i18n in `en`:
    - **(a)** `screen.getByLabelText(en.form_name)` and `getByLabelText(en.form_place)` resolve to inputs, so the labels are linked;
    - **(b)** choosing 31 / February / 1990 and submitting shows `en.form_error_invalid_date`, and `spy` is not called;
    - **(c)** choosing "unknown" accuracy hides the HH/MM/AM-PM selects, and submitting calls `spy` with `time: '12:00', timeAccuracy: 'unknown'`;
    - **(d)** an exact time 07:05 PM gives `time: '19:05', timeAccuracy: 'exact'`.
  - Mock `usePlaceSuggestions` to return `[]` so place free text is allowed (see Task 2).
- [ ] **Step 2: Run to verify they fail.** Run `npx vitest run src/utils/birthDate.test.js src/components/BirthForm.test.jsx`. Expected: FAIL (module missing; label lookups fail; no validation).
- [ ] **Step 3: Implement.**
  - Use `isValidBirthDate`, with `role="alert"` on the error paragraph.
  - Give each label `htmlFor` pointing at `useId()`-based ids. The date and time groups use `fieldset` + `legend`, with `aria-label` "Day"/"Month"/"Year" on the selects.
  - Replace BirthForm's own time selects with `<BirthTimeSelector t={t} accuracy hour minute ampm onAccuracyChange onTimeChange/>`, defaulting `accuracy` to `'exact'`.
- [ ] **Step 4: Run to verify they pass.** Run the same command (all pass), then `npx vitest run` (all green).
- [ ] **Step 5: Commit:** `Validate birth dates and allow an unknown birth time on /generate`.

---

### Task 2: Accessible place combobox, required pick, and no stale suggestions

**Files:**
- Create: `frontend/src/components/PlaceCombobox.jsx`
- Modify: `frontend/src/hooks/usePlaceSuggestions.js` (stale-response guard)
- Modify: `BirthForm.jsx` (place field), `pages/Onboarding.jsx:283-299` (birth place) and `:357-372` (manual current location), `pages/Profile.jsx:326-344` (birth place) and `:378-389` (manual location)
- Modify: `en.json`, `hi.json`
- Test: `frontend/src/components/PlaceCombobox.test.jsx`, `frontend/src/hooks/usePlaceSuggestions.test.js`, plus one case added to `BirthForm.test.jsx`

**Interfaces:**
- Produces: `<PlaceCombobox id value onInputChange(text) onSelect(item) items getLabel={x => x} placeholder className required inputProps />`. It's controlled: the parent owns `value` and `items`.
  - The input has `role="combobox"`, `aria-expanded`, `aria-controls`, `aria-autocomplete="list"` and `aria-activedescendant`. The list is `role="listbox"`, with options `role="option"` and `aria-selected`.
  - Keys: ArrowDown/ArrowUp move the active option, Enter selects it (calling `preventDefault` so the form isn't submitted), Escape closes the list. Mouse selection uses `onMouseDown`, as today.
- Produces: `usePlaceSuggestions(query) -> string[]`. Unchanged signature; an older in-flight response never overwrites a newer one.
- Consumes: `BirthForm` from Task 1.

**Copy:** `form_error_pick_place`: en "Please pick your birth place from the list." / hi "कृपया सूची से अपना जन्म स्थान चुनें।"

- [ ] **Step 1: Write failing tests.**
  - `PlaceCombobox.test.jsx`, with `items=['Delhi, India','Delhi Cantt, India']`:
    - ArrowDown twice then Enter calls `onSelect('Delhi Cantt, India')`;
    - Escape removes the listbox;
    - the input has `role="combobox"` and `aria-expanded="true"` while open.
  - `usePlaceSuggestions.test.js`: mock `fetchPlaceSuggestions`. Query 'Delh' resolves after 500ms with `['OLD']`; query 'Delhi' resolves after 10ms with `['NEW']`. Use fake timers and `renderHook`. The final value is `['NEW']`.
  - In `BirthForm.test.jsx`: with suggestions `['Delhi, India']` showing, typing 'Delh' without picking and submitting shows `en.form_error_pick_place`, and `spy` is not called.
- [ ] **Step 2: Run to verify they fail.**
- [ ] **Step 3: Implement.**
  - Add a per-effect `let cancelled = false` in `usePlaceSuggestions`, checked before `setSuggestions`, and set it to true in the cleanup.
  - BirthForm keeps `placePicked`. It becomes true on `onSelect` and false on `onInputChange`. Submit is blocked only when `!placePicked && suggestions.length > 0`.
  - Swap all four lists for `PlaceCombobox`. For the manual-location lists in Onboarding and Profile, pass `getLabel={m => m.display_name}`.
- [ ] **Step 4: Run to verify they pass.** Run the named tests, then `npx vitest run`.
- [ ] **Step 5: Commit:** `One accessible place combobox; require a pick; drop stale suggestions`.

---

### Task 3: Delete the orphaned /career-report page

**Files:**
- Modify: `frontend/src/App.jsx:28,111` (route becomes a redirect element), `config/nav.js:10,33` (drop the alias and the comment mention), `pages/learn/paths/CareerPath.jsx:109` (`to="/generate?topic=career"`), `pages/Home.jsx:22` (topic from state **or** the `?topic=` search param)
- Delete: `frontend/src/pages/CareerReport.jsx`
- Test: `frontend/src/pages/redirects.test.jsx` (add cases)

**Interfaces:**
- Produces: `/career-report` → `<Navigate replace>` to `/insights?topic=career&sub=career` when signed in, otherwise `/generate?topic=career`. The `/insights` URL is honoured by Task 5.
- Produces: `/generate?topic=career` behaves exactly like `navigate('/generate', { state: { topic: 'career' } })`.

- [ ] **Step 1: Write failing tests** in `redirects.test.jsx`:
  - signed out, `/career-report` lands on GENERATE with `search` `?topic=career`;
  - signed in, it lands on a `/insights` probe with `?topic=career&sub=career`;
  - Home at `/generate?topic=career` renders the career topic heading (the `getTopic('career')` label).
- [ ] **Step 2: Run to verify they fail.**
- [ ] **Step 3: Implement** a tiny `CareerReportRedirect` in `App.jsx`, using `useAuth`. Delete the page and the alias. In Home, use `state?.topic ?? searchParams.get('topic')`.
- [ ] **Step 4: Run to verify they pass.** Also run `grep -rn "pages/CareerReport\b\|'/career-report'" src`; the only match should be the route line.
- [ ] **Step 5: Commit:** `Retire the orphaned /career-report page`.

---

### Task 4: Charts survive refresh, deep links and storage loss

**Files:**
- Create: `frontend/src/services/lastChart.js`
- Modify: `config/nav.js` (extract `chartStateFromProfile`, reuse it in `navTarget`), `pages/Home.jsx` (save after generate), `pages/Result.jsx:110`, `pages/Insights.jsx:57`, `pages/AskPage.jsx:23`
- Test: `frontend/src/services/lastChart.test.js`, and `frontend/src/pages/redirects.test.jsx` (update the three "bails out" cases)

**Interfaces:**
- Produces, in `services/lastChart.js`:
  - `saveLastChart({ data, input }) -> void`. Writes sessionStorage key `sj_last_chart` with a try/catch.
  - `loadLastChart() -> { data, input } | null`.
  - `resolveChartState(routerState, user) -> { data, input, ...rest } | null`. Order: `routerState?.input` (with its `data`) → `loadLastChart()` → `chartStateFromProfile(getPrimaryProfile(user))` → `null`.
- Produces, in `config/nav.js`: `chartStateFromProfile(profile) -> { data, input } | null`.
- Consumes: `getPrimaryProfile(user)` (`services/astrologyProfiles.js:171`).

- [ ] **Step 1: Write failing tests.**
  - `lastChart.test.js`:
    - save then load round-trips;
    - `resolveChartState(undefined, null)` returns the saved chart;
    - router state wins over the saved chart;
    - with nothing saved and `user` set, it returns the primary profile's chart (mock `getPrimaryProfile`);
    - with `sessionStorage.getItem` throwing, `loadLastChart()` returns null and doesn't throw.
  - `redirects.test.jsx`: `/kundli` with no state but a saved last chart renders the page instead of redirecting. With nothing saved, it still redirects. Do the same for `/insights` and `/ask`.
- [ ] **Step 2: Run to verify they fail.**
- [ ] **Step 3: Implement.**
  - Home calls `saveLastChart({ data, input })` before `navigate`.
  - Result, Insights and AskPage replace `state` with `resolveChartState(location.state, user)`, then keep the existing `<Navigate>` when it's null.
  - Result also saves the resolved chart, so an opened profile becomes "last".
- [ ] **Step 4: Run to verify they pass.**
- [ ] **Step 5: Commit:** `Rebuild /kundli, /insights and /ask from the last chart or saved profile`.

---

### Task 5: Tabs live in the URL

**Files:**
- Modify: `pages/Result.jsx:87-104` (tab state), `pages/Insights.jsx` (sub-tab and topic)
- Test: `frontend/src/pages/Result.test.jsx` (create), `frontend/src/pages/Insights.test.jsx` (add cases)

**Interfaces:**
- `/kundli?tab=<birth_chart|divisional|analysis|download>&sub=<chart|planets|dasha|transit|bhava|ashtakavarga|sarvatobhadra>`.
  - Unknown values fall back to `birth_chart`/`chart`.
  - With no `?tab`, it falls back to the legacy `state.activeTab`/`activeSubtab` mapping that's already in Result.
  - A main-tab change **pushes** a history entry; a sub-tab change **replaces** it.
- `/insights?topic=<id>&sub=<reading|rajyogas|career|relationship|finance|health>`.
  - `topic` from the URL overrides `input.topic`.
  - A `sub` the topic doesn't offer falls back to `reading`.
  - `sub=career` on the career topic counts as "career opened", so Phase 1's lazy mount still holds.
- Consumes: `resolveChartState` (Task 4).

- [ ] **Step 1: Write failing tests.**
  - `Result.test.jsx`: mock the heavy children (charts and tables) as markers, and seed the chart with `saveLastChart`.
    - `/kundli?tab=analysis&sub=ashtakavarga` shows the Ashtakavarga pane;
    - clicking the "Dasha" pill sets `location.search` to `?tab=birth_chart&sub=dasha` (use a `LocationProbe`);
    - router state `{activeTab:'advanced'}` with no search opens Analysis;
    - `?tab=bogus` opens Birth Chart › Chart.
  - `Insights.test.jsx`:
    - `/insights?topic=career&sub=career` mounts CareerReportTab once;
    - `?sub=finance` on the career topic falls back to Reading.
- [ ] **Step 2: Run to verify they fail.**
- [ ] **Step 3: Implement** with `useSearchParams`. Derive the active tabs from the params (with the fallbacks above) instead of `useState`. Setters call `setSearchParams(next, { replace })`, keeping other params.
- [ ] **Step 4: Run to verify they pass.**
- [ ] **Step 5: Commit:** `Put Kundli and Insights tabs in the URL`.

---

### Task 6: Cache reports per chart and language, abort stale requests, regenerate on demand

**Files:**
- Create: `frontend/src/api/reportCache.js`, `frontend/src/hooks/useLatestRequest.js`
- Modify: `components/ChartReading.jsx`, `CareerReportTab.jsx`, `TopicReportTab.jsx`, `RajyogasTab.jsx` (replace their `fetch` blocks)
- Test: `frontend/src/api/reportCache.test.js`, plus cases added to `frontend/src/components/aiRetry.test.jsx`

**Interfaces:**
- Produces, in `api/reportCache.js`:
  - `readingBody(input, lang) -> object`. Returns `{ ...input, language: lang }`, the exact body ChartReading sends. Task 7 reuses it.
  - `peekReport(endpoint, body) -> data | null`. Reads the cache only.
  - `fetchReport(endpoint, body, { signal, force = false, fallback } = {}) -> Promise<data>`.
    - It POSTs JSON to `${API_BASE}${endpoint}`.
    - On `!ok` it throws `await errorFromResponse(resp, fallback)`.
    - It caches only successful responses, in sessionStorage under key `sj_report:${endpoint}:${stableStringify(body)}`, where keys are sorted so key order doesn't matter.
    - `force` skips the cache read but still writes.
    - All storage access is wrapped in try/catch.
- Produces, in `hooks/useLatestRequest.js`: `useLatestRequest() -> begin()`. Each `begin()` returns `{ signal, isCurrent() }` and aborts the previous controller; unmount aborts the current one. Callers ignore results when `!isCurrent()` and swallow `AbortError`.
- Each component's `generate` gains `{ force }`:
  - ChartReading: `generate({ force } = {})`.
  - TopicReportTab: `generate({ force } = {})`.
  - CareerReportTab: `generate(ctxOverride, { force } = {})`.
  - Regenerate buttons pass `{ force: true }`. Try Again does not, because errors aren't cached.
- Language: in ChartReading, CareerReportTab and TopicReportTab, a `useEffect` on `i18n.language` (skip the first run) calls `generate()` when `status === 'done'`. The cache makes switching back instant.

- [ ] **Step 1: Write failing tests.**
  - `reportCache.test.js`, with `fetch` mocked:
    - a second `fetchReport` with the same body makes no network call;
    - the same body with keys in a different order also hits the cache;
    - a different `language` misses;
    - `force:true` calls the network;
    - a 503 isn't cached, and the next call goes to the network;
    - with `sessionStorage` throwing, it still returns data.
  - `aiRetry.test.jsx` additions:
    - **(a)** ChartReading, signed in, mounted twice in a row (unmount, then render again): the second mount shows the reading with `fetch` called once;
    - **(b)** after a reading, `i18n.changeLanguage('hi')` triggers a request whose body has `language:'hi'`, and switching back to `en` doesn't call `fetch` again;
    - **(c)** Regenerate calls `fetch` even though the reading is cached;
    - **(d)** unmounting mid-request: when the delayed response resolves, React prints no state-update warning and the cache is still written, so the next mount is instant.
- [ ] **Step 2: Run to verify they fail.**
- [ ] **Step 3: Implement** the two modules, then replace the four `fetch` blocks.
  - Each component keeps its own status, UI and stagger timers, but clears those timers on unmount.
  - RajyogasTab has no language and no Regenerate; it only gets the cache and the abort.
- [ ] **Step 4: Run to verify they pass.** Run the named tests, then `npx vitest run`. The existing retry and Regenerate tests still pass.
- [ ] **Step 5: Commit:** `Cache reports per chart and language; abort stale requests`.

---

### Task 7: Show the AI reading at the top of the chart page

**Files:**
- Create: `frontend/src/components/ReadingTeaser.jsx`
- Modify: `pages/Result.jsx`. Render `<ReadingTeaser>` at the top of the Birth Chart › Chart pane, above the style toggle. The existing `InsightsAskEntry` cards stay below the charts.
- Modify: `en.json`, `hi.json`
- Test: `frontend/src/components/ReadingTeaser.test.jsx`

**Interfaces:**
- Consumes: `peekReport('/api/kundli/reading', readingBody(input, lang))` (Task 6). The `/insights` navigation state is the same `state` Result already passes.
- Produces: `<ReadingTeaser input onOpen />`. It **never** calls the network.
  - With a cached reading, it shows the first non-empty section, clamped to two lines (`line-clamp-2`), with a "Read your full reading →" button.
  - Without one, it shows the teaser heading and a "Reveal my reading" button.
  - Both buttons call `onOpen()`, which Result wires to `navigate('/insights?sub=reading', { state })`.

**Copy:**

| key | en | hi |
|---|---|---|
| `teaser_heading` | Your AI reading is ready | आपका AI फलादेश तैयार है |
| `teaser_body` | A personal reading of this chart: strengths, current period and what's ahead. | इस कुंडली का व्यक्तिगत फलादेश: आपकी ताकत, वर्तमान दशा और आगे क्या है। |
| `teaser_reveal` | Reveal my reading | मेरा फलादेश देखें |
| `teaser_continue` | Read your full reading → | पूरा फलादेश पढ़ें → |

- [ ] **Step 1: Write failing tests.**
  - With nothing cached: `en.teaser_heading` is shown, clicking `en.teaser_reveal` calls `onOpen`, and `fetch` (stubbed) is never called.
  - With a cached reading (seed it via `fetchReport` with fetch mocked once, or write the sessionStorage key with the same helper): the first section's text is shown, along with `en.teaser_continue`.
- [ ] **Step 2: Run to verify they fail.**
- [ ] **Step 3: Implement**, using the `Card` primitive and existing tokens (no new hex values). Add the teaser to Result.
- [ ] **Step 4: Run to verify they pass.**
- [ ] **Step 5: Commit:** `Surface the AI reading at the top of the chart page`.

---

### Task 8: Keep the chart through sign-in, and pre-fill onboarding from it

**Files:**
- Modify: `components/SiteHeader.jsx:101` (Sign in passes `next`), `pages/Onboarding.jsx` (offer to use the last chart)
- Modify: `en.json`, `hi.json`
- Test: `frontend/src/components/SiteHeader.test.jsx` (create), `frontend/src/pages/Onboarding.test.jsx` (create)

**Interfaces:**
- Consumes: `loadLastChart()` (Task 4); `input.timeAccuracy` (Task 1).
- SiteHeader's Sign in goes to `navigate('/login', { state: { next } })`. `next = pathname + search`, unless the pathname is `/` or `/login`, in which case no `next` is passed. Login already forwards `next` (`Login.jsx:51`), and Task 4 rebuilds `/kundli` from the last chart after the redirect.
- Onboarding: when `loadLastChart()?.input` has `date` and `place`, the welcome step shows a card with `name · date · place` and two buttons.
  - "Use these details" fills the `draft` (day/month/year/birthDate from `date`; `hour`/`minute`/`ampm` from the 24h `time` via `from24Hour(time) -> { hour, minute, ampm }`; `birthTimeAccuracy` from `input.timeAccuracy ?? 'exact'`; `place`) and jumps to `review`.
  - "Enter different details" continues to the normal flow.

**Copy:**

| key | en | hi |
|---|---|---|
| `onboarding_use_last_heading` | Use the chart you just made? | क्या अभी बनाई कुंडली का उपयोग करें? |
| `onboarding_use_last_yes` | Use these details | यही विवरण उपयोग करें |
| `onboarding_use_last_no` | Enter different details | अलग विवरण दर्ज करें |

- [ ] **Step 1: Write failing tests.**
  - `SiteHeader.test.jsx`: rendered at `/kundli?tab=analysis` while signed out, clicking Sign in lands on a `/login` probe whose `state.next === '/kundli?tab=analysis'`. At `/`, `state.next` is undefined.
  - `Onboarding.test.jsx`: with `saveLastChart({ data:{}, input:{ name:'Asha', date:'1990-08-16', time:'19:05', place:'Delhi, India', timeAccuracy:'exact' } })`, the welcome step shows `en.onboarding_use_last_heading`. Clicking "Use these details" shows the review step containing "Delhi, India" and "07:05 PM" (match whatever format ReviewCard prints today). With nothing saved, no such card appears.
- [ ] **Step 2: Run to verify they fail.**
- [ ] **Step 3: Implement.** Put `from24Hour` next to Onboarding's existing `to24Hour`.
- [ ] **Step 4: Run to verify they pass.**
- [ ] **Step 5: Commit:** `Keep the chart through sign-in and pre-fill onboarding from it`.

---

### Task 9: Verify and ship

- [ ] **Step 1:** From `frontend/`, run `npx vitest run && npx vite build`; everything passes and the build succeeds. From `backend/`, run `.venv/bin/pytest -q`; still green.
- [ ] **Step 2:** Run `npx vite preview --port 4173` and drive it with playwright-core (`executablePath: '/usr/bin/google-chrome'`) at 390px and 1440px:
  - generate a chart on `/generate`, with place picked from the list and the API at its production URL from the build env;
  - on `/kundli`, the reading teaser is visible above the charts;
  - switch to Analysis › Ashtakavarga, reload, and the same tab is shown;
  - click Sign in and check `/login` gets `state.next`.
  Take screenshots for the PR.
- [ ] **Step 3:** Push `fix/phase2-core-flows` and open a PR to `main` titled "Phase 2: core flows". Update the roadmap's Tracking row for Phase 2.
