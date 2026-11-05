# Phase 3: Full Hindi Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

> **Scope note (4 Nov 2026):** the owner moved Tasks 8, 9 and 10 to Phase 3B (see the roadmap). Phase 3 ships Tasks 0–7.

**Goal:** A Hindi user sees no English on the main journey (generate → chart → AI reports → home/Panchang), in a proper Devanagari typeface, and the language choice follows the account.

**Architecture:** **Extensible by design** (owner's requirement): adding a third language later means one translation file plus one registry entry, on each side, with no code edits.
- **Frontend registry:** `src/i18n/languages.js` is the single source of truth for codes, display names, locales and scripts. Locale files are discovered with `import.meta.glob`. Nothing outside `src/i18n/` may compare against `'hi'` or `'en'`. Everything goes through `currentLanguage()`, `localeFor()` and `scriptFor()`.
- **Backend registry:** `backend/services/i18n.py` is the mirror: codes, the language name used in LLM prompts, ordinal formatting and a template lookup that falls back to English.
- **Built on the registries:**
  - `LanguageSwitcher`, rendered from the registry;
  - script-based (not language-based) typography rules;
  - `utils/format.js` and `utils/astroNames.js`;
  - a translation pass per area;
  - guardrails that check **every** registered locale.
- **Tests:** each area pass is pinned by `expectNoEnglish(container, allow)` rendered in Hindi. Task 0 includes a test that registers a pseudo-language and proves the switcher, formatting, parity check and backend accept it without code changes.

**Tech Stack:** React 18, i18next/react-i18next, Tailwind 3, Vitest + Testing Library; FastAPI + pytest for the Rajyoga task.

**Spec:** `docs/superpowers/plans/2026-11-04-frontend-ux-roadmap.md`, Phase 3 (I-1…I-10, D-3). Owner decisions on 4 Nov 2026:
- **Knowledge Center:** the 40 articles under `src/pages/learn/**` and `src/config/*Content.js` stay English. They become a separate content phase. The existing Hindi notice stays.
- **Legal pages** (Terms, Privacy, Refund, Disclaimer): the binding text stays English, with a short Hindi notice that the English version applies.
- **Rajyogas:** the backend builds yoga names and explanations in Hindi when asked.

## Global Constraints

- **Out of scope** (English allowed, and excluded from the guardrail): `AdminDashboard.jsx`, `AstrologerDashboard.jsx`, `src/pages/learn/**`, `src/config/*Content.js`, and the body text of the four legal pages.
- **No language literals outside the i18n modules.**
  - Frontend: no `'hi'`/`'en'` comparisons or `startsWith('hi')` outside `src/i18n/`. Use `currentLanguage()`, `localeFor(code)` and `scriptFor(code)`.
  - Backend: no `language == "hi"` outside `services/i18n.py`. Use `language_name(code)` for LLM instructions and `text(table, code, key)` for templates.
  - Task 8's guardrail enforces both with a grep test.
- **Keys:**
  - Every new key goes in `en.json` and in every other registered locale (today `hi.json`).
  - New keys are flat, in `<area>_<name>` form. The existing nested `planets.*` and `signs.*` stay; `nakshatras.*` and `planet_abbr.*` are added in the same nested style.
- **Hindi wording follows `docs/i18n-glossary.md`** (Task 9). Use these terms from Task 1 on: जन्म कुंडली (birth chart), चंद्र (Moon), गुरु (Jupiter), लग्न, दशा / महादशा / अंतर्दशा, पुनः प्रयास करें (try again), फलादेश (reading). "AI", "KP", "D1…D60" and "PDF" stay in Latin script.
- **Allowed Latin in Hindi UI** (the `expectNoEnglish` allow-list): `AI`, `KP`, `PDF`, `Star Jyotish`, `D` + number, `AM`, `PM`, `EN`, URLs, and email addresses.
- Every storage access is wrapped in try/catch.
- **Gate before each commit:**
  - from `frontend/`: `npx vitest run` passes and `npx eslint <changed files>` reports 0 errors;
  - from `backend/` (Task 6): `.venv/bin/pytest -q` passes.
- Commit author is `sushiljain07@gmail.com`, and every message ends with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Run `graphify update .` after the code changes.

## Review Focus

1. **A Hindi user who signs in on a new device.** Their saved `preferred_language` must apply at login and override the device's English default. A deliberate toggle afterwards must save back to the profile. Pinned in Task 1.
2. **Non-Latin text with letter-spacing or uppercase classes.** For any non-Latin script, `tracking-*` must compute to 0 and `uppercase` must not apply. Pinned in Task 2 (a CSS rule test that reads `index.css` and checks `data-script`).
3. **API names the client doesn't know** (a new nakshatra spelling, or "Uranus" in the abbreviation map). Show the raw name, never a raw key like `nakshatras.Foo`. Pinned in Task 3.
4. **A Hindi Rajyoga request to the API, and the reading prompt.** `/api/rajyogas` with `language: "hi"` returns Devanagari names and explanations. The English-only reading prompt that also calls `check_all_yogas` is unchanged. Pinned in Task 6.
5. **Switching language on a page that is already rendered** (chart tabs, Panchang dates). Labels re-render in the new language without a reload. Pinned by each area test rendering in `en`, switching to `hi`, and asserting again (Tasks 4, 5, 7).

---

### Task 0: Language registry, frontend and backend (the extension point)

**Files:**
- Create:
  - `frontend/src/i18n/languages.js`
  - `backend/services/i18n.py`
  - `docs/i18n.md`: "How to add a language", a 6-step checklist. Step 1: add `xx.json` beside `en.json`. Step 2: add a registry entry here and in `backend/services/i18n.py`. Step 3: add the script's font to `index.html` and the Tailwind stacks. Step 4: translate the backend templates (`YOGA_TEXT` etc.). Step 5: add a glossary section. Step 6: run the parity tests.
- Modify:
  - `frontend/src/i18n/index.js`: build `resources` from `import.meta.glob('./*.json', { eager: true })` filtered to registry codes; export `SUPPORTED_LANGS` derived from the registry; keep `LANG_STORAGE_KEY`; set `<html lang>` **and** `data-script` on language change.
  - Replace the 32 frontend `startsWith('hi')` / `=== 'hi'` sites (`grep -rn "startsWith('hi')\|=== 'hi'\|'hi' :" src --include=*.js --include=*.jsx`) with `currentLanguage()` (the request `language` param) or `localeFor(currentLanguage())` (dates).
  - Replace the 15 backend `language == "hi"` sites (`grep -rn '== "hi"' backend/services backend/routers`) with `language_instruction(code)` / `text(...)`.
  - Make `backend/models/birth_data.py:15` validate `language` against `SUPPORTED_LANGUAGES`, falling back to `"en"` for unknown codes rather than a 422.
- Test: `frontend/src/i18n/languages.test.js`, `backend/tests/test_i18n_registry.py`

**Interfaces:**
- Frontend `languages.js`:
  ```js
  export const LANGUAGES = [
    { code: 'en', label: 'EN', nativeName: 'English', locale: 'en-IN', script: 'latn' },
    { code: 'hi', label: 'हि', nativeName: 'हिन्दी',  locale: 'hi-IN', script: 'deva', scriptRange: /[ऀ-ॿ]/ },
  ]
  ```
  It exports:
  - `DEFAULT_LANGUAGE = 'en'`;
  - `currentLanguage()`, which returns the registry code matching `i18n.language`'s base (so `hi-IN` → `hi`), else the default;
  - `localeFor(code)`, `scriptFor(code)`, `languageEntry(code)`;
  - `registerLanguage(entry)`, used by tests and future plugins, which appends to `LANGUAGES`.
- Backend `services/i18n.py`:
  - `SUPPORTED_LANGUAGES = {"en": {"name": "English"}, "hi": {"name": "Hindi", "script": "Devanagari"}}`;
  - `normalize_language(code) -> str` (unknown codes become `"en"`);
  - `language_instruction(code) -> str` ("Write in English." / "Write in Hindi (Devanagari).", built from the registry);
  - `text(table: dict, code: str, key: str, **params) -> str`. It looks up `table[code][key]`, falls back to `table["en"][key]`, then applies `.format(**params)`;
  - `ordinal(n, code) -> str` (en "9th", hi "9वें"; an unknown code uses English).

- [ ] **Step 1: Write failing tests.**
  - `languages.test.js`:
    - `currentLanguage()` returns `'hi'` after `changeLanguage('hi-IN')`, and `'en'` for `'fr'`;
    - `localeFor('hi')` is `'hi-IN'`;
    - **the extension test**: `registerLanguage({ code:'xx', label:'XX', nativeName:'Pseudo', locale:'en-GB', script:'latn' })` plus `i18n.addResourceBundle('xx','translation',{ ...en })`, after which `changeLanguage('xx')` makes `currentLanguage()` return `'xx'`. Remove the entry afterwards.
  - `test_i18n_registry.py`:
    - `normalize_language("fr") == "en"`;
    - `language_instruction("hi")` mentions Hindi;
    - `text({"en":{"k":"Hi {n}"}}, "hi", "k", n=1) == "Hi 1"` (the English fallback);
    - `ordinal(9,"hi") == "9वें"`;
    - posting `/api/kundli/reading`-shaped input with `language:"fr"` is accepted and treated as English (use a route that doesn't call the LLM, such as `/api/rajyogas`);
    - the existing `daily_editor` / `health_analysis` / `wealth_analysis` prompt tests still pass unchanged.
- [ ] **Step 2: Run to verify they fail.**
- [ ] **Step 3: Implement both registries**, then replace the 32 + 15 hardcoded sites.
- [ ] **Step 4: Run to verify they pass.** Run the full frontend and backend suites. `grep -rn "startsWith('hi')\|=== 'hi'" frontend/src --include=*.jsx --include=*.js | grep -v "src/i18n/"` returns nothing.
- [ ] **Step 5: Commit:** `Language registry on frontend and backend; no hardcoded language checks`.

---

### Task 1: The language switcher in the header and account menu, synced with the profile

**Files:**
- Create: `frontend/src/components/LanguageSwitcher.jsx`
- Modify:
  - `components/SiteHeader.jsx`: show the toggle in the header's right group at ≥ sm; in the mobile hamburger menu otherwise.
  - `components/AccountMenu.jsx`: add the toggle as a menu row.
  - `components/Footer.jsx:188` and `components/CompactFooter.jsx:63`: reuse `LanguageSwitcher`.
  - `contexts/AuthContext.jsx`: apply `user.preferred_language` when a user is set.
- Test: `frontend/src/components/LanguageSwitcher.test.jsx`, `frontend/src/contexts/AuthContext.language.test.jsx`

**Interfaces:**
- Produces: `<LanguageSwitcher size="sm"|"md" />`, rendered from `LANGUAGES` (Task 0). Nothing in it names a language.
  - Up to 3 languages: one button per entry, showing `entry.label` with `title={entry.nativeName}`, inside a group with `aria-label={t('lang_toggle_label')}`. Each button has `aria-pressed` and `lang={entry.code}`.
  - More than 3: a `<select>` listing `nativeName`s.
  - Clicking calls `i18n.changeLanguage(lng)`. When signed in, it also calls `updateMyProfile({ preferred_language: lng })`, fire-and-forget, with errors swallowed.
  - Buttons are at least 32×32px (Phase 4 raises them to 44).
- AuthContext: in the effect that sees `user` change, `if (languageEntry(user?.preferred_language) && user.preferred_language !== currentLanguage()) i18n.changeLanguage(user.preferred_language)`. It runs only when `user?.id` changes, so a toggle mid-session isn't undone.
- Consumes: `LANGUAGES`, `languageEntry` and `currentLanguage` (Task 0). The Profile page's language `<select>` (`Profile.jsx:230`) is also built from `LANGUAGES`.

**Copy:** `lang_toggle_label`: en "Language" / hi "भाषा".

- [ ] **Step 1: Write failing tests.**
  - `LanguageSwitcher.test.jsx`:
    - Rendering it and clicking "हि" makes `currentLanguage()` equal `'hi'`, and "हि" has `aria-pressed="true"`.
    - After `registerLanguage` adds a pseudo `xx` entry, the switcher renders a third button without any code change. With 4 entries it renders a `<select>`.
    - Signed in (mock `useAuth` with `updateMyProfile` as `vi.fn(() => Promise.resolve())`): clicking "हि" calls `updateMyProfile({ preferred_language: 'hi' })`.
    - Signed out: `updateMyProfile` is not called.
  - `AuthContext.language.test.jsx`: mock `api/auth` so `refreshSession` resolves `{ access_token:'t', user:{ id:'u', preferred_language:'hi' } }`. Render `AuthProvider`, then `await waitFor(() => expect(i18n.language).toBe('hi'))`.
- [ ] **Step 2: Run to verify they fail.**
- [ ] **Step 3: Implement.** Then replace the two footer toggles with `<LanguageSwitcher size="sm" />`, and build Profile's select from the registry.
- [ ] **Step 4: Run to verify they pass**, then run the full suite.
- [ ] **Step 5: Commit:** `Language switcher from the registry, in the header and account menu, synced with the profile`.

---

### Task 2: Typography for non-Latin scripts (Devanagari first)

**Files:**
- Modify: `frontend/index.html:40` (Google Fonts link), `frontend/tailwind.config.js:75-82` (font stacks), `frontend/src/index.css` (`:lang(hi)` rules)
- Test: `frontend/src/i18n/typography.test.js`

**Interfaces:**
- Fonts: add `Noto+Sans+Devanagari:wght@400;500;600;700` and `Tiro+Devanagari+Hindi` to the same Google Fonts URL, keeping `display=swap`.
  - `sans: ['Inter', 'Noto Sans Devanagari', 'ui-sans-serif', 'system-ui', 'sans-serif']`
  - `serif: ['Fraunces', 'Tiro Devanagari Hindi', 'Georgia', 'serif']`
  - Fraunces and Inter have no Devanagari glyphs, so the browser falls through to the Devanagari font per character.
  - Update the stale comment at `tailwind.config.js:78-80`.
- `index.css`: rules keyed on the **script**, not the language, so a future Bengali or Tamil entry gets them automatically. Task 0 sets `data-script` on `<html>` from the registry.
  ```css
  html:not([data-script="latn"]) [class*="tracking-"] { letter-spacing: 0 !important; }
  html:not([data-script="latn"]) .uppercase { text-transform: none; }
  html:not([data-script="latn"]) body { line-height: 1.6; }
  html:not([data-script="latn"]) .text-3xs, html:not([data-script="latn"]) .text-2xs { font-size: 0.75rem; line-height: 1.35; }
  html:not([data-script="latn"]) .leading-none { line-height: 1.25; }
  ```
  `index.html` gets `data-script="latn"` on `<html>` as the static default.

- [ ] **Step 1: Write the failing test** (`typography.test.js`, using `fs` with paths from `import.meta.url`):
  - `index.html` contains `Noto+Sans+Devanagari` and `Tiro+Devanagari+Hindi`;
  - `tailwind.config.js`'s `theme.extend.fontFamily.sans` includes `'Noto Sans Devanagari'`, and `serif` includes `'Tiro Devanagari Hindi'` (import the config);
  - `index.css` contains an `html:not([data-script="latn"])` rule that sets `letter-spacing: 0` for `tracking-` classes and `text-transform: none` for `.uppercase`, and no `:lang(hi)` selectors;
  - after `changeLanguage('hi')`, `document.documentElement.dataset.script === 'deva'`.
- [ ] **Step 2: Run to verify it fails.**
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run to verify it passes.** Also run `npx vite build` (CSS still compiles).
- [ ] **Step 5: Commit:** `Load Devanagari fonts and stop letter-spacing Hindi text`.

---

### Task 3: Shared helpers for localized names, dates and the Hindi check

**Files:**
- Create: `frontend/src/utils/astroNames.js`, `frontend/src/utils/format.js`, `frontend/src/test/expectNoEnglish.js`
- Modify: `en.json` and `hi.json` (add `nakshatras.*`, 27 names, and `planet_abbr.*`, 13 entries including Uranus, Neptune, Pluto and Lagna)
- Modify: `components/KundliChart.jsx:52-61,109` (drop `ABBR_EN`/`ABBR_HI` and use `planetAbbr`)
- Test: `frontend/src/utils/astroNames.test.js`, `frontend/src/utils/format.test.js`

**Interfaces:**
- `planetName(t, name)`, `signName(t, name)`, `nakshatraName(t, name)` return a string. Each uses `t(key, { defaultValue: name })`, so an unknown name shows as itself.
- `planetAbbr(t, name)` returns a string. Lagna is passed as `'Ascendant'`.
- `formatDate(date, opts)` and `formatNumber(n, opts)` use locale `localeFor(currentLanguage())` (Task 0). No language literals. `formatDate` accepts a `Date` or a `'YYYY-MM-DD'` string, read as a local date.
- `expectNoEnglish(container, extraAllow = [])` (test-only):
  - collects `container.textContent` plus every `aria-label`, `placeholder`, `title` and `alt`;
  - removes the Global Constraints allow-list plus `extraAllow`;
  - asserts there's no `/[A-Za-z]{3,}/` match, and lists the offending words in the message.
- Nakshatra names in `hi.json`: अश्विनी, भरणी, कृत्तिका, रोहिणी, मृगशिरा, आर्द्रा, पुनर्वसु, पुष्य, आश्लेषा, मघा, पूर्वा फाल्गुनी, उत्तरा फाल्गुनी, हस्त, चित्रा, स्वाति, विशाखा, अनुराधा, ज्येष्ठा, मूल, पूर्वाषाढ़ा, उत्तराषाढ़ा, श्रवण, धनिष्ठा, शतभिषा, पूर्वा भाद्रपद, उत्तरा भाद्रपद, रेवती. The English keys must match `backend/services/astro_calc.py`'s `NAKSHATRAS` spelling exactly; copy them from there.
- `planet_abbr` in Hindi: सू च मं बु गु शु श रा के, plus Uranus "अरु", Neptune "वरु", Pluto "यम", Ascendant "ल". English keeps today's `ABBR_EN` values, plus Ascendant "La".

- [ ] **Step 1: Write failing tests.**
  - `astroNames.test.js`, in `hi`:
    - `planetName(t,'Moon')` gives `'चंद्र'`;
    - `nakshatraName(t,'Rohini')` gives `'रोहिणी'`;
    - `nakshatraName(t,'Foo')` gives `'Foo'`, never `'nakshatras.Foo'`;
    - `planetAbbr(t,'Uranus')` gives `'अरु'`;
    - `planetAbbr(t,'Ascendant')` gives `'ल'`.
  - A parity check: every English key in `nakshatras` equals one of the backend `NAKSHATRAS` names. Read `backend/services/astro_calc.py` with `fs` and parse the list with a regex.
  - `format.test.js`: `formatDate('2026-11-04', { day:'numeric', month:'long' })` is `'4 November'` in `en` and `'4 नवंबर'` in `hi`.
- [ ] **Step 2: Run to verify they fail.**
- [ ] **Step 3: Implement**, and switch `KundliChart` to `planetAbbr` (its legend strings also go through `t()`: `chart_legend_retrograde|combust|exalted|debilitated|vargottama`).
- [ ] **Step 4: Run to verify they pass.**
- [ ] **Step 5: Commit:** `Shared helpers for Hindi planet, sign and nakshatra names and dates`.

---

### Task 4: The Kundli page in Hindi

**Files:** every user-visible literal in these files goes through `t()`, and API names go through the Task 3 helpers.
- `pages/Result.jsx`: chips, `MAIN_TABS` / `BIRTH_SUBTABS` / `ANALYSIS_SUBTABS` labels, the Style toggle, intro cards, and the Insights/Ask entry cards. The tab arrays become functions of `t`.
- `components/NavBar.jsx`
- `components/KundliChart.jsx`, `SouthIndiaChart.jsx`, `PlanetTable.jsx`, `DashaTable.jsx`, `TransitPanel.jsx`, `DivisionalCharts.jsx`, `ShodashvargaPanel.jsx`, `BhavaChalit.jsx`, `AshtakavargaTable.jsx`, `SarvatobhadraChakra.jsx`, `KPChart.jsx`, `KundliDownload.jsx` (the downloaded PDF/HTML follows the UI language; its date uses `formatDate`)
- Test: `frontend/src/pages/Result.hindi.test.jsx`

**Interfaces:**
- Reuse the existing keys `col_*`, `tab_*` and `nav_*` where they fit. New keys use the `kundli_*`, `dasha_*`, `transit_*`, `ashtakavarga_*`, `bhava_*`, `kp_*`, `download_*` and `chart_*` prefixes.
- `dasha_md` / `dasha_ad` / `dasha_pd` give the short forms (en: MD/AD/PD; hi: महा/अंतर/प्रत्य).

- [ ] **Step 1: Write the failing test.**
  - Use a realistic chart fixture. Generate it once with `curl -X POST localhost:8000/api/kundli` against a local backend, and save the response as `frontend/src/test/fixtures/kundli.json`. Commit the fixture.
  - Render `Result` in `hi`, with router state `{ data, input }`, for each of `?tab=birth_chart&sub=chart|planets|dasha|transit`, `?tab=divisional`, `?tab=analysis&sub=bhava|ashtakavarga|sarvatobhadra` and `?tab=download`.
  - Await lazy panes with `findBy…`, then call `expectNoEnglish(container)`.
  - Also render in `en`, switch to `hi` with `act`, and assert again (Review Focus 5).
- [ ] **Step 2: Run to verify it fails.** It lists the English words per pane.
- [ ] **Step 3: Implement**, file by file, until the test passes.
- [ ] **Step 4: Run to verify it passes**, then run the full suite.
- [ ] **Step 5: Commit:** `Kundli page fully in Hindi`.

---

### Task 5: AI pages and reports in Hindi

**Files:**
- `pages/Insights.jsx`: sub-tab labels and header. Topic labels come from the existing `landing_topic_*_label` keys.
- `pages/AskPage.jsx`
- `components/ChartReading.jsx`: `SECTION_CONFIG` titles, idle, loading and error copy, buttons, and the Raj Yoga teaser.
- `components/CareerReportTab.jsx`: all 47 literals, including the context form, depth toggle and section titles.
- `components/TopicReportTab.jsx`: `cfg.loadingSubtext` and section titles.
- `components/RajyogasTab.jsx`: all chrome, plus the 19-yoga reference text, which becomes keys `rajyoga_ref_<id>_*`.
- `components/ChartHighlight.jsx`, `components/AskChart.jsx`, `components/home/AskPersonaPanel.jsx`, `components/ErrorFallback.jsx`, `components/PaywallCard.jsx` (its copy only; the dormant `alert()` is Phase 4)
- Test: `frontend/src/components/reports.hindi.test.jsx`

- [ ] **Step 1: Write the failing test.** Stub `fetch` with fixed English-free responses: the Hindi reading sections, a career report fixture with Devanagari values, and a Rajyoga response from Task 6's Hindi output saved as a fixture.
  - Render each component in `hi` across its idle (signed out), loading, error (503) and done states.
  - Call `expectNoEnglish(container)` in each state.
  - For CareerReportTab, also cover the context form and the Quick/Full/Deep toggle.
- [ ] **Step 2: Run to verify it fails.**
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run to verify it passes**, then run the full suite.
- [ ] **Step 5: Commit:** `AI pages and reports fully in Hindi`.

---

### Task 6: Hindi Rajyoga names and explanations from the backend

**Files:**
- Modify: `backend/services/career_analysis.py`, in `check_special_combinations` (`:320`), `check_extra_yogas` (`:513`) and `check_all_yogas` (`:745`):
  - Each yoga dict gains `"id"` (a snake_case slug) and `"params"`, a dict of the values interpolated today.
  - `"yoga"` and `"description"` are rendered from a template table, `YOGA_TEXT = {"en": {...}, "hi": {...}}` (one dict per registered language), keyed by `f"{id}.present"` / `f"{id}.absent"`, through `render_yoga(entry, language)`. This uses `i18n.text()`, so a language without templates falls back to English.
  - Planet names inside `params` go through `PLANET_NAMES = {"en": {...}, "hi": {...}}`, with the same fallback.
  - House ordinals go through `i18n.ordinal()`.
- Modify: `backend/routers/rajyogas.py:30`, which now calls `check_all_yogas(planets, lagna_sign_idx, language=body.language)`.
- Modify: `frontend/src/components/RajyogasTab.jsx`. The body becomes `{ ...chartBody(input), language: lang }`, and the tab follows a language switch the same way the other reports do (Phase 2 pattern).
- Test: `backend/tests/test_yoga_i18n.py`

**Interfaces:**
- `check_all_yogas(planets, lagna_sign_idx, language="en") -> list[dict]`. Each dict has `id, yoga, description, present` plus the existing keys.
  - The default `"en"` keeps the reading prompt's call (`services/ai.py`) and every other caller byte-identical.

- [ ] **Step 1: Write failing tests** in `backend/tests/test_yoga_i18n.py`, using a fixed chart from an existing test fixture (look in `backend/tests/` for one used by the Rajyoga tests):
  - `check_all_yogas(..., language="en")` equals the output before this change. Snapshot it first: commit the expected JSON as `backend/tests/fixtures/yogas_en.json`, generated from `main` before editing.
  - In `language="hi"`, every `yoga` and `description` contains Devanagari and no `[A-Za-z]{3,}` other than planet names already translated.
  - Every entry has a unique `id`, and every `id` has both templates in **every** language in `SUPPORTED_LANGUAGES`.
  - With a pseudo language `"xx"` added to `SUPPORTED_LANGUAGES` (monkeypatched) and no templates, output equals English (the fallback).
  - The `/api/rajyogas` route with `{"language":"hi"}` returns Hindi.
- [ ] **Step 2: Run to verify they fail:** `.venv/bin/pytest tests/test_yoga_i18n.py -q`.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run to verify they pass.** Then run `.venv/bin/pytest -q` (all) and `npx vitest run` (the RajyogasTab cache key now includes the language).
- [ ] **Step 5: Commit:** `Rajyoga names and explanations in Hindi from the backend`.

---

### Task 7: The generate form, home and Panchang in Hindi

**Files:**
- `components/BirthForm.jsx`: Day/Month/Year, month names (via `formatDate` with `{ month: 'long' }`), placeholders, and the select aria-labels (closes the Phase 2 Task 1 ruling).
- `components/onboarding/BirthTimeSelector.jsx`: HH/MM/AM-PM placeholders and aria-labels.
- `pages/Home.jsx`: the Seo title stays English, as SEO for an English site.
- Home components: `components/home/HeroBanner.jsx`, `DailyPatrikaHero.jsx`, `LocationSection.jsx`, `HomeMasthead.jsx`, `MobileTimelineCard.jsx`, `WeekStrip.jsx`, `CosmicSnapshot.jsx`
- `pages/WeekAhead.jsx`, `pages/PanchangDetail.jsx` (48 literals; dates via `formatDate`)
- Other pages: `pages/ContactUs.jsx`, `pages/AboutUs.jsx`, `pages/TestimonialsPage.jsx`, `pages/Blog.jsx` and `pages/BlogArticle.jsx` (chrome only; post bodies are content), `pages/Learn.jsx` (index chrome only)
- Legal pages (`TermsOfUse.jsx`, `PrivacyPolicy.jsx`, `RefundPolicy.jsx`, `Disclaimer.jsx`): add `<LegalLanguageNote />` at the top, shown only in Hindi.
  - Copy for `legal_english_note`: hi "यह पृष्ठ केवल अंग्रेज़ी में उपलब्ध है। कानूनी रूप से अंग्रेज़ी संस्करण ही मान्य है।"; en "" (the component renders nothing in English).
- Test: `frontend/src/pages/journey.hindi.test.jsx`

- [ ] **Step 1: Write the failing test.** Render in `hi`, call `expectNoEnglish`, and switch en→hi for at least BirthForm and PanchangDetail.
  - Cover BirthForm, Home (`/generate`), PersonalHome with fixtures for its data hooks (mock `useDailyEditor` and the profile), PanchangDetail with a Panchang fixture from the local backend, WeekAhead, ContactUs, AboutUs and Learn.
  - Each legal page renders `hi.legal_english_note` in Hindi and nothing extra in English.
- [ ] **Step 2: Run to verify it fails.**
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run to verify it passes**, then run the full suite.
- [ ] **Step 5: Commit:** `Generate form, home, Panchang and site pages in Hindi`.

---

### Task 8 (moved to Phase 3B): Guardrails, so Hindi stays complete

**Files:**
- Create: `frontend/src/i18n/parity.test.js`, `frontend/src/i18n/noHardcodedEnglish.test.js`, `frontend/src/i18n/noLanguageLiterals.test.js`, `frontend/src/i18n/hardcoded-baseline.json`, `backend/tests/test_no_language_literals.py`
- Modify: `frontend/package.json`. Add `"@babel/parser"` to `devDependencies`, at the exact version already in `node_modules` (`node -p "require('@babel/parser/package.json').version"`), so nothing new is downloaded.

**Interfaces:**
- `parity.test.js`: for **every** locale in `LANGUAGES` other than `en`, compared against `en.json`:
  - the flattened key sets are equal;
  - each key's `{{placeholders}}` match;
  - every value matches the entry's `scriptRange`, except an explicit allow-list (`app_title`, any value that is only an allowed token, and the empty `legal_english_note` in English);
  - plus: every registry code has a locale file, and every locale file has a registry entry.
- `noLanguageLiterals.test.js`: greps `src/**/*.{js,jsx}` outside `src/i18n/` and test files for `'hi'`/`"hi"` comparisons and `startsWith('hi')`, and fails listing file:line. A matching pytest, `backend/tests/test_no_language_literals.py`, greps `backend/services` and `backend/routers` outside `services/i18n.py` for `== "hi"`/`== 'hi'`.
- `noHardcodedEnglish.test.js`:
  - It runs the review's AST scan (JSX text, string-literal children and the `placeholder`/`title`/`aria-label`/`alt`/`label` props; logic as in the review's `scan.cjs`) over `src/**/*.jsx`, excluding the out-of-scope paths in Global Constraints.
  - Each file's count must be ≤ its entry in `hardcoded-baseline.json`. Files not listed must be 0.
  - The baseline is generated **after** Tasks 4–7, so every main-journey file is 0. The failure message names the file and the new strings.

- [ ] **Step 1: Write the tests.** Generate the baseline with a `--write` mode: `UPDATE_BASELINE=1 npx vitest run src/i18n/noHardcodedEnglish.test.js`.
- [ ] **Step 2: Prove they catch regressions.** Temporarily add `<p>Hello world</p>` to `components/BirthForm.jsx` and see the test fail. Temporarily delete one key from `hi.json` and see parity fail. Revert both.
- [ ] **Step 3: Check the baseline.** It must hold no main-journey file. Anything left is listed in the commit message as deferred.
- [ ] **Step 4: Run the full suite.**
- [ ] **Step 5: Commit:** `Guardrails: key parity and no new hardcoded English`.

---

### Task 9 (moved to Phase 3B): Glossary and wording pass

**Files:**
- Create: `docs/i18n-glossary.md`, with one section per language. The Hindi section is a table of English term → Hindi term → note (about 40 rows, starting from the Global Constraints terms). A new language adds its own section, per the `docs/i18n.md` checklist.
- Modify:
  - `hi.json`: unify "try again" to पुनः प्रयास करें, Moon to चंद्र, Jupiter to गुरु, and chart to जन्म कुंडली / कुंडली (no चार्ट), except where a key names a specific chart such as D9.
  - `en.json` and `hi.json`: replace `coming_in_weeks` with i18next plurals (`coming_in_weeks_one` / `coming_in_weeks_other`) and update its caller. Fix `patrika_rarity` (hi) to keep the "occurs" wording.
- Test: extend `parity.test.js` with glossary rules: no Hindi value contains `फिर से प्रयास`, `फिर कोशिश`, `चंद्रमा` or `बृहस्पति`, and `चार्ट` appears only in keys on an allow-list.

- [ ] **Step 1: Write the failing glossary assertions.**
- [ ] **Step 2: Run to verify they fail** (they list the offending keys).
- [ ] **Step 3: Fix the values and the plural caller.**
- [ ] **Step 4: Run to verify they pass**, then run the full suite.
- [ ] **Step 5: Commit:** `Hindi glossary and consistent wording`.

---

### Task 10 (moved to Phase 3B): Verify and ship

- [ ] **Step 1:** From `frontend/`, run `npx vitest run && npx vite build`. From `backend/`, run `.venv/bin/pytest -q`.
- [ ] **Step 2: Browser check.** Run the local backend and `VITE_API_URL= npx vite`, then drive them with playwright-core (`/usr/bin/google-chrome`) at 390px and 1440px with `kundli_lang=hi`.
  - Pages: `/generate` (fill and submit), `/kundli` (every tab), `/insights` (Reading idle), `/panchang`, `/pricing`, `/terms`.
  - For each, take a screenshot and count Latin words with the allow-list applied. Expect 0 on everything except `/terms`, which has the note and English body.
  - Check that a Devanagari font is in use: `document.fonts.check('16px "Noto Sans Devanagari"', 'कुंडली')` is true.
- [ ] **Step 3:** Push `feat/phase3-hindi`, open a PR to `main` titled "Phase 3: full Hindi", attach the screenshots, and ask the owner to review the Hindi copy and the glossary. Update the roadmap's Tracking row.
