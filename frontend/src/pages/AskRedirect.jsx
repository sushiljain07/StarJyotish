// frontend/src/pages/AskRedirect.jsx
// Ask lives inside AI Insights now (/insights?sub=ask). Old /ask links and
// bookmarks land there, keeping router state such as presetQuestion.
import { Navigate, useLocation } from 'react-router-dom'

export default function AskRedirect() {
  const location = useLocation()
  return <Navigate to="/insights?sub=ask" replace state={location.state} />
}
