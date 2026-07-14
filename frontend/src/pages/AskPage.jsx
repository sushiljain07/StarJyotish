// frontend/src/pages/AskPage.jsx
// Standalone page for asking free-form questions about the birth chart.
import { lazy, Suspense } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import SiteHeader from '../components/SiteHeader'
import CompactFooter from '../components/CompactFooter'
import Seo from '../components/Seo'
import { formatDate, formatTime } from '../utils/format'

const AskChart = lazy(() => import('../components/AskChart'))

function TabLoader() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="text-3xl mb-3 animate-spin">💬</div>
      <div className="w-40 h-1.5 bg-night/10 rounded-full overflow-hidden">
        <div className="h-full rounded-full animate-pulse bg-primary w-3/4" />
      </div>
    </div>
  )
}

export default function AskPage() {
  const { state }   = useLocation()
  const navigate    = useNavigate()
  const { isAuthenticated } = useAuth()

  const homeDestination = isAuthenticated ? '/home' : '/'

  if (!state?.input) { navigate(homeDestination); return null }

  const { input, presetQuestion = null } = state

  return (
    <div className="min-h-screen bg-parchment flex flex-col">
      <Seo title="Ask Your Chart" description="Ask any question about your Vedic birth chart." path="/ask" noindex />
      <SiteHeader />
      <div className="h-[60px] shrink-0" />

      <div className="bg-parchment-card border-b border-line sticky top-[60px] z-30">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center justify-between py-2.5 gap-3">
            <div className="min-w-0 flex items-center gap-2 overflow-hidden">
              {input.name && (
                <span className="font-bold text-sm text-ink leading-none truncate">{input.name}</span>
              )}
              <span className="text-ink-faint text-xs leading-none hidden sm:inline shrink-0">·</span>
              <span className="text-ink-faint text-xs leading-none hidden sm:inline truncate">
                {formatDate(input.date)} · {formatTime(input.time)}
              </span>
            </div>
            <button
              onClick={() => navigate('/kundli', { state })}
              className="shrink-0 bg-night hover:bg-night-light text-ink-onnight text-xs font-semibold px-3 py-1.5 rounded-full transition"
            >
              ← Chart
            </button>
          </div>
          <div className="border-t border-line/40 pt-1 pb-1">
            <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#D9A441' }}>
              Ask Your Chart
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-5xl mx-auto w-full px-4 pt-6 pb-24 sm:pb-4">
        <Suspense fallback={<TabLoader />}>
          <AskChart input={input} initialQuestion={presetQuestion} />
        </Suspense>
      </div>

      <CompactFooter />
    </div>
  )
}
