# The Personal Home (`/home`)

> **Updated by the Onboarding sprint (see `docs/USER_JOURNEY.md`).** This
> page no longer shows placeholder Cosmic Snapshot / Birth Chart data —
> `Onboarding.jsx` now generates a real chart via `/api/kundli`, and
> `PersonalHome.jsx` reads it back through
> `services/astrologyProfiles.js`. Accounts with no Astrology Profile see
> `EmptyHomeState` instead. The sections below are left as written for
> this page's original sprint, with corrections noted inline where things
> changed.

## Purpose

`/home` is Star Jyotish's authenticated landing page — the personal
workspace a signed-in visitor sees every time they return, instead of the
public marketing Landing page. It replaces "generate a chart, read a
report, leave" with a standing place: today's chart context, a way back
into a saved chart, guided learning, a log of what the account has done,
and a couple of low-friction ways to keep going.

It is explicitly **not**:
- A Kundli generator (that's still `/generate`, unchanged).
- A dashboard of widgets/metrics.
- A source of predictions or daily horoscopes — every section describes
  the chart (Mahadasha, Antardasha, Moon sign) rather than forecasting a
  day.

The design reference points were Notion, Apple Health, Headspace, and
GitHub's authenticated home — calm, typography-first, generous
whitespace, one thing at a time down the page rather than a grid of
cards competing for attention.

## What this sprint did and didn't do

This was an **architecture, layout, and component** sprint:

- No AI calls were added.
- No new backend endpoints were added.
- Every section renders realistic placeholder data instead.
- Components take plain props (data + callbacks) so a future data layer
  swap never touches the components themselves — only `PersonalHome.jsx`
  and `config/homeData.js` change.

## Routing

- New route: `/home`, registered in `App.jsx`, wrapped in
  `<ProtectedRoute><OnboardingGate>` — `OnboardingGate.jsx` (added by the
  Onboarding sprint, see `docs/USER_JOURNEY.md`) redirects accounts with
  no Astrology Profile and no explicit skip into `/onboarding` first.
- `Login.jsx`'s post-login destination now defaults to `/home` for
  returning accounts and `/onboarding` for brand-new ones (see
  `docs/USER_JOURNEY.md`) instead of the public Landing page. A `next`
  state (set by `ProtectedRoute` when a signed-out visitor hits a
  protected page directly) still takes priority, so that flow is
  untouched.
- `SiteHeader.jsx`'s logo now goes to `/home` for signed-in visitors and
  `/` for everyone else.
- `AccountMenu.jsx` gained a "My Home" link above "My Profile".
- `/generate` (the existing birth-form page, `pages/Home.jsx`) is
  unchanged — it's still where a first-time (signed-out) visitor and
  this page's "Generate New Chart" CTA go. "View Full Chart" / "Ask AI
  about My Chart" now go straight to `/kundli` with the account's real
  saved chart instead (see below).

## Component hierarchy

```
pages/PersonalHome.jsx
├── components/SiteHeader.jsx            (existing, reused as-is)
├── components/home/WelcomeHero.jsx
├── components/Reveal.jsx                (existing, wraps each section below)
│   ├── components/home/CosmicSnapshot.jsx
│   ├── components/home/ChartPreviewCard.jsx
│   │   └── components/KundliChart.jsx   (existing chart renderer, reused)
│   ├── components/home/ContinueJourney.jsx
│   ├── components/home/RecentActivity.jsx
│   ├── components/home/SuggestedQuestions.jsx
│   └── components/home/ReflectionPrompt.jsx
└── components/home/ComingSoonStrip.jsx  (deliberately outside Reveal — see below)
```

Supporting files:
- `components/home/HomeIcons.jsx` — small hand-drawn icon set for this
  page (activity types, section glyphs), same single-stroke/`currentColor`
  convention as the existing `TopicIcon.jsx` / `TabIcon.jsx`. No icon
  library was added.
- `config/homeData.js` — the data layer described below.

`ComingSoonStrip` isn't wrapped in `Reveal` because it's meant to read as
quietly always-present, not as a moment worth a scroll animation — see
the file's own comment.

## Data sources (today vs. future)

Everything currently comes from `config/homeData.js`. Each getter's
comment names the real backend model it already mirrors, so the swap
later is mechanical:

| Section | Getter | Source |
|---|---|---|
| Cosmic Snapshot | `getCosmicSnapshotFromChart(chart)` | **Real as of the Onboarding sprint** — derived from the account's own `ChartResponse.dasha`, saved on their Astrology Profile |
| Birth Chart preview | `profile.chart` (from `services/astrologyProfiles.js`) | **Real as of the Onboarding sprint** — the same `ChartResponse.{ascendant, planets}` |
| Continue Your Journey | `getJourney()` | Real data already — `config/knowledgeGraph.js`. Only *which* guide counts as "recently viewed" is mocked (no reading-history tracking exists yet) |
| Recent Activity | `getRecentActivity()` | `GET /api/account/reports/{phone_number}` → `ReportSummaryOut` (`backend/models/account_models.py`, `backend/routers/account.py` — this endpoint already exists), widened to also cover non-report events (Ask questions, chart generation) once those have a backend model |
| Suggested Questions | `SUGGESTED_QUESTIONS` (static) | Static by design — these are prompts, not personalized data |
| Reflection | `getReflectionKey()` | Static by design — deliberately not predictive/personalized |

Cosmic Snapshot and the Birth Chart preview were placeholder in this
page's original sprint; see `docs/USER_JOURNEY.md` for how
`Onboarding.jsx` and `services/astrologyProfiles.js` made them real
without either component changing shape.

## Future AI integration points

- **Suggested Questions** and **"Ask AI about My Chart"** route into the
  real Ask flow. *(Updated by the Onboarding sprint.)* For an account
  with a saved Astrology Profile, that's now a direct `/kundli` deep-link
  with the real chart (see above) rather than a trip through `/generate`;
  an account without one (the `EmptyHomeState` case) still falls back to
  `/generate` with the existing `{ landToAsk, presetQuestion }` handoff
  `AskPersonaCard.jsx` uses on the landing page.
- **Cosmic Snapshot's** one-paragraph theme is static placeholder copy
  today (`home_snapshot_theme` in `i18n/{en,hi}.json`). Once a real
  Reading/summary endpoint exists for "what does my current
  Mahadasha/Antardasha combination mean," that paragraph is the one
  string that becomes a live AI-generated summary — no layout change
  needed.
- **Reflection** is intentionally kept non-AI and non-personalized (see
  "What this sprint did and didn't do"); it's a static, calm prompt by
  design, not a placeholder for a future personalized one.

## Design decisions worth knowing

- **No dark hero band.** Every public page (Landing, the old
  `/generate` Home, Login) opens with a dark `night`-colored hero. This
  page deliberately doesn't — it's a returning user's workspace, not a
  first impression, so `WelcomeHero` keeps the light `parchment`
  background and only echoes the brand's constellation motif
  (`CelestialBackdrop`) as a very faint watermark behind the greeting.
- **Chart preview honesty.** *(Updated by the Onboarding sprint.)*
  `ChartPreviewCard` now renders the account's real, saved chart — there
  is no more placeholder data or "sample layout" caption. The one caveat
  it still shows is honest rather than decorative: if the birth time was
  approximate or unknown (see `docs/USER_JOURNEY.md`'s Step 5), it says
  so, since the Ascendant and houses are genuinely less certain in that
  case.
- **"View Full Chart" / "Ask AI about My Chart".** *(Updated by the
  Onboarding sprint.)* These now deep-link straight into `/kundli`
  (`Result.jsx`) with the account's real saved `ChartResponse` — the
  "once a saved chart exists" future this doc originally described is
  the current behavior now. "Generate New Chart" still goes to
  `/generate` (a fresh, unsaved chart), since there's no "Add Profile"
  UI yet to save a second one — see `docs/USER_JOURNEY.md`.
- **Mahadasha progress ring.** The one custom visual on this page is a
  circular progress ring in `CosmicSnapshot` showing how far through the
  current Mahadasha the chart is — real information (the same
  elapsed/total math `DashaTable.jsx`'s progress bars already use), not
  decoration.
- **Continue Your Journey reuses real data.** The three cards pull
  directly from `config/knowledgeGraph.js`'s `getGuide()` /
  `getNextGuide()` — the guides, titles, hrefs, and "coming soon" states
  shown are the real Knowledge Center graph, not a parallel content
  model.
