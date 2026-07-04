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
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { hasAnyProfile, hasSkippedOnboarding } from '../services/astrologyProfiles'

export default function OnboardingGate({ children }) {
  const { user } = useAuth()

  if (!hasAnyProfile(user) && !hasSkippedOnboarding(user)) {
    return <Navigate to="/onboarding" replace />
  }

  return children
}
