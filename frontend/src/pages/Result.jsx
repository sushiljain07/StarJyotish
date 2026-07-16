// frontend/src/pages/Result.jsx
//
// Hub-and-spoke kundli navigation: one Overview (charts + grouped drill-in
// cards) and full-screen drill-ins with a Back affordance in the sticky bar
// — replaces the old two-level main-tab + sub-tab stack, and the page-level
// bottom NavBar that existed only because the underline tab row was hidden
// on mobile. There is deliberately NO persistent tab row of all sections:
// the nine surfaces don't belong to one frame; the Overview is the frame.
import { useState, lazy, Suspense } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/AuthContext'

import { StateBlock } from '../components/ui'
import KundliChart     from '../components/KundliChart'
import DashaTable      from '../components/DashaTable'
import PlanetTable     from '../components/PlanetTable'
import SegmentedToggle from '../components/SegmentedToggle'
import { formatDate, formatTime } from '../utils/format'
import { getTopic } from '../config/topics'
import TopicIcon from '../components/TopicIcon'
import Seo       from '../components/Seo'

const KPChart             = lazy(() => import('../components/KPChart'))
const DivisionalCharts    = lazy(() => import('../components/DivisionalCharts'))
const TransitPanel        = lazy(() => import('../components/TransitPanel'))
const KundliDownload      = lazy(() => import('../components/KundliDownload'))
const BhavaChalit         = lazy(() => import('../components/BhavaChalit'))
const AshtakavargaTable   = lazy(() => import('../components/AshtakavargaTable'))
const SarvatobhadraChakra = lazy(() => import('../components/SarvatobhadraChakra'))

function TabLoader() {
  return <StateBlock loading lines={5} className="max-w-lg mx-auto" />
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

// Every drill-in. `group` clusters the Overview cards so unrelated surfaces
// (birth-chart details vs deeper analysis vs export) don't share one frame.
const SECTIONS = [
  { id: 'planets',       label: 'Planets',       emoji: '🪐', group: 'birth',    desc: 'Sign, house, nakshatra & dignity of every planet' },
  { id: 'dasha',         label: 'Dasha',         emoji: '⏳', group: 'birth',    desc: 'Your Vimshottari planetary time cycles' },
  { id: 'transit',       label: 'Transit',       emoji: '🌗', group: 'birth',    desc: 'Where the planets are moving right now' },
  { id: 'divisional',    label: 'Life Areas',    emoji: '🧭', group: 'analysis', desc: 'Divisional charts for career, marriage & more' },
  { id: 'bhava',         label: 'Bhava Chalit',  emoji: '🏛️', group: 'analysis', desc: 'House-based chart of life circumstances' },
  { id: 'ashtakavarga',  label: 'Ashtakavarga',  emoji: '🔢', group: 'analysis', desc: 'Point-based strength of each sign & planet' },
  { id: 'sarvatobhadra', label: 'Sarvatobhadra', emoji: '✳️', group: 'analysis', desc: 'The all-direction chakra of nakshatra vedha' },
  { id: 'download',      label: 'Download',      emoji: '📄', group: 'export',   desc: 'Save your full kundli as a PDF report' },
]

const GROUPS = [
  { id: 'birth',    heading: 'Your birth chart, in detail' },
  { id: 'analysis', heading: 'Deeper analysis' },
  { id: 'export',   heading: 'Take it with you' },
]

const CHART_STYLES = [
  { id: 'north', label: 'North' },
  { id: 'kp',    label: 'KP' },
]

// Older callers (QuickAccess, ChartsStrip, PersonalHome, config/nav) still
// send the two-level activeTab/activeSubtab shape — map both levels onto
// the flat section list.
function resolveSection(tab, sub) {
  const byTab = { divisional: 'divisional', download: 'download', analysis: 'bhava', advanced: 'bhava' }
  if (byTab[tab]) return byTab[tab]
  const bySub = Object.fromEntries(SECTIONS.map(s => [s.id, s.id]))
  return bySub[sub] ?? 'overview'
}

function InfoBox({ heading, children }) {
  return (
    <div className="mb-4 rounded-xl px-4 py-3"
         style={{ background: '#171B33', border: '1px solid rgba(212,175,55,0.2)' }}>
      <p className="text-[10px] font-semibold uppercase tracking-widest mb-0.5"
         style={{ color: 'rgba(212,175,55,0.55)' }}>{heading}</p>
      <p className="text-xs leading-relaxed" style={{ color: 'rgba(232,220,200,0.65)' }}>{children}</p>
    </div>
  )
}

export default function Result() {
  const { t } = useTranslation()
  const { state } = useLocation()
  const navigate  = useNavigate()
  const { isAuthenticated } = useAuth()

  const homeDestination = isAuthenticated ? '/home' : '/'

  const initTab = state?.activeTab ?? 'birth_chart'
  const initSub = state?.activeSubtab ?? 'chart'

  const [section, setSection]       = useState(() => resolveSection(initTab, initSub))
  const [chartStyle, setChartStyle] = useState(initTab === 'kp' ? 'kp' : 'north')

  if (!state?.data) { navigate(homeDestination); return null }

  const { data, input, presetQuestion = null } = state
  const topic = getTopic(input.topic)

  function goto(id) {
    setSection(id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function renderBirthChart() {
    if (chartStyle === 'kp') {
      return (
        <Suspense fallback={<TabLoader />}>
          <KPChart input={input} />
        </Suspense>
      )
    }
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
    <div className="flex-1 flex flex-col">
      <Seo title="Your Kundli" description="Your personalized Vedic Kundli." path="/kundli" noindex />

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

          {/* Row 3 — drill-in context: back to the hub + where you are */}
          {section !== 'overview' && (
            <div className="border-t border-line/40 py-2 flex items-center gap-2">
              <button
                onClick={() => goto('overview')}
                className="shrink-0 inline-flex items-center gap-1 text-xs font-semibold text-primary-dark hover:text-primary transition"
              >
                ← {t('kundli_back_overview', 'Overview')}
              </button>
              <span className="text-ink-faint text-xs">/</span>
              <span className="text-xs font-semibold text-ink truncate">
                {SECTIONS.find(s => s.id === section)?.emoji}{' '}
                {SECTIONS.find(s => s.id === section)?.label}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Page content ────────────────────────────────────────────────── */}
      <div className="flex-1 max-w-5xl mx-auto w-full px-4 pt-6 pb-8 sm:pb-4">

        {/* ══ OVERVIEW ══ */}
        <div className={section === 'overview' ? 'tab-fade' : 'hidden'}>
          <SegmentedToggle label="Style" options={CHART_STYLES} active={chartStyle} onChange={setChartStyle} className="mb-4" />
          {renderBirthChart()}

          {/* Grouped drill-in cards */}
          {GROUPS.map(g => {
            const items = SECTIONS.filter(s => s.group === g.id)
            return (
              <div key={g.id} className="mt-8">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-ink-faint mb-2.5">{g.heading}</p>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {items.map(s => (
                    <button
                      key={s.id}
                      onClick={() => goto(s.id)}
                      className="text-left px-4 py-3 rounded-xl border transition-all hover:border-primary/60 hover:shadow-sm"
                      style={{ borderColor: '#EAE1CC', background: '#FFFDF8' }}
                    >
                      <span className="text-lg">{s.emoji}</span>
                      <p className="text-sm font-semibold text-ink mt-1">{s.label}</p>
                      <p className="text-xs text-ink-muted mt-0.5 leading-snug">{s.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            )
          })}

          <InsightsAskEntry />
        </div>

        {/* ══ DRILL-INS ══ */}
        <div className={section === 'planets' ? 'tab-fade' : 'hidden'}>
          <InfoBox heading="Planet Positions">
            Every planet&#39;s sign, house, nakshatra, and dignity at the moment of your birth.
            Retrograde (R) planets express their energy inward — more reflective, sometimes delayed, always deep.
          </InfoBox>
          <PlanetTable planets={data.planets} ascendant={data.ascendant} />
        </div>

        <div className={section === 'dasha' ? 'tab-fade' : 'hidden'}>
          <InfoBox heading="Vimshottari Dasha">
            Your life unfolds in planetary time cycles. Your active Mahadasha shapes the decade;
            Antardasha refines the year. The highlighted row is your present period.
          </InfoBox>
          <DashaTable dasha={data.dasha} />
        </div>

        <Suspense fallback={<TabLoader />}>
          <div className={section === 'transit' ? 'tab-fade' : 'hidden'}>
            <TransitPanel input={input} natalData={data} />
          </div>
        </Suspense>

        <div className={section === 'divisional' ? 'tab-fade' : 'hidden'}>
          <Suspense fallback={<TabLoader />}>
            <DivisionalCharts input={input} defaultDivision={topic?.division} />
          </Suspense>
        </div>

        <Suspense fallback={<TabLoader />}>
          <div className={section === 'bhava' ? 'tab-fade' : 'hidden'}>
            <BhavaChalit input={input} />
          </div>
          <div className={section === 'ashtakavarga' ? 'tab-fade' : 'hidden'}>
            <AshtakavargaTable input={input} />
          </div>
          <div className={section === 'sarvatobhadra' ? 'tab-fade' : 'hidden'}>
            <SarvatobhadraChakra natalPlanets={data.planets} transitPlanets={[]} />
          </div>
        </Suspense>

        <div className={section === 'download' ? 'tab-fade' : 'hidden'}>
          <Suspense fallback={<TabLoader />}>
            <KundliDownload data={data} input={input} />
          </Suspense>
        </div>

      </div>
    </div>
  )
}
