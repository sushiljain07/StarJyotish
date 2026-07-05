// frontend/src/components/home/HeroDial.jsx
//
// The ring is a clock — sunrise at 12 o'clock, sunset at 6 o'clock
// (bottom), Rahu Kaal / Yamaganda / Gulika Kaal red, Abhijit green,
// gold dot = right now. This is stated on the ring itself (sunrise/
// sunset anchors, clock tick marks) so users don't have to decode it.
//
// Score changed from "5.6/10 MIXED DAY" to a star rating alongside the
// number — stars communicate the level faster than a number alone, and
// "Mixed Day" as a label was less useful than showing the stars and
// letting the number speak. The center is tappable for a score breakdown
// that explains what drives the number, which builds the trust that a
// number without an explanation can't earn on its own.
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

const RADIUS = 82
const CX = 100, CY = 100
const CIRCUM = 2 * Math.PI * RADIUS

function parseTimeToMinutes(str) {
  if (!str) return null
  const [time, ampm] = str.split(' ')
  const [h0, m] = time.split(':').map(Number)
  let h = h0
  if (ampm === 'PM' && h !== 12) h += 12
  if (ampm === 'AM' && h === 12) h = 0
  return h * 60 + m
}

// Build an SVG arc segment on a circle centered at (CX,CY).
// The whole <svg> rotates -90deg via CSS so frac=0 sits at the top (12
// o'clock visual). This must match DailyTimeline's coordinate assumptions.
function Arc({ startFrac, endFrac, color }) {
  if (startFrac == null || endFrac == null) return null
  const span = Math.max(0.001, endFrac - startFrac) * CIRCUM
  const offset = -startFrac * CIRCUM
  return (
    <circle
      cx={CX} cy={CY} r={RADIUS} fill="none" stroke={color} strokeWidth="13"
      strokeDasharray={`${span} ${CIRCUM - span}`}
      strokeDashoffset={offset}
      strokeLinecap="round"
    />
  )
}

// Twelve tick marks around the outer edge of the ring, like a clock
// face. Without these the ring looks like abstract colored arcs; with
// them it immediately reads as a time-based circular scale.
function ClockTicks() {
  const ticks = []
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * 2 * Math.PI - Math.PI / 2
    const r1 = RADIUS + 8, r2 = RADIUS + 12
    ticks.push(
      <line
        key={i}
        x1={CX + r1 * Math.cos(angle)} y1={CY + r1 * Math.sin(angle)}
        x2={CX + r2 * Math.cos(angle)} y2={CY + r2 * Math.sin(angle)}
        stroke="rgba(248,242,228,0.15)" strokeWidth="1.5"
      />
    )
  }
  return <>{ticks}</>
}

function NowMarker({ frac }) {
  if (frac == null) return null
  const angle = frac * 2 * Math.PI - Math.PI / 2
  const x = CX + RADIUS * Math.cos(angle)
  const y = CY + RADIUS * Math.sin(angle)
  return (
    <>
      <circle cx={x} cy={y} r="8" fill="rgba(240,203,128,0.2)" />
      <circle cx={x} cy={y} r="4.5" fill="#F0CB80" />
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

  const sunriseMin = parseTimeToMinutes(panchang?.sunrise)
  const sunsetMin  = parseTimeToMinutes(panchang?.sunset)
  const daySpan = sunriseMin != null && sunsetMin != null ? sunsetMin - sunriseMin : null

  function toFraction(timeStr) {
    if (!daySpan) return null
    const min = parseTimeToMinutes(timeStr)
    if (min == null) return null
    return Math.max(0, Math.min(1, (min - sunriseMin) / daySpan))
  }

  const m = panchang?.muhurtas
  const now = new Date()
  const nowMin = now.getHours() * 60 + now.getMinutes()
  const nowFrac = daySpan && nowMin >= sunriseMin && nowMin <= sunsetMin
    ? (nowMin - sunriseMin) / daySpan
    : null

  return (
    <div className="bg-gradient-to-br from-night-light to-night border border-primary/20 rounded-3xl p-8 sm:p-10 relative overflow-hidden">
      <div
        className="absolute -top-40 -right-32 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(217,164,65,0.1), transparent 70%)' }}
      />
      <div className="grid sm:grid-cols-[220px_1fr] gap-8 sm:gap-10 items-center relative">

        {/* ── Dial column ── */}
        <div>
          {/* Ring */}
          <div className="relative w-[200px] h-[200px] mx-auto">
            {/* Sunrise / Sunset labels outside the SVG, anchored via absolute position */}
            {daySpan && (
              <>
                <span className="absolute top-[-20px] left-1/2 -translate-x-1/2 text-[9.5px] font-bold text-primary/70 uppercase tracking-wide whitespace-nowrap">
                  🌅 {panchang.sunrise}
                </span>
                <span className="absolute bottom-[-20px] left-1/2 -translate-x-1/2 text-[9.5px] font-bold text-primary/70 uppercase tracking-wide whitespace-nowrap">
                  🌇 {panchang.sunset}
                </span>
                <span className="absolute top-1/2 -translate-y-1/2 left-[-28px] text-[8.5px] text-primary/40 uppercase tracking-wide">
                  AM
                </span>
                <span className="absolute top-1/2 -translate-y-1/2 right-[-28px] text-[8.5px] text-primary/40 uppercase tracking-wide">
                  PM
                </span>
              </>
            )}

            <svg viewBox="0 0 200 200" className="w-full h-full">
              {/* Neutral track */}
              <circle cx={CX} cy={CY} r={RADIUS} fill="none" stroke="rgba(248,242,228,0.07)" strokeWidth="13" />
              {/* Clock ticks — drawn BEFORE the arcs so arcs sit on top */}
              <ClockTicks />
              {/* Avoid windows — drawn at -90deg orientation so frac=0 is 12 o'clock */}
              <g style={{ transform: 'rotate(-90deg)', transformOrigin: `${CX}px ${CY}px` }}>
                {daySpan && m && (
                  <>
                    <Arc startFrac={toFraction(m.gulika_kaal?.start)}     endFrac={toFraction(m.gulika_kaal?.end)}     color="#B84040" />
                    <Arc startFrac={toFraction(m.yamaganda?.start)}        endFrac={toFraction(m.yamaganda?.end)}        color="#B84040" />
                    <Arc startFrac={toFraction(m.rahu_kaal?.start)}        endFrac={toFraction(m.rahu_kaal?.end)}        color="#B84040" />
                    <Arc startFrac={toFraction(m.abhijit_muhurta?.start)} endFrac={toFraction(m.abhijit_muhurta?.end)} color="#5B7A5E" />
                  </>
                )}
                <NowMarker frac={nowFrac} />
              </g>
            </svg>

            {/* Score center — tappable for breakdown */}
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

          {/* Score breakdown (shown on tap) */}
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

          {/* Compact legend */}
          {daySpan && m && (
            <div className="flex items-center justify-center gap-4 mt-4 text-[10px]" style={{ color: 'rgba(248,242,228,0.4)' }}>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full inline-block bg-vermillion" /> {t('dial_avoid_window')}</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full inline-block bg-sage" /> {t('dial_favorable_window')}</span>
              {nowFrac != null && <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full inline-block" style={{ background: '#F0CB80' }} /> {t('dial_now')}</span>}
            </div>
          )}
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
