# Phase 3B: Hindi Follow-ups Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Lock in the Hindi work from Phase 3. Guardrails stop new English or missing keys from slipping in, the Hindi wording is consistent and recorded in a glossary, the last backend English (career alignment) is translated, the deferred minors are triaged, and a real-browser check confirms the result.

**Architecture:** Phase 3's registries are unchanged: `frontend/src/i18n/languages.js` and `backend/services/i18n.py`. Every new guardrail reads the language list from those registries, so a third language is checked automatically. Tests are the enforcement:
- `parity.test.js`: keys, placeholders and script;
- `noLanguageLiterals` (frontend and backend): no language-code literals outside the registries;
- `noHardcodedEnglish.test.js`: an AST ratchet with a per-file baseline;
- a hardened `expectNoEnglish`.

**Tech Stack:** React 18, i18next 26, Vitest + Testing Library, `@babel/parser` 7.29.7 (already in `node_modules`); FastAPI + pytest; playwright-core with `/usr/bin/google-chrome` for the browser check.

**Spec:**
- The Phase 3B section of `docs/superpowers/plans/2026-11-04-frontend-ux-roadmap.md`.
- Tasks 8–10 of `docs/superpowers/plans/2026-11-04-phase3-hindi.md`. That plan's Global Constraints still apply, including the `expectNoEnglish` allow-list and the out-of-scope paths.

## Global Constraints

- **No language literals** outside `frontend/src/i18n/` and `backend/services/i18n.py`. Use `currentLanguage()`, `localeFor()`, `scriptFor()`, `languageEntry()`, `DEFAULT_LANGUAGE`, and on the backend `normalize_language()`, `language_name()` and `text()`. Task 2 enforces this.
- **English output stays byte-identical** unless a change is listed in **Owner decisions** below and the owner has ratified it.
- **Out of scope** for the English checks: `AdminDashboard.jsx`, `AstrologerDashboard.jsx`, `src/pages/learn/**`, `src/config/*Content.js`, and the body text of the four legal pages.
- **Allowed Latin in Hindi UI:** `AI`, `KP`, `PDF`, `Star Jyotish`, `D`+number, `AM`, `PM`, `EN`, URLs, and email addresses.
- **Keys:** every new key goes in `en.json` and in every other registered locale, in flat `<area>_<name>` form.
- Every storage access is wrapped in try/catch.
- **Gate before each commit:**
  - from `frontend/`: `npx vitest run` passes and `npx eslint <changed files>` reports 0 errors;
  - from `backend/`: `.venv/bin/pytest -q` passes.
- **Commits** are authored by `sushiljain07@gmail.com` (repo-local config). Every message ends with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Run `graphify update .` after code changes.

## Owner decisions (ask before Task 6; record the answers here)

**Answered 10 Nov 2026:**
- Decision 1 is approved: use real ordinals.
- Decision 2 is approved: 19 → 20.
- Decision 3: use the neutral wording.
- राजयोग (one word) is the standard form.
- Execution is subagent-driven.
- Decision 4 (the "owner to confirm" glossary rows) is still open. Task 6 writes the table, applies only the settled rows, and the owner reviews the table in the PR.

1. **`patrika_why_house` English "1th/2th/3th house".** Proposed: use the existing `house_ordinal` key (`t('house_ordinal', { count, ordinal: true })`), giving "1st/2nd/3rd" in English and "1ला/2रा/4था" in Hindi. This changes English output.
2. **Rajyoga paywall says "19 yogas"; the backend checks 20.** Proposed: change it to 20 in `rajyogas_paywall_body` and `rajyogas_paywall_bullet_1` (en + hi). This changes English output.
3. **`career_scenario_prompt` (hi) uses the masculine "कर रहा हूँ".** Proposed gender-neutral wording: "मुझे एक करियर निर्णय लेना है: {{text}}। …", with the rest unchanged.
4. **Native wording review.** The glossary (Task 6) gives each flagged term a "Current" and a "Proposed" column. The owner confirms or edits the table; Task 6 applies only the confirmed rows.

## Triage of the deferred minors (36)

| # | Minor | Decision |
|---|---|---|
| 1 | SUPPORTED_LANGS computed once at import | Fix, Task 7 |
| 2 | Thin tests for localeFor/scriptFor/registerLanguage replace | Fix, Task 7 |
| 3 | Mid-file `from services… import` in career_analysis (health and wealth are already clean) | Fix, Task 5 |
| 4 | Hindi ordinal `{n}वें` for every n (backend) | Glossary row, Task 6 (native review) |
| 5 | en-GB → en-IN; no test on DailyPatrikaHero | Close: the journey test covers PersonalHome, which renders it |
| 6 | AccountMenu switcher row `role=menuitem` wraps buttons | Fix, Task 7 (`role="group"` + `aria-label`) |
| 7 | LanguageSwitcher: synchronous throw from updateMyProfile; no rejecting test | Fix, Task 7 |
| 8 | Profile `<option>`s lack `lang`; extra `tone` prop | Fix the `lang` attribute, Task 7; `tone` stays (used by AccountMenu) |
| 9 | Tiro Devanagari has only weight 400; bold is synthesized | Look at it in Task 8's screenshots; any fix moves to Phase 5a |
| 10 | Body line-height under Tailwind utilities; untested rules | Phase 5a |
| 11 | astroNames parity test imports `../../../backend` via `?raw` | Fix, Task 7 (`fs` + `it.skipIf`) |
| 12 | planetAbbr fallback is 2 Latin letters | Close: only for names the client doesn't know, by design |
| 13 | Hindi legend words | Glossary row, Task 6 |
| 14 | chartLagna `/12.{0,2}La/` is loose | Fix, Task 3 |
| 15 | Sarvatobhadra unused `fullName` falls back to Latin 'Abhijit' | Fix, Task 7 (add `nakshatras.Abhijit`) |
| 16 | `chart_sarvato_corner_Saturn` 'शनि\n(शनि)' | Fix, Task 6 |
| 17 | KPKP allow-list hack | Fix, Task 3 |
| 18 | Hindi prose and abbreviations | Glossary rows, Task 6 |
| 19 | test_yoga_i18n ids check covers only the last chart | Fix, Task 5 |
| 20 | render_yoga mutates its input | Fix, Task 5 |
| 21 | No vitest for the RajyogasTab language-follow effect | Fix, Task 7 |
| 22 | 'भाग्य और करियर का भाग्य', 'नीचता भंग हुई' | Glossary rows, Task 6 |
| 23 | Mislabelled 'context form with a stage and concern picked' test | Fix, Task 3 |
| 24 | career_scenario_prompt masculine | Owner decision 3, Task 6 |
| 25 | Paywall 19 vs 20; PaywallCard alert English | 19→20 per owner decision 2, Task 6; alert → Phase 4 (already listed) |
| 26 | अमात्यकारक, तालमेल, रोडमैप, राज योग vs राजयोग | Glossary rows, Task 6 |
| 27 | Insights sub-tab labels diverge from landing labels | Note it in the PR body, Task 8 |
| 28 | LocationSection capitalisation | Close: the component is unused (no imports) |
| 29 | KnowledgeCapsule teasers English on Hindi home | Content phase (owner decision, 4 Nov) |
| 30 | patrika_why_house '1th' | Owner decision 1, Task 6 |
| 31 | Test allow-list extras (AM\|PM regex, 'Star JyotishAI') | Fix, Task 3 |
| 32 | MONTH_KEYS duplicated; no dailyInsights coming-up date test | Fix, Task 7 |
| 33 | Eager loading of all locales | Phase 5d (already listed) |
| 34 | `_mahapurusha` 2-language tuple; Profile `\|\| 'en'` | Fix, Task 2 |
| 35 | Disclaimer plain-language box; backend N/A/? in career evidence | Disclaimer label → Task 4's ratchet clean-up; N/A/? close ('?' is not a word; N/A only appears for a malformed chart) |
| 36 | savedLanguageChoice storage-blocked untested; check_all_yogas run twice; Hindi fixture covers one chart | Test, Task 7; compute once, Task 5; every fixture in Hindi, Task 5 |

## Review Focus

1. **A third language registered later.** Parity, script, literal and ratchet checks must loop over the registry and never hardcode `hi`. Pinned in Task 1 (a pseudo-locale registered in-test is checked) and Task 2 (the literal patterns are built from the registry codes).
2. **Plural keys.** Hindi and English plural categories differ (ordinal `_many` exists in both today, but a future language may lack `_two`). Parity compares plural keys by base name, and requires `_other`. Pinned in Task 1.
3. **A Hindi container that renders nothing yet** (a skeleton or a loading state). `expectNoEnglish` must fail on it, not pass silently. Pinned in Task 3.
4. **A Hindi career report for a profession that matches no keyword, or a chart with no Amatyakaraka.** The explanation is in Hindi, and "?" stays a placeholder rather than turning into English. English is byte-identical. Pinned in Task 5.
5. **Language switched while RajyogasTab is open.** It refetches in the new language, and the old response arriving late must not overwrite the new one. Pinned in Task 7.

---

### Task 1: Key parity, placeholder and script checks across all locales

**Files:**
- Create: `frontend/src/i18n/parity.test.js`, `frontend/src/i18n/localeCheck.js` (pure helpers shared with Task 6)
- Modify: `en.json` and `hi.json`: replace `coming_in_weeks` with `coming_in_weeks_one` and `coming_in_weeks_other` (English: `"In ~{{count}} week · {{date}}"` and `"In ~{{count}} weeks · {{date}}"`; Hindi: both `"लगभग {{count}} सप्ताह में · {{date}}"`)
- Modify: `frontend/src/utils/dailyInsights.js:327`, to call `t('coming_in_weeks', { count: weeks, date })`

**Interfaces:**
- Produces, in `localeCheck.js`:
  - `flatten(obj) → Map<string,string>` with dotted keys;
  - `placeholders(str) → string[]`, the sorted names inside `{{…}}`;
  - `pluralBase(key) → string`, which strips `_(zero|one|two|few|many|other)` and `_ordinal_(…)`;
  - `scriptViolation(value, scriptRange) → boolean`.
- `scriptViolation` works like this:
  - remove the `{{…}}` placeholders, then the Global Constraints allow-list tokens (export that list as `ALLOWED_LATIN` from `src/test/expectNoEnglish.js` and import it here);
  - if any letter `\p{L}` remains, the value must match `scriptRange`.
  - So no per-key allow-list is needed: `app_title`, `form_ampm` and `panchang_eclipse_line` pass naturally.

- [ ] **Step 1: Write the failing tests** in `parity.test.js`. Loop over `LANGUAGES.filter(l => l.code !== DEFAULT_LANGUAGE)`:
  - `'<code> has every en key and no extra'`: the non-plural keys are equal; plural keys are compared by `pluralBase`, and every plural base has `_other`.
  - `'<code> placeholders match en'`: for each key, `placeholders(en) == placeholders(xx)`. Plural keys are compared to en's `_other`.
  - `'<code> values are in its script'`: no key gives `scriptViolation(value, entry.scriptRange)` (skip when the entry has no `scriptRange`).
  - `'every registry code has a locale file and vice versa'`: use `import.meta.glob('./*.json')`.
  - `'a registered pseudo-language is checked'`: `registerLanguage({code:'xx', …, scriptRange:/[ऀ-ॿ]/})` with an in-memory bundle missing one key makes the parity helper report that key. Restore the registry in `finally`.
- [ ] **Step 2: Run** `npx vitest run src/i18n/parity.test.js`. Expected: FAIL, naming `coming_in_weeks` (placeholder `s` vs none).
- [ ] **Step 3: Implement** `localeCheck.js`, the plural keys and the `dailyInsights.js` caller.
- [ ] **Step 4: Run** the parity test, then `npx vitest run`. Expected: PASS. Existing dailyInsights tests still produce "In ~1 week · …" and "In ~3 weeks · …".
- [ ] **Step 5: Commit:** `Check key, placeholder and script parity for every locale`.

### Task 2: No language-code literals, frontend and backend

**Files:**
- Create: `frontend/src/i18n/noLanguageLiterals.test.js`, `backend/tests/test_no_language_literals.py`
- Modify: `frontend/src/pages/Profile.jsx:139` (`|| DEFAULT_LANGUAGE`); `backend/services/yoga_text.py:55-61` (the `_mahapurusha` suffix comes from a per-language table)

**Interfaces:**
- Frontend: build the patterns from `LANGUAGES.map(l => l.code)`, so `CODES = en|hi`. In `src/**/*.{js,jsx}`, excluding `src/i18n/**` and `*.test.*`, flag:
  - `[!=]==?\s*(['"])(CODES)\1`, and the same with the literal on the left;
  - `startsWith\(\s*(['"])(CODES)`;
  - `(\|\||\?\?)\s*(['"])(CODES)\2` (a hardcoded default language).
- Backend: read the codes from `SUPPORTED_LANGUAGES`. In `backend/services/**/*.py` and `backend/routers/**/*.py`, excluding `services/i18n.py`, flag:
  - `[!=]=\s*(['"])(CODES)\1` (either side);
  - `in\s*[\(\[{][^)\]}]*(['"])(CODES)\1`;
  - `\.startswith\(\s*(['"])(CODES)`.
- `yoga_text.py`: `_MAHAPURUSHA_SUFFIX = {"en": "Pancha Mahapurusha", "hi": "पंच महापुरुष"}`. `_mahapurusha(index, language)` reads `_MAHAPURUSHA_SUFFIX[language]`. The rendered names are byte-identical.

- [ ] **Step 1: Write both tests.** The failure message lists `file:line: text`. Also add one test per side that feeds a fixed string (`if (lang === "hi")` and `x == 'hi'`) through the matcher and expects a hit, so the patterns are proven to catch both quote styles.
- [ ] **Step 2: Run** `npx vitest run src/i18n/noLanguageLiterals.test.js` and `.venv/bin/pytest tests/test_no_language_literals.py -q`. Expected: FAIL on `Profile.jsx:139`. If `yoga_text.py` is not caught (it uses an index, not a literal), the fix still goes in this task. Fix any other real hit in this task; anything that is not a comparison gets a narrower pattern, not an allow-list.
- [ ] **Step 3: Implement** the Profile and `_mahapurusha` fixes.
- [ ] **Step 4: Run** both suites in full. Expected: PASS. `test_yoga_i18n.py` is unchanged.
- [ ] **Step 5: Commit:** `Forbid language-code literals outside the registries`.

### Task 3: A stricter `expectNoEnglish`, and remove the allow-list hacks

**Files:**
- Modify: `frontend/src/test/expectNoEnglish.js`
- Modify: `src/pages/journey.hindi.test.jsx:134-145`, `src/pages/Result.hindi.test.jsx:23`, `src/components/reports.hindi.test.jsx:204`, `src/components/chartLagna.test.jsx:20`
- Test: `frontend/src/test/expectNoEnglish.test.js` (new)

**Interfaces:**
- `export const ALLOWED_LATIN` (the regex list used today; Task 1 imports it).
- `expectNoEnglish(container, extraAllow = [], { script } = {})`:
  - clones the container and drops `<style>`/`<script>` (moved here from `journey.hindi.test.jsx`'s `expectHindi`);
  - collects text with a `TreeWalker` over text nodes, **joined with `' '`**, plus the four attributes;
  - asserts the trimmed text is non-empty (message: `container is empty — still loading?`);
  - asserts it matches `script ?? languageEntry(currentLanguage()).scriptRange`, when that range exists;
  - then runs today's allow-list removal and the `/[A-Za-z]{3,}/` check.

- [ ] **Step 1: Write the failing tests** in `expectNoEnglish.test.js`, in `hi`:
  - an empty `<div>` fails with "empty";
  - a `<div><div class="animate-pulse"></div></div>` fails with "empty";
  - `<span>KP</span><span>KP</span>` passes with no extra allow;
  - `<span>Star Jyotish</span><span>AI</span>` passes;
  - `<option>AM</option><option>PM</option>` passes;
  - `<p>नमस्ते Hello</p>` fails listing `Hello`;
  - `<p>नमस्ते</p><style>.x{color:red}</style>` passes;
  - a Latin-only allowed text (`<p>PDF</p>`) fails the script check.
- [ ] **Step 2: Run** `npx vitest run src/test/expectNoEnglish.test.js`. Expected: FAIL on the join, empty and script cases.
- [ ] **Step 3: Implement.** Then clean up the callers:
  - In journey, drop `'Star JyotishAI'` and `/(?:AM|PM)+/` from `ALLOW`, and make `expectHindi` a thin wrapper (keep its Devanagari assertion only if it isn't redundant; it is, so delete it and call `expectNoEnglish` directly).
  - In Result, drop `/(?:KP){2,}/`.
  - Rename the reports test at line 204 after the state its body actually renders and asserts.
  - In chartLagna's English case, replace `/12.{0,2}La/` with a check on the lagna element: find the text node equal to `'La'` (`getAllByText('La', { exact: true })`), and assert it is non-empty. The Hindi case asserts `getAllByText('ल', { exact: true })` the same way.
- [ ] **Step 4: Run** `npx vitest run`. Expected: PASS. If a Hindi test now fails as "empty", that test was passing vacuously on a loading state: make it wait for content (`findBy…`) rather than loosening the helper.
- [ ] **Step 5: Commit:** `Make the no-English check reject empty containers and join text nodes`.

### Task 4: The hardcoded-English ratchet

**Files:**
- Create: `frontend/src/i18n/noHardcodedEnglish.test.js`, `frontend/src/i18n/hardcoded-baseline.json`, `frontend/src/i18n/scanJsx.js`
- Modify: `frontend/package.json` (devDependencies `"@babel/parser": "7.29.7"`; the version is already installed, so nothing is downloaded); `frontend/src/pages/Disclaimer.jsx:135` ("In plain language" → `t('disclaimer_plain_label')`, plus en and hi keys)

**Interfaces:**
- `scanJsx(source, file) → Array<{ line, text }>`. It parses with `@babel/parser` (`sourceType:'module', plugins:['jsx']`) and walks the AST with a small recursive visitor (no `@babel/traverse`). It reports:
  - `JSXText` with `/[A-Za-z]{3,}/` after trimming;
  - string `Literal`/`StringLiteral` JSX children (`{'…'}`) and template literals with no expressions;
  - string values of the JSX attributes `placeholder`, `title`, `aria-label`, `alt` and `label`.
  - It ignores text that is only `ALLOWED_LATIN` tokens.
- The test globs `src/**/*.jsx`, excluding `*.test.jsx` and the out-of-scope paths. It asserts `count(file) <= baseline[file] ?? 0`. With `UPDATE_BASELINE=1`, it writes the current counts (files with 0 omitted, keys sorted) instead.
- The failure message lists the file, the baseline, the count and the new strings with line numbers.

- [ ] **Step 1: Write the test** and `scanJsx.js`, plus a unit test of `scanJsx` on an inline snippet: `<p>Hello world</p>` gives 1, `<p>{t('x')}</p>` gives 0, `<img alt="Chart" />` gives 1, and `<p>PDF</p>` gives 0.
- [ ] **Step 2: Generate** the baseline: `UPDATE_BASELINE=1 npx vitest run src/i18n/noHardcodedEnglish.test.js`.
- [ ] **Step 3: Inspect the baseline.** Any main-journey file it lists gets the string translated in this task (Disclaimer's label is a known one). Only files that are genuinely deferred stay listed: legal body text, the unused `LocationSection`/`QuickAccess`, and the `PaywallCard` alert (Phase 4). List those in the commit message. Regenerate.
- [ ] **Step 4: Prove the guardrails catch regressions, then revert:**
  - add `<p>Hello world</p>` to `components/BirthForm.jsx`: the ratchet fails;
  - delete one key from `hi.json`: parity fails;
  - add `if (x === "hi")` to `utils/format.js`: the literal test fails.
- [ ] **Step 5: Run** `npx vitest run`. Expected: PASS.
- [ ] **Step 6: Commit:** `Ratchet hardcoded English in JSX against a per-file baseline`.

### Task 5: Backend: career alignment in Hindi, and the yoga/career tidy-ups

**Files:**
- Modify: `backend/services/career_analysis.py` (`compute_career_alignment` at 79-145; the imports at 752-754 and 1160 move to the top; `generate_career_report` at 1196 and 1310)
- Modify: `backend/services/yoga_text.py:311` (`render_yoga` must not mutate its input)
- Test: `backend/tests/test_career_alignment_i18n.py` (new), `backend/tests/test_yoga_i18n.py:37-45`

**Interfaces:**
- `compute_career_alignment(current_profession, ak_data, planets, lagna_idx, language="en")`. `label` stays the stable English id. `explanation` comes from `text(CAREER_ALIGNMENT_TEXT, language, "<underutilized|strong|partial>", planet=…, amk=…, keywords=…)`.
- The planet names come from `yoga_text.PLANET_NAMES` via its existing lookup helper. "?" stays "?". `matched_keywords` is the user's own input words and stays as typed.
- `CAREER_ALIGNMENT_TEXT["en"]` holds today's three f-strings, converted to `.format` templates **verbatim**.
- `generate_career_report` passes `language` through to it.
- `render_yoga(entry, language) → dict` returns a new dict: `{**entry, "yoga": …, "description": …}`.
- `check_all_yogas` runs once per career report, in English. The present-yoga list at 1310 becomes `[render_yoga(y, language) for y in combinations if y["present"]]`.

- [ ] **Step 1: Write the failing tests:**
  - **English byte-identical.** Exact-string asserts of all three English explanations, for "Software Engineer" with AMK Mercury, AMK Mars, and "Astronaut", and a no-AMK case containing `'?'`. Copy the expected strings from the current code before editing it.
  - **Hindi.** For the same inputs with `language="hi"`, each explanation matches `[ऀ-ॿ]`, has no `/[A-Za-z]{3,}/` apart from the user's `matched_keywords`, and contains `बुध` for Mercury.
  - **No mutation.** `render_yoga`: deep-copy an entry, render it, and assert the original is unchanged.
  - **Per-chart ids and Hindi on every fixture.** In `test_yoga_i18n`, move the subset assertion inside the loop, and run `check_all_yogas(..., language="hi")` for every case, asserting each `yoga`/`description` is Devanagari.
  - **One yoga pass.** `generate_career_report` with `_call_llm` patched: `check_all_yogas` is called once (patch it with `wraps=`).
- [ ] **Step 2: Run** `.venv/bin/pytest tests/test_career_alignment_i18n.py tests/test_yoga_i18n.py -q`. Expected: FAIL.
- [ ] **Step 3: Implement.** Hindi templates for the three cases (submit these wording rows to the Task 6 glossary review):
  - `underutilized`: "आपका बताया गया पेशा किसी पारंपरिक करियर क्षेत्र से सीधे नहीं जुड़ता, लेकिन आपकी कुंडली का सबसे मज़बूत करियर संकेत (अमात्यकारक: {amk}) ठोस, विशिष्ट क्षमताओं की ओर इशारा करता है। यह रिपोर्ट बताती है कि वह क्षमता कैसी दिखती है।"
  - `strong`: "आपका बताया गया पेशा {planet} से जुड़े शब्दों ({keywords}) से मेल खाता है, और {planet} ही आपकी कुंडली का अमात्यकारक है, यानी सबसे मज़बूत करियर संकेत। आपका वर्तमान मार्ग सीधे आपकी कुंडली की मूल शक्ति पर आधारित है।"
  - `partial`: "आपका बताया गया पेशा {planet} से जुड़े शब्दों ({keywords}) से मेल खाता है, लेकिन आपकी कुंडली का सबसे मज़बूत करियर संकेत (अमात्यकारक) {amk} है। आपका वर्तमान मार्ग वास्तविक क्षमताओं पर आधारित है; यह रिपोर्ट यह भी बताती है कि आपकी {amk} ऊर्जा किस संभावना की ओर इशारा करती है।"
  - Move the mid-file imports to the top. If moving one creates an import cycle, leave that one where it is with a one-line comment saying why.
- [ ] **Step 4: Run** `.venv/bin/pytest -q`. Expected: PASS.
- [ ] **Step 5: Commit:** `Career alignment explanation in Hindi; render yogas once without mutation`.

### Task 6: Glossary and wording pass

> **Needs the owner's answers to Owner decisions 1–4 first.**

**Files:**
- Create: `docs/i18n-glossary.md` (a `## हिन्दी (hi)` section: a table with English, Hindi, Note and Status (`settled` | `owner to confirm`); about 40 rows)
- Modify: `hi.json` (and `en.json` for decisions 1 and 2), `frontend/src/components/home/DailyPatrikaHero.jsx:87` (decision 1), `docs/i18n.md` (link the glossary)
- Test: extend `frontend/src/i18n/parity.test.js`

**Interfaces:**
- **Settled rows** (enforced by the test):
  - जन्म कुंडली / कुंडली for a chart, and never चार्ट, except in keys on an allow-list that name a specific divisional chart (list them in the test after grepping the 14 current hits);
  - चंद्र (not चंद्रमा);
  - गुरु (not बृहस्पति);
  - पुनः प्रयास करें (not फिर से प्रयास / फिर कोशिश);
  - राजयोग as one word (5 hits today vs 9 for राज योग; one form wins, and the glossary records which).
- **"Owner to confirm" rows**, each with the current form and a proposal:
  - the legend words (वक्री, अस्त, उच्च, नीच, वर्गोत्तम);
  - the nakshatra, sign and planet short forms;
  - the Sarvatobhadra corners and vowels;
  - अमात्यकारक, तालमेल, रोडमैप;
  - the house ordinals: frontend 1ला/2रा/4था/6ठा/5वाँ vs backend `{n}वें` (the oblique form after a postposition is correct for "{n}वें भाव में"; keep both and record why);
  - the Panchang yoga and masa spellings;
  - 'भाग्य और करियर का भाग्य' (`yoga_text.py:784`) and 'नीचता भंग हुई' (`:834`);
  - the Task 5 career-alignment Hindi.

- [ ] **Step 1: Write the failing glossary assertions** in `parity.test.js`, scoped to `hi`:
  - no value contains `फिर से प्रयास`, `फिर कोशिश`, `चंद्रमा` or `बृहस्पति`;
  - `चार्ट` appears only in allow-listed keys;
  - the losing राजयोग/राज योग form appears nowhere;
  - `patrika_rarity` (hi) contains a verb meaning "occurs" (`होता`);
  - `chart_sarvato_corner_Saturn` (hi) has no repeated word.
  Also, in `DailyPatrikaHero`, assert that `{house: 1}` renders "1st" in English and "1ला" in Hindi.
- [ ] **Step 2: Run** to verify they fail, listing the keys.
- [ ] **Step 3: Fix the values:**
  - `patrika_rarity` (hi) becomes `"{{rarity}} होता है"`, after checking what `rarity` interpolates to;
  - the Saturn corner becomes `"शनि"`;
  - decisions 1–3 as ratified;
  - the confirmed rows from decision 4;
  - the backend `yoga_text.py` strings if their rows were confirmed.
  Write the glossary.
- [ ] **Step 4: Run** `npx vitest run` and `.venv/bin/pytest -q`. Expected: PASS.
- [ ] **Step 5: Commit:** `Hindi glossary and consistent wording`.

### Task 7: Frontend registry, a11y and test minors

**Files:**
- Modify: `frontend/src/i18n/index.js` (`readSavedLang`, `syncHtmlLang` and the resource loop read `LANGUAGES` at call time through a local `supportedLangs()`; drop the `SUPPORTED_LANGS` export, which has no importers outside `index.js`; export `readSavedLang` for the test)
- Modify: `components/AccountMenu.jsx:129` (`role="group"` with `aria-label={t('language_label')}`, using the existing key or a new one)
- Modify: `components/LanguageSwitcher.jsx:29-30` (wrap it in `try { Promise.resolve(auth.updateMyProfile(…)).catch(() => {}) } catch {}`)
- Modify: `pages/Profile.jsx:236` (`<option lang={l.code}>`)
- Modify: `components/SarvatobhadraChakra.jsx:115` (add `nakshatras.Abhijit` to en ("Abhijit") and hi ("अभिजित"))
- Modify: `utils/astroNames.js:33-36` (one `MONTH_KEYS` array, used for both the lookup and the key)
- Modify: `utils/astroNames.test.js:2` (read `../../../backend/services/astro_calc.py` with `fs`; `it.skipIf(!existsSync(path))`)
- Tests: `i18n/index.test.js`, `i18n/languages.test.js`, `components/LanguageSwitcher.test.jsx`, `components/RajyogasTab.test.jsx` (new or extended), `utils/dailyInsights.test.js`

- [ ] **Step 1: Write the failing tests:**
  - **Runtime language.** After `registerLanguage({code:'xx',…})`, `localStorage.kundli_lang='xx'` and a reload of `readSavedLang` (export it for the test), it returns `'xx'`.
  - **Registry lookups.** `localeFor('zz')` is `'en-IN'`. `scriptFor('zz')` is `'latn'`. Registering `hi` twice leaves one `hi` entry, with the second entry's fields.
  - **Blocked storage.** `savedLanguageChoice()`, with `localStorage.getItem` throwing, returns `{ code: null, source: null }`.
  - **LanguageSwitcher.** `updateMyProfile` that throws synchronously still changes the language and doesn't throw. One that rejects does the same.
  - **AccountMenu.** The switcher row has `role="group"`, and no `menuitem` contains a `button`.
  - **RajyogasTab.** Rendered in `en`, then `changeLanguage('hi')`, it fetches `/api/rajyogas` again with `language: 'hi'`. If the `en` response resolves after the `hi` one, the screen still shows the Hindi result.
  - **dailyInsights.** For a coming-up change dated "12 Nov 2026" in `hi`, `when` contains `नवंबर` and `सप्ताह`.
  - **Sarvatobhadra.** The Abhijit cell's `fullName` in `hi` is `'अभिजित'`.
- [ ] **Step 2: Run** to verify they fail.
- [ ] **Step 3: Implement.** If the RajyogasTab race test fails, ignore stale responses with a request-id ref.
- [ ] **Step 4: Run** `npx vitest run` and `npx eslint` on the changed files. Expected: PASS, 0 errors.
- [ ] **Step 5: Commit:** `Registry, switcher, a11y and test fixes from the Phase 3 reviews`.

### Task 8: Real-browser check and ship

**Files:**
- Create (scratchpad, not committed): `hindi-check.mjs`, run with `NODE_PATH=/home/sushilk/logiqids-quest/node_modules` (playwright-core is installed there) and `executablePath: '/usr/bin/google-chrome'`
- Modify: `docs/superpowers/plans/2026-11-04-frontend-ux-roadmap.md` (the Tracking row and the Phase 3B status)

- [ ] **Step 1: Run the full gate.** From `frontend/`: `npx vitest run && npx vite build`. From `backend/`: `.venv/bin/pytest -q`. All must pass.
- [ ] **Step 2: Start the local backend and `VITE_API_URL= npx vite`.** Then drive Chrome with `localStorage.kundli_lang='hi'` and `kundli_lang_source='user'` at 390×844 and 1440×900 over:
  - `/generate` (fill and submit with a fixed birth: 1990-05-15 10:30, New Delhi);
  - `/kundli` (every top tab and sub-tab);
  - `/insights` (Reading idle);
  - `/panchang`, `/pricing` and `/terms`.
  For each page:
  - take a full-page screenshot;
  - report the Latin-word count over `document.body.innerText`, using the `ALLOWED_LATIN` rules plus the user's place name. Expect 0, except on `/terms` (English body) and the AI panes, which need a working LLM key and are blank locally;
  - assert `document.fonts.check('16px "Noto Sans Devanagari"', 'कुंडली')`.
  Look at the bold Hindi headings in the screenshots for minor #9.
- [ ] **Step 3: Fix and re-check.** Any non-zero page gets a fix plus a vitest pin in the owning area, re-run until clean, and committed as `Fix Hindi leftovers found in the browser check`.
- [ ] **Step 4: Update the roadmap.** Mark Phase 3B done, and move any owner-to-confirm glossary rows still open to a "3B leftovers" line.
- [ ] **Step 5: Push and open the PR.** Push `feat/phase3b-hindi-followups` and open a PR to `main`, "Phase 3B: Hindi guardrails, glossary and follow-ups". The body has:
  - the triage table outcome;
  - the owner decisions as applied;
  - the per-page Latin counts;
  - the Insights sub-tab label note (minor #27);
  - the screenshot paths.
  Ask the owner to review the glossary.
