import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

const START_H = 4
const END_H = 24
const SPAN_MIN = (END_H - START_H) * 60
const W = 720
const H = 130
const BAND_Y = 92
const ARC_PEAK = 28

function parseMin(str) {
  if (!str) return null
  const parts = str.trim().split(' ')
  if (parts.length < 2) return null
  const [time, ampm] = parts
  const [h0, m] = time.split(':').map(Number)
  let h = h0
  if (ampm === 'PM' && h !== 12) h += 12
  if (ampm === 'AM' && h === 12) h = 0
  return h * 60 + (m || 0)
}

function tx(min) {
  if (min == null) return null
  const clamped = Math.max(START_H * 60, Math.min(END_H * 60, min))
  return ((clamped - START_H * 60) / SPAN_MIN) * W
}

// Clamp label x so it never bleeds past the viewBox edges
function clampLabelX(rawX, halfWidth = 36) {
  return Math.max(halfWidth, Math.min(W - halfWidth, rawX))
}

const HOUR_LABELS = [
  { h: 4, label: '4 AM' },
  { h: 8, label: '8 AM' },
  { h: 12, label: '12 PM' },
  { h: 16, label: '4 PM' },
  { h: 20, label: '8 PM' },
  { h: 24, label: '12 AM' },
]

function sunArcPath(riseMin, setMin) {
  const pts = []
  for (let i = 0; i <= 50; i++) {
    const frac = i / 50
    const min = riseMin + frac * (setMin - riseMin)
    const py = BAND_Y - Math.sin(frac * Math.PI) * ARC_PEAK
    pts.push(`${i === 0 ? 'M' : 'L'}${tx(min).toFixed(1)},${py.toFixed(1)}`)
  }
  return pts.join(' ')
}

function sunPosOnArc(riseMin, setMin, nowMin) {
  if (nowMin < riseMin || nowMin > setMin) return null
  const frac = (nowMin - riseMin) / (setMin - riseMin)
  return {
    x: tx(riseMin + frac * (setMin - riseMin)),
    y: BAND_Y - Math.sin(frac * Math.PI) * ARC_PEAK,
  }
}

function Window({ start, end, color, label }) {
  const x1 = tx(parseMin(start))
  const x2 = tx(parseMin(end))
  if (x1 == null || x2 == null || x2 <= x1) return null
  return (
    <g>
      <rect x={x1} y={BAND_Y - 8} width={x2 - x1} height={16} rx={5} fill={color} opacity="0.9" />
      {x2 - x1 > 55 && (
        <text x={(x1 + x2) / 2} y={BAND_Y + 4} textAnchor="middle"
              fontSize="9" fontWeight="700" fill="#fff">
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

  const riseMin     = parseMin(panchang?.sunrise)
  const setMin      = parseMin(panchang?.sunset)
  const moonriseMin = parseMin(panchang?.moonrise)
  const moonsetMin  = parseMin(panchang?.moonset)
  const m = panchang?.muhurtas

  const arcPath = useMemo(
    () => riseMin != null && setMin != null ? sunArcPath(riseMin, setMin) : null,
    [riseMin, setMin],
  )

  const sunOnArc = riseMin != null && setMin != null ? sunPosOnArc(riseMin, setMin, nowMin) : null
  const nowX = tx(nowMin)
  const isDaytime = riseMin != null && setMin != null && nowMin >= riseMin && nowMin <= setMin

  if (!panchang?.sunrise) return null

  return (
    <div style={{ background: '#13183a', borderRadius: 16, padding: '14px 14px 10px', overflow: 'hidden' }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}
           role="img" aria-label={t('sky_rhythm_aria')}>

        {/* Daylight wash between sunrise and sunset */}
        {riseMin != null && setMin != null && (
          <rect x={tx(riseMin)} y={20} width={tx(setMin) - tx(riseMin)}
                height={BAND_Y - 20} fill="rgba(240,203,128,0.06)" rx="6" />
        )}

        {/* Hour tick marks and clamped labels */}
        {HOUR_LABELS.map(({ h, label }) => {
          const rawX = tx(h * 60)
          const labelX = clampLabelX(rawX, label.length * 3.5)
          return (
            <g key={h}>
              <line x1={rawX} y1={BAND_Y - 4} x2={rawX} y2={BAND_Y + 4}
                    stroke="rgba(248,242,228,0.18)" strokeWidth="1" />
              <text x={labelX} y={BAND_Y + 18} textAnchor="middle"
                    fontSize="9" fill="rgba(248,242,228,0.35)" fontWeight="600">
                {label}
              </text>
            </g>
          )
        })}

        {/* Time axis */}
        <line x1={0} y1={BAND_Y} x2={W} y2={BAND_Y}
              stroke="rgba(248,242,228,0.12)" strokeWidth="1" />

        {/* Sun arc */}
        {arcPath && (
          <path d={arcPath} fill="none" stroke="rgba(240,203,128,0.3)"
                strokeWidth="1.5" strokeDasharray="4 4" />
        )}

        {/* Muhurta windows */}
        {m && (
          <>
            <Window start={m.rahu_kaal?.start}      end={m.rahu_kaal?.end}      color="#C0392B" label={t('sky_rahu')} />
            <Window start={m.yamaganda?.start}       end={m.yamaganda?.end}       color="#C0392B" label={t('sky_yamaganda')} />
            <Window start={m.gulika_kaal?.start}     end={m.gulika_kaal?.end}     color="#C0392B" label={t('sky_gulika')} />
            <Window start={m.abhijit_muhurta?.start} end={m.abhijit_muhurta?.end} color="#2E7D5E" label={t('sky_abhijit')} />
          </>
        )}

        {/* ── Sun rise/set markers ── clearly labelled "Sun" */}
        {riseMin != null && (
          <g>
            <circle cx={tx(riseMin)} cy={BAND_Y} r="4" fill="#F0CB80" />
            <text x={clampLabelX(tx(riseMin), 44)} y={BAND_Y + 30} textAnchor="middle"
                  fontSize="9" fill="rgba(248,242,228,0.55)" fontWeight="600">
              ☀ {panchang.sunrise}
            </text>
            <text x={clampLabelX(tx(riseMin), 44)} y={BAND_Y + 41} textAnchor="middle"
                  fontSize="8" fill="rgba(248,242,228,0.3)">
              {t('sky_sunrise')}
            </text>
          </g>
        )}
        {setMin != null && (
          <g>
            <circle cx={tx(setMin)} cy={BAND_Y} r="4" fill="#F0CB80" />
            <text x={clampLabelX(tx(setMin), 44)} y={BAND_Y + 30} textAnchor="middle"
                  fontSize="9" fill="rgba(248,242,228,0.55)" fontWeight="600">
              ☀ {panchang.sunset}
            </text>
            <text x={clampLabelX(tx(setMin), 44)} y={BAND_Y + 41} textAnchor="middle"
                  fontSize="8" fill="rgba(248,242,228,0.3)">
              {t('sky_sunset')}
            </text>
          </g>
        )}

        {/* ── Moon rise/set markers — at top, clearly separate from sun arc ── */}
        {moonriseMin != null && (
          <g>
            <line x1={tx(moonriseMin)} y1={28} x2={tx(moonriseMin)} y2={BAND_Y - 10}
                  stroke="rgba(175,169,236,0.25)" strokeWidth="1" strokeDasharray="2 3" />
            <circle cx={tx(moonriseMin)} cy={BAND_Y} r="3" fill="rgba(175,169,236,0.5)" />
            <text x={clampLabelX(tx(moonriseMin), 32)} y={14} textAnchor="middle"
                  fontSize="9" fill="rgba(175,169,236,0.8)" fontWeight="600">
              ☽ {panchang.moonrise}
            </text>
            <text x={clampLabelX(tx(moonriseMin), 32)} y={25} textAnchor="middle"
                  fontSize="8" fill="rgba(175,169,236,0.45)">
              {t('sky_moonrise')}
            </text>
          </g>
        )}
        {moonsetMin != null && (
          <g>
            <line x1={tx(moonsetMin)} y1={28} x2={tx(moonsetMin)} y2={BAND_Y - 10}
                  stroke="rgba(175,169,236,0.25)" strokeWidth="1" strokeDasharray="2 3" />
            <circle cx={tx(moonsetMin)} cy={BAND_Y} r="3" fill="rgba(175,169,236,0.5)" />
            <text x={clampLabelX(tx(moonsetMin), 32)} y={14} textAnchor="middle"
                  fontSize="9" fill="rgba(175,169,236,0.8)" fontWeight="600">
              ☽ {panchang.moonset}
            </text>
            <text x={clampLabelX(tx(moonsetMin), 32)} y={25} textAnchor="middle"
                  fontSize="8" fill="rgba(175,169,236,0.45)">
              {t('sky_moonset')}
            </text>
          </g>
        )}

        {/* Sun disc on arc — only during daytime */}
        {sunOnArc && (
          <g>
            <circle cx={sunOnArc.x} cy={sunOnArc.y} r="11" fill="rgba(240,203,128,0.15)" />
            <circle cx={sunOnArc.x} cy={sunOnArc.y} r="6"  fill="#F0CB80" />
          </g>
        )}

        {/* NOW needle */}
        {nowX != null && (
          <g>
            <line x1={nowX} y1={32} x2={nowX} y2={BAND_Y + 6}
                  stroke={isDaytime ? '#F0CB80' : 'rgba(175,169,236,0.8)'}
                  strokeWidth="1.5" />
            <rect x={nowX - 20} y={20} width={40} height={14} rx={7}
                  fill={isDaytime ? '#F0CB80' : 'rgba(175,169,236,0.8)'} />
            <text x={nowX} y={30} textAnchor="middle" fontSize="8"
                  fontWeight="700" fill="#13183a">
              {t('sky_now')}
            </text>
          </g>
        )}
      </svg>

      <div style={{ display:'flex', justifyContent:'center', gap:16, marginTop:4,
                    fontSize:10, color:'rgba(248,242,228,0.4)' }}>
        <span style={{ display:'flex', alignItems:'center', gap:5 }}>
          <span style={{ width:8, height:8, borderRadius:2, background:'#C0392B', display:'inline-block' }} />
          {t('dial_avoid_window')}
        </span>
        <span style={{ display:'flex', alignItems:'center', gap:5 }}>
          <span style={{ width:8, height:8, borderRadius:2, background:'#2E7D5E', display:'inline-block' }} />
          {t('dial_favorable_window')}
        </span>
        <span style={{ display:'flex', alignItems:'center', gap:5 }}>
          <span style={{ width:8, height:8, borderRadius:'50%', background:'#F0CB80', display:'inline-block' }} />
          {t('sky_now')}
        </span>
      </div>
    </div>
  )
}
