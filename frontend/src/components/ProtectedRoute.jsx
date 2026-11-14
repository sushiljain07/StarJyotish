// frontend/src/components/ProtectedRoute.jsx
//
// Wrap any <Route element={...}> that should require a logged-in user:
//   <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
// Waits for AuthContext's mount-time silent-refresh to finish (`loading`)
// before deciding — otherwise a genuinely logged-in user with a valid
// refresh cookie would get bounced to /login for one render on every
// hard reload, just because the access token hadn't been re-minted yet.
import { useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/AuthContext'
import StateBlock from './ui/StateBlock'
import Button from './ui/Button'

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading, sessionError, retrySession } = useAuth()
  const { t } = useTranslation()
  const location = useLocation()
  // Local busy flag: a retry keeps the reconnect block on screen (no blank
  // frame) and stops repeat taps while the refresh runs.
  const [retrying, setRetrying] = useState(false)
  const onRetry = async () => {
    if (retrying) return
    setRetrying(true)
    try {
      await retrySession()
    } finally {
      setRetrying(false)
    }
  }

  if (loading) return null

  // The refresh failed for a reason that isn't a sign-out (rate limit,
  // server error, offline): don't throw a possibly-signed-in user to /login.
  if (!isAuthenticated && sessionError === 'unreachable') {
    return (
      <StateBlock
        icon="🌙"
        title={t('session_reconnect_title')}
        body={t('session_reconnect_body')}
        action={(
          <Button size="md" onClick={onRetry} disabled={retrying} aria-busy={retrying} className="mt-4">
            {t('session_reconnect_retry')}
          </Button>
        )}
        className="min-h-[60vh] flex flex-col items-center justify-center"
      />
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ next: location.pathname + location.search }} replace />
  }

  return children
}
