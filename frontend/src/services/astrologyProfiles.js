// frontend/src/services/astrologyProfiles.js
//
// ── The seam between "User Account" and "Astrology Profile" ────────────
//
// See docs/USER_JOURNEY.md for the full picture. Short version: a User
// Account (AuthContext's `user`, backed by the real users table) is a
// login identity. An Astrology Profile is a birth chart someone has
// created — their own, or someone else's ("Mom", "Rahul", "Daughter").
// One account can eventually hold several. Onboarding.jsx creates the
// first one; PersonalHome.jsx reads it back.
//
// ── What's real here, and what's a placeholder ──────────────────────────
//
// Chart generation (`createProfile` below) calls the real, already-live
// POST /api/kundli endpoint via api/astro.js's fetchKundli — same Swiss
// Ephemeris calculation /generate has always used. Nothing about the
// chart itself is fake.
//
// *Persisting* a profile as belonging to this account is the placeholder
// part: no backend endpoint exists yet for "save this chart as an
// Astrology Profile on my account" (the backend's BirthProfile table,
// account_models.py's BirthProfileOut, is currently only ever written as
// a side effect of generating a *report* — career/rajyogas/relationship/
// wealth — for a phone number, via services/persistence.py's
// save_for_phone; there is no equivalent for a plain chart, and no way to
// list profiles by account id, only by phone number). So this file keeps
// profiles in localStorage, scoped per account, shaped to match
// BirthProfileOut field-for-field (snake_case included) so that swapping
// this module's insides for real
// `GET/POST /api/account/astrology-profiles` calls later is a pure
// implementation-detail change — nothing that reads a profile from here
// (PersonalHome.jsx, Onboarding.jsx) would need to change.
//
// ── Multi-profile architecture (designed, not built) ────────────────────
//
// Storage is already an array per account, and every profile already
// carries `is_primary` — the two things "Add Profile" / "Switch Profile"
// need. "Switch" is just picking a different array element as primary;
// "Add" is another createProfile() call. Neither has UI this sprint (see
// docs/USER_JOURNEY.md's "Future multi-profile support" section) —
// deliberately, per this sprint's brief — so no switchPrimaryProfile() or
// archiveProfile() export exists yet; add them here, not in a component,
// when that UI is built.

import { fetchKundli } from '../api/astro'

// The backend's /api/kundli requires a time — Vedic chart calculation
// needs one to place the Ascendant and houses at all. When someone
// genuinely doesn't know their birth time (BirthTimeSelector.jsx's
// "I don't know" option), noon is the conventional placeholder Vedic
// astrologers use rather than blocking chart generation entirely — the
// resulting planetary *signs* are still accurate, only the Ascendant and
// house placements are approximate, which is exactly what
// `birth_time_accuracy: 'unknown'` on the saved profile exists to keep
// honest everywhere the chart is shown.
export const UNKNOWN_BIRTH_TIME_DEFAULT = '12:00'

const STORAGE_KEY = 'sj_astrology_profiles_v1'
const SKIP_STORAGE_KEY = 'sj_onboarding_skipped_v1'

// Accounts are keyed by `user.id` (a stable UUID regardless of whether
// they signed in with phone or Google — see backend/models/auth_models.py's
// UserOut) rather than phone/email, so switching login method never
// orphans a profile. Falls back to a generic bucket if somehow called
// before `user` is available; nothing should render onboarding/home
// without a signed-in user, so this is a defensive fallback, not a
// real path.
function accountKey(user) {
  return user?.id ?? 'anonymous'
}

function readAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    // Storage can throw (private browsing) or hold corrupt JSON (a
    // future format change) — either way, fail open to "no profiles
    // saved" rather than breaking onboarding/home entirely.
    return {}
  }
}

function writeAll(all) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
  } catch {
    // Best-effort — see readAll()'s comment. A failed write here means
    // the profile just generated won't be remembered next visit, which
    // is disappointing but not broken: the chart already returned and
    // rendered once regardless.
  }
}

export function listProfiles(user) {
  const all = readAll()
  return all[accountKey(user)] ?? []
}

export function hasAnyProfile(user) {
  return listProfiles(user).length > 0
}

export function getPrimaryProfile(user) {
  const profiles = listProfiles(user)
  return profiles.find(p => p.is_primary) ?? profiles[0] ?? null
}

// Generates a real chart (POST /api/kundli) and saves it as this
// account's Astrology Profile. The first profile an account creates is
// always primary; see the module comment above for why "switching"
// primary has no UI yet.
export async function createProfile(user, { relation, label, birthDate, birthTime, birthTimeAccuracy, place }) {
  const chart = await fetchKundli({ date: birthDate, time: birthTime, place })

  const profile = {
    id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    relation,               // 'self' | 'other'
    label,                  // display name — "Myself", "Mom", "Rahul", ...
    birth_date: birthDate,  // "YYYY-MM-DD" — matches BirthProfileOut.birth_date
    birth_time: birthTime,  // "HH:MM"      — matches BirthProfileOut.birth_time
    // Not part of BirthProfileOut today — the backend has no column for
    // this yet. Kept here anyway since it's real information the person
    // gave us (see BirthTimeSelector.jsx) and Home/Review both want to
    // show an honest "time unknown, using an approximate default"
    // caveat rather than silently presenting an invented time as exact.
    birth_time_accuracy: birthTimeAccuracy, // 'exact' | 'approximate' | 'unknown'
    place,
    is_primary: !hasAnyProfile(user),
    created_at: new Date().toISOString(),
    chart,                  // the real ChartResponse from the backend
  }

  const all = readAll()
  const key = accountKey(user)
  all[key] = [...(all[key] ?? []), profile]
  writeAll(all)

  // A saved profile supersedes any earlier "skip" — the account has
  // moved past onboarding for real now.
  clearOnboardingSkipped(user)

  return profile
}

// ── Skip flow ─────────────────────────────────────────────────────────
// A separate flag from "has a profile": skipping onboarding should stop
// it from popping up again on every visit (see OnboardingGate.jsx), but
// must never be confused with actually having a chart — PersonalHome.jsx
// uses this distinction to show its empty state only for accounts that
// explicitly chose to skip, not ones who simply haven't finished yet.
export function markOnboardingSkipped(user) {
  try {
    const all = readSkipped()
    all[accountKey(user)] = true
    localStorage.setItem(SKIP_STORAGE_KEY, JSON.stringify(all))
  } catch {
    // Fail open — see writeAll()'s comment. Worst case, onboarding
    // offers itself again next visit.
  }
}

function clearOnboardingSkipped(user) {
  try {
    const all = readSkipped()
    delete all[accountKey(user)]
    localStorage.setItem(SKIP_STORAGE_KEY, JSON.stringify(all))
  } catch {
    // No-op on failure — see writeAll()'s comment.
  }
}

function readSkipped() {
  try {
    const raw = localStorage.getItem(SKIP_STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function hasSkippedOnboarding(user) {
  return Boolean(readSkipped()[accountKey(user)])
}
