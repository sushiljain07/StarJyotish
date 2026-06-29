// frontend/src/components/ProtectedRoute.jsx
//
// Wrap any <Route element={...}> that should require a logged-in user:
//   <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
// Waits for AuthContext's mount-time silent-refresh to finish (`loading`)
// before deciding — otherwise a genuinely logged-in user with a valid
// refresh cookie would get bounced to /login for one render on every
// hard reload, just because the access token hadn't been re-minted yet.
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) return null

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ next: location.pathname + location.search }} replace />
  }

  return children
}
