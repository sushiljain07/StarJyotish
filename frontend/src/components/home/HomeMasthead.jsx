// frontend/src/components/home/HomeMasthead.jsx
//
// Purely the "sky" — ambient scene-setting only. Does NOT show the day's
// headline text; DailyPatrikaHero (the first beat right below, with its
// reactions and day-score ring) is the sole owner of that content. Showing
// it in both places was a real bug in the previous round — same sentence,
// twice, one screen apart.
//
// v2 (Home reimagined): the per-component Math.random() star sprinkle is
// gone — Starfield.jsx now renders one page-level sky behind everything,
// so this component only owns the gradient wash. The old animated
// sun-arc/projectile is replaced by a single celestial-clock disc (real
// Sun during the day, a phase-accurate Moon at night, canvas-drawn). A
// tithi line, an "edition" chip and a quiet check-in streak pill round out
// the masthead per the approved home-v5 mock. The old panchang preview
// button (tithi/nakshatra/yoga + rahu kaal, linking to /panchang) has been
// slimmed to just the tithi line below — the fuller panchang brief now
// lives once, in the TodayWindow beat, rather than duplicated here.
import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

// "6:08 AM" / "7:20 PM" -> minutes since midnight. Panchang always returns
// 12-hour strings with an AM/PM suffix (see services/panchang.py's _fmt).
function toMinutes(timeStr) {
  if (!timeStr) return null
  const m = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(timeStr.trim())
  if (!m) return null
  let [, h, min, ap] = m
  h = parseInt(h, 10) % 12
  if (/PM/i.test(ap)) h += 12
  return h * 60 + parseInt(min, 10)
}

function currentBucket(sunrise, sunset) {
  const now = new Date()
  const nowMin = now.getHours() * 60 + now.getMinutes()
  const sr = toMinutes(sunrise)
  const ss = toMinutes(sunset)
  if (sr == null || ss == null) return 'day'
  if (Math.abs(nowMin - sr) <= 60) return 'dawn'
  if (Math.abs(nowMin - ss) <= 60) return 'dusk'
  if (nowMin > sr + 60 && nowMin < ss - 60) return 'day'
  return 'night'
}

// PAGE_BG must match the page body's actual background exactly
// (bg-night-deep in tailwind.config = #0F1226) — the gradient always ends
// on this color regardless of time-of-day bucket, so the masthead fades
// into the page instead of cutting off with a visible seam. Only the top
// of the gradient (sky1) varies by bucket.
const PAGE_BG = '#0F1226'
const SKY = {
  dawn:  { sky1: '#33294F' },
  day:   { sky1: '#1D2C56' },
  dusk:  { sky1: '#2A1F42' },
  night: { sky1: '#131233' },
}

function shortLocation(label) {
  // "Hyderabad, Telangana, India" -> "Hyderabad" — the full geocoded
  // string is precise but reads as noise in a pill; the city is the part
  // that's actually useful to see at a glance. Full detail is still on
  // the profile page.
  if (!label) return null
  return label.split(',')[0].trim()
}

// ── Check-in streak — a quiet, client-only ritual signal ────────────────────
// Independent of useUserJourney's server-backed streak (which tracks card
// reactions): this one just answers "did you open the app today, and how
// many days running" — a pure visit log in localStorage.
const VISIT_KEY = 'sj_visit_days'

function useCheckInStreak() {
  const [state, setState] = useState({ streak: 0, beads: Array(7).fill(false) })

  useEffect(() => {
    try {
      const today = new Date()
      const todayKey = today.toISOString().slice(0, 10)
      const raw = JSON.parse(localStorage.getItem(VISIT_KEY) || '[]')
      let days = Array.isArray(raw) ? raw : []
      if (!days.includes(todayKey)) days = [...days, todayKey]
      days = days.slice(-90) // cap growth — only the trailing window matters
      localStorage.setItem(VISIT_KEY, JSON.stringify(days))

      const daySet = new Set(days)

      let streak = 0
      const cursor = new Date(today)
      while (daySet.has(cursor.toISOString().slice(0, 10))) {
        streak++
        cursor.setDate(cursor.getDate() - 1)
      }

      const beads = []
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today)
        d.setDate(d.getDate() - i)
        beads.push(daySet.has(d.toISOString().slice(0, 10)))
      }

      setState({ streak, beads })
    } catch {
      /* localStorage unavailable — the pill just stays quiet at zero */
    }
  }, [])

  return state
}

// Fills the top-left of the masthead's streak row, which otherwise sits
// empty — the streak pill is the only thing in that row and it's
// right-aligned, so on days with no streak (or even with one) the whole
// left half read as dead space.
function TodayDateLabel() {
  const label = useMemo(
    () => new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' }),
    [],
  )
  return <span className="text-2xs font-mono text-ink-onnight/45 whitespace-nowrap">{label}</span>
}

function StreakPill({ streak, beads, t }) {
  if (!streak) return null
  return (
    <div
      className="flex items-center gap-2 bg-white/[0.06] border border-white/[0.1] rounded-full px-3 py-1.5 shrink-0"
      title={t('home_streak_title', 'Daily check-in streak')}
    >
      <div className="flex items-center gap-[3px]">
        {beads.map((lit, i) => (
          <span
            key={i}
            className={`w-[5px] h-[5px] rounded-full ${lit ? 'bg-primary' : 'bg-primary/20'}`}
            style={lit ? { boxShadow: '0 0 6px rgba(240,203,128,0.7)' } : undefined}
          />
        ))}
      </div>
      <span className="text-2xs text-primary-glow whitespace-nowrap">
        {t('home_streak_label', { defaultValue: '{{n}}-day sky streak', n: streak })}
      </span>
    </div>
  )
}

// ── Edition chip ─────────────────────────────────────────────────────────────
function dayOfYear() {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 0)
  return Math.floor((now - start) / 86400000)
}

function EditionChip({ t }) {
  return (
    <p className="inline-flex items-center text-3xs text-primary bg-primary/[0.08] border border-dashed border-primary/40 rounded-lg px-2.5 py-1.5 mt-3">
      {t('home_edition_chip', {
        defaultValue: 'Edition #{{n}} — this page turns at sunrise',
        n: dayOfYear(),
      })}
    </p>
  )
}

// ── Tithi line ───────────────────────────────────────────────────────────────
function TithiLine({ panchang, t }) {
  if (!panchang) return null
  const tithiName = panchang.tithi?.name
  const nakName = typeof panchang.nakshatra === 'object' ? panchang.nakshatra?.name : panchang.nakshatra
  const horaName = typeof panchang.hora === 'object' ? panchang.hora?.name : panchang.hora

  const parts = []
  if (tithiName) parts.push(tithiName)
  if (nakName) parts.push(t('home_tithi_moon_in', { defaultValue: 'Moon in {{nak}}', nak: nakName }))
  if (horaName) parts.push(t('home_tithi_hora', { defaultValue: '{{planet}} hora', planet: horaName }))

  if (!parts.length) return null
  return <p className="text-xs text-ink-onnight/55 mt-1.5">{parts.join(' · ')}</p>
}

// ── Celestial clock ──────────────────────────────────────────────────────────
// Day (local hours 6–18): a warm glowing Sun disc. Night: the real Moon,
// phase computed with the same synodic approximation as the approved mock
// (reference new moon 2000-01-06 18:14 UTC-naive, period 29.530588853
// days) and drawn on a small canvas — no image assets, just geometry.
// Tailwind has no radial-gradient utility, so this needs a literal CSS
// background string — but the two stops are exactly the primary-glow and
// primary token hex values, not invented colors.
function SunDisc({ size = 52 }) {
  return (
    <div
      className="rounded-full"
      style={{
        width: size,
        height: size,
        background: 'radial-gradient(circle at 35% 32%, #F0CB80 0%, #D9A441 100%)',
        boxShadow: '0 0 22px 4px rgba(217,164,65,0.4)',
      }}
      aria-hidden="true"
    />
  )
}

function moonPhase() {
  const synodic = 29.530588853
  const ref = new Date(2000, 0, 6, 18, 14)
  const now = new Date()
  let age = ((now - ref) / 86400000) % synodic
  if (age < 0) age += synodic
  const illum = (1 - Math.cos((age / synodic) * 2 * Math.PI)) / 2
  const waxing = age < synodic / 2
  return { illum, waxing }
}

function MoonDisc({ t, size = 52 }) {
  const canvasRef = useRef(null)
  const { illum, waxing } = useMemo(moonPhase, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const R = size * 0.4
    const CX = size / 2
    const CY = size / 2

    ctx.clearRect(0, 0, size, size)

    // Step 1: draw the full lit disc
    ctx.fillStyle = '#FBF0DC'
    ctx.beginPath()
    ctx.arc(CX, CY, R, 0, Math.PI * 2)
    ctx.fill()

    // Step 2: paint the dark (unlit) portion over the top.
    //
    // The terminator divides the disc into a lit crescent and a dark region.
    // We always draw the dark half that faces away from the sun, then add or
    // subtract the terminator ellipse depending on phase.
    //
    // waxing (age < 14.75 days): sun is on the right → lit crescent on right
    //   • dark covers left semicircle + the right portion beyond the terminator
    //   • terminator ellipse width = R * (1 - 2*illum), positive = bulges left
    //
    // waning (age ≥ 14.75 days): sun is on the left → lit crescent on left
    //   • dark covers right semicircle + left portion beyond terminator
    //   • terminator ellipse width = R * (2*illum - 1), positive = bulges right
    //
    // ellipse x-radius: at new moon illum≈0 → w≈R (fully dark);
    //                   at full moon illum≈1 → w≈R (fully lit, dark side gone);
    //                   at quarter moon illum≈0.5 → w≈0 (straight terminator).
    ctx.fillStyle = '#171B33'
    ctx.beginPath()
    if (waxing) {
      // Dark left half
      ctx.arc(CX, CY, R, Math.PI / 2, -Math.PI / 2, false)
      // Terminator ellipse: positive w means the ellipse curves further left
      // (more dark = less illum); negative w curves right (less dark = more illum)
      const w = R * (1 - 2 * illum)   // >0 near new moon, <0 near full moon
      ctx.ellipse(CX, CY, Math.abs(w), R, 0, -Math.PI / 2, Math.PI / 2, w < 0)
    } else {
      // Dark right half
      ctx.arc(CX, CY, R, -Math.PI / 2, Math.PI / 2, false)
      const w = R * (2 * illum - 1)   // >0 near full moon, <0 near new moon
      ctx.ellipse(CX, CY, Math.abs(w), R, 0, Math.PI / 2, -Math.PI / 2, w > 0)
    }
    ctx.fill()
  }, [size, illum, waxing])

  return (
    <div className="flex flex-col items-center">
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        style={{ filter: 'drop-shadow(0 0 14px rgba(240,203,128,0.28))' }}
      />
      <p className="text-3xs text-ink-onnight/45 mt-1 whitespace-nowrap">
        {waxing ? t('home_moon_waxing', 'Waxing') : t('home_moon_waning', 'Waning')}
        {' · '}
        {Math.round(illum * 100)}%
      </p>
    </div>
  )
}

// The disc reads as noticeably small on wider (tablet/desktop) viewports,
// where the rest of the masthead's type and spacing scale up but this
// stayed pinned at its mobile size — bump it up past the sm breakpoint.
function useResponsiveClockSize() {
  const [size, setSize] = useState(() => (
    typeof window !== 'undefined' && window.innerWidth >= 640 ? 68 : 52
  ))
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 640px)')
    const update = e => setSize(e.matches ? 68 : 52)
    update(mq)
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])
  return size
}

function CelestialClock({ t }) {
  const hour = new Date().getHours()
  const isDay = hour >= 6 && hour < 18
  const size = useResponsiveClockSize()
  return (
    <div className="shrink-0" aria-hidden="true">
      {isDay ? <SunDisc size={size} /> : <MoonDisc t={t} size={size} />}
    </div>
  )
}

export default function HomeMasthead({ profile, location, panchang, dashaTags }) {
  const { t } = useTranslation()
  const { streak, beads } = useCheckInStreak()

  const bucket = useMemo(
    () => currentBucket(panchang?.sunrise, panchang?.sunset),
    [panchang?.sunrise, panchang?.sunset],
  )
  const sky = SKY[bucket]
  const firstName = profile?.label?.split(' ')[0]
  const currentCity = shortLocation(location?.label)
  const birthCity = shortLocation(profile?.place)

  return (
    <div
      className="relative overflow-hidden px-4 sm:px-6 pt-5 pb-8 transition-[background] duration-1000"
      style={{ background: `linear-gradient(180deg, ${sky.sky1} 0%, ${PAGE_BG} 100%)` }}
    >
      <div className="relative max-w-2xl mx-auto">
        {/* Today's date on the left, streak pill on the right — no profile
            name chip here (single-profile app). */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <TodayDateLabel />
          <StreakPill streak={streak} beads={beads} t={t} />
        </div>

        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="font-serif text-lg font-medium text-primary-light">
              {t('home_greeting', { name: firstName ?? '' })}
            </p>
            <div className="flex gap-2 mt-1.5 flex-wrap">
              {currentCity && (
                <span className="text-3xs font-mono text-ink-onnight/55 bg-white/[0.08] px-2.5 py-1 rounded-full">
                  Current: {currentCity}
                </span>
              )}
              {birthCity && (
                <span className="text-3xs font-mono text-ink-onnight/55 bg-white/[0.08] px-2.5 py-1 rounded-full">
                  Birth: {birthCity}
                </span>
              )}
            </div>
            <TithiLine panchang={panchang} t={t} />
            <EditionChip t={t} />
          </div>

          <CelestialClock t={t} />
        </div>

        {dashaTags && (dashaTags.mahadasha || dashaTags.antardasha) && (
          <div className="flex gap-2 flex-wrap mt-4">
            {dashaTags.mahadasha && (
              <span className="text-2xs font-mono text-primary-glow bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-full">
                Mahadasha · {dashaTags.mahadasha}
              </span>
            )}
            {dashaTags.antardasha && (
              <span className="text-2xs font-mono text-primary-glow bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-full">
                Antardasha · {dashaTags.antardasha}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
