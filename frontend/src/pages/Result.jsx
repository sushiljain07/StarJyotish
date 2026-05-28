// frontend/src/pages/Result.jsx
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import KundliChart from '../components/KundliChart'
import DashaTable from '../components/DashaTable'
import PlanetTable from '../components/PlanetTable'

const TABS = ['birth_chart', 'navamsa', 'dasha', 'planets']

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
    <div>
      {/* Birth details banner */}
      <div className="mb-6 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 flex flex-wrap items-center gap-4">
        <span>📅 {input.date}</span>
        <span>⏰ {input.time}</span>
        <span>📍 {input.place}</span>
        <button onClick={() => navigate('/')} className="ml-auto text-amber-600 hover:underline text-xs">
          ← New chart
        </button>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 border-b border-amber-200 mb-6 overflow-x-auto">
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg whitespace-nowrap transition ${
              activeTab === tab ? 'bg-amber-700 text-white' : 'text-amber-700 hover:bg-amber-100'
            }`}>
            {t(`tab_${tab}`)}
          </button>
        ))}
      </div>

      {/* Tab panels */}
      {activeTab === 'birth_chart' && (
        <div className="flex flex-col items-center">
          <KundliChart planets={data.planets} title={t('tab_birth_chart')} />
        </div>
      )}
      {activeTab === 'navamsa' && (
        <div className="flex flex-col items-center">
          <KundliChart planets={data.navamsa_planets} title={t('tab_navamsa')} />
        </div>
      )}
      {activeTab === 'dasha' && <DashaTable dasha={data.dasha} />}
      {activeTab === 'planets' && (
        <PlanetTable planets={data.planets} ascendant={data.ascendant} />
      )}
    </div>
  )
}
