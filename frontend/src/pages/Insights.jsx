// frontend/src/pages/Insights.jsx
// Standalone page for AI readings, Rajyogas, and topic reports.
// Promoted from the old "Insights" tab inside /kundli to its own URL.
import { useEffect, useState, lazy, Suspense } from 'react'
import { Navigate, useLocation, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/AuthContext'
import { resolveChartState } from '../services/lastChart'
import AnimatedTabRow from '../components/AnimatedTabRow'
import Seo from '../components/Seo'
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

function buildSubtabs(t, topicId) {
  const reading = { id: 'reading', label: t('nav_reading', 'Reading') }
  if (topicId === 'career') {
    return [reading, { id: 'rajyogas', label: t('nav_rajyogas', 'Rajyogas') }, { id: 'career', label: 'Career' }]
  }
  if (topicId === 'health' || topicId === 'relationship' || topicId === 'finance') {
    return [reading, { id: topicId, label: topicId.charAt(0).toUpperCase() + topicId.slice(1) }]
  }
  return [reading]
}

export default function Insights() {
  const { t } = useTranslation()
  const location = useLocation()
  const { isAuthenticated, user } = useAuth()
  // Router state, else the last chart in this tab, else the saved profile.
  const state = resolveChartState(location.state, user)

  // Sub-tab and topic live in the URL (?sub=&topic=) so refresh, Back and
  // shared links keep them. All hooks before any early return.
  const [searchParams, setSearchParams] = useSearchParams()
  const urlSub = searchParams.get('sub')
  // The career report auto-generates (a ~20s LLM call) when it mounts, so
  // mount it only once its tab has been opened, then keep it mounted.
  const [careerOpenedFlag, setCareerOpenedFlag] = useState(false)
  useEffect(() => {
    if (urlSub === 'career') setCareerOpenedFlag(true)
  }, [urlSub])

  const homeDestination = isAuthenticated ? '/home' : '/'

  // <Navigate>, not navigate() — see Result.jsx.
  if (!state?.input) return <Navigate to={homeDestination} replace />

  const { input } = state
  const topic   = getTopic(searchParams.get('topic') ?? input?.topic)
  const topicId = topic?.id ?? null
  const SUBTABS = buildSubtabs(t, topicId)
  const activeSub = SUBTABS.some(tab => tab.id === urlSub) ? urlSub : 'reading'
  const careerOpened = careerOpenedFlag || activeSub === 'career'

  function selectSub(id) {
    const next = new URLSearchParams(searchParams)
    next.set('sub', id)
    setSearchParams(next, { replace: true, state: location.state })
  }

  return (
    <div className="flex-1 flex flex-col">
      <Seo title="Chart Insights" description="AI-powered reading of your Vedic birth chart." path="/insights" noindex />

      <div className="bg-parchment-card border-b border-line sticky top-[60px] z-30">
        <div className="max-w-5xl mx-auto px-4">
          <div className="pt-2 pb-1">
            <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#D9A441' }}>
              Insights
            </p>
          </div>

          {SUBTABS.length > 1 && (
            <div className="border-t border-line/40 py-2">
              <AnimatedTabRow tabs={SUBTABS} active={activeSub} onChange={selectSub} variant="pill" accent="mauve" />
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 max-w-5xl mx-auto w-full px-4 pt-6 pb-8 sm:pb-4">
        <Suspense fallback={<TabLoader />}>
          <div className={activeSub === 'reading' ? 'tab-fade' : 'hidden'}>
            <ChartReading input={input} topic={topicId} onOpenRajyogas={() => selectSub('rajyogas')} />
          </div>
          <div className={activeSub === 'rajyogas' ? 'tab-fade' : 'hidden'}>
            <RajyogasTab input={input} />
          </div>
          {topicId === 'career' && careerOpened && (
            <div className={activeSub === 'career' ? 'tab-fade' : 'hidden'}>
              <CareerReportTab input={input} onOpenRajyogas={() => selectSub('rajyogas')} />
            </div>
          )}
          {(topicId === 'relationship' || topicId === 'finance' || topicId === 'health') && (
            <div className={activeSub === topicId ? 'tab-fade' : 'hidden'}>
              <TopicReportTab topic={topicId} input={input} />
            </div>
          )}
        </Suspense>
      </div>
    </div>
  )
}
