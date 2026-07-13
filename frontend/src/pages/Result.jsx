import { useState, lazy, Suspense } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/AuthContext'
import SiteHeader from '../components/SiteHeader'
import CompactFooter from '../components/CompactFooter'

// ── Eager imports ────────────────────────────────────────────────────────────
// Components the user sees immediately on first render (birth chart tab).
// Everything else is lazy so the initial JS bundle the landing page downloads
// doesn't include 2,700+ lines of chart/AI/report code nobody has asked for yet.
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

// ── Lazy imports ─────────────────────────────────────────────────────────────
// Loaded on first access of the tab that needs them. Vite automatically splits
// each of these into a separate chunk, so a user who only ever looks at the
// birth chart and planets never downloads the AI reading or advanced chart code.
const KPChart            = lazy(() => import('../components/KPChart'))
const DivisionalCharts   = lazy(() => import('../components/DivisionalCharts'))
const TransitPanel       = lazy(() => import('../components/TransitPanel'))
const KundliDownload     = lazy(() => import('../components/KundliDownload'))
const BhavaChalit        = lazy(() => import('../components/BhavaChalit'))
const AshtakavargaTable  = lazy(() => import('../components/AshtakavargaTable'))
const SarvatobhadraChakra = lazy(() => import('../components/SarvatobhadraChakra'))
const ChartReading       = lazy(() => import('../components/ChartReading'))
const AskChart           = lazy(() => import('../components/AskChart'))
const RajyogasTab        = lazy(() => import('../components/RajyogasTab'))
const CareerReportTab    = lazy(() => import('../components/CareerReportTab'))
const TopicReportTab     = lazy(() => import('../components/TopicReportTab'))

// ── Suspense fallback ────────────────────────────────────────────────────────
// Matches the existing spinner aesthetic used elsewhere in the app
// (rotating planet emoji + pulsing progress bar in ChartReading.jsx /
// CareerReport.jsx) so tab transitions feel intentional, not broken.
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
    <div className="flex flex-wrap gap-2 py-2">
      <span className="bg-primary-light text-primary-dark text-xs font-semibold px-3 py-1 rounded-full">
        Lagna: {data.ascendant.sign}
      </span>
      {moon && (
        <span className="bg-mauve-light text-mauve text-xs font-semibold px-3 py-1 rounded-full">
          Rashi: {moon.sign}
        </span>
      )}
      <span className="bg-vermillion-light text-vermillion text-xs font-semibold px-3 py-1 rounded-full">
        Mahadasha: {md.planet}
      </span>
    </div>
  )
}

// ── Top-level structure ──────────────────────────────────────────────────
// 4 main tabs — Kundli (everyday essentials), Advanced (specialist
// techniques most casual users won't recognize), Insights (Reading +
// whatever's relevant to the chosen topic), Ask (standalone, always).
// All 4 fit the mobile bottom nav directly; no overflow/"More" sheet needed.

function mainTabs(t) {
  return [
    { id: 'kundli',   label: t('nav_kundli'),   icon: '/starjyotish.svg' },
    { id: 'advanced', label: t('nav_advanced'), icon: 'advanced' },
    { id: 'insights', label: t('tab_reading'),  icon: 'insights' },
    { id: 'ask',      label: t('tab_ask'),      icon: 'ask' },
  ]
}

// Kundli — the things any visitor immediately recognizes and wants on day
// one. Same regardless of topic.
function kundliSubtabs(t) {
  return [
    { id: 'birth_chart', label: t('tab_birth_chart') },
    { id: 'divisional',  label: t('nav_divisional') },
    { id: 'planets',     label: t('tab_planets') },
    { id: 'dasha',       label: t('tab_dasha') },
    { id: 'transit',     label: t('nav_transit') },
    { id: 'download',    label: t('nav_download') },
  ]
}

// Advanced — specialist Vedic techniques most casual users won't know what
// to do with on day one; given their own home rather than cluttering Kundli.
function advancedSubtabs(t) {
  return [
    { id: 'bhava',         label: t('nav_bhava') },
    { id: 'ashtakavarga',  label: t('nav_ashtakavarga') },
    { id: 'sarvatobhadra', label: t('nav_sarvatobhadra') },
  ]
}

// Insights' sub-tabs depend on topic: Career gets Rajyogas + the Career
// Report alongside Reading (they serve different purposes); every other
// topic gets Reading + its one dedicated snapshot page; no topic at all
// gets just Reading.
function insightSubtabs(t, topicId) {
  const reading = { id: 'reading', label: t('nav_reading') }
  if (topicId === 'career') {
    return [reading, { id: 'rajyogas', label: t('nav_rajyogas') }, { id: 'career', label: t('nav_career') }]
  }
  if (topicId === 'health' || topicId === 'relationship' || topicId === 'finance') {
    return [reading, { id: topicId, label: t(`nav_${topicId}`) }]
  }
  return [reading]
}

const CHART_STYLES = [
  { id: 'north', label: 'North' },
  { id: 'kp',    label: 'KP' },
]

// Navigation pills — bold, filled, used for "which view am I looking at."
function SubTabBar({ subtabs, active, onChange, accent = 'primary' }) {
  return <AnimatedTabRow tabs={subtabs} active={active} onChange={onChange} variant="pill" accent={accent} />
}

// Deliberately distinct from SubTabBar — a small labeled segmented control
// for "how should the current view render," not "which view." Shares
// SubTabBar's filled-pill look (see SegmentedToggle.jsx for why), just with
// fewer, denser options.

export default function Result() {
  const { t } = useTranslation()
  const { state } = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  // Where "go back to where I came from" means for this visitor — their
  // own workspace if they're signed in, the marketing page otherwise.
  // Used both by the missing-state guard right below (a stale link or a
  // hard refresh loses router state entirely) and by the header's own
  // logo/back link further down, so the two can never disagree.
  const homeDestination = isAuthenticated ? '/home' : '/'

  // Carried over from the landing page's AI persona spotlight (see
  // Landing.jsx → Home.jsx) — read straight off the raw location state,
  // before the early-return guard below, since it has to seed the initial
  // tab and hook initializers must run unconditionally on every render.
  const landToAsk = Boolean(state?.landToAsk || state?.presetQuestion)
  // activeTab/activeSubtab: passed from PersonalHome's "deep dive" links so
  // the user lands directly on the right section (e.g. Dasha, Planets, Rajyogas).
  const initTab    = state?.activeTab    ?? (landToAsk ? 'ask' : 'kundli')
  const initSub    = state?.activeSubtab ?? 'birth_chart'

  const [activeMain, setActiveMain]           = useState(initTab)
  const [activeKundliSub, setActiveKundliSub] = useState(
    ['birth_chart','divisional','planets','dasha','transit','download'].includes(initSub) ? initSub : 'birth_chart'
  )
  const [activeAdvancedSub, setActiveAdvancedSub] = useState('bhava')
  // 'health'/'relationship'/'finance' are valid activeInsightSub values
  // whenever input.topic matches (see the topicId-gated tabs below) — they
  // were missing from this whitelist, so a deep-link straight to e.g. the
  // Wealth report silently fell back to 'reading' instead. Kundli's own
  // subtab whitelist above already lists every valid id explicitly, this
  // just matches that pattern for Insights.
  const [activeInsightSub, setActiveInsightSub]   = useState(
    ['reading', 'rajyogas', 'career', 'health', 'relationship', 'finance'].includes(initSub) ? initSub : 'reading'
  )
  const [chartStyle, setChartStyle] = useState('north')


  if (!state?.data) {
    navigate(homeDestination)
    return null
  }

  const { data, input, presetQuestion = null } = state
  const topic = getTopic(input.topic)
  const topicId = topic?.id ?? null

  const MAIN_TABS = mainTabs(t)
  const KUNDLI_SUBTABS = kundliSubtabs(t)
  const ADVANCED_SUBTABS = advancedSubtabs(t)
  const INSIGHT_SUBTABS = insightSubtabs(t, topicId)

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

  return (
    <div className="min-h-screen bg-parchment flex flex-col">
      {/* This route only ever renders with data handed off from Home.jsx's
          router state (see the early-return guard above) — there's no
          canonical, shareable URL for a search engine to land on, so it's
          excluded from indexing rather than given a generic/misleading
          title+description that wouldn't match what a crawler would
          actually see. */}
      <Seo title="Your Kundli" description="Your personalized Vedic Kundli and AI reading." path="/kundli" noindex />

      {/* Shared brand header — same as every other page */}
      <SiteHeader />

      {/* Chart context bar — deliberately different background from the brand
          SiteHeader above (bg-night-light vs bg-night) so the two layers read
          as distinct: the top bar is the app, this bar is the chart. */}
      <div className="bg-parchment-card border-b border-line sticky top-[52px] z-30">
        <div className="max-w-5xl mx-auto px-4">
          {/* Identity row: person details + Home button */}
          <div className="flex items-center justify-between py-2.5 gap-3">
            <div className="min-w-0">
              {input.name && (
                <div className="font-bold text-sm text-ink leading-tight truncate">{input.name}</div>
              )}
              <div className="text-ink-muted text-xs leading-tight truncate">
                {input.place}
              </div>
              <div className="text-ink-faint text-xs flex items-center gap-2 flex-wrap mt-0.5">
                {formatDate(input.date)} · {formatTime(input.time)}
                {topic && (
                  <span className="inline-flex items-center gap-1 bg-primary-light text-primary-dark rounded-full px-2 py-0.5 text-[11px] font-medium">
                    <TopicIcon id={topic.id} className="w-3 h-3" /> {t('focused_on')}: {t(`landing_topic_${topic.id}_label`)}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => navigate(homeDestination)}
              className="shrink-0 bg-night hover:bg-night-light text-ink-onnight text-xs font-semibold px-3 py-1.5 rounded-full transition"
            >
              {t('nav_back_home', 'Home')}
            </button>
          </div>
          {/* Lagna/Rashi/Mahadasha chips — moved inside context bar so they're always visible */}
          <SummaryChips data={data} />
          {/* Tab bar — desktop only */}
          <AnimatedTabRow
            tabs={MAIN_TABS}
            active={activeMain}
            onChange={setActiveMain}
            renderIcon={tab => tab.icon.startsWith('/')
              ? <img src={tab.icon} alt="" className="w-4 h-4 object-contain" />
              : <TabIcon id={tab.icon} className="w-4 h-4" />}
          />
          {/* Sub-tab pill row — always in sticky bar so it's never hidden under it.
              Shown only when the active main tab has sub-tabs to display.
              Thin top border visually separates pill row from main tab row. */}
          {(activeMain === 'kundli' || activeMain === 'advanced' || (activeMain === 'insights' && INSIGHT_SUBTABS.length > 1)) && (
            <div className="border-t border-line/60 pt-2 pb-2">
              {activeMain === 'kundli' && (
                <SubTabBar subtabs={KUNDLI_SUBTABS} active={activeKundliSub} onChange={setActiveKundliSub} />
              )}
              {activeMain === 'advanced' && (
                <SubTabBar subtabs={ADVANCED_SUBTABS} active={activeAdvancedSub} onChange={setActiveAdvancedSub} accent="sage" />
              )}
              {activeMain === 'insights' && (
                <SubTabBar subtabs={INSIGHT_SUBTABS} active={activeInsightSub} onChange={setActiveInsightSub} accent="mauve" />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-4 pb-24 sm:pb-4">

        {/* ══════════════ KUNDLI ══════════════ */}
        <div className={activeMain === 'kundli' ? 'tab-fade' : 'hidden'}>

          <div className={activeKundliSub === 'birth_chart' ? 'tab-fade' : 'hidden'}>
            <SegmentedToggle label="Style" options={CHART_STYLES} active={chartStyle} onChange={setChartStyle} className="mb-4" />
            {renderBirthChart()}
          </div>

          <div className={activeKundliSub === 'planets' ? 'tab-fade' : 'hidden'}>
            <PlanetTable planets={data.planets} ascendant={data.ascendant} />
          </div>

          <div className={activeKundliSub === 'dasha' ? 'tab-fade' : 'hidden'}>
            <DashaTable dasha={data.dasha} />
          </div>

          {/* Lazy sub-tabs — loaded on first access */}
          <Suspense fallback={<TabLoader />}>
            <div className={activeKundliSub === 'divisional' ? 'tab-fade' : 'hidden'}>
              <DivisionalCharts input={input} defaultDivision={topic?.division} />
            </div>

            <div className={activeKundliSub === 'transit' ? 'tab-fade' : 'hidden'}>
              <TransitPanel input={input} natalData={data} />
            </div>

            <div className={activeKundliSub === 'download' ? 'tab-fade' : 'hidden'}>
              <KundliDownload data={data} input={input} />
            </div>
          </Suspense>
        </div>

        {/* ══════════════ ADVANCED ══════════════ */}
        <div className={activeMain === 'advanced' ? 'tab-fade' : 'hidden'}>

          <Suspense fallback={<TabLoader />}>
            <div className={activeAdvancedSub === 'bhava' ? 'tab-fade' : 'hidden'}>
              <BhavaChalit input={input} />
            </div>

            <div className={activeAdvancedSub === 'ashtakavarga' ? 'tab-fade' : 'hidden'}>
              <AshtakavargaTable input={input} />
            </div>

            <div className={activeAdvancedSub === 'sarvatobhadra' ? 'tab-fade' : 'hidden'}>
              {/* Note: pre-existing gap, not introduced here — natal-only view
                  until something actually feeds live transit data in. */}
              <SarvatobhadraChakra natalPlanets={data.planets} transitPlanets={[]} />
            </div>
          </Suspense>
        </div>

        {/* ══════════════ INSIGHTS ══════════════ */}
        <div className={activeMain === 'insights' ? 'tab-fade' : 'hidden'}>

          <Suspense fallback={<TabLoader />}>
            <div className={activeInsightSub === 'reading' ? 'tab-fade' : 'hidden'}>
              <ChartReading input={input} onSwitchToCareer={() => setActiveInsightSub('career')} />
            </div>

            <div className={activeInsightSub === 'rajyogas' ? 'tab-fade' : 'hidden'}>
              <RajyogasTab input={input} />
            </div>

            <div className={activeInsightSub === 'career' ? 'tab-fade' : 'hidden'}>
              <CareerReportTab input={input} />
            </div>

            {(topicId === 'relationship' || topicId === 'finance' || topicId === 'health') && (
              <div className={activeInsightSub === topicId ? 'tab-fade' : 'hidden'}>
                <TopicReportTab topic={topicId} input={input} />
              </div>
            )}
          </Suspense>
        </div>

        {/* ══════════════ ASK ══════════════ */}
        <div className={activeMain === 'ask' ? 'tab-fade' : 'hidden'}>
          <Suspense fallback={<TabLoader />}>
            <AskChart input={input} initialQuestion={presetQuestion} />
          </Suspense>
        </div>

      </div>

      {/* CompactFooter sits above the mobile NavBar — desktop users see it
          at the natural scroll end; mobile users see it above the tab bar.
          pb-16 on the content div (already present for NavBar clearance)
          ensures it isn't obscured on small screens. */}
      <CompactFooter />
      <NavBar tabs={MAIN_TABS} activeTab={activeMain} onTabChange={setActiveMain} />
    </div>
  )
}
