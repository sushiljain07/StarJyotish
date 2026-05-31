// frontend/src/pages/Result.jsx
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import KundliChart from '../components/KundliChart'
import DashaTable from '../components/DashaTable'
import PlanetTable from '../components/PlanetTable'
import ChartReading from '../components/ChartReading'
import AskChart from '../components/AskChart'
import NavBar from '../components/NavBar'

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
          {/* Top row: place + new chart button */}
          <div className="flex items-center justify-between py-3">
            <div>
              {input.name && <div className="font-bold text-lg leading-tight">{input.name}</div>}
              <div className={`${input.name ? 'text-indigo-200 text-xs' : 'font-bold text-base'} leading-tight`}>{input.place}</div>
              <div className="text-indigo-200 text-xs">{input.date} · {input.time}</div>
            </div>
            <button
              onClick={() => navigate('/')}
              className="bg-white/20 hover:bg-white/30 text-white text-xs font-medium px-3 py-1.5 rounded-full transition"
            >
              ← New chart
            </button>
          </div>
          {/* Desktop nav inline in header */}
          <NavBar activeTab={activeTab} onTabChange={setActiveTab} variant="desktop" />
        </div>
      </div>

      {/* Summary chips */}
      <div className="max-w-5xl mx-auto w-full">
        <SummaryChips data={data} />
      </div>

      {/* Content */}
      <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-4 pb-24 sm:pb-4">
        {/* Birth chart tab: D1 always shown; D9 alongside on desktop */}
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
          {/* Mobile: D9 below */}
          <div className="sm:hidden mt-6 flex flex-col items-center">
            <KundliChart
              planets={data.navamsa_planets}
              ascendant={data.navamsa_ascendant}
              title={t('tab_navamsa')}
            />
          </div>
        </div>
        <div className={activeTab === 'dasha' ? '' : 'hidden'}>
          <DashaTable dasha={data.dasha} />
        </div>
        <div className={activeTab === 'planets' ? '' : 'hidden'}>
          <PlanetTable planets={data.planets} ascendant={data.ascendant} />
        </div>
        <div className={activeTab === 'reading' ? '' : 'hidden'}>
          <ChartReading input={input} />
        </div>
        <div className={activeTab === 'ask' ? '' : 'hidden'}>
          <AskChart input={input} />
        </div>
      </div>

      {/* Mobile bottom nav */}
      <NavBar activeTab={activeTab} onTabChange={setActiveTab} variant="mobile" />
    </div>
  )
}
