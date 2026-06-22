// Enhanced planet table with nakshatra lord, degree within nakshatra, and KP data
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import SegmentedToggle from './SegmentedToggle'

const PLANET_COLORS = {
  Sun: '#E53E3E', Moon: '#7B61FF', Mars: '#CC2200', Mercury: '#16A34A',
  Jupiter: '#2563EB', Venus: '#E91E8C', Saturn: '#1E40AF', Rahu: '#8B0000',
  Ketu: '#5B21B6', Neptune: '#7C3AED', Uranus: '#0891B2', Pluto: '#374151',
}

const LORD_COLORS = {
  Sun: '#E53E3E', Moon: '#7B61FF', Mars: '#CC2200', Rahu: '#8B0000',
  Saturn: '#1E40AF', Jupiter: '#2563EB', Mercury: '#16A34A', Venus: '#E91E8C', Ketu: '#5B21B6',
}

function LordBadge({ lord }) {
  if (!lord) return null
  return (
    <span className="inline-block px-1 py-0.5 rounded text-white text-xs font-bold ml-1"
          style={{ backgroundColor: LORD_COLORS[lord] ?? '#64748b', fontSize: '10px' }}>
      {lord.slice(0, 3)}
    </span>
  )
}

// Nakshatra degree formatter: convert decimal degrees to degrees + minutes + seconds
function formatNakDeg(deg) {
  const totalSec = Math.round(deg * 3600)
  const d = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  return `${d}°${String(m).padStart(2, '0')}'${String(s).padStart(2, '0')}"`
}

function formatDeg(deg) {
  const d = Math.floor(deg)
  const mFull = (deg - d) * 60
  const m = Math.floor(mFull)
  const s = Math.round((mFull - m) * 60)
  return `${d}°${String(m).padStart(2, '0')}'${String(s).padStart(2, '0')}"`
}

const EXALTATION   = { Sun:0, Moon:1, Mars:9, Mercury:5, Jupiter:3, Venus:11, Saturn:6 }
const DEBILITATION = { Sun:6, Moon:7, Mars:3, Mercury:11, Jupiter:9, Venus:5,  Saturn:0 }
const OWN_SIGNS    = { Sun:[4], Moon:[3], Mars:[0,7], Mercury:[2,5], Jupiter:[8,11], Venus:[1,6], Saturn:[9,10] }

function getDignity(planet, signIdx) {
  if (EXALTATION[planet] === signIdx) return { label: 'Exalted', color: '#059669' }
  if (DEBILITATION[planet] === signIdx) return { label: 'Debilitated', color: '#DC2626' }
  if (OWN_SIGNS[planet]?.includes(signIdx)) return { label: 'Own Sign', color: '#2563EB' }
  return null
}

export default function PlanetTable({ planets = [], ascendant }) {
  const { t } = useTranslation()
  const [mode, setMode] = useState('basic') // basic | nakshatra | full

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-primary-dark">{t('planet_table_heading')}</h3>
        <SegmentedToggle
          options={[['basic','Basic'], ['nakshatra','Nakshatra'], ['full','Full']].map(([id, label]) => ({ id, label }))}
          active={mode}
          onChange={setMode}
        />
      </div>

      {ascendant && (
        <div className="text-sm text-primary-dark bg-primary-light border border-line rounded-lg p-3">
          <span className="font-semibold">Ascendant (Lagna): </span>
          <span>{ascendant.sign} {formatDeg(ascendant.degree)}</span>
          <span className="text-primary-dark ml-2">· {ascendant.nakshatra}</span>
          {ascendant.nakshatra_lord && (
            <span className="ml-2">Lord: <LordBadge lord={ascendant.nakshatra_lord} /></span>
          )}
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-line">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-primary-light text-primary-dark">
              <th className="p-2.5 border-b text-left">Planet</th>
              <th className="p-2.5 border-b text-left">Sign</th>
              <th className="p-2.5 border-b text-right">Degree</th>
              <th className="p-2.5 border-b text-center">House</th>

              {(mode === 'nakshatra' || mode === 'full') && (
                <>
                  <th className="p-2.5 border-b text-left">Nakshatra</th>
                  <th className="p-2.5 border-b text-center">Pada</th>
                  <th className="p-2.5 border-b text-left">Nak° (in nakshatra)</th>
                  <th className="p-2.5 border-b text-center">Star Lord</th>
                </>
              )}

              {mode === 'basic' && (
                <>
                  <th className="p-2.5 border-b text-left">Nakshatra</th>
                  <th className="p-2.5 border-b text-center">Pada</th>
                </>
              )}

              {mode === 'full' && (
                <th className="p-2.5 border-b text-center">Dignity</th>
              )}

              <th className="p-2.5 border-b text-center">R</th>
            </tr>
          </thead>
          <tbody>
            {planets.map((p, i) => {
              const dignity = getDignity(p.name, p.sign_index)
              return (
                <tr key={p.name} className={i % 2 === 0 ? 'bg-parchment-card' : 'bg-night/[0.03]'}>
                  <td className="p-2.5 border-b font-bold"
                      style={{ color: PLANET_COLORS[p.name] ?? '#333' }}>
                    {t(`planets.${p.name}`, p.name)}
                  </td>
                  <td className="p-2.5 border-b">
                    {t(`signs.${p.sign}`, p.sign)}
                    {dignity && mode === 'basic' && (
                      <span className="ml-1 text-xs font-semibold" style={{ color: dignity.color }}>
                        ({dignity.label.slice(0, 3)})
                      </span>
                    )}
                  </td>
                  <td className="p-2.5 border-b text-right tabular-nums font-mono text-xs">
                    {formatDeg(p.degree)}
                  </td>
                  <td className="p-2.5 border-b text-center font-bold text-primary-dark">{p.house}</td>

                  {(mode === 'nakshatra' || mode === 'full') && (
                    <>
                      <td className="p-2.5 border-b text-ink">{p.nakshatra}</td>
                      <td className="p-2.5 border-b text-center text-ink-muted">{p.nakshatra_pada}</td>
                      <td className="p-2.5 border-b text-right tabular-nums font-mono text-xs text-ink-muted">
                        {p.nakshatra_degree != null ? formatNakDeg(p.nakshatra_degree) : '–'}
                      </td>
                      <td className="p-2.5 border-b text-center">
                        <LordBadge lord={p.nakshatra_lord} />
                      </td>
                    </>
                  )}

                  {mode === 'basic' && (
                    <>
                      <td className="p-2.5 border-b text-ink">{p.nakshatra}</td>
                      <td className="p-2.5 border-b text-center text-ink-muted">{p.nakshatra_pada}</td>
                    </>
                  )}

                  {mode === 'full' && (
                    <td className="p-2.5 border-b text-center text-xs">
                      {dignity
                        ? <span className="font-semibold" style={{ color: dignity.color }}>{dignity.label}</span>
                        : <span className="text-ink-faint">—</span>
                      }
                    </td>
                  )}

                  <td className="p-2.5 border-b text-center">
                    {p.retrograde && <span className="text-vermillion font-bold">R</span>}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-faint px-1">
        <span>R = Retrograde</span>
        <span>Exl = Exalted · Deb = Debilitated · Own = Own Sign</span>
        <span>Nakshatra° = degree within nakshatra (0–13°20')</span>
      </div>
    </div>
  )
}
