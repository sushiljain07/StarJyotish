import { useTranslation } from 'react-i18next'

// The dial ring represents today's daylight span (sunrise -> sunset) as a
// full circle, with Rahu Kaal / Yamaganda / Gulika Kaal shaded vermillion
// and Abhijit Muhurta shaded sage — all positioned from the ACTUAL times
// DailyPanchang fetched, not decorative placeholder arcs.
const RADIUS = 112
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

function parseTimeToMinutes(str) {
  if (!str) return null
  const [time, ampm] = str.split(' ')
  const [h0, m] = time.split(':').map(Number)
  let h = h0
  if (ampm === 'PM' && h !== 12) h += 12
  if (ampm === 'AM' && h === 12) h = 0
  return h * 60 + m
}

function Arc({ startFrac, endFrac, color }) {
  if (startFrac == null || endFrac == null) return null
  const span = Math.max(0, endFrac - startFrac) * CIRCUMFERENCE
  const offset = -startFrac * CIRCUMFERENCE
  return (
    <circle
      cx="130" cy="130" r={RADIUS} fill="none" stroke={color} strokeWidth="16"
      strokeDasharray={`${span} ${CIRCUMFERENCE - span}`}
      strokeDashoffset={offset}
      strokeLinecap="round"
    />
  )
}

// A dot at today's current time, positioned in the same raw (pre-rotation)
// coordinate space the Arc dasharray math above uses — angle 0 sits at
// SVG's 3 o'clock, and the whole <svg> gets a CSS -rotate-90 so that
// becomes 12 o'clock visually, same as every Arc segment. Without this,
// the ring is just a static illustration with no way to tell "where in
// today am I right now" relative to the colored windows.
function NowMarker({ frac }) {
  if (frac == null) return null
  const angle = frac * 2 * Math.PI
  const x = 130 + RADIUS * Math.cos(angle)
  const y = 130 + RADIUS * Math.sin(angle)
  return (
    <>
      <circle cx={x} cy={y} r="7" fill="none" stroke="#F0CB80" strokeWidth="1.5" opacity="0.5" />
      <circle cx={x} cy={y} r="4" fill="#F0CB80" />
    </>
  )
}

export default function HeroDial({ panchang, dayScore, eyebrow, headline, subtext, chips, recalcNote }) {
  const { t } = useTranslation()
  const sunriseMin = parseTimeToMinutes(panchang?.sunrise)
  const sunsetMin = parseTimeToMinutes(panchang?.sunset)
  const daySpan = sunriseMin != null && sunsetMin != null ? sunsetMin - sunriseMin : null

  function toFraction(timeStr) {
    if (!daySpan) return null
    const min = parseTimeToMinutes(timeStr)
    if (min == null) return null
    return Math.max(0, Math.min(1, (min - sunriseMin) / daySpan))
  }

  const m = panchang?.muhurtas

  // "Now" only makes sense to mark while we're actually between sunrise
  // and sunset — outside that window the ring doesn't represent the
  // current moment at all (it's still "today", just night), so the
  // marker is hidden entirely rather than clamped to a misleading edge.
  const now = new Date()
  const nowMin = now.getHours() * 60 + now.getMinutes()
  const nowFrac = daySpan && nowMin >= sunriseMin && nowMin <= sunsetMin
    ? (nowMin - sunriseMin) / daySpan
    : null

  return (
    <div className="bg-gradient-to-br from-night-light to-night border border-primary/20 rounded-3xl p-8 sm:p-10 relative overflow-hidden">
      <div
        className="absolute -top-40 -right-32 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(217,164,65,0.12), transparent 70%)' }}
      />
      <div className="grid sm:grid-cols-[240px_1fr] gap-8 sm:gap-10 items-center relative">
        <div>
          <div className="relative w-[220px] h-[220px] sm:w-[240px] sm:h-[240px] mx-auto">
            <svg viewBox="0 0 260 260" className="w-full h-full -rotate-90">
              <circle cx="130" cy="130" r={RADIUS} fill="none" stroke="rgba(248,242,228,0.08)" strokeWidth="16" />
              {daySpan && m && (
                <>
                  <Arc startFrac={toFraction(m.gulika_kaal?.start)} endFrac={toFraction(m.gulika_kaal?.end)} color="#A23B3B" />
                  <Arc startFrac={toFraction(m.yamaganda?.start)} endFrac={toFraction(m.yamaganda?.end)} color="#A23B3B" />
                  <Arc startFrac={toFraction(m.rahu_kaal?.start)} endFrac={toFraction(m.rahu_kaal?.end)} color="#A23B3B" />
                  <Arc startFrac={toFraction(m.abhijit_muhurta?.start)} endFrac={toFraction(m.abhijit_muhurta?.end)} color="#5B7A5E" />
                </>
              )}
              <NowMarker frac={nowFrac} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <p className="font-serif font-semibold text-4xl text-primary-light leading-none">
                {dayScore?.score ?? '—'}<span className="text-base text-ink-onnight/60 font-normal">/10</span>
              </p>
              <p className="text-[11px] tracking-widest uppercase text-ink-onnight/60 mt-1.5">
                {dayScore?.label ?? t('dial_loading')}
              </p>
            </div>
          </div>
          {daySpan && (
            <p className="text-center text-[10.5px] text-ink-onnight/40 mt-2.5">
              {t('dial_ring_caption', { sunrise: panchang.sunrise, sunset: panchang.sunset })}
            </p>
          )}
          {daySpan && m && (
            <div className="flex items-center justify-center gap-4 mt-2 text-[10.5px] text-ink-onnight/50 flex-wrap">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-vermillion inline-block" /> {t('dial_avoid_window')}</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-sage inline-block" /> {t('dial_favorable_window')}</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-primary inline-block" /> {t('dial_now')}</span>
            </div>
          )}
        </div>

        <div className="text-center sm:text-left">
          <p className="text-xs tracking-widest uppercase text-primary font-bold mb-2">{eyebrow}</p>
          <h1 className="font-serif font-semibold text-2xl sm:text-3xl text-primary-light leading-snug max-w-xl">
            {headline}
          </h1>
          {subtext && (
            <p className="text-sm text-ink-onnight/80 mt-3 leading-relaxed max-w-lg">{subtext}</p>
          )}
          {chips?.length > 0 && (
            <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-4">
              {chips.map((chip, i) => (
                <span key={i} className="text-xs px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/10 text-ink-onnight/85">
                  {chip}
                </span>
              ))}
            </div>
          )}
          {recalcNote && (
            <p className="text-[11px] text-ink-onnight/50 mt-3.5 flex items-center gap-2 justify-center sm:justify-start">
              <span className="w-1.5 h-1.5 rounded-full bg-sage inline-block" />
              {recalcNote}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
