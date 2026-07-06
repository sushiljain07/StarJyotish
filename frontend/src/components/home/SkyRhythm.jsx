// frontend/src/components/home/SkyRhythm.jsx
//
// The day as a horizontal score — replaces the circular-dial idea for
// showing sunrise/sunset/moonrise/moonset and the muhurta windows.
//
// Why horizontal: time reads left-to-right, window lengths become
// visually comparable, the sun's height maps to its real altitude arc,
// and the whole thing is glanceable in a second on both mobile and
// desktop. The band spans 4 AM → midnight (20h) rather than a full 24h,
// because 12 AM–4 AM is dead space that would compress the interesting
// daytime hours.
//
// Layers, bottom to top:
//   1. Golden daylight wash between sunrise and sunset
//   2. The sun's altitude arc (a sine hump over the daylight span) with
//      the sun disc at its true current position along it
//   3. Muhurta window blocks on the time axis (red avoid / green Abhijit)
//   4. Moonrise / moonset markers
//   5. The "now" needle — a live vertical line, updating each minute
//
// All times come as "H:MM AM/PM" strings from /api/panchang (IST-correct
// after this sprint's timezone work); this component only does geometry.
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

const START_H = 4          // band starts 4 AM
const END_H = 24           // ...ends midnight
const SPAN_MIN = (END_H - START_H) * 60
const W = 720              // viewBox width
const H = 120              // viewBox height
const BAND_Y = 86          // y of the time axis
const ARC_PEAK = 26        // sun arc peak height above axis

function parseMin(str) {
  if (!str) return null
  const [time, ampm] = str.split(' ')
  const [h0, m] = time.split(':').map(Number)
  let h = h0
  if (ampm === 'PM' && h !== 12) h += 12
  if (ampm === 'AM' && h === 12) h = 0
  return h * 60 + m
}

function x(min) {
  if (min == null) return null
  const clamped = Math.max(START_H * 60, Math.min(END_H * 60, min))
  return ((clamped - START_H * 60) / SPAN_MIN) * W
}

function fmtHour(h) {
  if (h === 12) return '12P'
  if (h === 24 || h === 0) return '12A'
  return h < 12 ? `${h}A` : `${h - 12}P`
}

// Sun altitude arc: sine hump between sunrise and sunset
function sunArcPath(riseMin, setMin) {
  const steps = 40
  const pts = []
  for (let i = 0; i <= steps; i++) {
    const frac = i / steps
    const min = riseMin + frac * (setMin - riseMin)
    const px = x(min)
    const py = BAND_Y - Math.sin(frac * Math.PI) * ARC_PEAK
    pts.push(`${i === 0 ? 'M' : 'L'}${px.toFixed(1)},${py.toFixed(1)}`)
  }
  return pts.join(' ')
}

function sunPosNow(riseMin, setMin, nowMin) {
  if (nowMin < riseMin || nowMin > setMin) return null
  const frac = (nowMin - riseMin) / (setMin - riseMin)
  return {
    x: x(riseMin + frac * (setMin - riseMin)),
    y: BAND_Y - Math.sin(frac * Math.PI) * ARC_PEAK,
  }
}

function Window({ start, end, color, label }) {
  const x1 = x(parseMin(start))
  const x2 = x(parseMin(end))
  if (x1 == null || x2 == null || x2 <= x1) return null
  return (
    <g>
      <rect x={x1} y={BAND_Y - 7} width={x2 - x1} height={14} rx={4} fill={color} opacity="0.85" />
      {x2 - x1 > 56 && (
        <text x={(x1 + x2) / 2} y={BAND_Y + 3.5} textAnchor="middle" fontSize="8"
              fontWeight="700" fill="#F8F2E4" style={{ letterSpacing: '0.3px' }}>
          {label}
        </text>
      )}
    </g>
  )
}

export default function SkyRhythm({ panchang }) {
  const { t } = useTranslation()
  const [nowMin, setNowMin] = useState(() => {
    const d = new Date(); return d.getHours() * 60 + d.getMinutes()
  })

  useEffect(() => {
    const id = setInterval(() => {
      const d = new Date(); setNowMin(d.getHours() * 60 + d.getMinutes())
    }, 60_000)
    return () => clearInterval(id)
  }, [])

  const riseMin = parseMin(panchang?.sunrise)
  const setMin = parseMin(panchang?.sunset)
  const moonriseMin = parseMin(panchang?.moonrise)
  const moonsetMin = parseMin(panchang?.moonset)
  const m = panchang?.muhurtas

  const arcPath = useMemo(
    () => (riseMin != null && setMin != null ? sunArcPath(riseMin, setMin) : null),
    [riseMin, setMin],
  )
  const sun = riseMin != null && setMin != null ? sunPosNow(riseMin, setMin, nowMin) : null
  const nowX = x(nowMin)

  if (!panchang?.sunrise) return null

  return (
    <div className="bg-gradient-to-br from-night-light to-night border border-primary/20 rounded-2xl px-4 pt-4 pb-3 overflow-hidden">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block" role="img"
           aria-label={t('sky_rhythm_aria')}>

        {/* Daylight wash */}
        {riseMin != null && setMin != null && (
          <rect x={x(riseMin)} y={12} width={x(setMin) - x(riseMin)} height={BAND_Y - 12}
                fill="rgba(217,164,65,0.08)" rx="6" />
        )}

        {/* Hour ticks + labels every 4 hours */}
        {Array.from({ length: (END_H - START_H) / 4 + 1 }, (_, i) => START_H + i * 4).map(h => (
          <g key={h}>
            <line x1={x(h * 60)} y1={BAND_Y - 4} x2={x(h * 60)} y2={BAND_Y + 4}
                  stroke="rgba(248,242,228,0.22)" strokeWidth="1" />
            <text x={x(h * 60)} y={BAND_Y + 17} textAnchor="middle" fontSize="8.5"
                  fill="rgba(248,242,228,0.35)" fontWeight="600">{fmtHour(h)}</text>
          </g>
        ))}

        {/* Time axis */}
        <line x1={0} y1={BAND_Y} x2={W} y2={BAND_Y} stroke="rgba(248,242,228,0.14)" strokeWidth="1" />

        {/* Sun altitude arc */}
        {arcPath && (
          <path d={arcPath} fill="none" stroke="rgba(240,203,128,0.4)" strokeWidth="1.5"
                strokeDasharray="3 3" />
        )}

        {/* Muhurta windows on the axis */}
        {m && (
          <>
            <Window start={m.gulika_kaal?.start} end={m.gulika_kaal?.end} color="#B84040" label={t('sky_gulika')} />
            <Window start={m.yamaganda?.start} end={m.yamaganda?.end} color="#B84040" label={t('sky_yamaganda')} />
            <Window start={m.rahu_kaal?.start} end={m.rahu_kaal?.end} color="#B84040" label={t('sky_rahu')} />
            <Window start={m.abhijit_muhurta?.start} end={m.abhijit_muhurta?.end} color="#5B7A5E" label={t('sky_abhijit')} />
          </>
        )}

        {/* Sunrise / sunset markers */}
        {riseMin != null && (
          <g>
            <circle cx={x(riseMin)} cy={BAND_Y} r="3" fill="#D9A441" />
            <text x={x(riseMin)} y={BAND_Y + 30} textAnchor="middle" fontSize="9"
                  fill="rgba(248,242,228,0.65)" fontWeight="600">🌅 {panchang.sunrise}</text>
          </g>
        )}
        {setMin != null && (
          <g>
            <circle cx={x(setMin)} cy={BAND_Y} r="3" fill="#D9A441" />
            <text x={x(setMin)} y={BAND_Y + 30} textAnchor="middle" fontSize="9"
                  fill="rgba(248,242,228,0.65)" fontWeight="600">🌇 {panchang.sunset}</text>
          </g>
        )}

        {/* Moon rise/set markers above the axis */}
        {moonriseMin != null && (
          <g>
            <text x={x(moonriseMin)} y={26} textAnchor="middle" fontSize="10">🌔</text>
            <line x1={x(moonriseMin)} y1={30} x2={x(moonriseMin)} y2={BAND_Y - 8}
                  stroke="rgba(175,169,236,0.35)" strokeWidth="1" strokeDasharray="2 3" />
            <text x={x(moonriseMin)} y={40} textAnchor="middle" fontSize="7.5"
                  fill="rgba(175,169,236,0.8)" fontWeight="600">{panchang.moonrise}</text>
          </g>
        )}
        {moonsetMin != null && (
          <g>
            <text x={x(moonsetMin)} y={26} textAnchor="middle" fontSize="10">🌘</text>
            <line x1={x(moonsetMin)} y1={30} x2={x(moonsetMin)} y2={BAND_Y - 8}
                  stroke="rgba(175,169,236,0.35)" strokeWidth="1" strokeDasharray="2 3" />
            <text x={x(moonsetMin)} y={40} textAnchor="middle" fontSize="7.5"
                  fill="rgba(175,169,236,0.8)" fontWeight="600">{panchang.moonset}</text>
          </g>
        )}

        {/* The sun, at its true position along the arc right now */}
        {sun && (
          <g>
            <circle cx={sun.x} cy={sun.y} r="10" fill="rgba(240,203,128,0.18)" />
            <circle cx={sun.x} cy={sun.y} r="5.5" fill="#F0CB80" />
          </g>
        )}

        {/* Now needle */}
        {nowX != null && (
          <g>
            <line x1={nowX} y1={16} x2={nowX} y2={BAND_Y + 6}
                  stroke="#F0CB80" strokeWidth="1.5" opacity="0.9" />
            <rect x={nowX - 16} y={2} width={32} height={13} rx={6.5}
                  fill="#F0CB80" />
            <text x={nowX} y={11.5} textAnchor="middle" fontSize="8" fontWeight="700"
                  fill="#131836">{t('sky_now')}</text>
          </g>
        )}
      </svg>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-1 text-[10px]"
           style={{ color: 'rgba(248,242,228,0.45)' }}>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-sm inline-block" style={{ background: '#B84040' }} />
          {t('dial_avoid_window')}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-sm inline-block" style={{ background: '#5B7A5E' }} />
          {t('dial_favorable_window')}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full inline-block" style={{ background: '#F0CB80' }} />
          {t('dial_now')}
        </span>
      </div>
    </div>
  )
}
