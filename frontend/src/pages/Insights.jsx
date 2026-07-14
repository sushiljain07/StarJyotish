// frontend/src/pages/Insights.jsx
//
// Standalone page for AI-powered chart readings, reports, and Rajyogas.
// Receives chart state via router location (same shape as Result.jsx).
// Accessed via /insights — promoted from a tab inside /kundli.

import { useState, lazy, Suspense, useRef, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/AuthContext'
import SiteHeader from '../components/SiteHeader'
import CompactFooter from '../components/CompactFooter'
import AnimatedTabRow from '../components/AnimatedTabRow'
import TopicIcon from '../components/TopicIcon'
import Seo       from '../components/Seo'
import { formatDate, formatTime } from '../utils/format'
import { getTopic } from '../config/topics'

const ChartReading    = lazy(() => import('../components/ChartReading'))
const RajyogasTab     = lazy(() => import('../components/RajyogasTab'))
const CareerReportTab = lazy(() => import('../components/CareerReportTab'))
const TopicReportTab  = lazy(() => import('../components/TopicReportTab'))

function TabLoader() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="text-3xl mb-3 animate-spin">🪐</div>
      <div className="w-40 h-1.5 bg-night/10 rounded-full overflow-hidden">
        <div className="h-full rounded-full animate-pulse bg-primary w-3/4" />
      </div>
    </div>
  )
}

function insightSubtabs(t, topicId) {
  const reading = { id: 'reading', label: t('nav_reading', 'Reading') }
  if (topicId === 'career') {
    return [reading, { id: 'rajyogas', label: t('nav_rajyogas', 'Rajyogas') }, { id: 'career', label: t('nav_career', 'Career') }]
  }
  if (topicId === 'health' || topicId === 'relationship' || topicId === 'finance') {
    return [reading, { id: topicId, label: t(`nav_${topicId}`, topicId) }]
  }
  return [reading]
}

export default function Insights() {
  const { t } = useTranslation()
  const { state } = useLocation()
  const navigate  = useNavigate()
  const { isAuthenticated } = useAuth()

  const homeDestination = isAuthenticated ? '/home' : '/'

  // All hooks must be called before any early returns
  const stickyRef = useRef(null)
  const [stickyH, setStickyH] = useState(0)
  const [activeSub, setActiveSub] = useState('reading')

  useEffect(() => {
    if (!stickyRef.current) return
    const ro = new ResizeObserver(entries => setStickyH(entries[0].contentRect.height))
    ro.observe(stickyRef.current)
    return () => ro.disconnect()
  }, [])

  if (!state?.input) {
    navigate(homeDestination)
    return null
  }

  const { input } = state
  const topic   = getTopic(input?.topic)
  const topicId = topic?.id ?? null

  const SUBTABS = insightSubtabs(t, topicId)

  return (
    <div className="min-h-screen bg-parchment flex flex-col">
      <Seo title="Chart Insights" description="AI-powered reading of your Vedic birth chart." path="/insights" noindex />
      <SiteHeader />

      <div ref={stickyRef} className="bg-parchment-card border-b border-line sticky top-[60px] z-30">
        <div className="max-w-5xl mx-auto px-4">
          {/* Identity row */}
          <div className="flex items-center justify-between py-1.5 gap-3">
            <div className="min-w-0 flex items-center gap-2 overflow-hidden">
              {input?.name && (
                <span className="font-bold text-sm text-ink leading-none truncate">{input.name}</span>
              )}
              <span className="text-ink-faint text-xs leading-none hidden sm:inline shrink-0">·</span>
              <span className="text-ink-faint text-xs leading-none hidden sm:inline truncate">
                {formatDate(input?.date)} · {formatTime(input?.time)}
              </span>
              {topic && (
                <span className="hidden sm:inline-flex shrink-0 items-center gap-1 bg-primary-light text-primary-dark rounded-full px-2 py-0.5 text-[11px] font-medium">
                  <TopicIcon id={topic.id} className="w-3 h-3" /> {t(`landing_topic_${topic.id}_label`)}
                </span>
              )}
            </div>
            <button
              onClick={() => navigate('/kundli', { state })}
              className="shrink-0 bg-night hover:bg-night-light text-ink-onnight text-xs font-semibold px-3 py-1.5 rounded-full transition"
            >
              ← Chart
            </button>
          </div>

          {/* Page label */}
          <div className="py-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(212,175,55,0.6)' }}>
              Insights
            </p>
          </div>

          {/* Sub-tabs */}
          {SUBTABS.length > 1 && (
            <div className="border-t border-line/50 py-1.5">
              <AnimatedTabRow tabs={SUBTABS} active={activeSub} onChange={setActiveSub} variant="pill" accent="mauve" />
            </div>
          )}
        </div>
      </div>

      <div
        className="flex-1 max-w-5xl mx-auto w-full px-4 pb-24 sm:pb-4"
        style={{ paddingTop: stickyH > 0 ? `${60 + stickyH + 16}px` : '180px' }}
      >
        <Suspense fallback={<TabLoader />}>
          <div className={activeSub === 'reading' ? 'tab-fade' : 'hidden'}>
            <ChartReading input={input} onSwitchToCareer={() => setActiveSub('career')} />
          </div>

          <div className={activeSub === 'rajyogas' ? 'tab-fade' : 'hidden'}>
            <RajyogasTab input={input} />
          </div>

          <div className={activeSub === 'career' ? 'tab-fade' : 'hidden'}>
            <CareerReportTab input={input} />
          </div>

          {(topicId === 'relationship' || topicId === 'finance' || topicId === 'health') && (
            <div className={activeSub === topicId ? 'tab-fade' : 'hidden'}>
              <TopicReportTab topic={topicId} input={input} />
            </div>
          )}
        </Suspense>
      </div>

      <CompactFooter />
    </div>
  )
}
