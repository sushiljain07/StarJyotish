# The Personal Home (`/home`)

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
  `<ProtectedRoute>` (redirects to `/login` if signed out, same pattern
  as `/account`).
- `Login.jsx`'s post-login fallback (`next`) now defaults to `/home`
  instead of `/` — signing in lands you in your workspace, not back on
  the marketing page. A `next` state (set by `ProtectedRoute` when a
  signed-out visitor hits a protected page directly) still takes
  priority, so that flow is untouched.
- `SiteHeader.jsx`'s logo now goes to `/home` for signed-in visitors and
  `/` for everyone else.
- `AccountMenu.jsx` gained a "My Home" link above "My Profile".
- `/generate` (the existing birth-form page, `pages/Home.jsx`) is
  unchanged — it's still where both a first-time visitor and this new
  page's "Generate New Chart" / "Ask AI" CTAs go.

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

| Section | Placeholder getter | Future backend source |
|---|---|---|
| Cosmic Snapshot | `getCosmicSnapshot()` | `ChartResponse.dasha` (`DashaData` in `backend/models/chart_data.py`) via the account's primary saved chart |
| Birth Chart preview | `getChartPreview()` | `ChartResponse.{ascendant, planets}`, same model |
| Continue Your Journey | `getJourney()` | Real data already — `config/knowledgeGraph.js`. Only *which* guide counts as "recently viewed" is mocked (no reading-history tracking exists yet) |
| Recent Activity | `getRecentActivity()` | `GET /api/account/reports/{phone_number}` → `ReportSummaryOut` (`backend/models/account_models.py`, `backend/routers/account.py` — this endpoint already exists), widened to also cover non-report events (Ask questions, chart generation) once those have a backend model |
| Suggested Questions | `SUGGESTED_QUESTIONS` (static) | Static by design — these are prompts, not personalized data |
| Reflection | `getReflectionKey()` | Static by design — deliberately not predictive/personalized |

`getCosmicSnapshot()` and `getChartPreview()` both read from a single
hand-written placeholder object today; in both cases the real source will
be the same account-scoped chart, most likely surfaced through a new
"primary chart" read that composes the existing
`GET /api/account/birth-profiles/{phone_number}` (which profile is
primary) with a stored `ChartResponse` for it. That's one future backend
addition (a persisted `ChartResponse` per `BirthProfile`, or a re-run of
the existing chart computation on read) — everything on the frontend
already expects that exact shape.

## Future AI integration points

- **Suggested Questions** and **"Ask AI about My Chart"** already route
  into the real Ask flow (`/generate` → `Result.jsx` → `AskChart.jsx`,
  via the existing `{ landToAsk, presetQuestion }` state handoff
  `AskPersonaCard.jsx` uses on the landing page). No new AI wiring is
  needed here — once a saved chart exists, these buttons can point
  straight at `/kundli` with that chart's data instead of `/generate`.
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
- **Chart preview honesty.** `ChartPreviewCard` reuses the real
  `KundliChart` renderer with placeholder planet positions, but carries a
  small caption ("Showing a sample layout until your saved chart is
  connected here") rather than silently presenting mock data as if it
  were the visitor's own chart — the same honesty pattern
  `Profile.jsx`'s membership card already uses for not implying a paid
  tier exists before billing is built. That caption is the one line that
  goes away once account charts are wired up.
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
