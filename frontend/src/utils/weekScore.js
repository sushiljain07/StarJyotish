// frontend/src/utils/weekScore.js
//
// Shared "this week" score heuristic for WeekStrip.jsx (the Home page
// constellation preview) and WeekAhead.jsx (its "Full week" destination) —
// both must agree on the same day's number, or the destination page reads
// as disconnected from what it was opened from.
//
// Real per-day scoring (like dailyInsights.computeDayScore) needs transit
// planet positions for each future date, which the backend only computes
// for "now" (see services/transit_calc.py) — a per-day version is a bigger
// backend feature, not a UI concern. So this stays a stable, deterministic
// pseudo-score hashed from the date string: a display heuristic, not a
// computed astrological reading, same spirit as WeekStrip's original
// comment described.
const BANDS = [
  { min: 80, key: 'dial_label_excellent' },
  { min: 65, key: 'dial_label_steady' },
  { min: 50, key: 'dial_label_mixed' },
  { min: 35, key: 'dial_label_cautious' },
  { min: 0,  key: 'dial_label_challenging' },
]

export function weekDayScore(day, index) {
  const seed = (day?.date ?? '').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) + index * 11
  return 45 + (seed % 48) // [45,93) — stable per date+index
}

export function weekDayScoreLabel(score, t) {
  const band = BANDS.find(b => score >= b.min) ?? BANDS[BANDS.length - 1]
  return t ? t(band.key) : band.key
}
