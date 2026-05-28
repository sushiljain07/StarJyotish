// frontend/src/components/PlanetTable.jsx
import { useTranslation } from 'react-i18next'

export default function PlanetTable({ planets = [], ascendant }) {
  const { t } = useTranslation()

  return (
    <div>
      <h3 className="font-semibold text-amber-900 mb-3">{t('planet_table_heading')}</h3>
      {ascendant && (
        <div className="mb-3 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded p-2">
          <span className="font-semibold">Ascendant (Lagna): </span>
          {t(`signs.${ascendant.sign}`, ascendant.sign)} {ascendant.degree.toFixed(2)}° · {ascendant.nakshatra}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse min-w-[560px]">
          <thead>
            <tr className="bg-amber-100 text-amber-800">
              {['col_planet','col_sign','col_degree','col_house','col_nakshatra','col_pada','col_retrograde']
                .map(k => (
                  <th key={k} className={`p-2 border border-amber-200 ${k === 'col_degree' || k === 'col_house' || k === 'col_pada' ? 'text-right' : 'text-left'}`}>
                    {t(k)}
                  </th>
                ))}
            </tr>
          </thead>
          <tbody>
            {planets.map((p, i) => (
              <tr key={p.name} className={i % 2 === 0 ? 'bg-white' : 'bg-amber-50'}>
                <td className="p-2 border border-amber-200 font-medium text-amber-900">
                  {t(`planets.${p.name}`, p.name)}
                </td>
                <td className="p-2 border border-amber-200">{t(`signs.${p.sign}`, p.sign)}</td>
                <td className="p-2 border border-amber-200 text-right tabular-nums">{p.degree.toFixed(2)}°</td>
                <td className="p-2 border border-amber-200 text-right">{p.house}</td>
                <td className="p-2 border border-amber-200">{p.nakshatra}</td>
                <td className="p-2 border border-amber-200 text-right">{p.nakshatra_pada}</td>
                <td className="p-2 border border-amber-200 text-center text-amber-600">
                  {p.retrograde ? 'R' : ''}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
