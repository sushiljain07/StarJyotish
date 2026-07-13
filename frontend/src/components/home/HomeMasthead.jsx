// frontend/src/components/home/HomeMasthead.jsx
//
// Replaces HeroBanner + LocationSection + QuickAccess + CosmicSnapshot as
// the top of PersonalHome. This is the "sky" from the agreed redesign
// (starjyotish-home-v4.html): a night-sky band whose tone genuinely shifts
// with the time of day (computed from the real sunrise/sunset in
// panchang.data, not a demo toggle), carrying the day's real headline from
// useDailyEditor and a compact panchang preview that hands off to the new
// /panchang page.
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
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

const SKY = {
  dawn:  { sky1: '#241F3F', sky2: '#4E3A4E', bodyColor: '#E8A874', body: 'sun' },
  day:   { sky1: '#1D2C56', sky2: '#3A4E86', bodyColor: '#F2C94C', body: 'sun' },
  dusk:  { sky1: '#1E1938', sky2: '#4A2F4C', bodyColor: '#C05B3C', body: 'sun' },
  night: { sky1: '#0A0E1C', sky2: '#12102A', bodyColor: '#F7C877', body: 'moon' },
}

// Body x/y position along the arc, per bucket — dawn low-left, day high,
// dusk low-right, night high (moon doesn't track the sun's arc).
const BODY_POS = {
  dawn:  { x: 15, y: 68 },
  day:   { x: 50, y: 16 },
  dusk:  { x: 85, y: 64 },
  night: { x: 50, y: 22 },
}

function CelestialBody({ bucket, color }) {
  const { x, y } = BODY_POS[bucket]
  const r = bucket === 'day' ? 15 : 13
  if (SKY[bucket].body === 'sun') {
    return <circle cx={x} cy={y} r={r} fill={color} />
  }
  return (
    <path
      d={`M ${x} ${y - r} a ${r} ${r} 0 100 ${r * 2} a ${r * 0.72} ${r * 0.72} 0 11${-r * 0.2} ${-r * 2}z`}
      fill={color}
    />
  )
}

function initials(label) {
  return (label || '?').trim().charAt(0).toUpperCase()
}

export default function HomeMasthead({
  profile, profiles = [], location, panchang, headlineText, dashaTags,
}) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const bucket = useMemo(
    () => currentBucket(panchang?.sunrise, panchang?.sunset),
    [panchang?.sunrise, panchang?.sunset],
  )
  const sky = SKY[bucket]
  const firstName = profile?.label?.split(' ')[0]

  return (
    <div
      className="relative overflow-hidden px-4 sm:px-6 pt-5 pb-7 transition-[background] duration-1000"
      style={{ background: `linear-gradient(175deg, ${sky.sky1} 0%, ${sky.sky2} 78%)` }}
    >
      {(bucket === 'night' || bucket === 'dusk') && (
        <div className="absolute inset-0 opacity-70 pointer-events-none" aria-hidden="true">
          {Array.from({ length: 34 }).map((_, i) => (
            <span
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                width: Math.random() * 1.6 + 0.6,
                height: Math.random() * 1.6 + 0.6,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 65}%`,
                opacity: Math.random() * 0.6 + 0.3,
              }}
            />
          ))}
        </div>
      )}

      <div className="relative max-w-2xl mx-auto">
        {/* Profile chips — which chart this home page is reading right now */}
        {profiles.length > 0 && (
          <div className="flex gap-1.5 flex-wrap mb-4">
            {profiles.slice(0, 4).map(p => (
              <span
                key={p.id ?? p.label}
                className={`flex items-center gap-1.5 text-[11px] pl-1 pr-3 py-1 rounded-full ${
                  p.label === profile?.label
                    ? 'bg-primary/20 text-primary-light'
                    : 'bg-white/[0.07] text-ink-onnight/55'
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-white/[0.18] flex items-center justify-center text-[8.5px] text-ink-onnight">
                  {initials(p.label)}
                </span>
                {p.label}
              </span>
            ))}
          </div>
        )}

        <p className="font-serif text-lg font-medium text-primary-light">
          {t('home_greeting', { name: firstName ?? '' })}
        </p>
        <div className="flex gap-2 mt-1.5">
          {location?.label && (
            <span className="text-[10.5px] font-mono text-ink-onnight/55 bg-white/[0.08] px-2.5 py-1 rounded-full">
              {location.label}
            </span>
          )}
          {profile?.place && (
            <span className="text-[10.5px] font-mono text-ink-onnight/55 bg-white/[0.08] px-2.5 py-1 rounded-full">
              born {profile.place}
            </span>
          )}
        </div>

        {/* Time-of-day arc */}
        <div className="relative h-20 mt-4 -mb-1">
          <svg viewBox="0 0 100 92" preserveAspectRatio="none" className="w-full h-full" aria-hidden="true">
            <path d="M 3 86 Q 50 -12 97 86" fill="none" stroke="rgba(237,234,224,0.18)" strokeWidth="0.5" strokeDasharray="1.4 2.6" />
            <CelestialBody bucket={bucket} color={sky.bodyColor} />
          </svg>
        </div>

        {headlineText && (
          <p className="font-serif text-[21px] sm:text-[23px] font-medium leading-snug text-primary-light -mt-1">
            {headlineText}
          </p>
        )}

        {dashaTags && (dashaTags.mahadasha || dashaTags.antardasha) && (
          <div className="flex gap-2 flex-wrap mt-4">
            {dashaTags.mahadasha && (
              <span className="text-[10.5px] font-mono text-indigo-200 bg-indigo-400/[0.14] border border-indigo-300/20 px-2.5 py-1 rounded-full">
                Mahadasha · {dashaTags.mahadasha}
              </span>
            )}
            {dashaTags.antardasha && (
              <span className="text-[10.5px] font-mono text-indigo-200 bg-indigo-400/[0.14] border border-indigo-300/20 px-2.5 py-1 rounded-full">
                Antardasha · {dashaTags.antardasha}
              </span>
            )}
          </div>
        )}

        {panchang && (
          <button
            onClick={() => navigate('/panchang')}
            className="w-full text-left mt-3.5 bg-white/[0.06] border border-white/[0.1] rounded-xl px-3.5 py-3 hover:bg-white/[0.09] transition"
          >
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-mono text-ink-onnight/70 truncate">
                {panchang.tithi?.name} · {panchang.nakshatra} · {panchang.yoga}
              </span>
              <span className="text-primary-light text-xs ml-2 shrink-0">⌃</span>
            </div>
            {panchang.muhurtas?.rahu_kaal && (
              <p className="text-[10.5px] text-ink-onnight/40 mt-1">
                Rahu Kaal {panchang.muhurtas.rahu_kaal.start}–{panchang.muhurtas.rahu_kaal.end} · full panchang →
              </p>
            )}
          </button>
        )}
      </div>
    </div>
  )
}
