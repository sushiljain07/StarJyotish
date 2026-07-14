import { useState, lazy, Suspense } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/AuthContext'
import SiteHeader from '../components/SiteHeader'
import CompactFooter from '../components/CompactFooter'

import KundliChart     from '../components/KundliChart'
import DashaTable      from '../components/DashaTable'
import PlanetTable     from '../components/PlanetTable'
import NavBar          from '../components/NavBar'
import SegmentedToggle from '../components/SegmentedToggle'
import AnimatedTabRow  from '../components/AnimatedTabRow'
import { formatDate, formatTime } from '../utils/format'
import { getTopic } from '../config/topics'
import TopicIcon from '../components/TopicIcon'
import TabIcon   from '../components/TabIcon'
import Seo       from '../components/Seo'

const KPChart             = lazy(() => import('../components/KPChart'))
const DivisionalCharts    = lazy(() => import('../components/DivisionalCharts'))
const TransitPanel        = lazy(() => import('../components/TransitPanel'))
const KundliDownload      = lazy(() => import('../components/KundliDownload'))
const BhavaChalit         = lazy(() => import('../components/BhavaChalit'))
const AshtakavargaTable   = lazy(() => import('../components/AshtakavargaTable'))
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
  const md   = data.dasha.current_mahadasha
  return (
    <div className="flex gap-1.5 py-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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

const MAIN_TABS = [
  { id: 'birth_chart', label: 'Birth Chart', icon: '/starjyotish.svg' },
  { id: 'divisional',  label: 'Life Areas',  icon: 'insights' },
  { id: 'analysis',    label: 'Analysis',    icon: 'advanced' },
  { id: 'download',    label: 'Download',    icon: 'ask' },
]

const BIRTH_SUBTABS = [
  { id: 'chart',   label: 'Chart' },
  { id: 'planets', label: 'Planets' },
  { id: 'dasha',   label: 'Dasha' },
  { id: 'transit', label: 'Transit' },
]

const ANALYSIS_SUBTABS = [
  { id: 'bhava',         label: 'Bhava Chalit' },
  { id: 'ashtakavarga',  label: 'Ashtakavarga' },
  { id: 'sarvatobhadra', label: 'Sarvatobhadra' },
]

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
  const navigate  = useNavigate()
  const { isAuthenticated } = useAuth()

  const homeDestination = isAuthenticated ? '/home' : '/'

  const initTab = state?.activeTab ?? 'birth_chart'
  const initSub = state?.activeSubtab ?? 'chart'

  const legacyMainMap = {
    kundli: 'birth_chart', advanced: 'analysis',
    birth_chart: 'birth_chart', divisional: 'divisional',
    analysis: 'analysis', download: 'download',
  }
  const resolvedMain = legacyMainMap[initTab] ?? 'birth_chart'
  const legacyBirthMap = { birth_chart: 'chart', planets: 'planets', dasha: 'dasha', transit: 'transit' }
  const resolvedBirthSub = legacyBirthMap[initSub] ?? initSub

  const [activeMain, setActiveMain]         = useState(resolvedMain)
  const [activeBirthSub, setActiveBirthSub] = useState(
    ['chart','planets','dasha','transit'].includes(resolvedBirthSub) ? resolvedBirthSub : 'chart'
  )
  const [activeAnalysisSub, setActiveAnalysisSub] = useState('bhava')
  const [chartStyle, setChartStyle]               = useState('north')

  if (!state?.data) { navigate(homeDestination); return null }

  const { data, input, presetQuestion = null } = state
  const topic = getTopic(input.topic)

  function renderBirthChart() {
    if (chartStyle === 'north') {
      return (
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-start">
          <div className="w-full sm:w-[460px]">
            <KundliChart planets={data.planets} ascendant={data.ascendant}
                         navamsaPlanets={data.navamsa_planets}
                         title={t('tab_birth_chart', 'Lagna Chart')} />
          </div>
          <div className="w-full sm:w-[460px]">
            <KundliChart planets={data.navamsa_planets} ascendant={data.navamsa_ascendant}
                         title={t('tab_navamsa', 'Navamsa (D9)')} />
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
              <p className="text-sm font-semibold text-ink">Insights &amp; Reading</p>
              <p className="text-xs text-ink-muted">AI reading of your chart</p>
            </div>
          </div>
          <span className="text-xs font-semibold shrink-0 ml-2" style={{ color: '#D9A441' }}>Open →</span>
        </button>
        <button
          onClick={() => navigate('/ask', { state: { ...state, presetQuestion } })}
          className="flex-1 flex items-center justify-between px-4 py-3 rounded-xl border transition-all hover:border-primary/60"
          style={{ borderColor: '#EAE1CC', background: '#FFFDF8' }}
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">💬</span>
            <div className="text-left">
              <p className="text-sm font-semibold text-ink">Ask a Question</p>
              <p className="text-xs text-ink-muted">Timing, decisions, anything</p>
            </div>
          </div>
          <span className="text-xs font-semibold shrink-0 ml-2" style={{ color: '#D9A441' }}>Ask →</span>
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-parchment flex flex-col">
      <Seo title="Your Kundli" description="Your personalized Vedic Kundli." path="/kundli" noindex />

      <SiteHeader />
      {/* Spacer so content clears the fixed 60 px header */}
      <div className="h-[60px] shrink-0" />

      {/* ── Sticky context bar ──────────────────────────────────────────── */}
      <div className="bg-parchment-card border-b border-line sticky top-[60px] z-30">
        <div className="max-w-5xl mx-auto px-4">

          {/* Row 1 — identity */}
          <div className="flex items-center justify-between py-2.5 gap-3">
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
          <div className="border-t border-line/40 pt-1">
            <AnimatedTabRow
              tabs={MAIN_TABS}
              active={activeMain}
              onChange={setActiveMain}
              renderIcon={tab => tab.icon.startsWith('/')
                ? <img src={tab.icon} alt="" className="w-4 h-4 object-contain" />
                : <TabIcon id={tab.icon} className="w-4 h-4" />}
            />
          </div>

          {/* Row 4 — sub-tabs (only when the active main tab has them) */}
          {(activeMain === 'birth_chart' || activeMain === 'analysis') && (
            <div className="border-t border-line/40 py-2">
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

      {/* ── Page content ────────────────────────────────────────────────── */}
      <div className="flex-1 max-w-5xl mx-auto w-full px-4 pt-6 pb-24 sm:pb-4">

        {/* ══ BIRTH CHART ══ */}
        <div className={activeMain === 'birth_chart' ? 'tab-fade' : 'hidden'}>

          <div className={activeBirthSub === 'chart' ? 'tab-fade' : 'hidden'}>
            <SegmentedToggle label="Style" options={CHART_STYLES} active={chartStyle} onChange={setChartStyle} className="mb-4" />
            {renderBirthChart()}
            <InsightsAskEntry />
          </div>

          <div className={activeBirthSub === 'planets' ? 'tab-fade' : 'hidden'}>
            <div className="mb-4 rounded-xl px-4 py-3"
                 style={{ background: '#171B33', border: '1px solid rgba(212,175,55,0.2)' }}>
              <p className="text-[10px] font-semibold uppercase tracking-widest mb-0.5"
                 style={{ color: 'rgba(212,175,55,0.55)' }}>Planet Positions</p>
              <p className="text-xs leading-relaxed" style={{ color: 'rgba(232,220,200,0.65)' }}>
                Every planet&#39;s sign, house, nakshatra, and dignity at the moment of your birth.
                Retrograde (R) planets express their energy inward — more reflective, sometimes delayed, always deep.
              </p>
            </div>
            <PlanetTable planets={data.planets} ascendant={data.ascendant} />
          </div>

          <div className={activeBirthSub === 'dasha' ? 'tab-fade' : 'hidden'}>
            <div className="mb-4 rounded-xl px-4 py-3"
                 style={{ background: '#171B33', border: '1px solid rgba(212,175,55,0.2)' }}>
              <p className="text-[10px] font-semibold uppercase tracking-widest mb-0.5"
                 style={{ color: 'rgba(212,175,55,0.55)' }}>Vimshottari Dasha</p>
              <p className="text-xs leading-relaxed" style={{ color: 'rgba(232,220,200,0.65)' }}>
                Your life unfolds in planetary time cycles. Your active Mahadasha shapes the decade;
                Antardasha refines the year. The highlighted row is your present period.
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

      <CompactFooter />
      <NavBar tabs={MAIN_TABS} activeTab={activeMain} onTabChange={setActiveMain} />
    </div>
  )
}
