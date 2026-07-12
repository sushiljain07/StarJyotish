// frontend/src/components/home/WeekStrip.jsx
//
// Horizontal preview of the coming week, backed by real per-day panchang
// (POST /api/panchang/week) — not invented mood text. Each day shows its
// date, a colored dot for whether Rahu Kaal falls in a "daytime-heavy" or
// "evening-heavy" slot (a genuinely computed distinction, not a guess),
// and taps through to WeekAhead.jsx for the full read.
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchPanchangWeek } from '../../api/astro'

function shortDayName(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()
}

// Rahu Kaal starting before 1pm reads as "morning caution", after 3pm as
// "evening caution" — a real distinction computed from the actual window,
// not a fabricated daily mood.
function rahuTone(muhurtas) {
  const start = muhurtas?.rahu_kaal?.start
  if (!start) return '#8FA876'
  const hour = parseInt(start, 10)
  const isPM = /PM/i.test(start)
  const hour24 = isPM && hour !== 12 ? hour + 12 : hour
  if (hour24 < 13) return '#C05B3C'
  if (hour24 >= 16) return '#F0A93A'
  return '#8FA876'
}

export default function WeekStrip({ location }) {
  const navigate = useNavigate()
  const [week, setWeek] = useState(null)

  useEffect(() => {
    if (!location) return
    let cancelled = false
    fetchPanchangWeek({ lat: location.lat, lon: location.lon, timezone: location.timezone, days: 7 })
      .then(res => { if (!cancelled) setWeek(res.days) })
      .catch(() => { /* strip just doesn't render — home page still works */ })
    return () => { cancelled = true }
  }, [location?.lat, location?.lon])

  if (!week) return null

  const todayStr = new Date().toISOString().slice(0, 10)

  return (
    <div className="flex gap-2.5 overflow-x-auto pb-1 -mx-1 px-1" style={{ scrollbarWidth: 'none' }}>
      {week.map(day => {
        const isToday = day.date === todayStr
        return (
          <button
            key={day.date}
            onClick={() => navigate('/week-ahead')}
            className="flex-shrink-0 w-[72px] rounded-xl border py-3 text-center transition"
            style={{
              background: isToday ? 'rgba(217,164,65,0.14)' : 'rgba(255,255,255,0.045)',
              borderColor: isToday ? 'rgba(217,164,65,0.3)' : 'rgba(255,255,255,0.09)',
            }}
          >
            <p className="text-[10px] font-mono text-ink-onnight/45">
              {isToday ? 'TODAY' : shortDayName(day.date)}
            </p>
            <p className="font-serif text-[15px] font-medium text-primary-light my-1">
              {day.date.split('-')[2]}
            </p>
            <span
              className="block w-2 h-2 rounded-full mx-auto"
              style={{ background: rahuTone(day.muhurtas) }}
              aria-hidden="true"
            />
          </button>
        )
      })}
    </div>
  )
}
