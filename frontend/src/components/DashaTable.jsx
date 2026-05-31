// frontend/src/components/DashaTable.jsx
import { useTranslation } from 'react-i18next'

function pct(start, end) {
  const now = Date.now()
  const s = new Date(start).getTime()
  const e = new Date(end).getTime()
  if (now <= s) return 0
  if (now >= e) return 100
  return Math.round(((now - s) / (e - s)) * 100)
}

export default function DashaTable({ dasha }) {
  const { t } = useTranslation()
  if (!dasha) return null

  const { current_mahadasha: md, current_antardasha: ad, antardashas, full_sequence } = dasha
  const yrsLeft = ((new Date(md.end) - Date.now()) / (365.25 * 86400000)).toFixed(1)

  return (
    <div className="space-y-6">
      {/* Current MD card */}
      <div className="bg-primary-light border border-indigo-200 rounded-lg p-4">
        <div className="text-xs text-indigo-500 uppercase tracking-wide mb-1">
          {t('current_mahadasha')}
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-2xl font-bold text-indigo-900">
            {t(`planets.${md.planet}`, md.planet)}
          </span>
          <span className="text-sm text-gray-500">
            {md.start} – {md.end} · {md.years}y ·{' '}
            <span className="text-indigo-700">{yrsLeft} {t('years_remaining')}</span>
          </span>
        </div>
        <div className="mt-2 h-2 bg-amber-200 rounded-full">
          <div className="h-2 bg-primary rounded-full" style={{ width: `${pct(md.start, md.end)}%` }} />
        </div>
      </div>

      {/* Antardashas */}
      <div>
        <h3 className="font-semibold text-indigo-900 mb-2">{t('antardasha_heading')}</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-primary-light text-indigo-800">
                <th className="text-left p-2 border border-amber-200">{t('col_planet')}</th>
                <th className="text-left p-2 border border-amber-200">Start</th>
                <th className="text-left p-2 border border-amber-200">End</th>
                <th className="p-2 border border-amber-200 w-24">Timeline</th>
              </tr>
            </thead>
            <tbody>
              {antardashas.map((a) => {
                const isCurrent = ad && a.planet === ad.planet && a.start === ad.start
                const isPast = new Date(a.end) < new Date()
                return (
                  <tr
                    key={`${a.planet}-${a.start}`}
                    className={isCurrent ? 'bg-primary-light font-semibold'
                      : isPast ? 'bg-white text-gray-400' : 'bg-white text-gray-500'}
                  >
                    <td className="p-2 border border-amber-200">
                      {isCurrent && '▶ '}
                      {t(`planets.${md.planet}`, md.planet)}–{t(`planets.${a.planet}`, a.planet)}
                    </td>
                    <td className="p-2 border border-amber-200">{a.start}</td>
                    <td className="p-2 border border-amber-200">{a.end}</td>
                    <td className="p-2 border border-amber-200">
                      <div className="h-2 bg-primary-light rounded-full">
                        <div
                          className={`h-2 rounded-full ${isCurrent ? 'bg-primary' : isPast ? 'bg-amber-400' : 'bg-amber-200'}`}
                          style={{ width: `${pct(a.start, a.end)}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Full sequence pills */}
      <div>
        <h3 className="font-semibold text-indigo-900 mb-2">{t('full_sequence')}</h3>
        <div className="flex flex-wrap gap-2">
          {full_sequence.map((m) => {
            const isCurrent = m.planet === md.planet && m.start === md.start
            return (
              <span
                key={`${m.planet}-${m.start}`}
                className={`px-3 py-1 rounded-full text-sm ${
                  isCurrent ? 'bg-primary text-white font-bold' : 'bg-primary-light text-indigo-700'
                }`}
              >
                {t(`planets.${m.planet}`, m.planet)} {m.years}y
              </span>
            )
          })}
        </div>
      </div>
    </div>
  )
}
