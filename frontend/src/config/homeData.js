// frontend/src/config/homeData.js
//
// Data layer for the authenticated /home page (see docs/PRODUCT_HOME.md
// and docs/USER_JOURNEY.md). Two different kinds of data live here now:
//
//   1. Real, derived from the account's actual Astrology Profile
//      (services/astrologyProfiles.js) — Cosmic Snapshot and the Birth
//      Chart preview. Onboarding.jsx generates a real chart via the
//      existing /api/kundli endpoint, so by the time PersonalHome.jsx
//      renders these sections, there's nothing left to fake.
//   2. Still placeholder — Continue Your Journey's "which guide was
//      recently viewed," Recent Activity, and Reflection have no backend
//      support yet at all (no reading-history tracking, no activity log).
//      Each getter below says which is which.

import { getGuide, getNextGuide } from './knowledgeGraph'

// ── Cosmic Snapshot ─────────────────────────────────────────────────────────
// Derives {currentMahadasha, currentAntardasha, moonSign, progress} from a
// real ChartResponse (backend/models/chart_data.py) — the same shape
// services/astrologyProfiles.js stores on every Astrology Profile as
// `profile.chart`. PersonalHome.jsx only calls this once a profile
// exists; there is no placeholder/demo version of this anymore (see
// docs/PRODUCT_HOME.md's superseded "sample chart" note from the
// previous sprint — replaced now that onboarding produces a real one).
function periodProgress(start, end) {
  const now = Date.now()
  const s = new Date(start).getTime()
  const e = new Date(end).getTime()
  if (now <= s) return 0
  if (now >= e) return 100
  return Math.round(((now - s) / (e - s)) * 100)
}

export function getCosmicSnapshotFromChart(chart) {
  const { current_mahadasha, current_antardasha } = chart.dasha
  const moon = chart.planets.find(p => p.name === 'Moon')

  return {
    currentMahadasha: current_mahadasha,
    currentAntardasha: current_antardasha,
    moonSign: moon?.sign ?? null,
    mahadashaProgressPct: periodProgress(current_mahadasha.start, current_mahadasha.end),
  }
}

// ── Continue Your Journey ────────────────────────────────────────────────
// Consumes the real Knowledge Center graph (config/knowledgeGraph.js) —
// only the *choice* of which three guides to surface is a placeholder
// (there's no reading-history tracking yet), the guide data itself is
// real. A future "recently viewed" feature only needs to supply a
// different `lastViewedId` here; getJourney()'s shape doesn't change.
export function getJourney(lastViewedId = 'birth-chart-basics') {
  const recentlyViewed = getGuide(lastViewedId)
  // getNextGuide() returns the display-ready {title, href, comingSoon,
  // description} shape JourneyCard renders directly — see
  // knowledgeGraph.js. "Next learning step" deliberately looks one guide
  // further down the main path than "recommended", so the two cards never
  // show the same guide twice.
  const recommendedId = recentlyViewed?.nextGuides?.[0] ?? null
  const recommended = getNextGuide(lastViewedId)
  const nextStep = recommendedId ? getNextGuide(recommendedId) : null

  return { recentlyViewed, recommended, nextStep }
}

// ── Recent Activity ──────────────────────────────────────────────────────
// Mirrors backend/models/account_models.py's ReportSummaryOut list from
// GET /api/account/reports/{phone_number} (report_type + created_at),
// widened here to also cover non-report events (chart generation, Ask
// questions) that don't have a backend model yet. `type` picks the icon.
const PLACEHOLDER_ACTIVITY = [
  { id: 'a1', type: 'report', label: 'Generated Career Report', timestamp: '2026-07-02T09:15:00Z' },
  { id: 'a2', type: 'ask', label: 'Asked AI about Saturn', timestamp: '2026-06-29T18:40:00Z' },
  { id: 'a3', type: 'guide', label: 'Viewed Aries Guide', timestamp: '2026-06-27T07:05:00Z' },
  { id: 'a4', type: 'chart', label: 'Generated Birth Chart', timestamp: '2026-06-21T12:00:00Z' },
]

export function getRecentActivity() {
  return PLACEHOLDER_ACTIVITY
}

// ── Suggested Questions ──────────────────────────────────────────────────
// Distinct from config/aiQuestions.js (that file backs the *signed-out*
// landing-page demo, complete with canned demo answers). These have no
// demo answer — tapping one carries straight into a real Ask flow via
// /generate, the same handoff AskPersonaCard.jsx uses.
export const SUGGESTED_QUESTIONS = [
  { id: 'strongest-planet' },
  { id: 'saturn-importance' },
  { id: 'current-dasha' },
  { id: 'ascendant-meaning' },
]

// ── Reflection ────────────────────────────────────────────────────────────
// A small rotating set of calm, non-predictive prompts — not a horoscope.
// Picked deterministically by day-of-year so it holds steady across a
// single day's visits but changes tomorrow, without needing any storage.
const REFLECTIONS = [
  'home_reflection_1',
  'home_reflection_2',
  'home_reflection_3',
  'home_reflection_4',
  'home_reflection_5',
]

export function getReflectionKey(date = new Date()) {
  const start = new Date(date.getFullYear(), 0, 0)
  const dayOfYear = Math.floor((date - start) / 86400000)
  return REFLECTIONS[dayOfYear % REFLECTIONS.length]
}

// ── Coming Soon ───────────────────────────────────────────────────────────
export const COMING_SOON_FEATURES = [
  'daily-insights',
  'transit-timeline',
  'remedies',
  'compatibility',
  'life-milestones',
]
