// frontend/src/utils/muhurtaWindow.js
//
// Shared "best window" computation — originally TodayWindow.jsx's
// computeWindow(), extracted so WeekAhead.jsx (each day of the week ahead)
// can reuse the exact same Abhijit-minus-Rahu-Kaal overlap logic that
// already powers Home's "Your window today" card, instead of re-deriving
// it or falling back to raw fact dumps. Real panchang data only, same
// principle as PanchangDetail.jsx — no invented per-day guidance text.
//
// `date` is the calendar day this window is FOR (defaults to now, matching
// TodayWindow.jsx's original behavior) — it's needed to pick the correct
// classical Rahu Kaal octant for that day's weekday specifically, not
// whatever weekday "now" happens to be when a future day is passed in.

// "6:08 AM" -> minutes since midnight. Panchang always returns 12-hour
// strings with an AM/PM suffix (see services/panchang.py's _fmt).
export function parseAmPm(timeStr) {
  if (!timeStr) return null
  const m = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(timeStr.trim())
  if (!m) return null
  let [, h, min, ap] = m
  h = parseInt(h, 10) % 12
  if (/PM/i.test(ap)) h += 12
  return h * 60 + parseInt(min, 10)
}

export function minutesToLabel(mins) {
  const m = ((Math.round(mins) % 1440) + 1440) % 1440
  let h = Math.floor(m / 60)
  const mm = m % 60
  const ap = h >= 12 ? 'PM' : 'AM'
  h = h % 12
  if (h === 0) h = 12
  return `${h}:${String(mm).padStart(2, '0')} ${ap}`
}

const FALLBACK_SUNRISE = 6 * 60   // 6:00 am
const FALLBACK_SUNSET  = 18 * 60  // 6:00 pm

// Classical 1/8th-of-daytime Rahu Kaal octant, by weekday (JS getDay(): 0=Sun).
const RAHU_OCTANT_BY_WEEKDAY = { 0: 8, 1: 2, 2: 7, 3: 5, 4: 6, 5: 4, 6: 3 }

export function computeWindow(panchang, date = new Date()) {
  const sunrise = parseAmPm(panchang?.sunrise) ?? FALLBACK_SUNRISE
  const sunset  = parseAmPm(panchang?.sunset)  ?? FALLBACK_SUNSET
  const daylight = Math.max(1, sunset - sunrise)

  // Trust a backend window only if it's coherent (inside daylight, start
  // before end) — the muhurta block can arrive timezone-shifted, and a
  // "1:22 AM" Rahu kaal would paint the whole bar. Fall back to the
  // classical formulas otherwise.
  const sane = (start, end) =>
    start != null && end != null && start < end && start >= sunrise && end <= sunset

  let abhijitStart = parseAmPm(panchang?.muhurtas?.abhijit_muhurta?.start)
  let abhijitEnd   = parseAmPm(panchang?.muhurtas?.abhijit_muhurta?.end)
  if (!sane(abhijitStart, abhijitEnd)) {
    const midday = sunrise + daylight / 2
    abhijitStart = midday - 24
    abhijitEnd = midday + 24
  }

  let rahuStart = parseAmPm(panchang?.muhurtas?.rahu_kaal?.start)
  let rahuEnd   = parseAmPm(panchang?.muhurtas?.rahu_kaal?.end)
  if (!sane(rahuStart, rahuEnd)) {
    const octant = RAHU_OCTANT_BY_WEEKDAY[date.getDay()]
    const segment = daylight / 8
    rahuStart = sunrise + (octant - 1) * segment
    rahuEnd = rahuStart + segment
  }

  // Compute the "best window" = Abhijit minus any overlap with Rahu Kaal
  // Overlap: max(abhijitStart, rahuStart) → min(abhijitEnd, rahuEnd)
  const overlapStart = Math.max(abhijitStart, rahuStart)
  const overlapEnd   = Math.min(abhijitEnd, rahuEnd)
  const hasOverlap   = overlapStart < overlapEnd

  // Best window: the largest clear sub-window of Abhijit outside Rahu Kaal
  let bestStart = abhijitStart
  let bestEnd   = abhijitEnd
  let bestNote  = null
  if (hasOverlap) {
    // Pick whichever side of the overlap is longer
    const beforeDur = overlapStart - abhijitStart
    const afterDur  = abhijitEnd - overlapEnd
    if (afterDur >= beforeDur && afterDur > 0) {
      bestStart = overlapEnd
      bestEnd   = abhijitEnd
    } else if (beforeDur > 0) {
      bestStart = abhijitStart
      bestEnd   = overlapStart
    } else {
      // Rahu Kaal fully covers Abhijit — no clear window
      bestStart = null
      bestEnd   = null
    }
    bestNote = 'Rahu Kaal overlaps — avoid that portion'
  }

  return { abhijitStart, abhijitEnd, rahuStart, rahuEnd, sunrise, sunset, bestStart, bestEnd, bestNote }
}
