// frontend/src/utils/format.js
//
// Single source of truth for displaying dates/times produced by the backend.
// The backend always sends dates as "YYYY-MM-DD" and times as "HH:MM" (24h) —
// keep using those raw strings for any date math (new Date(), comparisons,
// sorting). Only wrap the JSX *display* output with these.
import { currentLanguage, localeFor } from '../i18n/languages'

// With no options: "YYYY-MM-DD" -> "DD-MM-YYYY" (numeric, language-neutral).
// With Intl options: localized in the current UI language. Accepts a Date or
// a "YYYY-MM-DD" string (read as a local date).
export function formatDate(date, opts) {
  if (opts) {
    let d = date
    if (typeof date === 'string') {
      const [y, m, day] = date.split('-').map(Number)
      if (!y || !m || !day) return date
      d = new Date(y, m - 1, day)
    }
    if (!(d instanceof Date) || Number.isNaN(d.getTime())) return date
    return d.toLocaleDateString(localeFor(currentLanguage()), opts)
  }
  if (!date || typeof date !== 'string') return date
  const [y, m, d] = date.split('-')
  if (!y || !m || !d) return date
  return `${d}-${m}-${y}`
}

export function formatNumber(n, opts) {
  return new Intl.NumberFormat(localeFor(currentLanguage()), opts).format(n)
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
