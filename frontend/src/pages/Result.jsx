import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import KundliChart        from '../components/KundliChart'
import DashaTable         from '../components/DashaTable'
import PlanetTable        from '../components/PlanetTable'
import ChartReading       from '../components/ChartReading'
import AskChart           from '../components/AskChart'
import NavBar             from '../components/NavBar'
import DivisionalCharts   from '../components/DivisionalCharts'
import TransitPanel       from '../components/TransitPanel'
import KPChart            from '../components/KPChart'
import AshtakavargaTable  from '../components/AshtakavargaTable'
import SarvatobhadraChakra from '../components/SarvatobhadraChakra'
import BhavaChality       from '../components/BhavaChality'
import KundliDownload     from '../components/KundliDownload'
import CareerReportTab   from '../components/CareerReportTab'
import RajyogasTab       from '../components/RajyogasTab'

function formatDate(dateStr) {
  const [y, m, d] = dateStr.split('-')
  return `${d}-${m}-${y}`
}
function formatTime(timeStr) {
  const [hStr, min] = timeStr.split(':')
  let h = parseInt(hStr, 10)
  const ampm = h >= 12 ? 'PM' : 'AM'
  if (h === 0) h = 12
  else if (h > 12) h -= 12
  return `${h}:${min} ${ampm}`
}

function SummaryChips({ data }) {
  const moon = data.planets.find(p => p.name === 'Moon')
  const md = data.dasha.current_mahadasha
  return (
    <div className="flex flex-wrap gap-2 px-4 py-2 bg-white border-b border-slate-100">
      <span className="bg-indigo-50 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full">
        Lagna: {data.ascendant.sign}
      </span>
      {moon && (
        <span className="bg-pink-50 text-pink-700 text-xs font-semibold px-3 py-1 rounded-full">
          Rashi: {moon.sign}
        </span>
      )}
      <span className="bg-amber-50 text-amber-700 text-xs font-semibold px-3 py-1 rounded-full">
        Mahadasha: {md.planet}
      </span>
    </div>
  )
}

// ── Main tab list ──
// `primary: true` tabs appear directly in the mobile bottom nav (in this
// array's order); the rest live behind its "More" sheet. Desktop's
// horizontal tab bar shows all of them in this order, unaffected by the flag.
const TABS = [
  { id: 'birth_chart', label: 'Kundli',     icon: '/astroguru.svg', primary: true },
  { id: 'divisional',  label: 'Divisional',  icon: '📊' },
  { id: 'transit',     label: 'Transit',     icon: '🌍' },
  { id: 'special',     label: 'Special',     icon: '✨' },
  { id: 'dasha',       label: 'Dasha',       icon: '⏳', primary: true },
  { id: 'planets',     label: 'Planets',     icon: '🌟' },
  { id: 'reading',     label: 'Reading',     icon: '📖', primary: true },
  { id: 'ask',         label: 'Ask',         icon: '💬', primary: true },
  { id: 'rajyogas',    label: 'Rajyogas',    icon: '👑' },
  { id: 'career',      label: 'Career',      icon: '💼' },
  { id: 'download',    label: 'Download',    icon: '⬇️' },
]

// Chart style options
const CHART_STYLES = [
  { id: 'north', label: 'North Indian' },
  { id: 'kp',    label: 'KP Chart' },
]

// Special sub-tabs
const SPECIAL_TABS = [
  { id: 'bhava',       label: 'Bhava Chalit' },
  { id: 'ashtaka',     label: 'Ashtakavarga' },
  { id: 'sarvatobhadra', label: 'Sarvatobhadra' },
]

export default function Result() {
  const { t } = useTranslation()
  const { state } = useLocation()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState('birth_chart')
  const [chartStyle, setChartStyle] = useState('north')
  const [specialTab, setSpecialTab] = useState('bhava')
  const [transitData, setTransitData] = useState(null)

  if (!state?.data) {
    navigate('/')
    return null
  }

  const { data, input } = state

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
      return <KPChart input={input} />
    }
    return null
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <div className="bg-primary text-white">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center justify-between py-3">
            <div>
              {input.name && <div className="font-bold text-lg leading-tight">{input.name}</div>}
              <div className={`${input.name ? 'text-indigo-200 text-xs' : 'font-bold text-base'} leading-tight`}>
                {input.place}
              </div>
              <div className="text-indigo-200 text-xs">
                {formatDate(input.date)} · {formatTime(input.time)}
              </div>
            </div>
            <button onClick={() => navigate('/')}
                    className="bg-white/20 hover:bg-white/30 text-white text-xs font-medium px-3 py-1.5 rounded-full transition">
              ← New chart
            </button>
          </div>

          {/* Tab bar — desktop only; mobile uses the bottom nav instead */}
          <div className="hidden sm:flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                      className={`whitespace-nowrap px-3 py-1.5 rounded-t-lg text-xs font-medium transition inline-flex items-center gap-1 ${
                        activeTab === tab.id
                          ? 'bg-white text-indigo-700'
                          : 'text-indigo-200 hover:text-white hover:bg-white/10'
                      }`}>
                {tab.icon.startsWith('/')
                  ? <img src={tab.icon} alt="" className="w-3.5 h-3.5 object-contain" />
                  : <span>{tab.icon}</span>}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary chips */}
      <div className="max-w-5xl mx-auto w-full">
        <SummaryChips data={data} />
      </div>

      {/* Content */}
      <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-4 pb-24 sm:pb-4">

        {/* ── Kundli / Birth Chart ── */}
        <div className={activeTab === 'birth_chart' ? '' : 'hidden'}>
          {/* Chart style picker */}
          <div className="flex gap-2 mb-4 flex-wrap">
            {CHART_STYLES.map(s => (
              <button key={s.id} onClick={() => setChartStyle(s.id)}
                      className={`text-xs px-3 py-1.5 rounded-lg border transition ${
                        chartStyle === s.id
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-400'
                      }`}>
                {s.label}
              </button>
            ))}
          </div>
          {renderBirthChart()}
        </div>

        {/* ── Divisional Charts ── */}
        <div className={activeTab === 'divisional' ? '' : 'hidden'}>
          <DivisionalCharts input={input} />
        </div>

        {/* ── Transit ── */}
        <div className={activeTab === 'transit' ? '' : 'hidden'}>
          <TransitPanel input={input} natalData={data} />
        </div>

        {/* ── Special features ── */}
        <div className={activeTab === 'special' ? '' : 'hidden'}>
          {/* Special sub-tabs */}
          <div className="flex gap-2 mb-4 flex-wrap">
            {SPECIAL_TABS.map(s => (
              <button key={s.id} onClick={() => setSpecialTab(s.id)}
                      className={`text-xs px-3 py-1.5 rounded-lg border transition ${
                        specialTab === s.id
                          ? 'bg-rose-600 border-rose-600 text-white shadow-sm'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-rose-400'
                      }`}>
                {s.label}
              </button>
            ))}
          </div>
          {specialTab === 'bhava'       && <BhavaChality input={input} />}
          {specialTab === 'ashtaka'     && <AshtakavargaTable input={input} />}
          {specialTab === 'sarvatobhadra' && (
            <SarvatobhadraChakra
              natalPlanets={data.planets}
              transitPlanets={transitData?.transit_planets ?? []}
            />
          )}
        </div>

        {/* ── Dasha ── */}
        <div className={activeTab === 'dasha' ? '' : 'hidden'}>
          <DashaTable dasha={data.dasha} />
        </div>

        {/* ── Planets ── */}
        <div className={activeTab === 'planets' ? '' : 'hidden'}>
          <PlanetTable planets={data.planets} ascendant={data.ascendant} />
        </div>

        {/* ── Reading ── */}
        <div className={activeTab === 'reading' ? '' : 'hidden'}>
          <ChartReading input={input} onSwitchToCareer={() => setActiveTab('career')} />
        </div>

        {/* ── Ask ── */}
        <div className={activeTab === 'ask' ? '' : 'hidden'}>
          <AskChart input={input} />
        </div>

        {/* ── Rajyogas ── */}
        <div className={activeTab === 'rajyogas' ? '' : 'hidden'}>
          <RajyogasTab input={input} />
        </div>

        {/* ── Career Report ── */}
        <div className={activeTab === 'career' ? '' : 'hidden'}>
          <CareerReportTab input={input} />
        </div>

        {/* ── Download ── */}
        <div className={activeTab === 'download' ? '' : 'hidden'}>
          <KundliDownload data={data} input={input} />
        </div>

      </div>

      <NavBar tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}
