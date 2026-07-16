// frontend/src/components/home/TodayWindow.jsx
//
// "Your window today" — turns the panchang's muhurta data into one
// practical read: a 6am–9pm timeline with the Abhijit muhurta (favorable)
// and Rahu kaal (avoid beginnings) marked, a live "now" marker from the
// real clock, and a plain-English "best window" line. Falls back to the
// classical formulas (solar-midday ± 24 min for Abhijit; the 1/8th-of
// daytime octant by weekday for Rahu kaal) when the backend hasn't
// returned muhurtas yet, so the card never looks broken while panchang is
// still loading — same spirit as WeekStrip's "computed, not invented"
// rule.
//
// Below the timeline, a compact panchang summary echoes today's classical
// limbs + sky timings as small labeled cells, skipping whatever the
// current panchang payload doesn't have (there's no "hora" field from the
// backend today, so that cell simply never renders). The brief lives here
// once; "Full panchang →" carries the rest. The whole card is one CTA
// into /panchang.
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const WINDOW_START_MIN = 6 * 60   // 6:00 am
const WINDOW_END_MIN   = 21 * 60  // 9:00 pm

// "6:08 AM" -> minutes since midnight. Panchang always returns 12-hour
// strings with an AM/PM suffix (see services/panchang.py's _fmt) — same
// parser as HomeMasthead.jsx.
function parseAmPm(timeStr) {
  if (!timeStr) return null
  const m = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(timeStr.trim())
  if (!m) return null
  let [, h, min, ap] = m
  h = parseInt(h, 10) % 12
  if (/PM/i.test(ap)) h += 12
  return h * 60 + parseInt(min, 10)
}

function minutesToLabel(mins) {
  const m = ((Math.round(mins) % 1440) + 1440) % 1440
  let h = Math.floor(m / 60)
  const mm = m % 60
  const ap = h >= 12 ? 'PM' : 'AM'
  h = h % 12
  if (h === 0) h = 12
  return `${h}:${String(mm).padStart(2, '0')} ${ap}`
}

function pctOf(mins) {
  const p = (mins - WINDOW_START_MIN) / (WINDOW_END_MIN - WINDOW_START_MIN)
  return Math.max(0, Math.min(100, p * 100))
}

// Classical 1/8th-of-daytime Rahu Kaal octant, by weekday (JS getDay(): 0=Sun).
const RAHU_OCTANT_BY_WEEKDAY = { 0: 8, 1: 2, 2: 7, 3: 5, 4: 6, 5: 4, 6: 3 }

function computeWindow(panchang) {
  const sunrise = parseAmPm(panchang?.sunrise) ?? 6 * 60
  const sunset  = parseAmPm(panchang?.sunset)  ?? 18 * 60
  const daylight = Math.max(1, sunset - sunrise)

  // Trust a backend window only if it's coherent (inside daylight, start
  // before end) — the muhurta block can arrive timezone-shifted, and a
  // "1:22 AM" Rahu kaal would paint the whole bar. Fall back to the
  // classical formulas otherwise.
  const sane = (start, end) =>
    start != null && end != null && start < end && start >= sunrise && end <= sunset

  let abhijitStart = parseAmPm(panchang?.muhurtas?.abhijit_muhurta?.start)
  let abhijitEnd   = parseAmPm(panchang?.muhurtas?.abhijit_muhurta?.end)
  if (!sane(abhijitStart, abhijitEnd)) {
    const midday = sunrise + daylight / 2
    abhijitStart = midday - 24
    abhijitEnd = midday + 24
  }

  let rahuStart = parseAmPm(panchang?.muhurtas?.rahu_kaal?.start)
  let rahuEnd   = parseAmPm(panchang?.muhurtas?.rahu_kaal?.end)
  if (!sane(rahuStart, rahuEnd)) {
    const octant = RAHU_OCTANT_BY_WEEKDAY[new Date().getDay()]
    const segment = daylight / 8
    rahuStart = sunrise + (octant - 1) * segment
    rahuEnd = rahuStart + segment
  }

  return { abhijitStart, abhijitEnd, rahuStart, rahuEnd }
}

function PanchangCell({ label, value }) {
  if (!value) return null
  return (
    <div className="min-w-0">
      <p className="text-3xs uppercase tracking-wider text-ink-faint">{label}</p>
      <p className="text-xs text-ink-onnight truncate">{value}</p>
    </div>
  )
}

export default function TodayWindow({ panchang }) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const { abhijitStart, abhijitEnd, rahuStart, rahuEnd } = useMemo(
    () => computeWindow(panchang),
    [panchang?.sunrise, panchang?.sunset, panchang?.muhurtas],
  )

  const nowPct = useMemo(() => {
    const now = new Date()
    const nowMin = now.getHours() * 60 + now.getMinutes()
    const p = (nowMin - WINDOW_START_MIN) / (WINDOW_END_MIN - WINDOW_START_MIN)
    return Math.max(2, Math.min(98, p * 100))
  }, [])

  const goodLeft = pctOf(abhijitStart)
  const goodWidth = Math.max(1, pctOf(abhijitEnd) - goodLeft)
  const avoidLeft = pctOf(rahuStart)
  const avoidWidth = Math.max(1, pctOf(rahuEnd) - avoidLeft)

  const tithiName = panchang?.tithi?.name
  const nakName = typeof panchang?.nakshatra === 'object' ? panchang?.nakshatra?.name : panchang?.nakshatra
  const horaName = typeof panchang?.hora === 'object' ? panchang?.hora?.name : panchang?.hora

  const hasSummary = Boolean(
    tithiName || nakName || panchang?.yoga || panchang?.karana || panchang?.sunrise || panchang?.sunset || horaName,
  )

  return (
    <button
      onClick={() => navigate('/panchang')}
      className="w-full text-left bg-white/[0.045] border border-white/[0.09] rounded-card p-5 hover:border-primary/30 transition"
    >
      <div className="relative h-3.5 rounded-full bg-white/[0.06] mx-1 mt-2 mb-2">
        <div
          className="absolute top-0 h-full rounded-full"
          style={{
            left: `${goodLeft}%`,
            width: `${goodWidth}%`,
            background: 'linear-gradient(90deg, rgba(217,164,65,0.55), rgba(240,203,128,0.85))',
            boxShadow: '0 0 12px rgba(240,203,128,0.35)',
          }}
        />
        <div
          className="absolute top-0 h-full rounded-full bg-vermillion/40"
          style={{ left: `${avoidLeft}%`, width: `${avoidWidth}%` }}
        />
        <div
          className="absolute -top-1.5 w-0.5 h-[26px] bg-white rounded-sm motion-reduce:transition-none"
          style={{ left: `${nowPct}%`, boxShadow: '0 0 8px rgba(255,255,255,0.8)' }}
        >
          <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[8px] tracking-widest uppercase text-white whitespace-nowrap">
            {t('home_window_now', 'now')}
          </span>
        </div>
      </div>

      <div className="flex justify-between text-3xs text-ink-faint px-1">
        <span>6 am</span><span>noon</span><span>9 pm</span>
      </div>

      <div className="flex gap-5 mt-3 text-2xs text-ink-onnight/60 flex-wrap">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-primary-glow shrink-0" style={{ boxShadow: '0 0 6px rgba(240,203,128,0.6)' }} />
          {t('home_window_abhijit', 'Abhijit muhurta — favorable')}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-vermillion shrink-0" />
          {t('home_window_rahu', 'Rahu kaal — avoid beginnings')}
        </span>
      </div>

      <p className="text-sm text-ink-onnight mt-3">
        {t('home_window_best', {
          defaultValue: 'Best window: {{start}} – {{end}}',
          start: minutesToLabel(abhijitStart),
          end: minutesToLabel(abhijitEnd),
        })}
        {' — '}
        {t('home_window_best_hint', 'sign, send, or start it here.')}
      </p>

      {hasSummary && (
        <div className="grid grid-cols-3 gap-x-3 gap-y-2.5 mt-4 pt-4 border-t border-white/[0.08]">
          <PanchangCell label={t('panchang_tithi', 'Tithi')} value={tithiName} />
          <PanchangCell label={t('panchang_nakshatra', 'Nakshatra')} value={nakName} />
          <PanchangCell label={t('panchang_yoga', 'Yoga')} value={panchang?.yoga} />
          <PanchangCell label={t('panchang_karana', 'Karana')} value={panchang?.karana} />
          <PanchangCell label={t('home_window_sunrise', 'Sunrise')} value={panchang?.sunrise} />
          <PanchangCell label={t('home_window_sunset', 'Sunset')} value={panchang?.sunset} />
          <PanchangCell label={t('home_window_hora', 'Hora')} value={horaName} />
        </div>
      )}

      <p className="text-2xs font-bold text-primary mt-4">
        {t('home_window_full_panchang', 'Full panchang →')}
      </p>
    </button>
  )
}
