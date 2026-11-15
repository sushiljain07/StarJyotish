// frontend/src/services/currentLocation.js
//
// Where the person actually is TODAY — separate from their birth place
// (services/astrologyProfiles.js), which never changes and isn't a
// reasonable source for Rahu Kaal/sunrise-sunset if they've since moved
// or are travelling. This is deliberately per-device localStorage only
// (same trade-off astrologyProfiles.js makes for cached chart data): a
// person's current city genuinely can differ by device (phone with them,
// laptop at home), so there's no clearly "more correct" single value to
// sync across devices the way a birth profile has.
//
// Storage key follows the existing sj_*_v1:{userId} convention used
// throughout astrologyProfiles.js.

const STALE_AFTER_MS = 12 * 60 * 60 * 1000 // 12 hours

function storageKey(userId) {
  return `sj_current_location_v1:${userId ?? 'anon'}`
}

// shape: { lat, lon, label, timezone, source: 'geolocation'|'manual', savedAt }
export function getCurrentLocation(userId) {
  try {
    const raw = localStorage.getItem(storageKey(userId))
    if (raw) return JSON.parse(raw)
    if (userId == null) return null
    // A city chosen while signed out MOVES to the user key on the first read
    // after sign-in. It is removed from :anon because a manual city never
    // expires, so a different account on a shared device would otherwise
    // inherit it. Never the birth city (see hooks/useCurrentLocation.js).
    const anonRaw = localStorage.getItem(storageKey(null))
    if (!anonRaw) return null
    localStorage.setItem(storageKey(userId), anonRaw)
    localStorage.removeItem(storageKey(null))
    return JSON.parse(anonRaw)
  } catch {
    return null
  }
}

export function setCurrentLocation(userId, { lat, lon, label, timezone, source }) {
  const value = { lat, lon, label, timezone, source, savedAt: Date.now() }
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify(value))
  } catch {
    // Storage can fail (private browsing, quota) — the page still works,
    // it just re-prompts for location next load instead of persisting.
  }
  return value
}

export function isLocationStale(location) {
  if (location?.source === 'manual') return false // a chosen city never expires
  if (!location?.savedAt) return true
  return Date.now() - location.savedAt > STALE_AFTER_MS
}

// Wraps the browser geolocation API in a promise. Callers should have a
// manual-entry fallback ready for the reject case — permission denial is
// common and not an error state worth showing as one.
export function requestBrowserLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('geolocation_unsupported'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      pos => resolve({
        lat: pos.coords.latitude,
        lon: pos.coords.longitude,
        // Derive timezone from the browser — always correct, no round-trip needed.
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      }),
      err => reject(err),
      { timeout: 10000, maximumAge: STALE_AFTER_MS }
    )
  })
}
