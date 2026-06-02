// frontend/src/pages/Result.jsx
// REPLACE your entire Result.jsx with this file

import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import KundliChart from '../components/KundliChart'
import DashaTable from '../components/DashaTable'
import PlanetTable from '../components/PlanetTable'
import ChartReading from '../components/ChartReading'
import AskChart from '../components/AskChart'
import NavBar from '../components/NavBar'
import DivisionalCharts from '../components/DivisionalCharts'

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
      <span className="bg-primary-light text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full">
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

// Tab definitions — added 'divisional' tab
const TABS = [
  { id: 'birth_chart', label: '🔯 Birth Chart' },
  { id: 'divisional',  label: '🪐 Divisional' },
  { id: 'dasha',       label: '⏳ Dasha' },
  { id: 'planets',     label: '🌍 Planets' },
  { id: 'reading',     label: '📖 Reading' },
  { id: 'ask',         label: '💬 Ask' },
]

export default function Result() {
  const { t } = useTranslation()
  const { state } = useLocation()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('birth_chart')

  if (!state?.data) {
    navigate('/')
    return null
  }

  const { data, input } = state

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
            <button
              onClick={() => navigate('/')}
              className="bg-white/20 hover:bg-white/30 text-white text-xs font-medium px-3 py-1.5 rounded-full transition"
            >
              ← New chart
            </button>
          </div>

          {/* Tab bar */}
          <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  whitespace-nowrap px-3 py-1.5 rounded-t-lg text-xs font-medium transition
                  ${activeTab === tab.id
                    ? 'bg-white text-indigo-700'
                    : 'text-indigo-200 hover:text-white hover:bg-white/10'
                  }
                `}
              >
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

        {/* Birth Chart Tab */}
        <div className={activeTab === 'birth_chart' ? '' : 'hidden'}>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-start">
            <div className="w-full sm:w-[460px]">
              <KundliChart
                planets={data.planets}
                ascendant={data.ascendant}
                navamsaPlanets={data.navamsa_planets}
                title={t('tab_birth_chart')}
              />
            </div>
            <div className="hidden sm:block w-[460px]">
              <KundliChart
                planets={data.navamsa_planets}
                ascendant={data.navamsa_ascendant}
                title={t('tab_navamsa')}
              />
            </div>
          </div>
          <div className="sm:hidden mt-6 flex flex-col items-center">
            <KundliChart
              planets={data.navamsa_planets}
              ascendant={data.navamsa_ascendant}
              title={t('tab_navamsa')}
            />
          </div>
        </div>

        {/* ── NEW: Divisional Charts Tab ── */}
        <div className={activeTab === 'divisional' ? '' : 'hidden'}>
          <DivisionalCharts input={input} />
        </div>

        {/* Dasha Tab */}
        <div className={activeTab === 'dasha' ? '' : 'hidden'}>
          <DashaTable dasha={data.dasha} />
        </div>

        {/* Planets Tab */}
        <div className={activeTab === 'planets' ? '' : 'hidden'}>
          <PlanetTable planets={data.planets} ascendant={data.ascendant} />
        </div>

        {/* Reading Tab */}
        <div className={activeTab === 'reading' ? '' : 'hidden'}>
          <ChartReading input={input} />
        </div>

        {/* Ask Tab */}
        <div className={activeTab === 'ask' ? '' : 'hidden'}>
          <AskChart input={input} />
        </div>

      </div>
    </div>
  )
}
