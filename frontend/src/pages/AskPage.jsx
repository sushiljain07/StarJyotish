// frontend/src/pages/AskPage.jsx
// Standalone page for asking free-form questions about the birth chart.
import { lazy, Suspense } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Seo from '../components/Seo'
import { StateBlock } from '../components/ui'

const AskChart = lazy(() => import('../components/AskChart'))

// Lazy-load fallback — shared skeleton StateBlock (see components/ui).
function TabLoader() {
  return <StateBlock loading lines={5} className="max-w-lg mx-auto" />
}

export default function AskPage() {
  const { state }   = useLocation()
  const navigate    = useNavigate()
  const { isAuthenticated } = useAuth()

  const homeDestination = isAuthenticated ? '/home' : '/'

  if (!state?.input) { navigate(homeDestination); return null }

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
