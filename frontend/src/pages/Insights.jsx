// frontend/src/pages/Insights.jsx
// AI Insights: three fixed sub-tabs — Reading | Ask | Reports. Reports has an
// in-page topic picker (career, health, relationship, finance) and, for
// career, a Career report | Rajyogas toggle.
//
// URL scheme (so refresh, Back and shared links keep the view):
//   ?sub=reading|ask|reports
//   &topic=career|health|relationship|finance   (Reports)
//   &view=report|rajyogas                        (Reports › Career only)
// Old links (?sub=career|rajyogas|health|relationship|finance) are mapped
// onto this scheme with a replace.
import { useEffect, useState, lazy, Suspense } from 'react'
import { Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/AuthContext'
import { resolveChartState } from '../services/lastChart'
import AnimatedTabRow from '../components/AnimatedTabRow'
import SegmentedToggle from '../components/SegmentedToggle'
import Seo from '../components/Seo'
import { getTopic } from '../config/topics'

const ChartReading    = lazy(() => import('../components/ChartReading'))
const AskChart        = lazy(() => import('../components/AskChart'))
const RajyogasTab     = lazy(() => import('../components/RajyogasTab'))
const CareerReportTab = lazy(() => import('../components/CareerReportTab'))
const TopicReportTab  = lazy(() => import('../components/TopicReportTab'))

const SUB_IDS     = ['reading', 'ask', 'reports']
const TOPIC_IDS   = ['career', 'health', 'relationship', 'finance']
const CAREER_VIEWS = ['report', 'rajyogas']
const OTHER_TOPICS = TOPIC_IDS.filter(id => id !== 'career')

// Old ?sub= values → the params that replace them.
const LEGACY_SUBS = {
  career:       { topic: 'career', view: 'report' },
  rajyogas:     { topic: 'career', view: 'rajyogas' },
  health:       { topic: 'health' },
  relationship: { topic: 'relationship' },
  finance:      { topic: 'finance' },
}

function TabLoader() {
  const { t } = useTranslation()
  return (
    <div role="status" className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <span className="sr-only">{t('state_loading_label')}</span>
      <div aria-hidden="true" className="text-3xl mb-3 motion-safe:animate-spin">🪐</div>
      <div className="w-40 h-1.5 bg-night/10 rounded-full overflow-hidden">
        <div className="h-full rounded-full motion-safe:animate-pulse bg-primary w-3/4" />
      </div>
    </div>
  )
}

// Which panel the URL points at: 'reading', 'ask', 'reports:career:report',
// 'reports:career:rajyogas' or 'reports:<topic>'. null for a legacy ?sub=
// that is about to be redirected, so nothing is opened (and mounted) first.
function resolveView(searchParams, inputTopic) {
  const urlSub = searchParams.get('sub')
  if (LEGACY_SUBS[urlSub]) return { sub: null, reportTopic: null, careerView: null, panel: null }
  const sub = SUB_IDS.includes(urlSub) ? urlSub : 'reading'
  const urlTopic = searchParams.get('topic')
  const reportTopic = TOPIC_IDS.includes(urlTopic) ? urlTopic
    : TOPIC_IDS.includes(inputTopic) ? inputTopic
    : 'career'
  // Rajyogas is rule-based (no LLM call), so it's the career default; the
  // ~20s career report starts only once someone picks it.
  const careerView = CAREER_VIEWS.includes(searchParams.get('view')) ? searchParams.get('view') : 'rajyogas'
  const reportPanel = reportTopic === 'career' ? `reports:career:${careerView}` : `reports:${reportTopic}`
  return { sub, reportTopic, careerView, panel: sub === 'reports' ? reportPanel : sub }
}

export default function Insights() {
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, user, loading: authLoading } = useAuth()
  // Router state, else the last chart in this tab, else the saved profile.
  const state = resolveChartState(location.state, user)

  // All hooks before any early return.
  const [searchParams, setSearchParams] = useSearchParams()
  const { sub: activeSub, reportTopic, careerView, panel: activePanel } = resolveView(searchParams, state?.input?.topic)

  // Every panel starts its own request when it mounts (the reading, a
  // preset Ask question, the career and topic reports are LLM calls), so
  // a panel mounts only once it has been opened, then stays mounted.
  // Hidden panels get active={false} so a language switch doesn't
  // regenerate them unseen; each catches up when shown again.
  const [openedPanels, setOpenedPanels] = useState(() => new Set())
  useEffect(() => {
    if (!activePanel) return
    setOpenedPanels(prev => (prev.has(activePanel) ? prev : new Set(prev).add(activePanel)))
  }, [activePanel])
  const isOpened = id => id === activePanel || openedPanels.has(id)

  const legacy = LEGACY_SUBS[searchParams.get('sub')]
  if (legacy) {
    const next = new URLSearchParams(searchParams)
    next.set('sub', 'reports')
    next.set('topic', legacy.topic)
    if (legacy.view) next.set('view', legacy.view)
    else next.delete('view')
    return <Navigate to={{ pathname: location.pathname, search: `?${next}` }} replace state={location.state} />
  }

  const homeDestination = isAuthenticated ? '/home' : '/'

  // On a hard page load the saved profile is only known once sign-in
  // has resolved; redirecting before then would bounce a signed-in user.
  if (!state?.input && authLoading) return null

  // <Navigate>, not navigate() — see Result.jsx.
  if (!state?.input) return <Navigate to={homeDestination} replace />

  const { input, presetQuestion = null } = state
  // The reading's own topic focus: the URL's topic, else the chart's.
  const readingTopic = getTopic(searchParams.get('topic') ?? input?.topic)?.id ?? null

  const SUBTABS = [
    { id: 'reading', label: t('nav_reading') },
    { id: 'ask',     label: t('insights_subtab_ask') },
    { id: 'reports', label: t('insights_subtab_reports') },
  ]
  const TOPIC_OPTIONS = TOPIC_IDS.map(id => ({ id, label: t(`insights_subtab_${id}`) }))
  const CAREER_VIEW_OPTIONS = [
    { id: 'report',   label: t('insights_career_view_report') },
    { id: 'rajyogas', label: t('insights_career_view_rajyogas') },
  ]

  function updateParams(changes) {
    const next = new URLSearchParams(searchParams)
    for (const [key, value] of Object.entries(changes)) next.set(key, value)
    setSearchParams(next, { replace: true, state: location.state })
  }

  // Once AskChart has sent the preset question, drop it from this history
  // entry so a reload (or Back to here) doesn't ask it again.
  function clearPresetQuestion() {
    navigate({ pathname: location.pathname, search: location.search },
      { replace: true, state: { ...location.state, presetQuestion: undefined } })
  }

  const selectSub = id => updateParams({ sub: id })
  const openRajyogas = () => updateParams({ sub: 'reports', topic: 'career', view: 'rajyogas' })
  const panelClass = id => (activePanel === id ? 'tab-fade' : 'hidden')

  return (
    <div className="flex-1 flex flex-col">
      <Seo title={t('insights_seo_title')} description={t('insights_seo_description')} path="/insights" noindex />

      <div className="bg-parchment-card border-b border-line sticky top-[60px] z-30">
        <div className="max-w-5xl mx-auto px-4">
          <div className="pt-2 pb-1">
            <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#D9A441' }}>
              {t('insights_header')}
            </p>
          </div>

          <div className="border-t border-line/40 py-2">
            <AnimatedTabRow tabs={SUBTABS} active={activeSub} onChange={selectSub} variant="pill" accent="mauve" label={t('insights_subtabs_aria')} />
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-5xl mx-auto w-full px-4 pt-6 pb-8 sm:pb-4">
        {activeSub === 'reports' && (
          <div className="mb-6 space-y-2">
            <SegmentedToggle
              ariaLabel={t('insights_topic_picker_label')}
              options={TOPIC_OPTIONS}
              active={reportTopic}
              onChange={id => updateParams({ topic: id })}
            />
            {reportTopic === 'career' && (
              <SegmentedToggle
                ariaLabel={t('insights_subtab_career')}
                options={CAREER_VIEW_OPTIONS}
                active={careerView}
                onChange={id => updateParams({ view: id })}
              />
            )}
          </div>
        )}

        <Suspense fallback={<TabLoader />}>
          {isOpened('reading') && (
            <div className={panelClass('reading')}>
              <ChartReading input={input} topic={readingTopic} onOpenRajyogas={openRajyogas} active={activePanel === 'reading'} />
            </div>
          )}
          {isOpened('ask') && (
            <div className={panelClass('ask')}>
              <AskChart input={input} initialQuestion={presetQuestion} onInitialQuestionSent={clearPresetQuestion} />
            </div>
          )}
          {isOpened('reports:career:report') && (
            <div className={panelClass('reports:career:report')}>
              <CareerReportTab input={input} onOpenRajyogas={openRajyogas} active={activePanel === 'reports:career:report'} />
            </div>
          )}
          {isOpened('reports:career:rajyogas') && (
            <div className={panelClass('reports:career:rajyogas')}>
              <RajyogasTab input={input} active={activePanel === 'reports:career:rajyogas'} />
            </div>
          )}
          {OTHER_TOPICS.filter(id => isOpened(`reports:${id}`)).map(id => (
            <div key={id} className={panelClass(`reports:${id}`)}>
              <TopicReportTab topic={id} input={input} active={activePanel === `reports:${id}`} />
            </div>
          ))}
        </Suspense>
      </div>
    </div>
  )
}
