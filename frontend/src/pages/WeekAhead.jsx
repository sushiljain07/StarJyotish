// frontend/src/pages/WeekAhead.jsx
//
// Full week view reachable from PersonalHome's "This week" strip. Each
// day's tithi/nakshatra/Rahu Kaal comes from the real per-day panchang
// calculation (POST /api/panchang/week) — no invented "mood" or guidance
// text per day, since that would need real transit-based reasoning per
// day (a much bigger backend feature) rather than the panchang facts this
// endpoint actually computes. Real data only, same principle as
// PanchangDetail.jsx.
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Seo from '../components/Seo'
import CelestialBackdrop from '../components/CelestialBackdrop'
import BottomNav from '../components/home/BottomNav'
import { useCurrentLocation } from '../hooks/useCurrentLocation'
import { fetchPanchangWeek } from '../api/astro'
import { getPrimaryProfile } from '../services/astrologyProfiles'

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
  const { user } = useAuth()
  const profile = getPrimaryProfile(user)
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
    <div className="min-h-screen bg-night-deep pb-24 md:pb-12">
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

        {week && week.map(day => {
          const isToday = day.date === todayStr
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
                <div className="flex gap-1.5 flex-wrap mb-1.5">
                  <span className="text-[10px] font-mono text-ink-onnight/55 bg-white/[0.06] px-2 py-0.5 rounded-full">
                    {day.tithi?.name}
                  </span>
                  <span className="text-[10px] font-mono text-ink-onnight/55 bg-white/[0.06] px-2 py-0.5 rounded-full">
                    {day.nakshatra}
                  </span>
                </div>
                {day.muhurtas?.rahu_kaal && (
                  <p className="text-sm text-ink-onnight/75">
                    Rahu Kaal {day.muhurtas.rahu_kaal.start} – {day.muhurtas.rahu_kaal.end}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <BottomNav profile={profile} />
    </div>
  )
}
