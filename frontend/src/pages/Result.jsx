import { useEffect, useState, lazy, Suspense } from 'react'
import { Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { planetName, signName } from '../utils/astroNames'
import { useAuth } from '../contexts/AuthContext'
import { resolveChartState, saveLastChart } from '../services/lastChart'

import { StateBlock } from '../components/ui'
import KundliChart     from '../components/KundliChart'
import DashaTable      from '../components/DashaTable'
import PlanetTable     from '../components/PlanetTable'
import NavBar          from '../components/NavBar'
import SegmentedToggle from '../components/SegmentedToggle'
import AnimatedTabRow  from '../components/AnimatedTabRow'
import { useScrollDirection } from '../hooks/useScrollDirection'
import { getTopic } from '../config/topics'
import TabIcon   from '../components/TabIcon'
import Seo       from '../components/Seo'
import ReadingTeaser from '../components/ReadingTeaser'

const KPChart             = lazy(() => import('../components/KPChart'))
const DivisionalCharts    = lazy(() => import('../components/DivisionalCharts'))
const TransitPanel        = lazy(() => import('../components/TransitPanel'))
const KundliDownload      = lazy(() => import('../components/KundliDownload'))
const BhavaChalit         = lazy(() => import('../components/BhavaChalit'))
const AshtakavargaTable   = lazy(() => import('../components/AshtakavargaTable'))
const SarvatobhadraChakra = lazy(() => import('../components/SarvatobhadraChakra'))

// Lazy-tab fallback — shared skeleton StateBlock (was a bespoke spinning 🪐
// with a fake progress bar, duplicated in AskPage with a different emoji).
function TabLoader() {
  return <StateBlock loading lines={5} className="max-w-lg mx-auto" />
}

function SummaryChips({ data, collapsed }) {
  const { t } = useTranslation()
  const moon = data.planets.find(p => p.name === 'Moon')
  const md   = data.dasha.current_mahadasha
  return (
    <div
      data-testid="summary-chips"
      className={`flex flex-wrap gap-1.5 motion-safe:transition-all motion-safe:duration-200 ${
        collapsed ? 'max-h-0 opacity-0 overflow-hidden py-0 md:max-h-none md:opacity-100 md:overflow-visible md:py-2' : 'py-2'
      }`}
    >
      <span className="bg-primary-light text-primary-dark text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap">
        {t('kundli_chip_lagna', { sign: signName(t, data.ascendant.sign) })}
      </span>
      {moon && (
        <span className="bg-mauve-light text-mauve text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap">
          {t('kundli_chip_rashi', { sign: signName(t, moon.sign) })}
        </span>
      )}
      <span className="bg-vermillion-light text-vermillion text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap">
        {t('kundli_chip_mahadasha', { planet: planetName(t, md.planet) })}
      </span>
    </div>
  )
}

const mainTabs = t => [
  { id: 'birth_chart', label: t('tab_birth_chart'),        icon: 'kundli' },
  { id: 'divisional',  label: t('kundli_tab_life_areas'),  icon: 'insights' },
  { id: 'analysis',    label: t('kundli_tab_analysis'),    icon: 'advanced' },
  { id: 'download',    label: t('nav_download'),           icon: 'download' },
]

const birthSubtabs = t => [
  { id: 'chart',   label: t('kundli_sub_chart') },
  { id: 'planets', label: t('tab_planets') },
  { id: 'dasha',   label: t('tab_dasha') },
  { id: 'transit', label: t('nav_transit') },
]

const analysisSubtabs = t => [
  { id: 'bhava',         label: t('nav_bhava') },
  { id: 'ashtakavarga',  label: t('nav_ashtakavarga') },
  { id: 'sarvatobhadra', label: t('nav_sarvatobhadra') },
]

const MAIN_TAB_IDS = mainTabs(k => k).map(tab => tab.id)
const BIRTH_SUB_IDS = birthSubtabs(k => k).map(tab => tab.id)
const ANALYSIS_SUB_IDS = analysisSubtabs(k => k).map(tab => tab.id)

const chartStyles = t => [
  { id: 'north', label: t('kundli_style_north') },
  { id: 'kp',    label: 'KP' },
]

function SubTabBar({ subtabs, active, onChange, accent = 'primary' }) {
  return <AnimatedTabRow tabs={subtabs} active={active} onChange={onChange} variant="pill" accent={accent} />
}

export default function Result() {
  const { t } = useTranslation()
  const location  = useLocation()
  const navigate  = useNavigate()
  const scrollDir = useScrollDirection()
  const { isAuthenticated, user, loading: authLoading } = useAuth()
  // Router state, else the last chart in this tab, else the saved profile.
  const state = resolveChartState(location.state, user)

  const homeDestination = isAuthenticated ? '/home' : '/'

  // Tabs live in the URL (?tab=&sub=) so refresh, Back and shared links
  // keep them. Without ?tab, fall back to the { activeTab, activeSubtab }
  // router state older in-app links still pass.
  const [searchParams, setSearchParams] = useSearchParams()
  const urlTab = searchParams.get('tab')
  const urlSub = searchParams.get('sub')

  const legacyMainMap = {
    kundli: 'birth_chart', advanced: 'analysis',
    birth_chart: 'birth_chart', divisional: 'divisional',
    analysis: 'analysis', download: 'download',
  }
  const legacyBirthMap = { birth_chart: 'chart', planets: 'planets', dasha: 'dasha', transit: 'transit' }

  const activeMain = urlTab
    ? (MAIN_TAB_IDS.includes(urlTab) ? urlTab : 'birth_chart')
    : (legacyMainMap[state?.activeTab] ?? 'birth_chart')
  const legacySub = urlTab ? null : (legacyBirthMap[state?.activeSubtab] ?? state?.activeSubtab)
  const activeBirthSub = BIRTH_SUB_IDS.includes(urlSub) ? urlSub
    : BIRTH_SUB_IDS.includes(legacySub) ? legacySub : 'chart'
  const activeAnalysisSub = ANALYSIS_SUB_IDS.includes(urlSub) ? urlSub : 'bhava'

  // A main-tab change is a new history entry (Back returns to the previous
  // main tab); a sub-tab change replaces it. Router state is carried along
  // so the chart and any preset question survive.
  function selectMain(id) {
    if (id === activeMain) return
    setSearchParams({ tab: id }, { state: location.state })
  }
  function selectSub(id) {
    setSearchParams({ tab: activeMain, sub: id }, { replace: true, state: location.state })
  }

  const [chartStyle, setChartStyle]               = useState('north')
  const MAIN_TABS = mainTabs(t)

  // Remember a chart that arrived by navigation, so a refresh or a
  // sign-in round-trip comes back to it (see services/lastChart.js).
  useEffect(() => {
    if (location.state?.data) saveLastChart(location.state)
  }, [location.state])

  // On a hard page load the saved profile is only known once sign-in
  // has resolved; redirecting before then would bounce a signed-in user.
  if (!state?.data && authLoading) return null

  // <Navigate>, not navigate(): navigate() during render is ignored by
  // React Router, which left a blank page for bookmarked/refreshed URLs.
  if (!state?.data) return <Navigate to={homeDestination} replace />

  const { data, input, presetQuestion = null } = state
  const topic = getTopic(input.topic)

  function renderBirthChart() {
    if (chartStyle === 'north') {
      return (
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-start">
          <div className="w-full sm:w-[460px]">
            <KundliChart planets={data.planets} ascendant={data.ascendant}
                         navamsaPlanets={data.navamsa_planets}
                         title={t('tab_birth_chart')} />
          </div>
          <div className="w-full sm:w-[460px]">
            <KundliChart planets={data.navamsa_planets} ascendant={data.navamsa_ascendant}
                         title={t('tab_navamsa')} />
          </div>
        </div>
      )
    }
    if (chartStyle === 'kp') {
      return (
        <Suspense fallback={<TabLoader />}>
          <KPChart input={input} />
        </Suspense>
      )
    }
    return null
  }

  function InsightsAskEntry() {
    return (
      <div className="mt-6 flex flex-col sm:flex-row gap-3 border-t pt-6" style={{ borderColor: '#EAE1CC' }}>
        <button
          onClick={() => navigate('/insights', { state })}
          className="flex-1 flex items-center justify-between px-4 py-3 rounded-xl border transition-all hover:border-primary/60"
          style={{ borderColor: '#EAE1CC', background: '#FFFDF8' }}
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">✨</span>
            <div className="text-left">
              <p className="text-sm font-semibold text-ink">{t('kundli_insights_title')}</p>
              <p className="text-xs text-ink-muted">{t('kundli_insights_sub')}</p>
            </div>
          </div>
          <span className="text-xs font-semibold shrink-0 ml-2" style={{ color: '#D9A441' }}>{t('kundli_open')}</span>
        </button>
        <button
          onClick={() => navigate('/ask', { state: { ...state, presetQuestion } })}
          className="flex-1 flex items-center justify-between px-4 py-3 rounded-xl border transition-all hover:border-primary/60"
          style={{ borderColor: '#EAE1CC', background: '#FFFDF8' }}
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">💬</span>
            <div className="text-left">
              <p className="text-sm font-semibold text-ink">{t('kundli_ask_title')}</p>
              <p className="text-xs text-ink-muted">{t('kundli_ask_sub')}</p>
            </div>
          </div>
          <span className="text-xs font-semibold shrink-0 ml-2" style={{ color: '#D9A441' }}>{t('kundli_ask_cta')}</span>
        </button>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col">
      <Seo title={t('kundli_seo_title')} description={t('kundli_seo_description')} path="/kundli" noindex />

      {/* ── Sticky context bar ──────────────────────────────────────────── */}
      <div className="bg-parchment-card border-b border-line sticky top-[60px] z-30">
        <div className="max-w-5xl mx-auto px-4">

          {/* chips */}
          <SummaryChips data={data} collapsed={scrollDir === 'down'} />

          {/* Row 3 — main tabs */}
          <div className="border-t border-line/40 pt-1">
            <AnimatedTabRow
              tabs={MAIN_TABS}
              active={activeMain}
              onChange={selectMain}
              renderIcon={tab => <TabIcon id={tab.icon} className="w-4 h-4" />}
            />
          </div>

          {/* Row 4 — sub-tabs (only when the active main tab has them) */}
          {(activeMain === 'birth_chart' || activeMain === 'analysis') && (
            <div className="border-t border-line/40 py-2">
              {activeMain === 'birth_chart' && (
                <SubTabBar subtabs={birthSubtabs(t)} active={activeBirthSub} onChange={selectSub} />
              )}
              {activeMain === 'analysis' && (
                <SubTabBar subtabs={analysisSubtabs(t)} active={activeAnalysisSub} onChange={selectSub} accent="sage" />
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Page content ────────────────────────────────────────────────── */}
      <div className="flex-1 max-w-5xl mx-auto w-full px-4 pt-6 pb-8 sm:pb-4">

        {/* ══ BIRTH CHART ══ */}
        <div className={activeMain === 'birth_chart' ? 'tab-fade' : 'hidden'}>

          <div className={activeBirthSub === 'chart' ? 'tab-fade' : 'hidden'}>
            <ReadingTeaser input={input} onOpen={() => navigate('/insights?sub=reading', { state })} />
            <SegmentedToggle label={t('kundli_style')} options={chartStyles(t)} active={chartStyle} onChange={setChartStyle} className="mb-4" />
            {renderBirthChart()}
            <InsightsAskEntry />
          </div>

          <div className={activeBirthSub === 'planets' ? 'tab-fade' : 'hidden'}>
            <div className="mb-4 rounded-xl px-4 py-3"
                 style={{ background: '#171B33', border: '1px solid rgba(212,175,55,0.2)' }}>
              <p className="text-[10px] font-semibold uppercase tracking-widest mb-0.5"
                 style={{ color: 'rgba(212,175,55,0.55)' }}>{t('kundli_planets_intro_title')}</p>
              <p className="text-xs leading-relaxed" style={{ color: 'rgba(232,220,200,0.65)' }}>
                {t('kundli_planets_intro_body')}
              </p>
            </div>
            <PlanetTable planets={data.planets} ascendant={data.ascendant} />
          </div>

          <div className={activeBirthSub === 'dasha' ? 'tab-fade' : 'hidden'}>
            <div className="mb-4 rounded-xl px-4 py-3"
                 style={{ background: '#171B33', border: '1px solid rgba(212,175,55,0.2)' }}>
              <p className="text-[10px] font-semibold uppercase tracking-widest mb-0.5"
                 style={{ color: 'rgba(212,175,55,0.55)' }}>{t('kundli_dasha_intro_title')}</p>
              <p className="text-xs leading-relaxed" style={{ color: 'rgba(232,220,200,0.65)' }}>
                {t('kundli_dasha_intro_body')}
              </p>
            </div>
            <DashaTable dasha={data.dasha} />
          </div>

          <Suspense fallback={<TabLoader />}>
            <div className={activeBirthSub === 'transit' ? 'tab-fade' : 'hidden'}>
              <TransitPanel input={input} natalData={data} />
            </div>
          </Suspense>
        </div>

        {/* ══ LIFE AREAS (DIVISIONAL) ══ */}
        <div className={activeMain === 'divisional' ? 'tab-fade' : 'hidden'}>
          <Suspense fallback={<TabLoader />}>
            <DivisionalCharts input={input} defaultDivision={topic?.division} />
          </Suspense>
        </div>

        {/* ══ ANALYSIS ══ */}
        <div className={activeMain === 'analysis' ? 'tab-fade' : 'hidden'}>
          <Suspense fallback={<TabLoader />}>
            <div className={activeAnalysisSub === 'bhava' ? 'tab-fade' : 'hidden'}>
              <BhavaChalit input={input} />
            </div>
            <div className={activeAnalysisSub === 'ashtakavarga' ? 'tab-fade' : 'hidden'}>
              <AshtakavargaTable input={input} />
            </div>
            <div className={activeAnalysisSub === 'sarvatobhadra' ? 'tab-fade' : 'hidden'}>
              <SarvatobhadraChakra natalPlanets={data.planets} transitPlanets={[]} />
            </div>
          </Suspense>
        </div>

        {/* ══ DOWNLOAD ══ */}
        <div className={activeMain === 'download' ? 'tab-fade' : 'hidden'}>
          <Suspense fallback={<TabLoader />}>
            <KundliDownload data={data} input={input} />
          </Suspense>
        </div>

      </div>

      <NavBar tabs={MAIN_TABS} activeTab={activeMain} onTabChange={selectMain} raised={isAuthenticated} />
    </div>
  )
}
