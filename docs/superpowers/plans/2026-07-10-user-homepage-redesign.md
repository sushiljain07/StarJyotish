# User Homepage Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the authenticated `/home` page into a premium astrology dashboard that closely follows the supplied mockups while preserving existing data flows, routes, header, and footer.

**Architecture:** Keep `PersonalHome.jsx` as the orchestration layer, but reshape the layout into a hero-plus-dashboard composition and extract any repeated presentation shells into focused home components. Reuse existing hooks and business logic so the work stays visual and structural rather than altering astrology calculations or route behavior.

**Tech Stack:** React 18, React Router, react-i18next, Tailwind CSS, existing app hooks/components

---

## File Map

- **Modify:** `frontend/src/pages/PersonalHome.jsx` — main responsive layout, section order, hero/dashboard composition
- **Modify:** `frontend/src/components/home/DailyPatrikaHero.jsx` — align hero styling and content hierarchy more closely to mockups
- **Modify:** `frontend/src/components/home/QuickPanchangStrip.jsx` — adapt visual treatment to match the redesigned dashboard
- **Modify:** `frontend/src/components/home/DoAvoidCards.jsx` — elevate guidance cards and improve mobile density
- **Modify:** `frontend/src/components/home/LifeAreaGrid.jsx` — tighten card styling and grid responsiveness
- **Modify:** `frontend/src/components/home/ReportsStrip.jsx` — make reports feel more premium and consistent with the new system
- **Modify:** `frontend/src/index.css` — shared utility or visual polish only if component-local classes are not enough
- **Modify:** `frontend/src/i18n/en.json` — new home-page strings if needed
- **Modify:** `frontend/src/i18n/hi.json` — Hindi equivalents for any new strings
- **Validate:** `frontend/package.json` scripts `lint` and `build`

### Task 1: Recompose the page shell

**Files:**
- Modify: `frontend/src/pages/PersonalHome.jsx`

- [ ] Audit the existing `/home` render order and identify which current blocks stay, move, merge, or become secondary.
- [ ] Rebuild the top of the page into a mock-inspired structure: premium identity hero, utility cards, then dashboard rows.
- [ ] Preserve current interactive behavior for profile switching, chart open, report open, and bottom navigation.
- [ ] Ensure the desktop layout uses multi-column groupings and mobile uses a clean vertical stack without duplicated purpose blocks.

### Task 2: Upgrade the hero and premium cards

**Files:**
- Modify: `frontend/src/components/home/DailyPatrikaHero.jsx`
- Modify: `frontend/src/components/home/QuickPanchangStrip.jsx`
- Modify: `frontend/src/components/home/DoAvoidCards.jsx`

- [ ] Refine the hero to feel closer to the reference images: stronger greeting block, clearer hierarchy, premium surface treatment, and improved small-screen wrapping.
- [ ] Restyle quick panchang and daily guidance cards so they visually belong to the same premium dashboard system.
- [ ] Remove unnecessary visual repetition between nearby guidance modules while keeping the same data value.

### Task 3: Tighten insight and report modules

**Files:**
- Modify: `frontend/src/components/home/LifeAreaGrid.jsx`
- Modify: `frontend/src/components/home/ReportsStrip.jsx`
- Modify: `frontend/src/pages/PersonalHome.jsx`

- [ ] Refine life-area and report sections to better match the mockups' premium card density and CTA treatment.
- [ ] Improve section grouping, spacing, and ordering so the page answers “what matters now” before deeper exploration.
- [ ] Keep report and insight destinations unchanged.

### Task 4: Finish bilingual and responsive polish

**Files:**
- Modify: `frontend/src/i18n/en.json`
- Modify: `frontend/src/i18n/hi.json`
- Modify: `frontend/src/index.css`
- Modify: `frontend/src/pages/PersonalHome.jsx`

- [ ] Add only the new strings required by the redesign.
- [ ] Make sure layouts accommodate longer Hindi text and compact mobile viewports.
- [ ] Add only minimal shared CSS needed for reusable polish that cannot stay inside components.

### Task 5: Validate the redesign

**Files:**
- Validate: `frontend/src/pages/PersonalHome.jsx`
- Validate: `frontend/src/components/home/*.jsx`

- [ ] Run `npm run lint` in `frontend/`.
- [ ] Run `npm run build` in `frontend/`.
- [ ] Manually verify the `/home` page in English and Hindi at mobile and desktop widths.
