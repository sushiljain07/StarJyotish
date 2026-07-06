// frontend/src/components/home/HeroDial.jsx
//
// The ring is a full 24-hour clock — midnight at top (12 o'clock),
// 6 AM at left (9 o'clock), noon at bottom (6 o'clock), 6 PM at right
// (3 o'clock). Sunrise and sunset are pinned as labels at their exact
// angular positions on the ring. Rahu Kaal / Yamaganda / Gulika Kaal
// are red arcs; Abhijit Muhurta is green. Gold dot = right now.
// The Now dot is ALWAYS visible — it doesn't vanish at night.

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

const RADIUS = 82
const CX = 100, CY = 100
const CIRCUM = 2 * Math.PI * RADIUS

// Convert "HH:MM AM/PM" string → total minutes since midnight
function parseTimeToMinutes(str) {
  if (!str) return null
  const [time, ampm] = str.split(' ')
  const [h0, m] = time.split(':').map(Number)
  let h = h0
  if (ampm === 'PM' && h !== 12) h += 12
  if (ampm === 'AM' && h === 12) h = 0
  return h * 60 + m
}

// Convert total minutes since midnight → fraction of 24-hour clock (0–1)
// frac=0 → midnight (top), frac=0.25 → 6 AM (left), frac=0.5 → noon (bottom), frac=0.75 → 6 PM (right)
function minToFrac(minutes) {
  if (minutes == null) return null
  return ((minutes % 1440) + 1440) % 1440 / 1440
}

// Convert fraction → SVG (x, y) on the ring
function fracToXY(frac, r = RADIUS) {
  // frac=0 → top → angle = -π/2
  const angle = frac * 2 * Math.PI - Math.PI / 2
  return {
    x: CX + r * Math.cos(angle),
    y: CY + r * Math.sin(angle),
  }
}

// SVG arc segment — startFrac and endFrac are 0–1 fractions of 24h clock
function Arc({ startFrac, endFrac, color }) {
  if (startFrac == null || endFrac == null) return null
  let span = endFrac - startFrac
  if (span < 0) span += 1 // handle midnight wrap
  span = Math.max(0.002, span) * CIRCUM
  const offset = -(startFrac * CIRCUM) + CIRCUM / 4 // +CIRCUM/4 rotates origin to top
  return (
    <circle
      cx={CX} cy={CY} r={RADIUS} fill="none" stroke={color} strokeWidth="12"
      strokeDasharray={`${span} ${CIRCUM - span}`}
      strokeDashoffset={offset}
      strokeLinecap="round"
    />
  )
}

// 24 tick marks (one per hour), slightly longer every 6 hours
function ClockTicks() {
  const ticks = []
  for (let i = 0; i < 24; i++) {
    const frac = i / 24
    const angle = frac * 2 * Math.PI - Math.PI / 2
    const major = i % 6 === 0
    const r1 = RADIUS + 7
    const r2 = RADIUS + (major ? 14 : 10)
    ticks.push(
      <line
        key={i}
        x1={CX + r1 * Math.cos(angle)} y1={CY + r1 * Math.sin(angle)}
        x2={CX + r2 * Math.cos(angle)} y2={CY + r2 * Math.sin(angle)}
        stroke={major ? 'rgba(248,242,228,0.3)' : 'rgba(248,242,228,0.1)'}
        strokeWidth={major ? 1.5 : 1}
      />
    )
  }
  return <>{ticks}</>
}

// Gold "Now" dot on the ring
function NowMarker({ frac }) {
  if (frac == null) return null
  const { x, y } = fracToXY(frac)
  return (
    <>
      <circle cx={x} cy={y} r="9" fill="rgba(240,203,128,0.18)" />
      <circle cx={x} cy={y} r="4.5" fill="#F0CB80" />
    </>
  )
}

// Small labeled dot for sunrise / sunset pinned to the ring edge
function SunMarker({ frac, emoji, timeStr, isTop }) {
  if (frac == null) return null
  const { x, y } = fracToXY(frac, RADIUS + 22)
  return (
    <g>
      {/* connector line from ring to label */}
      {(() => {
        const inner = fracToXY(frac, RADIUS + 8)
        return <line x1={inner.x} y1={inner.y} x2={x} y2={y} stroke="rgba(248,242,228,0.2)" strokeWidth="1" />
      })()}
      <circle cx={fracToXY(frac, RADIUS).x} cy={fracToXY(frac, RADIUS).y} r="3" fill="#D9A441" />
      <text
        x={x} y={y}
        textAnchor="middle"
        dominantBaseline={isTop ? 'auto' : 'hanging'}
        fontSize="7"
        fontWeight="bold"
        fill="rgba(248,242,228,0.6)"
        fontFamily="system-ui, sans-serif"
        letterSpacing="0.5"
      >
        {emoji} {timeStr}
      </text>
    </g>
  )
}

// Tiny compass labels at cardinal points: 12 (midnight), 6A, 12 (noon), 6P
function CardinalLabels() {
  const labels = [
    { frac: 0,    label: '12A', anchor: 'middle',  dy: -10 },
    { frac: 0.25, label: '6A',  anchor: 'end',     dx: -10, dy: 4 },
    { frac: 0.5,  label: '12P', anchor: 'middle',  dy: 12 },
    { frac: 0.75, label: '6P',  anchor: 'start',   dx: 10,  dy: 4 },
  ]
  return (
    <>
      {labels.map(({ frac, label, anchor, dx = 0, dy = 0 }) => {
        const { x, y } = fracToXY(frac, RADIUS + 30)
        return (
          <text
            key={label}
            x={x + dx} y={y + dy}
            textAnchor={anchor}
            fontSize="6.5"
            fill="rgba(248,242,228,0.22)"
            fontFamily="system-ui, sans-serif"
            letterSpacing="0.8"
            fontWeight="bold"
          >
            {label}
          </text>
        )
      })}
    </>
  )
}

function Stars({ score }) {
  const full = Math.round(score / 2)
  return (
    <div className="flex gap-0.5 justify-center mt-1">
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} style={{ fontSize: '11px', color: i <= full ? '#D9A441' : 'rgba(248,242,228,0.18)' }}>★</span>
      ))}
    </div>
  )
}

export default function HeroDial({ panchang, dayScore, eyebrow, headline, subtext, chips, recalcNote }) {
  const { t } = useTranslation()
  const [breakdownOpen, setBreakdownOpen] = useState(false)
  const [nowFrac, setNowFrac] = useState(null)

  // Live clock — update every 30 seconds so the dot moves in real time
  useEffect(() => {
    function tick() {
      const now = new Date()
      setNowFrac(minToFrac(now.getHours() * 60 + now.getMinutes()))
    }
    tick()
    const id = setInterval(tick, 30_000)
    return () => clearInterval(id)
  }, [])

  const sunriseMin = parseTimeToMinutes(panchang?.sunrise)
  const sunsetMin  = parseTimeToMinutes(panchang?.sunset)
  const sunriseFrac = minToFrac(sunriseMin)
  const sunsetFrac  = minToFrac(sunsetMin)

  const m = panchang?.muhurtas

  // Daytime arc (golden tint behind the day span)
  const hasDayArc = sunriseFrac != null && sunsetFrac != null

  return (
    <div className="bg-gradient-to-br from-night-light to-night border border-primary/20 rounded-3xl p-8 sm:p-10 relative overflow-hidden">
      <div
        className="absolute -top-40 -right-32 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(217,164,65,0.1), transparent 70%)' }}
      />
      <div className="grid sm:grid-cols-[220px_1fr] gap-8 sm:gap-10 items-center relative">

        {/* ── Dial column ── */}
        <div>
          <div className="relative w-[220px] h-[220px] mx-auto">
            <svg viewBox="0 0 200 200" className="w-full h-full" overflow="visible">
              {/* Neutral track */}
              <circle cx={CX} cy={CY} r={RADIUS} fill="none" stroke="rgba(248,242,228,0.07)" strokeWidth="12" />

              {/* Daytime band — subtle golden wash between sunrise and sunset */}
              {hasDayArc && (
                <Arc startFrac={sunriseFrac} endFrac={sunsetFrac} color="rgba(217,164,65,0.12)" />
              )}

              {/* Hour ticks */}
              <ClockTicks />

              {/* Cardinal time labels */}
              <CardinalLabels />

              {/* Muhurta arcs */}
              {m && (
                <>
                  <Arc startFrac={minToFrac(parseTimeToMinutes(m.gulika_kaal?.start))}     endFrac={minToFrac(parseTimeToMinutes(m.gulika_kaal?.end))}     color="#B84040" />
                  <Arc startFrac={minToFrac(parseTimeToMinutes(m.yamaganda?.start))}        endFrac={minToFrac(parseTimeToMinutes(m.yamaganda?.end))}        color="#B84040" />
                  <Arc startFrac={minToFrac(parseTimeToMinutes(m.rahu_kaal?.start))}        endFrac={minToFrac(parseTimeToMinutes(m.rahu_kaal?.end))}        color="#B84040" />
                  <Arc startFrac={minToFrac(parseTimeToMinutes(m.abhijit_muhurta?.start))} endFrac={minToFrac(parseTimeToMinutes(m.abhijit_muhurta?.end))} color="#5B7A5E" />
                </>
              )}

              {/* Sunrise / Sunset pin markers */}
              <SunMarker frac={sunriseFrac} emoji="🌅" timeStr={panchang?.sunrise} isTop={true} />
              <SunMarker frac={sunsetFrac}  emoji="🌇" timeStr={panchang?.sunset}  isTop={false} />

              {/* Now dot — always on ring, always visible */}
              <NowMarker frac={nowFrac} />
            </svg>

            {/* Score center */}
            <button
              onClick={() => setBreakdownOpen(o => !o)}
              className="absolute inset-0 flex flex-col items-center justify-center text-center hover:opacity-90 transition-opacity"
              aria-label={t('dial_tap_breakdown')}
            >
              <span className="font-serif font-semibold leading-none" style={{ fontSize: '38px', color: '#F0CB80' }}>
                {dayScore?.score ?? '—'}
              </span>
              <span className="text-[11px]" style={{ color: 'rgba(248,242,228,0.45)' }}>/10</span>
              {dayScore?.score && <Stars score={dayScore.score} />}
              <span className="text-[8.5px] uppercase tracking-wider mt-1.5" style={{ color: 'rgba(248,242,228,0.35)' }}>
                {breakdownOpen ? t('dial_close_breakdown') : t('dial_tap_breakdown')}
              </span>
            </button>
          </div>

          {/* Score breakdown */}
          {breakdownOpen && (
            <div className="mt-5 text-[11px] leading-relaxed px-1" style={{ color: 'rgba(248,242,228,0.55)' }}>
              <p className="font-semibold mb-2" style={{ color: 'rgba(248,242,228,0.75)' }}>{t('dial_breakdown_title')}</p>
              {[
                { pct: '35%', key: 'dial_breakdown_moon' },
                { pct: '25%', key: 'dial_breakdown_dasha' },
                { pct: '20%', key: 'dial_breakdown_dignity' },
                { pct: '10%', key: 'dial_breakdown_panchang' },
                { pct: '10%', key: 'dial_breakdown_abhijit' },
              ].map(row => (
                <div key={row.key} className="flex justify-between gap-2 py-0.5">
                  <span>{t(row.key)}</span>
                  <span className="font-semibold shrink-0" style={{ color: '#F0CB80' }}>{row.pct}</span>
                </div>
              ))}
            </div>
          )}

          {/* Legend */}
          <div className="flex items-center justify-center gap-4 mt-4 text-[10px]" style={{ color: 'rgba(248,242,228,0.4)' }}>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full inline-block bg-vermillion" /> {t('dial_avoid_window')}</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full inline-block bg-sage" /> {t('dial_favorable_window')}</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full inline-block" style={{ background: '#F0CB80' }} /> {t('dial_now')}</span>
          </div>
        </div>

        {/* ── Text column ── */}
        <div className="text-center sm:text-left">
          <p className="text-xs tracking-widest uppercase font-bold mb-2" style={{ color: '#D9A441' }}>{eyebrow}</p>
          <h1 className="font-serif font-semibold leading-snug max-w-xl mb-3" style={{ fontSize: 'clamp(17px, 2.2vw, 24px)', color: 'rgba(248,242,228,0.95)' }}>
            {headline}
          </h1>
          {subtext && (
            <p className="text-sm leading-relaxed max-w-lg mb-4" style={{ color: 'rgba(248,242,228,0.65)' }}>{subtext}</p>
          )}
          {chips?.length > 0 && (
            <div className="flex flex-wrap justify-center sm:justify-start gap-2 mb-4">
              {chips.map((chip, i) => (
                <span key={i} className="text-xs px-3 py-1.5 rounded-full border" style={{ background: 'rgba(248,242,228,0.05)', borderColor: 'rgba(248,242,228,0.12)', color: 'rgba(248,242,228,0.8)' }}>
                  {chip}
                </span>
              ))}
            </div>
          )}
          {recalcNote && (
            <p className="text-[11px] flex items-center gap-2 justify-center sm:justify-start" style={{ color: 'rgba(248,242,228,0.4)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-sage inline-block" />
              {recalcNote}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
