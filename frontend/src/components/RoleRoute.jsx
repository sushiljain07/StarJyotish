// frontend/src/components/RoleRoute.jsx
// Like ProtectedRoute but also checks user.role.
// Usage:
//   <RoleRoute role="admin"><AdminDashboard /></RoleRoute>
//   <RoleRoute role="astrologer"><AstrologerDashboard /></RoleRoute>
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

// eslint-disable-next-line react/prop-types
export default function RoleRoute({ role, children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return null

  if (!user) {
    return <Navigate to="/login" state={{ next: location.pathname }} replace />
  }

  if (user.role !== role) {
    // Wrong role — send to their own Home, not login (they are logged
    // in) and not '/' (that's the signed-out marketing page; /home is
    // what "home" means for a signed-in visitor everywhere else in this
    // app — see pages/PersonalHome.jsx).
    return <Navigate to="/home" replace />
  }

  return children
}
