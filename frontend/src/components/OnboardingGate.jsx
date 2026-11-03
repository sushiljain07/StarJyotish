// frontend/src/components/OnboardingGate.jsx
//
// Wraps the /home route (see App.jsx), inside <ProtectedRoute> so `user`
// is always populated by the time this runs. Encodes the "IF profile
// does not exist" half of docs/USER_JOURNEY.md's state machine as a
// route guard rather than logic buried in PersonalHome.jsx itself, so
// the same rule protects /home regardless of how someone arrives there
// (post-login redirect, a bookmark, the browser back button, typing the
// URL directly) — Login.jsx's own post-login redirect (the *other* half
// of the same rule) is just an optimization that skips the extra hop for
// the common case; this is the actual enforcement.
//
// localStorage only reflects profiles this browser has seen, so a returning
// user on a new device (or after clearing site data) used to be sent to
// onboarding — and re-entering their details there overwrote their saved
// server profile. When the local check says "no profile", this now asks
// the server once (loadProfiles also refreshes the local cache) before
// deciding.
import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { hasAnyProfile, hasSkippedOnboarding, loadProfiles } from '../services/astrologyProfiles'

export default function OnboardingGate({ children }) {
  const { user, accessToken } = useAuth()
  const locallyKnown = hasAnyProfile(user) || hasSkippedOnboarding(user)
  // 'checking' | 'has-profile' | 'none'
  const [serverState, setServerState] = useState(locallyKnown ? 'has-profile' : 'checking')

  useEffect(() => {
    if (locallyKnown) return undefined
    let cancelled = false
    loadProfiles(user, accessToken)
      .then(profiles => { if (!cancelled) setServerState(profiles?.length ? 'has-profile' : 'none') })
      .catch(() => { if (!cancelled) setServerState('none') })
    return () => { cancelled = true }
    // Only re-check when the signed-in account changes, not on every token refresh.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, locallyKnown])

  if (locallyKnown || serverState === 'has-profile') return children
  if (serverState === 'checking') return null  // same blank-while-resolving as ProtectedRoute
  return <Navigate to="/onboarding" replace />
}
