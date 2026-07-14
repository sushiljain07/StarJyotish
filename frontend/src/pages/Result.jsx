import { useState, lazy, Suspense, useRef, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/AuthContext'
import SiteHeader from '../components/SiteHeader'
import CompactFooter from '../components/CompactFooter'

// ── Eager imports ─────────────────────────────────────────────────────────────
import KundliChart     from '../components/KundliChart'
import DashaTable      from '../components/DashaTable'
import PlanetTable     from '../components/PlanetTable'
import NavBar          from '../components/NavBar'
import SegmentedToggle from '../components/SegmentedToggle'
import AnimatedTabRow  from '../components/AnimatedTabRow'
import { formatDate, formatTime } from '../utils/format'
import { getTopic } from '../config/topics'
import ChartHighlight from '../components/ChartHighlight'
import TopicIcon from '../components/TopicIcon'
import TabIcon   from '../components/TabIcon'
import Seo       from '../components/Seo'

// ── Lazy imports ──────────────────────────────────────────────────────────────
const KPChart            = lazy(() => import('../components/KPChart'))
const DivisionalCharts   = lazy(() => import('../components/DivisionalCharts'))
const TransitPanel       = lazy(() => import('../components/TransitPanel'))
const KundliDownload     = lazy(() => import('../components/KundliDownload'))
const BhavaChalit        = lazy(() => import('../components/BhavaChalit'))
const AshtakavargaTable  = lazy(() => import('../components/AshtakavargaTable'))
const SarvatobhadraChakra = lazy(() => import('../components/SarvatobhadraChakra'))

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

function SummaryChips({ data }) {
  const moon = data.planets.find(p => p.name === 'Moon')
  const md = data.dasha.current_mahadasha
  return (
    <div className="flex gap-1.5 py-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <span className="shrink-0 bg-primary-light text-primary-dark text-xs font-semibold px-3 py-1 rounded-full">
        Lagna: {data.ascendant.sign}
      </span>
      {moon && (
        <span className="shrink-0 bg-mauve-light text-mauve text-xs font-semibold px-3 py-1 rounded-full">
          Rashi: {moon.sign}
        </span>
      )}
      <span className="shrink-0 bg-vermillion-light text-vermillion text-xs font-semibold px-3 py-1 rounded-full">
        Mahadasha: {md.planet}
      </span>
    </div>
  )
}

// ── Tab structure ─────────────────────────────────────────────────────────────
// 4 main tabs that map to the 4 facets of the Kundli experience.
// Insights and Ask have been promoted to their own pages (/insights, /ask)
// so this page is purely the chart — the data layer.
function mainTabs(t) {
  return [
    { id: 'birth_chart', label: 'Birth Chart',    icon: '/starjyotish.svg' },
    { id: 'divisional',  label: 'Life Areas',     icon: 'insights' },
    { id: 'analysis',    label: 'Analysis',       icon: 'advanced' },
    { id: 'download',    label: 'Download',       icon: 'ask' },
  ]
}

// Birth Chart sub-tabs
function birthSubtabs() {
  return [
    { id: 'chart',   label: 'Chart' },
    { id: 'planets', label: 'Planets' },
    { id: 'dasha',   label: 'Dasha' },
    { id: 'transit', label: 'Transit' },
  ]
}

// Analysis sub-tabs (was "Advanced") — renamed to be descriptive
function analysisSubtabs() {
  return [
    { id: 'bhava',         label: 'Bhava Chalit' },
    { id: 'ashtakavarga',  label: 'Ashtakavarga' },
    { id: 'sarvatobhadra', label: 'Sarvatobhadra' },
  ]
}

const CHART_STYLES = [
  { id: 'north', label: 'North' },
  { id: 'kp',    label: 'KP' },
]

function SubTabBar({ subtabs, active, onChange, accent = 'primary' }) {
  return <AnimatedTabRow tabs={subtabs} active={active} onChange={onChange} variant="pill" accent={accent} />
}

export default function Result() {
  const { t } = useTranslation()
  const { state } = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  const homeDestination = isAuthenticated ? '/home' : '/'

  // Support deep-links from PersonalHome
  const landToAsk      = Boolean(state?.landToAsk || state?.presetQuestion)
  const initTab        = state?.activeTab    ?? 'birth_chart'
  const initBirthSub   = state?.activeSubtab ?? 'chart'

  // Map legacy subtab ids from old nav to new structure
  const legacyBirthMap = { birth_chart: 'chart', planets: 'planets', dasha: 'dasha', transit: 'transit' }
  const resolvedBirthSub = legacyBirthMap[initBirthSub] ?? initBirthSub

  // Map legacy main tabs — if someone lands on 'insights' or 'ask', redirect
  const legacyMainMap = {
    kundli: 'birth_chart',
    advanced: 'analysis',
    birth_chart: 'birth_chart',
    divisional: 'divisional',
    analysis: 'analysis',
    download: 'download',
  }
  const resolvedMain = legacyMainMap[initTab] ?? 'birth_chart'

  const [activeMain, setActiveMain]         = useState(resolvedMain)
  const [activeBirthSub, setActiveBirthSub] = useState(
    ['chart','planets','dasha','transit'].includes(resolvedBirthSub) ? resolvedBirthSub : 'chart'
  )
  const [activeAnalysisSub, setActiveAnalysisSub] = useState('bhava')
  const [chartStyle, setChartStyle]               = useState('north')

  // Sticky bar measurement
  const stickyRef = useRef(null)
  const [stickyH, setStickyH] = useState(0)
  useEffect(() => {
    if (!stickyRef.current) return
    const ro = new ResizeObserver(entries => setStickyH(entries[0].contentRect.height))
    ro.observe(stickyRef.current)
    return () => ro.disconnect()
  }, [])

  // Redirect to /insights or /ask if landed there via legacy links
  useEffect(() => {
    if (initTab === 'insights' || initTab === 'ask') {
      const dest = initTab === 'ask' ? '/ask' : '/insights'
      navigate(dest, { state, replace: true })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (!state?.data) {
    navigate(homeDestination)
    return null
  }

  const { data, input, presetQuestion = null } = state
  const topic = getTopic(input.topic)

  const MAIN_TABS      = mainTabs(t)
  const BIRTH_SUBTABS  = birthSubtabs()
  const ANALYSIS_SUBTABS = analysisSubtabs()

  function renderBirthChart() {
    if (chartStyle === 'north') {
      return (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-start">
            <div className="w-full sm:w-[460px] space-y-1">
              <KundliChart planets={data.planets} ascendant={data.ascendant}
                           navamsaPlanets={data.navamsa_planets}
                           title={t('tab_birth_chart', 'Lagna Chart')} />
              <ChartHighlight input={input} chartType="D1" autoLoad />
            </div>
            <div className="w-full sm:w-[460px] space-y-1">
              <KundliChart planets={data.navamsa_planets} ascendant={data.navamsa_ascendant}
                           title={t('tab_navamsa', 'Navamsa (D9)')} />
              <ChartHighlight input={input} chartType="D9" />
            </div>
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

  // ── Insight & Ask entry points rendered as CTA cards ─────────────────────
  function InsightsAskEntry() {
    return (
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => navigate('/insights', { state })}
          className="group text-left rounded-2xl p-5 transition-all duration-200"
          style={{ background: '#171B33', border: '1px solid rgba(212,175,55,0.2)' }}
        >
          <div className="text-2xl mb-2">✨</div>
          <h3 className="font-serif font-bold text-base mb-1" style={{ color: '#E8DCC8' }}>
            Insights & Reading
          </h3>
          <p className="text-xs leading-relaxed mb-3" style={{ color: 'rgba(232,220,200,0.55)' }}>
            AI-powered reading of your chart — career, relationships, wealth and more.
          </p>
          <span className="text-xs font-semibold" style={{ color: '#D4AF37' }}>
            Open Insights →
          </span>
        </button>

        <button
          onClick={() => navigate('/ask', { state: { ...state, presetQuestion } })}
          className="group text-left rounded-2xl p-5 transition-all duration-200"
          style={{ background: '#171B33', border: '1px solid rgba(212,175,55,0.2)' }}
        >
          <div className="text-2xl mb-2">💬</div>
          <h3 className="font-serif font-bold text-base mb-1" style={{ color: '#E8DCC8' }}>
            Ask a Question
          </h3>
          <p className="text-xs leading-relaxed mb-3" style={{ color: 'rgba(232,220,200,0.55)' }}>
            Ask anything about your chart — timing, decisions, relationships.
          </p>
          <span className="text-xs font-semibold" style={{ color: '#D4AF37' }}>
            Start Asking →
          </span>
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-parchment flex flex-col">
      <Seo title="Your Kundli" description="Your personalized Vedic Kundli and AI reading." path="/kundli" noindex />

      <SiteHeader />

      {/* ── Sticky context bar ──────────────────────────────────────────── */}
      <div ref={stickyRef} className="bg-parchment-card border-b border-line sticky top-[60px] z-30">
        <div className="max-w-5xl mx-auto px-4">

          {/* Row 1 — identity */}
          <div className="flex items-center justify-between py-1.5 gap-3">
            <div className="min-w-0 flex items-center gap-2 overflow-hidden">
              {input.name && (
                <span className="font-bold text-sm text-ink leading-none truncate">{input.name}</span>
              )}
              <span className="text-ink-faint text-xs leading-none hidden sm:inline shrink-0">·</span>
              <span className="text-ink-faint text-xs leading-none hidden sm:inline truncate">
                {formatDate(input.date)} · {formatTime(input.time)}
              </span>
              {topic && (
                <span className="hidden sm:inline-flex shrink-0 items-center gap-1 bg-primary-light text-primary-dark rounded-full px-2 py-0.5 text-[11px] font-medium">
                  <TopicIcon id={topic.id} className="w-3 h-3" /> {t(`landing_topic_${topic.id}_label`)}
                </span>
              )}
            </div>
            <button
              onClick={() => navigate(homeDestination)}
              className="shrink-0 bg-night hover:bg-night-light text-ink-onnight text-xs font-semibold px-3 py-1.5 rounded-full transition"
            >
              {t('nav_back_home', 'Home')}
            </button>
          </div>

          {/* Row 2 — chips */}
          <SummaryChips data={data} />

          {/* Row 3 — main tabs */}
          <AnimatedTabRow
            tabs={MAIN_TABS}
            active={activeMain}
            onChange={setActiveMain}
            renderIcon={tab => tab.icon.startsWith('/')
              ? <img src={tab.icon} alt="" className="w-4 h-4 object-contain" />
              : <TabIcon id={tab.icon} className="w-4 h-4" />}
          />

          {/* Row 4 — sub-tabs */}
          {(activeMain === 'birth_chart' || activeMain === 'analysis') && (
            <div className="border-t border-line/50 py-1.5">
              {activeMain === 'birth_chart' && (
                <SubTabBar subtabs={BIRTH_SUBTABS} active={activeBirthSub} onChange={setActiveBirthSub} />
              )}
              {activeMain === 'analysis' && (
                <SubTabBar subtabs={ANALYSIS_SUBTABS} active={activeAnalysisSub} onChange={setActiveAnalysisSub} accent="sage" />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div
        className="flex-1 max-w-5xl mx-auto w-full px-4 pb-24 sm:pb-4"
        style={{ paddingTop: stickyH > 0 ? `${60 + stickyH + 16}px` : '200px' }}
      >

        {/* ══════════ BIRTH CHART ══════════ */}
        <div className={activeMain === 'birth_chart' ? 'tab-fade' : 'hidden'}>

          <div className={activeBirthSub === 'chart' ? 'tab-fade' : 'hidden'}>
            <SegmentedToggle label="Style" options={CHART_STYLES} active={chartStyle} onChange={setChartStyle} className="mb-4" />
            {renderBirthChart()}
            <InsightsAskEntry />
          </div>

          <div className={activeBirthSub === 'planets' ? 'tab-fade' : 'hidden'}>
            <div className="mb-4 relative overflow-hidden rounded-xl px-4 py-3"
                 style={{ background: '#171B33', border: '1px solid rgba(212,175,55,0.2)' }}>
              <p className="text-[10px] font-semibold uppercase tracking-widest mb-0.5"
                 style={{ color: 'rgba(212,175,55,0.55)' }}>Planet Positions</p>
              <p className="text-xs leading-relaxed" style={{ color: 'rgba(232,220,200,0.65)' }}>
                Every planet's sign, house, nakshatra, and dignity at the moment of your birth.
                Retrograde (R) planets express their energy inward — more reflective, sometimes delayed, always deep.
              </p>
            </div>
            <PlanetTable planets={data.planets} ascendant={data.ascendant} />
          </div>

          <div className={activeBirthSub === 'dasha' ? 'tab-fade' : 'hidden'}>
            <div className="mb-4 relative overflow-hidden rounded-xl px-4 py-3"
                 style={{ background: '#171B33', border: '1px solid rgba(212,175,55,0.2)' }}>
              <p className="text-[10px] font-semibold uppercase tracking-widest mb-0.5"
                 style={{ color: 'rgba(212,175,55,0.55)' }}>Vimshottari Dasha</p>
              <p className="text-xs leading-relaxed" style={{ color: 'rgba(232,220,200,0.65)' }}>
                Your life unfolds in planetary time cycles called Dashas — each ruled by a planet whose themes
                dominate that period. Your active Mahadasha shapes the decade; Antardasha refines the year.
                The highlighted row is your present period.
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

        {/* ══════════ LIFE AREAS (DIVISIONAL) ══════════ */}
        <div className={activeMain === 'divisional' ? 'tab-fade' : 'hidden'}>
          <Suspense fallback={<TabLoader />}>
            <DivisionalCharts input={input} defaultDivision={topic?.division} />
          </Suspense>
        </div>

        {/* ══════════ ANALYSIS (was ADVANCED) ══════════ */}
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

        {/* ══════════ DOWNLOAD ══════════ */}
        <div className={activeMain === 'download' ? 'tab-fade' : 'hidden'}>
          <Suspense fallback={<TabLoader />}>
            <KundliDownload data={data} input={input} />
          </Suspense>
        </div>

      </div>

      <CompactFooter />
      <NavBar tabs={MAIN_TABS} activeTab={activeMain} onTabChange={setActiveMain} />
    </div>
  )
}
