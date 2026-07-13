import { API_BASE } from './config'

async function postJson(path, body) {
  const resp = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}))
    throw new Error(err.detail ?? 'Server error')
  }
  return resp.json()
}

export function fetchKundli({ date, time, place }) {
  return postJson('/api/kundli', { date, time, place })
}

export function fetchTransit({ date, time, place }) {
  return postJson('/api/kundli/transit', { date, time, place })
}

// Forward-looking transit facts (Sade Sati status, next Saturn/Jupiter/
// Rahu sign change) for the home page's "Coming up" section — see
// services/outlook.py for why this needs its own endpoint rather than
// reusing /kundli/transit, which only reports the current snapshot.
export function fetchOutlook({ date, time, place }) {
  return postJson('/api/kundli/outlook', { date, time, place })
}

export function fetchAshtakavarga({ date, time, place }) {
  return postJson('/api/kundli/ashtakavarga', { date, time, place })
}

export function fetchBhavaChalit({ date, time, place }) {
  return postJson('/api/kundli/bhava-chalit', { date, time, place })
}

export function fetchKPChart({ date, time, place }) {
  return postJson('/api/kundli/kp', { date, time, place })
}

export function fetchDivisional({ date, time, place, division }) {
  return postJson(`/api/kundli/divisional?division=${division}`, { date, time, place })
}

// Place-name autocomplete for the birth form. Goes through our own backend
// (routers/places.py) rather than calling Nominatim directly from the
// browser — Nominatim's usage policy disallows client-side autocomplete
// against its public API and blocks/CORS-rejects that pattern, which is
// why suggestions were silently returning nothing.
export async function fetchPlaceSuggestions(query) {
  const resp = await fetch(`${API_BASE}/api/places/suggest?q=${encodeURIComponent(query)}`)
  if (!resp.ok) return []
  const data = await resp.json()
  return data.suggestions ?? []
}

// Same lookup as fetchPlaceSuggestions, but with lat/lon attached to each
// match — used by the home page's "update current city" picker, which
// needs coordinates to send to /api/panchang, not just a display string.
export async function fetchPlaceMatches(query) {
  const resp = await fetch(`${API_BASE}/api/places/search?q=${encodeURIComponent(query)}`)
  if (!resp.ok) return []
  const data = await resp.json()
  return data.places ?? []
}

// GPS coordinates -> a human-readable label. Used right after the browser
// grants geolocation (Onboarding.jsx's currentLocation step, and Profile.
// jsx's astrology-profile edit form) — a raw lat/lon pair isn't something
// to show in a pill. Returns null (not a throw) on any failure, matching
// the backend's own degrade-gracefully behavior for this endpoint.
export async function fetchReverseGeocode(lat, lon) {
  try {
    const resp = await fetch(`${API_BASE}/api/places/reverse?lat=${lat}&lon=${lon}`)
    if (!resp.ok) return null
    const data = await resp.json()
    return data.label ?? null
  } catch {
    return null
  }
}

// Today's Panchang for a given CURRENT location — deliberately separate
// from fetchTransit above, which is keyed to birth data. lat/lon here
// come from browser geolocation or a manually chosen city, never from an
// Astrology Profile's birth place.
export function fetchPanchang({ lat, lon, timezone }) {
  return postJson('/api/panchang', { lat, lon, timezone })
}

// Today plus the next (days-1) days of Panchang for the same location —
// powers the home page's "This week" strip and the full week view.
// Same location semantics as fetchPanchang: current location, not birth place.
export function fetchPanchangWeek({ lat, lon, timezone, days = 7 }) {
  return postJson('/api/panchang/week', { lat, lon, timezone, days })
}
