# Phase 5b: Component Adoption Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Hand-typed buttons, cards, chips and text sizes are replaced by the shared `ui/` components and the type scale, and a guard stops them from coming back.

**Architecture:**
1. Task 1 adds one new primitive (`Badge`) and one `href` option on `Button`. It also adds a ratchet test, `theme/componentUsage.test.js`: each file may use a pattern only as many times as its baseline allows.
2. Tasks 2–5 migrate one area of the app each. Their file sets don't overlap, so they can run in parallel worktrees, and each task lowers the baseline for its own files.
3. Task 6 turns the two patterns that must reach zero into hard guards, then runs the browser pass, the review and the docs.

**Tech Stack:** React 18, Vite, Tailwind 3.4, Vitest, Playwright for the browser pass.

**Spec:**
- Roadmap §5b in `docs/superpowers/plans/2026-11-04-frontend-ux-roadmap.md`:
  - Move the 37 hand-built CTAs onto `<Button>` and the cards onto `<Card>`.
  - Add `Pill`/`Badge` components.
  - Codemod the arbitrary text sizes to the 2xs/3xs scale, with nothing below 10px.
  - Add a lint or CI grep that blocks `rounded-xl|2xl` and `shadow-(sm|md|lg)` outside `ui/`.
- Measured on `main` at f18d9ec (16 Nov), in non-test `.jsx` outside `components/ui/`:

| Pattern | Count | Files |
|---|---|---|
| Gold CTA recipe (`hover:bg-primary-dark`) | 40 | 30 |
| Light card recipe (`bg-parchment-card … border-line`) | 128 | 82 (includes form fields, see Task 1) |
| Night card recipe (`bg-white/[0.03–0.06] … border-white/`) | 11 | — |
| Chip recipe (`rounded-full` + `px-*` + `text-2xs/3xs/xs`) | 51 | 26 |
| Arbitrary text sizes (`text-[Npx]`) | 82 | — |
| `rounded-xl` / `rounded-2xl` | 243 | 94 |
| `shadow-sm` / `shadow-md` / `shadow-lg` | 82 | 37 |

The arbitrary text sizes break down as: 57× `11px`, 7× `13px`, 5× `15px`, 4× `13.5px`, 3× `17px`, 3× `12px`, 1× `9px`, 1× `19px`, 1× `16.5px`.

## Global Constraints

- **Branch:** `feat/phase5b-components`, from `main` at f18d9ec. The PR targets `main`.
- **This is a refactor, not a redesign.**
  - No layout change and no copy change.
  - Allowed visual changes: card radius unifies to `rounded-card` (16px), CTA padding and shadow unify to the `Button` sizes, chip padding unifies to the `Badge` sizes, and text sizes snap to the scale in the mapping below.
  - Phone layouts at 360 and 390 must have no horizontal scroll, in en and hi.
- **Text-size mapping (decided here; the owner confirms in plan review):**

| From | To |
|---|---|
| `text-[11px]` | `text-2xs` (identical) |
| `text-[9px]` | `text-2xs` (readable text ≥11px; the spec's floor is 10px) |
| `text-[12px]` | `text-xs` (identical) |
| `text-[13px]`, `text-[13.5px]` | `text-sm` (14px) |
| `text-[15px]`, `text-[16.5px]` | `text-base` (16px) |
| `text-[17px]` | `text-lg` (18px) |
| `sm:text-[19px]` | `sm:text-xl` (20px) |

  Responsive prefixes are kept (`sm:text-[13px]` → `sm:text-sm`).
- **Earlier rules still hold:**
  - Tokens only; `colourGuards.test.js`, `tokenUsage.test.js` and the night-file scans stay green.
  - Gold selection, the two-level Kundli tabs and the one bottom bar on mobile /kundli don't change.
  - 44px tap targets: `Button` already gives `min-h-11`.
  - The frame (`components/layout/frame.js`) is untouched.
- **What is a card:** a container that sets off a group of content. Form fields (inputs, textareas, selects, comboboxes) are not cards and stay as they are. Chart SVG internals and progress bars are out of scope.
- **What is a CTA:** a gold, filled action whose recipe includes `hover:bg-primary-dark`. Dots, rings, progress fills and tab underlines that use `bg-primary` are not CTAs.
- **Before each commit:** `npm run build` regenerates `frontend/public/sitemap.xml`; restore it with `git checkout frontend/public/sitemap.xml`.
- **Tests:** run `cd frontend && npx vitest run <files>` while working, and the full `npx vitest run` plus `npx eslint src` (0 errors) before each merge.

## Review Focus

1. **Long Hindi CTA labels on a 360px phone.** `Button` sets `whitespace-nowrap`; some of the old hand-built CTAs wrapped. A long label must not push the page wider. The CTAs that can be wide get `className="whitespace-normal text-center"`. Covered by a Task 6 browser check in hi at 360, and a Task 1 test that `className` can override nowrap.
2. **Disabled states that changed meaning.** Old CTAs used `disabled:bg-primary/40` or `disabled:bg-line disabled:text-ink-muted`; `Button` uses `disabled:opacity-50`. A disabled submit must still look disabled and stay unclickable. Tasks 3 and 5 keep their existing disabled-state tests passing (PhoneOtpForm, Profile, CareerReportTab).
3. **Cards that are links or buttons.** A card rendered through `Card as={Link}` or `as="button"` must keep its `to`/`onClick` and keyboard focus. Covered by a Task 1 test, `Card as={Link} to="/x"` renders an `<a href="/x">`, and by the existing navigation tests in each area.
4. **Night cards picking up light styles.** On /home and the other night surfaces, `Card` must get `surface="night"` (or `night-accent`). The default light surface on a night page would fail contrast. Covered by the existing `nightColour.test.jsx` and `nightColourPages.test.js` scans, plus the Task 6 contrast walker.
5. **External links on Button.** A CTA pointing at an external URL must stay an `<a href target rel>`, not become a router `Link`. Covered by the Task 1 `href` test.

---

### Task 1: Badge, Button `href`, and the component-usage ratchet

**Files:**
- Create:
  - `frontend/src/components/ui/Badge.jsx`
  - `frontend/src/components/ui/Badge.test.jsx`
  - `frontend/src/theme/componentUsage.test.js`
  - `frontend/src/theme/baselines/component-usage-baseline.json` (generated)
- Modify:
  - `frontend/src/components/ui/Button.jsx` (add `href`)
  - `frontend/src/components/ui/index.js` (export `Badge`)
- Test: `frontend/src/components/ui/tokens.test.jsx` (extend for Button `href` and Card `as`)

**Interfaces:**
- Produces:
  - `Badge({ tone = 'neutral', surface = 'light', size = 'sm', className = '', children, ...rest })` renders a `<span>`.
    - `tone`: `'neutral' | 'gold' | 'sage'`. `surface`: `'light' | 'night'`. `size`: `'sm' | 'md'`.
    - Base classes: `inline-flex items-center gap-1 rounded-full font-semibold whitespace-nowrap`.
    - Sizes: `sm` is `text-2xs px-2 py-0.5`; `md` is `text-2xs px-2.5 py-1`.
    - Light tones:
      - `neutral`: `bg-parchment text-ink-muted border border-line`
      - `gold`: `bg-primary/10 text-primary-ink border border-primary/30`
      - `sage`: `bg-sage-light text-sage`
    - Night tones:
      - `neutral`: `bg-white/[0.08] text-ink-onnight`
      - `gold`: `bg-primary/10 text-primary-glow border border-primary/20`
      - `sage`: `bg-white/[0.08] text-ink-onnight`
    - `className` is appended last. Callers add `font-mono` or `uppercase tracking-widest` this way.
    - The spec says "Pill/Badge". This plan ships one component named `Badge`; a second name for the same chip would be a duplicate.
  - `Button`'s new `href` prop: it renders `<a href={href} target="_blank" rel="noopener noreferrer">` with the same classes. `to` still renders a router `Link`. Passing both is a caller error; `to` wins.
  - **The ratchet.** `componentUsage.test.js` follows the shape of `tokenUsage.test.js`:
    - It walks non-test `.jsx` under `src`, excluding `components/ui/`.
    - It compares per-file counts against the baseline, with an "over baseline" check and a "stale entry" check.
    - The baseline is written by `UPDATE_COMPONENT_BASELINE=1 npx vitest run src/theme/componentUsage.test.js`.
    - Counters:

```js
const COUNTERS = {
  goldCta: /hover:bg-primary-dark/g,
  lightCard: /bg-parchment-card(?=[^"'`]*border-line)|border-line(?=[^"'`]*bg-parchment-card)/g,
  nightCard: /bg-white\/\[0\.0[3-6]\d?\](?=[^"'`]*border-white\/)/g,
  chip: /rounded-full(?=[^"'`]*px-[\d.]+)(?=[^"'`]*text-(?:2xs|3xs|xs)\b)/g,
  arbitraryText: /text-\[\d+(?:\.\d+)?px\]/g,
  roundedXl: /\brounded-(?:xl|2xl)\b/g,
  shadowSml: /\bshadow-(?:sm|md|lg)\b/g,
}
```

    - Lowering the baseline for a file is how each later task proves its migration.

- [ ] **Step 1: Write the failing tests.**
  - `Badge.test.jsx`:
    - `render(<Badge>New</Badge>)` gives a `span` with the text, `rounded-full`, `text-2xs`, `bg-parchment`.
    - `render(<Badge tone="gold" surface="night">x</Badge>)` has `text-primary-glow`.
    - `render(<Badge className="font-mono">x</Badge>)` has `font-mono`.
    - No class Badge emits contains `text-[` or `#`.
  - `tokens.test.jsx`:
    - `render(<MemoryRouter><Button href="https://x.test">Go</Button></MemoryRouter>)` gives `getByRole('link')` with `href="https://x.test"`, `target="_blank"` and `rel` containing `noopener`.
    - `render(<MemoryRouter><Card as={Link} to="/x">c</Card></MemoryRouter>)` gives a link with `href="/x"`.
    - `render(<Button className="whitespace-normal">x</Button>)` has `whitespace-normal` in its class list.
- [ ] **Step 2: Run** `npx vitest run src/components/ui`. Expected: FAIL (Badge module not found; the href assertions fail).
- [ ] **Step 3: Implement** `Badge.jsx`, Button `href`, and the `index.js` export.
- [ ] **Step 4: Write `componentUsage.test.js`** with the counters above, plus a guard that the walk finds more than 50 files. Generate the baseline with `UPDATE_COMPONENT_BASELINE=1`. Record the totals per counter in the commit message; they should be close to the spec table.
- [ ] **Step 5: Run** `npx vitest run src/components/ui src/theme`. Expected: PASS.
- [ ] **Step 6: Commit:** `5b: Badge, Button href, component-usage ratchet`.

### Tasks 2–5: Migrate one area each

Each area task follows the same steps. Only the file set differs.

- [ ] **Step 1 (the failing test): write the target baseline for the area's files.** In `component-usage-baseline.json`, set `goldCta`, `arbitraryText` and `chip` to 0 for every file in the area, by deleting those keys. Run `npx vitest run src/theme/componentUsage.test.js`. Expected: FAIL, listing the area's files as "found N, baseline 0".
- [ ] **Step 2: Migrate.**
  - Each `hover:bg-primary-dark` CTA becomes `<Button>`.
    - Size: `px-7 py-3` → `size="lg"`; `px-5`/`px-6 py-2.5` → `md`; header and compact CTAs → `sm`.
    - Use `to` for router links and `href` for external links.
    - Keep `w-full` and margins via `className`.
    - Wide or translated labels get `whitespace-normal text-center`.
  - Each card container becomes `<Card>` with the right `surface` and `padding`.
    - Use `padding="none"` plus the old padding in `className` where the old padding isn't sm, md or lg.
    - Use `as` for `Link`, `button` or `article`.
  - Each chip becomes `<Badge>`.
  - Each `text-[Npx]` maps per the Global Constraints table.
  - `rounded-xl`, `rounded-2xl`, `shadow-sm`, `shadow-md` and `shadow-lg` disappear wherever a Card, Button or Badge replaces them. Don't hunt the rest; the ratchet records what's left.
- [ ] **Step 3: Regenerate the baseline** with `UPDATE_COMPONENT_BASELINE=1`. Then check that `git diff` shows the baseline only went down. Any number going up is a bug.
- [ ] **Step 4: Run** the area's own tests, then the full `npx vitest run` and `npx eslint src`. Expected: PASS and 0 errors.
  - Update class-string assertions in the area's existing tests to the new components, and keep their behaviour assertions.
- [ ] **Step 5: Commit:** `5b: <area> uses Button, Card and Badge`.

**Merge note for the controller.** Tasks 2–5 run in parallel worktrees and all edit `component-usage-baseline.json`, under different keys. On a JSON conflict, take either side, then rerun `UPDATE_COMPONENT_BASELINE=1` on the merged tree and check that no number went up.

#### Task 2: Learn and knowledge
- Files:
  - `frontend/src/pages/learn/**` (38 files)
  - `frontend/src/components/knowledge/**`
  - `frontend/src/pages/Learn.jsx`
- About 98 hits. The 8 identical "Generate your Kundli" CTAs (`px-7 py-3 … shadow-md hover:shadow-lg`) become `<Button size="lg" to="/generate">`, and `components/knowledge/CTA.jsx` becomes one too.
- The 9px "yrs" label in `learn/categories/Dashas.jsx:42` becomes `text-2xs`. Check that it still fits its ring at 360.

#### Task 3: Site, account and admin pages
- Files:
  - Pages: `Landing`, `Blog`, `BlogArticle`, `TestimonialsPage`, `ContactUs`, `AboutUs`, `FAQ`, `Pricing`, `TermsOfUse`, `PrivacyPolicy`, `RefundPolicy`, `Disclaimer`, `NotFound`, `Login`, `Onboarding`, `Profile`, `PanchangDetail`, `WeekAhead`, `AdminDashboard`, `AstrologerDashboard`
  - `components/auth/**`, `components/onboarding/**`
  - Components: `Footer`, `SiteHeader`, `SocialButtons`, `Testimonials`, `ErrorFallback`, `ScrollToTop`, `SegmentedToggle`, `PlaceCombobox`
- About 80 hits. PanchangDetail alone has 21 (stat cards and the Week/Month table text sizes).
- `PhoneOtpForm`'s `buttonCls` becomes `<Button className="w-full">`. Its disabled test must still pass: the button is disabled and has the disabled styling class from `Button`.
- `ScrollToTop` is a 44px icon button: keep it hand-built, and add it to an explicit allow-list comment in `componentUsage.test.js`. It stays in the baseline at 1.

#### Task 4: /home
- Files: `frontend/src/components/home/**` and `frontend/src/pages/PersonalHome.jsx`.
- About 42 hits, all on night surfaces: `Card surface="night"`, `Badge surface="night"`.
- HomeMasthead's dasha and location chips become `<Badge surface="night" size="md" className="font-mono">`, with `tone="gold"` for the dasha chips.
- The `/home` reading text (13.5px) becomes `text-sm`.
- `JyotiAvatar` and the masthead sky are out of scope (hex baseline, the 5a/UX2 leftovers).

#### Task 5: Kundli, reports and Insights
- Files:
  - Components: `CareerReportTab`, `TopicReportTab`, `RajyogasTab`, `KundliDownload`, `AshtakavargaTable`, `AskPersonaCard`, `AskChart`, `BhavaChalit`, `DivisionalCharts`, `TransitPanel`, `KPChart`, `ChartReading`, `ReadingTeaser`, `PaywallCard`, `SectionJumpNav`, `SarvatobhadraChakra`
  - Pages: `Result`, `Insights`
- About 85 hits. CareerReportTab (21) and TopicReportTab (10) share recipes, so migrate them together.
- The rank circles (`w-8 h-8 rounded-full bg-primary…`), progress fills and pulse skeletons are not CTAs; leave them.
- `SectionJumpNav`'s gold pill is a toggle, not a CTA. Use `Button` only if its behaviour is a plain button; otherwise leave it and note why.

### Task 6: Hard guards, browser pass, review and docs

**Files:**
- Modify:
  - `frontend/src/theme/componentUsage.test.js`
  - `docs/superpowers/plans/2026-11-04-frontend-ux-roadmap.md`
  - the memory file `star-jyotish-frontend-ux-roadmap.md`

- [ ] **Step 1: Write the failing guard.** Add `it('goldCta and arbitraryText are zero outside ui/', …)`. It sums those two counters across all files and expects 0. The only exception is `ScrollToTop.jsx` (goldCta 1), which is named in the test. If anything was missed, it fails here.
- [ ] **Step 2: Fix** what Step 1 finds, then run the full suite and `npx eslint src`.
- [ ] **Step 3: Browser pass.**
  - Setup: Playwright, the dev-OTP login and seeded `sj_last_chart`.
  - Sizes: 1440, 1280, 390 and 360, in en and hi.
  - Pages: `/`, `/learn` plus one category and one path page, `/blog`, `/blog/<any slug>`, `/pricing`, `/contact`, `/login`, `/home`, `/panchang`, `/week-ahead`, `/account`, `/kundli` (every tab), and `/insights` (Reading, Ask, Reports).
  - Pass when:
    - there is no horizontal scroll (hi at 360 is the key check for Review Focus #1);
    - the contrast walker finds 0 AA failures;
    - there are no React warnings;
    - every CTA is at least 44px tall.
  - Take before/after screenshots against `main` for the owner, one dev server at a time with `--force` (two servers sharing node_modules corrupt Vite's dependency cache).
- [ ] **Step 4: Whole-branch review** on opus, then one fix wave.
- [ ] **Step 5: Docs.**
  - Roadmap: write a 5b status block and the remaining ratchet totals (`rounded-xl/2xl`, `shadow-*`, `lightCard`) under "Left from 5b". Mark the tracking row "Done".
  - Update the memory and run `graphify update .`.
  - Commit: `docs: roadmap records phase 5b`.

## Execution order (faster mode, as in UX2 and UX3)

1. **Wave 1:** Task 1 alone, since every later task consumes `Badge`, `href` and the ratchet.
2. **Wave 2:** Tasks 2, 3, 4 and 5 in parallel worktrees. Their file sets don't overlap; they share only the baseline JSON (see the merge note).
3. **Wave 3:** Task 6.
4. **Reviews:**
   - one light review per task (these are refactors guarded by the ratchet and the existing tests);
   - a full review for Task 3, because it touches the auth forms;
   - the final whole-branch review on opus.
