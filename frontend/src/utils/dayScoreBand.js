// One score band drives both the day-ring's tone and its label, so a
// "cautious" day can never be drawn in the steady (green) tone. The label
// thresholds mirror computeDayScore in utils/dailyInsights.js.
const BANDS = [
  { min: 8,   labelKey: 'dial_label_excellent',   tone: 'opportunity' },
  { min: 6.5, labelKey: 'dial_label_steady',      tone: 'steady' },
  { min: 5,   labelKey: 'dial_label_mixed',       tone: 'steady' },
  { min: 3.5, labelKey: 'dial_label_cautious',    tone: 'caution' },
  { min: -Infinity, labelKey: 'dial_label_challenging', tone: 'caution' },
]

export function dayScoreBand(score) {
  if (score == null) return { labelKey: null, tone: 'steady' }
  const { labelKey, tone } = BANDS.find(b => score >= b.min)
  return { labelKey, tone }
}
