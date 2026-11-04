// /career-report used to be a standalone career-report page that nothing in
// the app linked to any more (the career report lives in Insights). Old
// links and bookmarks still arrive here, so send them to the right place.
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function CareerReportRedirect() {
  const { isAuthenticated, loading } = useAuth()
  // Wait for sign-in to resolve, or a signed-in user lands on /generate.
  if (loading) return null
  const to = isAuthenticated ? '/insights?topic=career&sub=career' : '/generate?topic=career'
  return <Navigate to={to} replace />
}
