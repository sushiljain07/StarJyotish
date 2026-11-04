// frontend/src/pages/AskPage.jsx
// Standalone page for asking free-form questions about the birth chart.
import { lazy, Suspense } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { resolveChartState } from '../services/lastChart'
import Seo from '../components/Seo'
import { StateBlock } from '../components/ui'

const AskChart = lazy(() => import('../components/AskChart'))

// Lazy-load fallback — shared skeleton StateBlock (see components/ui).
function TabLoader() {
  return <StateBlock loading lines={5} className="max-w-lg mx-auto" />
}

export default function AskPage() {
  const location = useLocation()
  const { isAuthenticated, user, loading: authLoading } = useAuth()
  // Router state, else the last chart in this tab, else the saved profile.
  const state = resolveChartState(location.state, user)

  const homeDestination = isAuthenticated ? '/home' : '/'

  // On a hard page load the saved profile is only known once sign-in
  // has resolved; redirecting before then would bounce a signed-in user.
  if (!state?.input && authLoading) return null

  // <Navigate>, not navigate() — see Result.jsx.
  if (!state?.input) return <Navigate to={homeDestination} replace />

  const { input, presetQuestion = null } = state

  return (
    <div className="flex-1 flex flex-col">
      <Seo title="Ask Your Chart" description="Ask any question about your Vedic birth chart." path="/ask" noindex />

      <div className="bg-parchment-card border-b border-line sticky top-[60px] z-30">
        <div className="max-w-5xl mx-auto px-4 py-2">
          <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#D9A441' }}>
            Ask Your Chart
          </p>
        </div>
      </div>

      <div className="flex-1 max-w-5xl mx-auto w-full px-4 pt-6 pb-8 sm:pb-4">
        <Suspense fallback={<TabLoader />}>
          <AskChart input={input} initialQuestion={presetQuestion} />
        </Suspense>
      </div>
    </div>
  )
}
