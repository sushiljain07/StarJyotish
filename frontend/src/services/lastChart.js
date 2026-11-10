// The chart the user is looking at, kept for the browser tab's session.
// /kundli and /insights (which now also hosts Ask; /ask redirects there)
// used to get their chart only from router
// state, so a refresh, a shared link or a sign-in round-trip bounced the
// user to /home. resolveChartState() rebuilds it instead.
import { getPrimaryProfile } from './astrologyProfiles'
import { chartStateFromProfile } from '../config/nav'

const KEY = 'sj_last_chart'

export function saveLastChart({ data, input }) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify({ data, input }))
  } catch {
    // Storage blocked or full: refresh falls back to the saved profile.
  }
}

export function loadLastChart() {
  try {
    const raw = sessionStorage.getItem(KEY)
    const parsed = raw ? JSON.parse(raw) : null
    return parsed?.data && parsed?.input ? parsed : null
  } catch {
    return null
  }
}

// Router state (in-app navigation) → the last chart in this tab → the
// signed-in user's primary profile → null (caller redirects).
export function resolveChartState(routerState, user) {
  if (routerState?.input) return routerState
  return loadLastChart() ?? (user ? chartStateFromProfile(getPrimaryProfile(user)) : null)
}

// Drop this tab's chart and cached reports. Called on sign-out so the next
// person on a shared device doesn't see them.
export function clearChartSession() {
  try {
    sessionStorage.removeItem(KEY)
    for (let i = sessionStorage.length - 1; i >= 0; i--) {
      const k = sessionStorage.key(i)
      if (k?.startsWith('sj_report:')) sessionStorage.removeItem(k)
    }
  } catch {
    // Storage blocked: nothing was stored.
  }
}
