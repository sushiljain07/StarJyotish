// frontend/src/pages/WeekAhead.jsx
//
// Full week view reachable from PersonalHome's "This week" strip (see
// WeekStrip.jsx). That strip is framed entirely around the week's score/
// destiny constellation, not panchang timing facts — this page is its
// "Full week" destination, so it needs to carry the same framing rather
// than switching to a flat list of tithi/nakshatra/Rahu Kaal facts (which
// is what /panchang and PanchangDetail.jsx already own). Score here comes
// from utils/weekScore.js, the same heuristic WeekStrip already uses, so
// the two never disagree on a given day's number.
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import Seo from '../components/Seo'
import CelestialBackdrop from '../components/CelestialBackdrop'
import { useCurrentLocation } from '../hooks/useCurrentLocation'
import { fetchPanchangWeek } from '../api/astro'
import { weekDayScore, weekDayScoreLabel } from '../utils/weekScore'
import { computeWindow, minutesToLabel } from '../utils/muhurtaWindow'

function shortDayName(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()
}

function dayNumber(dateStr) {
  return dateStr.split('-')[2]
}

export default function WeekAhead() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { location } = useCurrentLocation()

  const [week, setWeek] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!location) return
    let cancelled = false
    setLoading(true)
    setError(false)
    fetchPanchangWeek({ lat: location.lat, lon: location.lon, timezone: location.timezone, days: 7 })
      .then(res => { if (!cancelled) setWeek(res.days) })
      .catch(() => { if (!cancelled) setError(true) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [location?.lat, location?.lon])

  const todayStr = new Date().toISOString().slice(0, 10)

  return (
    <div className="pb-8 md:pb-12">
      <Seo title={t('week_page_title')} path="/week-ahead" noindex />

      <div className="relative overflow-hidden bg-night px-4 pt-6 pb-8">
        <CelestialBackdrop className="text-primary opacity-40" />
        <div className="relative max-w-2xl mx-auto">
          <button
            onClick={() => navigate('/home')}
            className="flex items-center gap-2 text-sm text-ink-onnight/70 hover:text-primary-light transition mb-4"
          >
            <span aria-hidden="true">←</span> {t('week_page_back_cta')}
          </button>
          <h1 className="font-serif text-2xl font-medium text-primary-light">
            {t('week_page_title')}
          </h1>
          {week?.length > 0 && (
            <p className="text-sm text-ink-onnight/60 mt-1">
              {week[0].date} – {week[week.length - 1].date}
              {location?.label ? ` · ${location.label}` : ''}
            </p>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-4">
        {loading && <p className="text-sm text-ink-onnight/60 py-6">Loading the week ahead…</p>}
        {error && (
          <p className="text-sm text-vermillion py-6">
            Couldn't load the week ahead for your current location. Try again in a moment.
          </p>
        )}

        {week && week.map((day, i) => {
          const isToday = day.date === todayStr
          const score = weekDayScore(day, i)
          const label = weekDayScoreLabel(score, t)
          const tithiName = day.tithi?.name
          const nakName = typeof day.nakshatra === 'object' ? day.nakshatra?.name : day.nakshatra
          const { bestStart, bestEnd, bestNote } = computeWindow(day, new Date(day.date + 'T00:00:00'))
          return (
            <div
              key={day.date}
              className={`flex gap-4 py-4 border-b border-white/[0.08] last:border-b-0 ${isToday ? 'bg-primary/[0.06] -mx-4 px-4 rounded-lg' : ''}`}
            >
              <div className="flex-shrink-0 w-12 text-center">
                <p className="text-[10px] font-mono text-ink-onnight/45">
                  {isToday ? t('week_page_today_label') : shortDayName(day.date)}
                </p>
                <p className="font-serif text-xl text-primary-light mt-0.5">{dayNumber(day.date)}</p>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <span
                    className="font-serif text-2xl text-primary-glow shrink-0"
                    style={{ textShadow: '0 0 12px rgba(240,203,128,0.35)' }}
                  >
                    {score}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink-onnight">{label}</p>
                    {(tithiName || nakName) && (
                      <p className="text-xs text-ink-onnight/45 truncate mt-0.5">
                        {[tithiName, nakName].filter(Boolean).join(' · ')}
                      </p>
                    )}
                  </div>
                </div>
                {bestStart != null && (
                  <p className="text-xs text-ink-onnight/70 mt-2">
                    {t('week_page_best_window', {
                      defaultValue: 'Best window: {{start}} – {{end}}',
                      start: minutesToLabel(bestStart),
                      end: minutesToLabel(bestEnd),
                    })}
                    {bestNote && <span className="block text-2xs text-vermillion/70 mt-0.5">{bestNote}</span>}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
