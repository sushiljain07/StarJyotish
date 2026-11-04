// The chart the user is looking at, kept for the browser tab's session.
// /kundli, /insights and /ask used to get their chart only from router
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
