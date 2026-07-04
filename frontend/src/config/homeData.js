// frontend/src/config/homeData.js
//
// Data layer for the authenticated /home page (see docs/PRODUCT_HOME.md).
// This sprint is architecture-only — no AI, no backend calls — so every
// getter below returns realistic, hand-written placeholder data instead of
// fetching anything. What matters is the *shape*: each getter's return
// value mirrors a real backend model that already exists (or is planned),
// documented in the comment above it, so wiring this page up later means
// swapping the function body for a real fetch — none of the components in
// components/home/ should need to change at all.
//
// Nothing here should be read as real personalization. It's a stand-in for
// data that will eventually come from the signed-in user's own account.

import { getGuide, getNextGuide } from './knowledgeGraph'

// ── Cosmic Snapshot ─────────────────────────────────────────────────────────
// Mirrors backend/models/chart_data.py's DashaData shape
// (current_mahadasha / current_antardasha, each a {planet, start, end}
// entry) plus one Moon-sign lookup off ChartResponse.planets. Once account
// charts are connected, this becomes a thin adapter over
// GET /api/account/birth-profiles/{phone} → the primary profile's stored
// ChartResponse, not a new endpoint of its own.
const PLACEHOLDER_SNAPSHOT = {
  currentMahadasha: { planet: 'Jupiter', start: '2021-03-14', end: '2037-03-14' },
  currentAntardasha: { planet: 'Saturn', start: '2025-11-02', end: '2028-06-19' },
  moonSign: 'Taurus',
}

// Percent elapsed through a {start, end} period, both "YYYY-MM-DD" — same
// calculation DashaTable.jsx uses for its progress bars, kept local here
// since it's a few lines and this file has no other reason to import a
// chart-rendering component.
function periodProgress(start, end) {
  const now = Date.now()
  const s = new Date(start).getTime()
  const e = new Date(end).getTime()
  if (now <= s) return 0
  if (now >= e) return 100
  return Math.round(((now - s) / (e - s)) * 100)
}

export function getCosmicSnapshot() {
  const { currentMahadasha, currentAntardasha, moonSign } = PLACEHOLDER_SNAPSHOT
  return {
    currentMahadasha,
    currentAntardasha,
    moonSign,
    mahadashaProgressPct: periodProgress(currentMahadasha.start, currentMahadasha.end),
  }
}

// ── Birth Chart preview ──────────────────────────────────────────────────
// Mirrors backend/models/chart_data.py's ChartResponse.{ascendant, planets}
// closely enough to feed straight into <KundliChart> as-is. Once account
// charts are connected, the primary BirthProfile's saved ChartResponse
// replaces this wholesale.
export function getChartPreview() {
  return {
    ascendant: { sign: 'Leo', sign_index: 4, degree: 12.4, nakshatra: 'Purva Phalguni' },
    planets: [
      { name: 'Sun', house: 1, degree: 18.2 },
      { name: 'Moon', house: 10, degree: 4.7 },
      { name: 'Mars', house: 6, degree: 27.1 },
      { name: 'Mercury', house: 12, degree: 9.3 },
      { name: 'Jupiter', house: 5, degree: 15.8 },
      { name: 'Venus', house: 11, degree: 2.6 },
      { name: 'Saturn', house: 7, degree: 22.9 },
      { name: 'Rahu', house: 3, degree: 11.0 },
      { name: 'Ketu', house: 9, degree: 11.0 },
    ],
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
