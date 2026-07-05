// frontend/src/services/astrologyProfiles.js
//
// ── The seam between "User Account" and "Astrology Profile" ────────────
//
// See docs/USER_JOURNEY.md for the full picture. Short version: a User
// Account (AuthContext's `user`, backed by the real users table) is a
// login identity. An Astrology Profile is a birth chart someone has
// created — their own, or someone else's ("Mom", "Rahul", "Daughter").
//
// ── Persistence strategy (as of SJ-008) ────────────────────────────────
//
// When authenticated:
//   1. createProfile() POSTs to POST /api/account/birth-profiles/me —
//      stores the profile in PostgreSQL, available on any device.
//   2. The chart (ChartResponse) is still stored in localStorage keyed to
//      the server-assigned profile UUID, because the backend doesn't store
//      chart data (only birth details) — re-computing a chart from stored
//      birth details is cheap, but this avoids an extra API call on every
//      PersonalHome render.
//   3. listProfiles() / getPrimaryProfile() try the API first, falling back
//      to localStorage if the API is unreachable (offline / cold start).
//
// When unauthenticated (or API unavailable):
//   - Pure localStorage, exactly as before. Nothing changes for the
//     anonymous /generate flow.
//
// ── Chart data storage ──────────────────────────────────────────────────
//
// The backend's BirthProfile only stores birth details (date/time/place/
// lat/lon/label). Chart results (planets, houses, dasha, navamsa, etc.)
// are stored in localStorage keyed by profile id, same as before —
// `sj_chart_data_v1:{userId}:{profileId}`. On a new device, if the chart
// cache is cold, we re-fetch from /api/kundli using the stored birth
// details, which is fast (< 1 s) and deterministic.

import { fetchKundli } from '../api/astro'
import { API_BASE } from '../api/config'

export const UNKNOWN_BIRTH_TIME_DEFAULT = '12:00'

// ── localStorage keys ───────────────────────────────────────────────────

const LEGACY_PROFILES_KEY = 'sj_astrology_profiles_v1'   // old: full profile incl. chart
const CHART_CACHE_PREFIX   = 'sj_chart_data_v1'           // new: chart keyed by profileId
const SKIP_STORAGE_KEY     = 'sj_onboarding_skipped_v1'

function accountKey(user)    { return user?.id ?? 'anonymous' }
function chartCacheKey(user, profileId) { return `${CHART_CACHE_PREFIX}:${accountKey(user)}:${profileId}` }

// ── Chart cache (localStorage) ──────────────────────────────────────────

function readChartCache(user, profileId) {
  try {
    const raw = localStorage.getItem(chartCacheKey(user, profileId))
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function writeChartCache(user, profileId, chart) {
  try {
    localStorage.setItem(chartCacheKey(user, profileId), JSON.stringify(chart))
  } catch { /* storage unavailable — fail open */ }
}

// ── Legacy localStorage (unauthenticated / fallback) ────────────────────

function readAllLegacy() {
  try {
    const raw = localStorage.getItem(LEGACY_PROFILES_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch { return {} }
}

function writeAllLegacy(all) {
  try { localStorage.setItem(LEGACY_PROFILES_KEY, JSON.stringify(all)) } catch { /* storage unavailable — fail open */ }
}

function listProfilesLegacy(user) {
  return readAllLegacy()[accountKey(user)] ?? []
}

// ── API helpers ─────────────────────────────────────────────────────────

async function apiFetchProfiles(accessToken) {
  const resp = await fetch(`${API_BASE}/api/account/birth-profiles/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    credentials: 'include',
  })
  if (!resp.ok) return null
  return resp.json()
}

async function apiSaveProfile(accessToken, { label, birth_date, birth_time, place }) {
  const resp = await fetch(`${API_BASE}/api/account/birth-profiles/me`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    credentials: 'include',
    body: JSON.stringify({ label, birth_date, birth_time, place }),
  })
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}))
    throw new Error(err.detail ?? 'Could not save profile')
  }
  return resp.json()
}

async function apiDeleteProfile(accessToken, profileId) {
  const resp = await fetch(`${API_BASE}/api/account/birth-profiles/${profileId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` },
    credentials: 'include',
  })
  if (!resp.ok && resp.status !== 404) {
    const err = await resp.json().catch(() => ({}))
    throw new Error(err.detail ?? 'Could not delete profile')
  }
  // A 404 here means it's already gone (e.g. deleted from another device,
  // or a stale double-click) — treated as success rather than an error,
  // since the end state the caller wants (this profile no longer existing)
  // is already true either way.
}

// ── Merge API profile shape with local chart cache ──────────────────────
//
// The API returns {id, label, birth_date, birth_time, place, is_primary,
// marital_status} — no chart data. We enrich each with a locally-cached
// chart (or regenerate it on first access from a new device).

async function enrichProfile(user, apiProfile) {
  const cached = readChartCache(user, apiProfile.id)
  const chart = cached ?? await fetchKundli({
    date: typeof apiProfile.birth_date === 'string'
      ? apiProfile.birth_date
      : apiProfile.birth_date.toISOString().slice(0, 10),
    time: typeof apiProfile.birth_time === 'string'
      ? apiProfile.birth_time.slice(0, 5)
      : String(apiProfile.birth_time).slice(0, 5),
    place: apiProfile.place,
  })
  if (!cached) writeChartCache(user, apiProfile.id, chart)

  return {
    id: String(apiProfile.id),
    relation: 'self',          // API doesn't store this yet; default to self
    label: apiProfile.label,
    birth_date: typeof apiProfile.birth_date === 'string'
      ? apiProfile.birth_date
      : apiProfile.birth_date.toISOString().slice(0, 10),
    birth_time: typeof apiProfile.birth_time === 'string'
      ? apiProfile.birth_time.slice(0, 5)
      : String(apiProfile.birth_time).slice(0, 5),
    birth_time_accuracy: 'exact',  // legacy field; assume exact for API profiles
    place: apiProfile.place,
    is_primary: apiProfile.is_primary,
    created_at: null,
    chart,
  }
}

// ── Public API ───────────────────────────────────────────────────────────

export function hasAnyProfile(user) {
  // Synchronous quick-check for OnboardingGate / Login routing.
  // Checks both legacy localStorage AND the presence of any chart cache
  // keys for this user (which exist after a successful createProfile()).
  if (listProfilesLegacy(user).length > 0) return true
  // Check if we have any chart cache keys (means API profiles exist)
  try {
    const prefix = `${CHART_CACHE_PREFIX}:${accountKey(user)}:`
    for (let i = 0; i < localStorage.length; i++) {
      if (localStorage.key(i)?.startsWith(prefix)) return true
    }
  } catch { /* storage unavailable — fail open */ }
  return false
}

export function getPrimaryProfile(user) {
  // Synchronous: read from legacy cache only. Used by PersonalHome.jsx
  // which also calls the async loadProfiles() separately.
  const profiles = listProfilesLegacy(user)
  return profiles.find(p => p.is_primary) ?? profiles[0] ?? null
}

export function listProfiles(user) {
  return listProfilesLegacy(user)
}

// Async: load profiles from API (if authenticated) and merge with chart
// cache, updating the legacy localStorage so synchronous callers stay warm.
export async function loadProfiles(user, accessToken) {
  if (!accessToken) return listProfilesLegacy(user)

  try {
    const apiProfiles = await apiFetchProfiles(accessToken)
    if (!apiProfiles || !Array.isArray(apiProfiles)) return listProfilesLegacy(user)

    // Enrich all profiles with chart data in parallel
    const enriched = await Promise.all(apiProfiles.map(p => enrichProfile(user, p)))

    // Write back to legacy cache so synchronous callers (hasAnyProfile,
    // getPrimaryProfile) reflect the latest server state after loadProfiles()
    // has been awaited at least once on this device.
    const all = readAllLegacy()
    all[accountKey(user)] = enriched
    writeAllLegacy(all)

    return enriched
  } catch {
    // API unreachable — fall back to whatever is in localStorage
    return listProfilesLegacy(user)
  }
}

// Creates a profile. If authenticated, saves to the API (cross-device).
// Always saves to localStorage as a warm cache.
export async function createProfile(user, accessToken, { relation, label, birthDate, birthTime, birthTimeAccuracy, place }) {
  const chart = await fetchKundli({ date: birthDate, time: birthTime, place })

  let profileId = `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  let is_primary = !hasAnyProfile(user)

  // Try to persist to the backend
  if (accessToken) {
    try {
      const saved = await apiSaveProfile(accessToken, {
        label,
        birth_date: birthDate,
        birth_time: birthTime,
        place,
      })
      profileId = String(saved.id)
      is_primary = saved.is_primary
    } catch {
      // Backend unavailable — keep the local id, continue with localStorage-only
    }
  }

  const profile = {
    id: profileId,
    relation,
    label,
    birth_date: birthDate,
    birth_time: birthTime,
    birth_time_accuracy: birthTimeAccuracy,
    place,
    is_primary,
    created_at: new Date().toISOString(),
    chart,
  }

  // Always cache chart data locally (backend doesn't store chart results)
  writeChartCache(user, profileId, chart)

  // Update the legacy localStorage profile list
  const all = readAllLegacy()
  const key = accountKey(user)
  // Replace if same id already exists (idempotent re-save), else append
  const existing = all[key] ?? []
  const idx = existing.findIndex(p => p.id === profileId)
  if (idx >= 0) existing[idx] = profile
  else existing.push(profile)
  all[key] = existing
  writeAllLegacy(all)

  clearOnboardingSkipped(user)
  return profile
}

// Deletes a profile. If authenticated, deletes from the API first (source
// of truth for cross-device state); always cleans up local caches
// afterward regardless, so an unauthenticated/offline delete still removes
// it from this device even though there's nothing server-side to call.
export async function deleteProfile(user, accessToken, profileId) {
  if (accessToken) {
    await apiDeleteProfile(accessToken, profileId)
  }

  // Remove the cached chart for this profile.
  try {
    localStorage.removeItem(chartCacheKey(user, profileId))
  } catch { /* best-effort */ }

  // Remove from the legacy profile list, promoting another profile to
  // primary if the deleted one was primary — mirrors the backend's own
  // reassignment in routers/account.py's delete endpoint, kept in sync
  // here too since listProfiles()/getPrimaryProfile() read this legacy
  // cache synchronously without waiting on the next loadProfiles() call.
  const all = readAllLegacy()
  const key = accountKey(user)
  const existing = all[key] ?? []
  const wasPrimary = existing.find(p => p.id === profileId)?.is_primary
  const remaining = existing.filter(p => p.id !== profileId)
  if (wasPrimary && remaining.length > 0) {
    remaining[0] = { ...remaining[0], is_primary: true }
  }
  all[key] = remaining
  writeAllLegacy(all)

  return remaining
}

// ── Skip flow ────────────────────────────────────────────────────────────

export function markOnboardingSkipped(user) {
  try {
    const all = readSkipped()
    all[accountKey(user)] = true
    localStorage.setItem(SKIP_STORAGE_KEY, JSON.stringify(all))
  } catch { /* storage unavailable — fail open */ }
}

function clearOnboardingSkipped(user) {
  try {
    const all = readSkipped()
    delete all[accountKey(user)]
    localStorage.setItem(SKIP_STORAGE_KEY, JSON.stringify(all))
  } catch { /* storage unavailable — fail open */ }
}

function readSkipped() {
  try {
    const raw = localStorage.getItem(SKIP_STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch { return {} }
}

export function hasSkippedOnboarding(user) {
  return Boolean(readSkipped()[accountKey(user)])
}
