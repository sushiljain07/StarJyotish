// frontend/src/pages/AskPage.jsx
// Standalone page for asking free-form questions about the birth chart.
import { lazy, Suspense } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Seo from '../components/Seo'
import { StateBlock } from '../components/ui'
import { formatDate, formatTime } from '../utils/format'

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

      <div className="flex-1 max-w-5xl mx-auto w-full px-4 pt-6 pb-8 sm:pb-4">
        <Suspense fallback={<TabLoader />}>
          <AskChart input={input} initialQuestion={presetQuestion} />
        </Suspense>
      </div>
    </div>
  )
}
