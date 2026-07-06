// SkyRhythm — horizontal day band.
// Mobile fix: taller viewBox, larger fonts, bigger window blocks so it's
// readable on a 375px screen. The band still spans 4 AM → midnight.
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

const START_H = 4
const END_H = 24
const SPAN_MIN = (END_H - START_H) * 60
const W = 600          // narrower logical width — scales better on mobile
const H = 150
const BAND_Y = 100
const ARC_PEAK = 32

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
  const c = Math.max(START_H * 60, Math.min(END_H * 60, min))
  return ((c - START_H * 60) / SPAN_MIN) * W
}

function clampX(rawX, half = 28) {
  return Math.max(half, Math.min(W - half, rawX))
}

const HOUR_LABELS = [
  { h: 4, label: '4A' }, { h: 8, label: '8A' }, { h: 12, label: '12P' },
  { h: 16, label: '4P' }, { h: 20, label: '8P' }, { h: 24, label: '12A' },
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
  const wide = x2 - x1 > 44
  return (
    <g>
      <rect x={x1} y={BAND_Y - 10} width={x2 - x1} height={20} rx={5} fill={color} />
      {wide && (
        <text x={(x1 + x2) / 2} y={BAND_Y + 4.5} textAnchor="middle"
              fontSize="10" fontWeight="700" fill="#fff">
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
    <div style={{ background: '#13183a', borderRadius: 14, padding: '12px 12px 8px', overflow: 'hidden' }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}
           role="img" aria-label={t('sky_rhythm_aria')}>

        {/* Daylight wash */}
        {riseMin != null && setMin != null && (
          <rect x={tx(riseMin)} y={22} width={tx(setMin) - tx(riseMin)}
                height={BAND_Y - 22} fill="rgba(240,203,128,0.07)" rx="5" />
        )}

        {/* Hour ticks + labels */}
        {HOUR_LABELS.map(({ h, label }) => {
          const rawX = tx(h * 60)
          const labelX = clampX(rawX, 14)
          return (
            <g key={h}>
              <line x1={rawX} y1={BAND_Y - 5} x2={rawX} y2={BAND_Y + 5}
                    stroke="rgba(248,242,228,0.2)" strokeWidth="1" />
              <text x={labelX} y={BAND_Y + 20} textAnchor="middle"
                    fontSize="11" fill="rgba(248,242,228,0.4)" fontWeight="600">
                {label}
              </text>
            </g>
          )
        })}

        {/* Axis */}
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

        {/* Sunrise/sunset */}
        {riseMin != null && (
          <g>
            <circle cx={tx(riseMin)} cy={BAND_Y} r="5" fill="#F0CB80" />
            <text x={clampX(tx(riseMin), 30)} y={BAND_Y + 34} textAnchor="middle"
                  fontSize="10" fill="rgba(248,242,228,0.55)" fontWeight="600">
              ☀ {panchang.sunrise}
            </text>
            <text x={clampX(tx(riseMin), 30)} y={BAND_Y + 46} textAnchor="middle"
                  fontSize="9" fill="rgba(248,242,228,0.3)">
              {t('sky_sunrise')}
            </text>
          </g>
        )}
        {setMin != null && (
          <g>
            <circle cx={tx(setMin)} cy={BAND_Y} r="5" fill="#F0CB80" />
            <text x={clampX(tx(setMin), 30)} y={BAND_Y + 34} textAnchor="middle"
                  fontSize="10" fill="rgba(248,242,228,0.55)" fontWeight="600">
              ☀ {panchang.sunset}
            </text>
            <text x={clampX(tx(setMin), 30)} y={BAND_Y + 46} textAnchor="middle"
                  fontSize="9" fill="rgba(248,242,228,0.3)">
              {t('sky_sunset')}
            </text>
          </g>
        )}

        {/* Moon markers */}
        {moonriseMin != null && (
          <g>
            <line x1={tx(moonriseMin)} y1={30} x2={tx(moonriseMin)} y2={BAND_Y - 12}
                  stroke="rgba(175,169,236,0.3)" strokeWidth="1" strokeDasharray="2 3" />
            <circle cx={tx(moonriseMin)} cy={BAND_Y} r="3.5" fill="rgba(175,169,236,0.6)" />
            <text x={clampX(tx(moonriseMin), 28)} y={16} textAnchor="middle"
                  fontSize="10" fill="rgba(175,169,236,0.8)" fontWeight="600">
              ☽ {panchang.moonrise}
            </text>
            <text x={clampX(tx(moonriseMin), 28)} y={28} textAnchor="middle"
                  fontSize="9" fill="rgba(175,169,236,0.4)">
              {t('sky_moonrise')}
            </text>
          </g>
        )}
        {moonsetMin != null && (
          <g>
            <line x1={tx(moonsetMin)} y1={30} x2={tx(moonsetMin)} y2={BAND_Y - 12}
                  stroke="rgba(175,169,236,0.3)" strokeWidth="1" strokeDasharray="2 3" />
            <circle cx={tx(moonsetMin)} cy={BAND_Y} r="3.5" fill="rgba(175,169,236,0.6)" />
            <text x={clampX(tx(moonsetMin), 28)} y={16} textAnchor="middle"
                  fontSize="10" fill="rgba(175,169,236,0.8)" fontWeight="600">
              ☽ {panchang.moonset}
            </text>
            <text x={clampX(tx(moonsetMin), 28)} y={28} textAnchor="middle"
                  fontSize="9" fill="rgba(175,169,236,0.4)">
              {t('sky_moonset')}
            </text>
          </g>
        )}

        {/* Sun disc on arc — daytime only */}
        {sunOnArc && (
          <g>
            <circle cx={sunOnArc.x} cy={sunOnArc.y} r="12" fill="rgba(240,203,128,0.15)" />
            <circle cx={sunOnArc.x} cy={sunOnArc.y} r="7"  fill="#F0CB80" />
          </g>
        )}

        {/* NOW needle */}
        {nowX != null && (
          <g>
            <line x1={nowX} y1={36} x2={nowX} y2={BAND_Y + 8}
                  stroke={isDaytime ? '#F0CB80' : 'rgba(175,169,236,0.8)'}
                  strokeWidth="2" />
            <rect x={nowX - 22} y={22} width={44} height={16} rx={8}
                  fill={isDaytime ? '#F0CB80' : 'rgba(175,169,236,0.8)'} />
            <text x={nowX} y={33} textAnchor="middle" fontSize="9"
                  fontWeight="800" fill="#13183a">
              {t('sky_now')}
            </text>
          </g>
        )}
      </svg>

      <div style={{ display:'flex', justifyContent:'center', gap:14, marginTop:4,
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
