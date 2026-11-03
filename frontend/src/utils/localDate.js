// frontend/src/utils/localDate.js
//
// "Today" for anything the user sees or that's keyed per day (streaks,
// daily caches, quotas, the week strip) must be the user's LOCAL calendar
// date. `new Date().toISOString().slice(0, 10)` is the UTC date — for
// Indian users that's still yesterday until 05:30 IST — and mixing it with
// local setDate() arithmetic could double-count or skip a streak day.

/** YYYY-MM-DD of `date` in the browser's local timezone. */
export function localDateStr(date = new Date()) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** YYYY-MM-DD for `days` days from `date` (negative for the past), local time. */
export function localDateStrOffset(days, date = new Date()) {
  const shifted = new Date(date)
  shifted.setDate(shifted.getDate() + days)
  return localDateStr(shifted)
}
