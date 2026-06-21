// frontend/src/utils/format.js
//
// Single source of truth for displaying dates/times produced by the backend.
// The backend always sends dates as "YYYY-MM-DD" and times as "HH:MM" (24h) —
// keep using those raw strings for any date math (new Date(), comparisons,
// sorting). Only wrap the JSX *display* output with these.

// "YYYY-MM-DD" -> "DD-MM-YYYY"
export function formatDate(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return dateStr
  const [y, m, d] = dateStr.split('-')
  if (!y || !m || !d) return dateStr
  return `${d}-${m}-${y}`
}

// "HH:MM" (24h) -> "H:MM AM/PM"
export function formatTime(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') return timeStr
  const [hStr, min] = timeStr.split(':')
  let h = parseInt(hStr, 10)
  if (Number.isNaN(h)) return timeStr
  const ampm = h >= 12 ? 'PM' : 'AM'
  if (h === 0) h = 12
  else if (h > 12) h -= 12
  return `${h}:${min} ${ampm}`
}
