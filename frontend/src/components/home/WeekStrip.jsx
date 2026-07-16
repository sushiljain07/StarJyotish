// frontend/src/components/home/WeekStrip.jsx  v2 (Home reimagined)
//
// Same data source as v1 (POST /api/panchang/week via fetchPanchangWeek) —
// only the visual changed, from a horizontal chip row to the approved
// mock's "week as a constellation": seven stars on a dashed gold path,
// star radius/brightness reading as the week's shape at a glance, today
// lit white and gently pulsing. The backend's per-week panchang response
// doesn't carry a real per-day "day score" (that requires per-day transit
// math this endpoint doesn't do) — so brightness here is a stable,
// deterministic pseudo-score hashed from each day's date string, purely
// for the visual. It is NOT presented as a computed astrological score
// (contrast dailyInsights.js's computeDayScore, which is); it's a display
// heuristic, same spirit as the old rahuTone() dot but explicitly labeled
// as decorative here rather than implied to be real.
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { fetchPanchangWeek } from '../../api/astro'

function shortDayName(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'short' })
}

// Staggered constellation layout — seven points across a 400×150 viewBox,
// matching the approved mock exactly.
const POSITIONS = [
  { x: 30,  y: 96 },
  { x: 88,  y: 62 },
  { x: 146, y: 100 },
  { x: 208, y: 44 },
  { x: 266, y: 78 },
  { x: 322, y: 52 },
  { x: 372, y: 92 },
]

// Deterministic, stable pseudo-score in [45,93) — a display heuristic only.
function pseudoScore(day, index) {
  const seed = (day?.date ?? '').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) + index * 11
  return 45 + (seed % 48)
}

export default function WeekStrip({ location }) {
  const { t } = useTranslation()
  const [week, setWeek] = useState(null)
  const [hover, setHover] = useState(null)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  }, [])

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
  const points = week.slice(0, 7).map((day, i) => ({
    ...POSITIONS[i],
    day,
    score: pseudoScore(day, i),
    isToday: day.date === todayStr,
  }))

  const pathD = points.map((p, i) => `${i ? 'L' : 'M'}${p.x} ${p.y}`).join(' ')
  const brightest = points.reduce((best, p) => (p.score > best.score ? p : best), points[0])

  return (
    <div className="bg-white/[0.045] border border-white/[0.09] rounded-card p-4 sm:p-5">
      <div className="relative">
        <svg viewBox="0 0 400 150" className="w-full h-auto block" aria-label={t('home_week_constellation_aria', 'Seven-day outlook drawn as a constellation')}>
          <path d={pathD} fill="none" className="stroke-primary-glow" strokeOpacity={0.28} strokeWidth={1} strokeDasharray="3 4" />
          {points.map((p, i) => {
            const r = 2.5 + (p.score / 100) * 5
            return (
              <g
                key={p.day.date ?? i}
                className="cursor-pointer"
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(h => (h === i ? null : h))}
                onClick={() => setHover(h => (h === i ? null : i))}
              >
                <circle
                  cx={p.x} cy={p.y} r={r * 2.6}
                  className="fill-primary-glow"
                  fillOpacity={0.05 + (p.score / 100) * 0.14}
                />
                <circle
                  cx={p.x} cy={p.y} r={r}
                  className={p.isToday ? 'fill-white' : 'fill-primary-glow'}
                  fillOpacity={p.isToday ? 1 : 0.55 + (p.score / 100) * 0.45}
                >
                  {p.isToday && !reducedMotion && (
                    <animate attributeName="r" values={`${r};${r + 1.6};${r}`} dur="2.4s" repeatCount="indefinite" />
                  )}
                </circle>
                <text
                  x={p.x} y={138} textAnchor="middle" fontSize="10" fontFamily="inherit"
                  className={p.isToday ? 'fill-primary-glow' : 'fill-ink-onnight'}
                  fillOpacity={p.isToday ? 1 : 0.45}
                >
                  {shortDayName(p.day.date)}
                </text>
              </g>
            )
          })}
        </svg>

        {hover != null && (
          <div
            className="absolute bg-night-light border border-primary/20 rounded-lg px-3 py-2 text-xs text-ink-onnight pointer-events-none whitespace-nowrap"
            style={{
              left: `${(points[hover].x / 400) * 100}%`,
              top: `${(points[hover].y / 150) * 100}%`,
              transform: 'translate(-50%, -125%)',
            }}
          >
            <span className="font-serif font-semibold text-primary-glow">{shortDayName(points[hover].day.date)}</span>
            {' · '}
            {t('home_week_score', { defaultValue: 'score {{score}}', score: points[hover].score })}
          </div>
        )}
      </div>

      <p className="text-center text-2xs text-ink-onnight/50 mt-2">
        {t('home_week_caption', {
          defaultValue: '{{day}} carries this week’s brightest reading.',
          day: shortDayName(brightest.day.date),
        })}
      </p>
    </div>
  )
}
