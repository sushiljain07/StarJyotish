# Phase 5a: Contrast and Tokens Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make all meaningful text in the frontend pass WCAG AA on light surfaces, and make every colour and animation come from the one token set in `tailwind.config.js`.

**Architecture:** The tokens already exist (commit b343ebc). This phase migrates the call sites onto them. Guard tests in `src/theme/` lock each rule in, so the migration cannot regress. A per-file ratchet baseline covers rules that still have legitimate exceptions (gold text on night surfaces). Charts get their colours from `src/theme/chartPalette.js`, which reads `tailwind.config.js`, so the JS colours and the Tailwind classes can't drift apart.

**Tech Stack:** React 18, Vite, Tailwind 3.4, Vitest.

**Spec:** `docs/superpowers/plans/2026-11-04-frontend-ux-roadmap.md`, section "Phase 5 → 5a" (D-1, D-2, D-4, D-5, D-10, D-11).

## Global Constraints

- Branch `feat/phase5a-contrast-tokens`. Continue from b343ebc. One PR at the end.
- Text pairs: AA means 4.5:1 for text and 3:1 for focus rings and non-text UI. Ratios are measured with the `ratio()` helper in `src/theme/contrast.test.js`.
- Light surfaces are `parchment`, `parchment-card`, white, `primary-light`, `*-light` tints, and `bg-white/xx` over parchment. Night surfaces are `night`, `night-light`, `night-deep`, and any dark gradient.
- **Gold text on light surfaces** uses `text-primary-ink`. Hover on light changes to `hover:text-ink` (not a lighter gold). **Gold text on night surfaces** stays `text-primary-glow`, `text-primary-light` or `text-primary`. Gold *backgrounds and borders* (`bg-primary`, `border-primary/50`, `hover:bg-primary-dark`) are not text and are unchanged.
- **`ink-faint`** stays only for decoration: separators, bullets, decorative glyphs, disabled controls, and icon-only buttons that have an `aria-label`. All readable text moves to `text-ink-muted`: labels, captions, timestamps, helper text, placeholders, and "n/a" values.
- **Status meaning** (auspicious/present/low-risk vs mixed vs challenging/absent/high-risk) uses `good` / `caution` / `bad`. Text uses `text-good`, tinted backgrounds use `bg-good-light`, and borders use `border-good/30`.
- Planet colours (`config/planetColors.js`) are **out of scope**. That is W-2.
- English copy is unchanged. Hindi copy is unchanged. No `'hi'` literals.
- Run tests with `npm test` in `frontend/`. Run `npm run lint`. After each change run `graphify update .` from the repo root.

## Review Focus

1. **Gold text on a night surface wrongly darkened** to `primary-ink`, so it becomes unreadable on `night` (that pair is about 2.4:1). The ratchet in Task 1 can't see backgrounds. The per-batch reviewer must check each changed file against its night sections: `Home.jsx`, `Landing.jsx`, `SiteHeader`, `Footer`, `BottomNav`, `HomeMasthead`, `DailyPatrikaHero`, and the knowledge `Hero`.
2. **A component used on both surfaces** (it has a `surface`/`tone` prop, as in `ui/Button`, `ui/SectionHeading` and `ui/StateBlock`) must keep its night branch unchanged. Add a test for each changed `ui/` component that renders `surface="night"` and asserts the night class is still present.
3. **Focus ring invisible on night surfaces** after the ring is darkened for parchment. Task 5 pins the halo contrast against `night.DEFAULT`.
4. **Reduced motion:** moving the inline keyframes must keep the `prefers-reduced-motion` overrides in DailyPatrikaHero working. `src/reducedMotion.test.js` must still pass, and Task 5 adds an assertion for the moved `sj-*` classes.
5. **Chart SVG text below AA**, such as the 9px ascendant label. Task 4's palette test pins every text key ≥ 4.5:1 on `paper`.

---

### Task 1: Token-usage guard tests (ratchet)

**Files:**
- Create: `frontend/src/theme/tokenUsage.test.js`
- Create: `frontend/src/theme/baselines/token-usage-baseline.json`

**Interfaces:**
- Produces: `npm test -- tokenUsage` and `UPDATE_TOKEN_BASELINE=1 npm test -- tokenUsage`, which rewrites the baseline. Tasks 2–4 run this after each batch and commit the lowered baseline.

The test walks `src/**/*.jsx` (skipping `*.test.jsx`) using the same `walk` as `i18n/noHardcodedEnglish.test.js`. For each file it counts:
- `goldText`: matches of `/(?<![\w-])(?:hover:|group-hover:|focus:)?text-primary(?:-dark)?(?![\w-])/g`. That covers bare `text-primary` and `text-primary-dark`, but not `-ink`, `-glow` or `-light`.
- `faintText`: matches of `/text-ink-faint(?![\w-])/g`.
- `adHocStatus`: matches of `/(?:text|bg|border|from|to)-(?:green|emerald|amber|yellow|red|rose)-\d{2,3}/g`.

- [ ] **Step 1: Write the test**

```js
it('no file uses more gold/faint text than its baseline', ...)   // per file, per counter: count <= baseline[file]?.[counter] ?? 0
it('the baseline has no stale entries', ...)                     // every baseline entry > 0 must equal the current count (forces lowering after a fix)
it('adHocStatus is zero everywhere', ...)                        // written now, marked it.todo until Task 3, then enabled
```

- [ ] **Step 2: Generate the baseline** with `UPDATE_TOKEN_BASELINE=1 npm test -- tokenUsage`, then run without the variable. Expected: PASS. The counts recorded are about 502 goldText and 208 faintText.
- [ ] **Step 3: Commit** with the message `test: ratchet gold, faint and ad-hoc status text usage`.

### Task 2: Migrate gold and faint text (4 batches)

Run as four sub-tasks, each with its own implementer and reviewer, because every change is a judgement about which surface the text sits on. Each batch: edit the files, run `UPDATE_TOKEN_BASELINE=1 npm test -- tokenUsage` (counts must only go down), run the full `npm test`, then commit.

| Batch | Files |
|---|---|
| 2a | `components/ui/**`, `components/home/**`, `components/landing/**`, `components/knowledge/**` |
| 2b | `components/*.jsx` (chart, report and table tabs, nav, header, footer) |
| 2c | `pages/*.jsx` |
| 2d | `pages/learn/**` |

**Interfaces:**
- Consumes: the Global Constraints rules; the Task 1 baseline.
- Produces: a lower baseline. After 2d, every remaining `goldText` entry is on a night surface, and every remaining `faintText` entry is decorative.

- [ ] **Step 1 (2a only): Write failing surface tests** in `src/components/ui/tokens.test.jsx`:
  - `<Button variant="outline" surface="light">` has class `text-primary-ink`; with `surface="night"` it has `text-primary-glow`.
  - `<SectionHeading surface="light">` eyebrow has `text-primary-ink`; with `surface="night"` it has `text-primary-glow`.
  - The `InlineNotice` dismiss button keeps `text-ink-faint` and has an `aria-label`. This is the allowed decorative case.

  Read the components for the real prop names.
- [ ] **Step 2: Run them.** Expected: the light cases FAIL.
- [ ] **Step 3: Migrate the batch's files** using the rules in Global Constraints.
- [ ] **Step 4: Run** `UPDATE_TOKEN_BASELINE=1 npm test -- tokenUsage && npm test`. Expected: PASS, and the baseline totals go down.
- [ ] **Step 5: Commit** with the message `5a: gold and faint text to AA tokens (<batch name>)`.

**Reviewer checklist per batch:** compare `git diff` against each file's background. No `primary-ink` may sit on a night surface, and every remaining `text-primary(-dark)` must be on one. Confirm any `ink-faint` left behind is decorative.

### Task 3: Semantic status colours

**Files:** the 9 files with `adHocStatus` hits: `RajyogasTab`, `AshtakavargaTable`, `CareerReportTab`, `SarvatobhadraChakra`, `ChartReading`, `TopicReportTab`, `PaywallCard`, `pages/PanchangDetail`, `pages/learn/categories/Yogas`. Test files: `src/theme/tokenUsage.test.js` and `src/components/RajyogasTab.test.jsx`.

- [ ] **Step 1: Enable** the `adHocStatus is zero everywhere` test. Add a case to `RajyogasTab.test.jsx` that renders a present rajyoga and asserts its badge has `text-good` and `bg-good-light`.
- [ ] **Step 2: Run them.** Expected: FAIL.
- [ ] **Step 3: Map colours.**
  - emerald/green → `good`, amber/yellow → `caution`, red/rose → `bad`.
  - `-50`/`-100` backgrounds become `bg-<k>-light`. `-600`/`-700` text becomes `text-<k>`. `-200` borders become `border-<k>/30`. `-400`/`-500` accents become `bg-<k>` or `border-l-<k>`.
  - Exception: the PanchangDetail paksha dot (`bg-amber-400/80`) is moonlight, not status, so it becomes `bg-primary/80`.
- [ ] **Step 4: Run** `npm test`. Expected: PASS.
- [ ] **Step 5: Commit** with the message `5a: good/caution/bad replace ad-hoc status colours`.

### Task 4: `chartPalette` and removing the second palette

**Files:**
- Create: `frontend/src/theme/chartPalette.js` and `frontend/src/theme/chartPalette.test.js`
- Modify: `KundliChart.jsx`, `SouthIndiaChart.jsx`, `WesternChart.jsx`, `SarvatobhadraChakra.jsx`, `ChartReading.jsx`, `ChartHighlight.jsx`, `home/MobileTimelineCard.jsx`

**Interfaces:**
- Produces: `chartPalette` (a frozen object) and `withAlpha(hex: string, alpha: number): string`, which returns `rgba(r,g,b,a)`. Both are in `src/theme/chartPalette.js`, built by importing `../../tailwind.config.js`, as `contrast.test.js` already does.

| Key | Token | Replaces |
|---|---|---|
| `paper` | `parchment.card` | `#fff8f0`, `#fffef8`, `#fffbf0`, `#fafafa`, `#f8f8f8` |
| `paperAlt` | `parchment.DEFAULT` | `#fff7ed`, `#fff0e8`, `#e8f0ff`, `#f0f4ff` |
| `ascFill` | `primary.light` | `#fff5e0`, `#fef9c3` |
| `line` | `primary.dark` | `#b5451b` strokes |
| `signText` | `primary.ink` | `#b5451b` text |
| `asc` | `vermillion.DEFAULT` | `#FF6B00` (strokes and the "La"/asc label) |
| `text` | `ink.DEFAULT` | `#333`, `#374151` |
| `muted` | `ink.muted` | `#888`, `#94a3b8` |
| `hairline` | `line` | `#e2e8f0` |
| `goodFill` / `badFill` | `good.light` / `bad.light` | `#f0fff4`, `#d1fae5` / reds |
| `gold` | `primary.DEFAULT` | `#D4AF37`, `#D9A441` (decoration only) |
| `night` / `nightLight` / `nightDeep` | the `night.*` tokens | `#171B33`, `#262B4A`, `#1A0A3B`, `#2D1B69` |
| `onNight` | `ink.onnight` | `#C9C2D6`, `#E8DCC8`, `rgba(248,242,228,…)` → `withAlpha(onNight, a)` |

In MobileTimelineCard, `#5B7A5E` and `#A23B3B` become `sage` and `vermillion`/`bad`, and `#2E1A1A`/`#1A2E22` become `withAlpha(bad, …)`/`withAlpha(good, …)` over night. Where a colour sits in a `className`, use the Tailwind class instead of the palette.

- [ ] **Step 1: Write the tests** in `chartPalette.test.js`:
  - every value equals its config token (spot-check `paper`, `asc`, `line`);
  - `withAlpha('#D9A441', 0.5) === 'rgba(217,164,65,0.5)'`;
  - `text`, `muted`, `signText` and `asc` are each ≥ 4.5:1 on `paper` and on `ascFill`;
  - a file scan finds no hex or `rgba(` literal in the 7 files above, except `PLANET_COLORS` fallbacks, which use `chartPalette.text` / `.muted`.
- [ ] **Step 2: Run them.** Expected: FAIL (the module is missing).
- [ ] **Step 3: Implement** `chartPalette.js` and migrate the 7 files.
- [ ] **Step 4: Run** `npm test`. Expected: PASS. Existing chart tests still pass.
- [ ] **Step 5: Commit** with the message `5a: chartPalette from Tailwind tokens; drop the second gold/purple palette`.

### Task 5: Keyframes in one place; focus ring from tokens

**Files:** `src/index.css`, `tailwind.config.js`, `components/home/HeroBanner.jsx`, `components/home/DailyPatrikaHero.jsx`, the 13 users of `.prediction-fade`/`.tab-fade`, `src/index.css.test.js`, and `src/theme/contrast.test.js`.

Decisions:
- All `@keyframes` live in `src/index.css`.
  - The duplicated `fadeSlideIn`/`fadeSlideInFast` blocks are removed from `index.css`, and the Tailwind config is their single home.
  - `.prediction-fade` users move to `animate-fade-in-up` and `.tab-fade` users move to `animate-fade-in-fast`. Both legacy classes are then deleted.
  - The inline `sj-*` and `sj-hb-twinkle` keyframes, their classes and their reduced-motion block move from the two JSX `<style>` tags into `index.css`.
- Focus ring: `outline: 2px solid theme('colors.primary.ink'); box-shadow: 0 0 0 4px theme('colors.primary.glow');`. The dark ring shows on parchment and the glow halo shows on night. Both `:focus-visible` rules use it, with no hex literals.

- [ ] **Step 1: Write the tests.**
  - `index.css.test.js`: `@keyframes fadeSlideIn` is absent from `index.css`. The focus-visible rules contain `theme('colors.primary.ink')` and no `#` hex. `.sj-fade-up` sits inside a `prefers-reduced-motion: reduce` override.
  - A scan over `src/**/*.jsx` finds no `@keyframes`, `prediction-fade` or `tab-fade`.
  - `contrast.test.js`: `primary.ink` ≥ 3:1 on both light surfaces, and `primary.glow` ≥ 3:1 on `night.DEFAULT` and `night.deep`.
- [ ] **Step 2: Run them.** Expected: FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run** `npm test && npm run lint && npm run build`. Expected: PASS. The build shows Tailwind resolved `theme()`.
- [ ] **Step 5: Commit** with the message `5a: one home for keyframes; token focus ring with night halo`.

### Task 6: Browser check, roadmap update, PR

- [ ] **Step 1:** Run `npm run dev`. In English and Hindi, check: /home (night hero plus parchment cards), a Kundli result (North and South chart, Rajyogas, Ashtakavarga, Career report), /insights, a Learn page, /panchang, and the mobile timeline card at 375px. Tab through the pages to see the focus ring on parchment and on night. Turn on reduced motion and check the home hero.
- [ ] **Step 2:** In the roadmap, mark 5a done in the Phase 5 section and the Tracking table, and record `primary.ink #86621E` (not #8F6A22).
- [ ] **Step 3:** Run the final whole-branch review (opus) and one fix wave, then push and open the PR.
