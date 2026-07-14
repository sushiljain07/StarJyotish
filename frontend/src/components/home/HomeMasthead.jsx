// frontend/src/components/home/HomeMasthead.jsx
//
// Purely the "sky" — ambient scene-setting only. Does NOT show the day's
// headline text; DailyPatrikaHero (the first beat right below, with its
// reactions and day-score ring) is the sole owner of that content. Showing
// it in both places was a real bug in the previous round — same sentence,
// twice, one screen apart.
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

// PAGE_BG must match the page body's actual background exactly
// (bg-night-deep in tailwind.config = #0F1226) — the gradient always ends
// on this color regardless of time-of-day bucket, so the masthead fades
// into the page instead of cutting off with a visible seam. Only the top
// of the gradient (sky1) and the celestial body's color vary by bucket.
const PAGE_BG = '#0F1226'
const SKY = {
  dawn:  { sky1: '#33294F', bodyColor: '#E8A874', body: 'sun' },
  day:   { sky1: '#1D2C56', bodyColor: '#F2C94C', body: 'sun' },
  dusk:  { sky1: '#2A1F42', bodyColor: '#C05B3C', body: 'sun' },
  night: { sky1: '#131233', bodyColor: '#F7C877', body: 'moon' },
}

// Body position along the arc, as a % of the band's width/height — dawn
// low-left, day high-center, dusk low-right, night high (moon doesn't
// track the sun's arc). Rendered as a real HTML circle (see below), not
// an SVG shape stretched by preserveAspectRatio="none" — that stretch is
// what turned the sun into a flat ellipse in the previous round.
const BODY_POS = {
  dawn:  { left: '15%', top: '68%' },
  day:   { left: '50%', top: '18%' },
  dusk:  { left: '85%', top: '64%' },
  night: { left: '50%', top: '24%' },
}

function shortLocation(label) {
  // "Hyderabad, Telangana, India" -> "Hyderabad" — the full geocoded
  // string is precise but reads as noise in a pill; the city is the part
  // that's actually useful to see at a glance. Full detail is still on
  // the profile page.
  if (!label) return null
  return label.split(',')[0].trim()
}

function initials(label) {
  return (label || '?').trim().charAt(0).toUpperCase()
}

export default function HomeMasthead({ profile, profiles = [], location, panchang, dashaTags }) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const bucket = useMemo(
    () => currentBucket(panchang?.sunrise, panchang?.sunset),
    [panchang?.sunrise, panchang?.sunset],
  )
  const sky = SKY[bucket]
  const pos = BODY_POS[bucket]
  const firstName = profile?.label?.split(' ')[0]
  const currentCity = shortLocation(location?.label)
  const birthCity = shortLocation(profile?.place)

  return (
    <div
      className="relative overflow-hidden px-4 sm:px-6 pt-5 pb-8 transition-[background] duration-1000"
      style={{ background: `linear-gradient(180deg, ${sky.sky1} 0%, ${PAGE_BG} 100%)` }}
    >
      {(bucket === 'night' || bucket === 'dusk') && (
        <div className="absolute inset-0 opacity-70 pointer-events-none" aria-hidden="true">
          {Array.from({ length: 28 }).map((_, i) => (
            <span
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                width: Math.random() * 1.6 + 0.6,
                height: Math.random() * 1.6 + 0.6,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 55}%`,
                opacity: Math.random() * 0.6 + 0.3,
              }}
            />
          ))}
        </div>
      )}

      <div className="relative max-w-2xl mx-auto">
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
        <div className="flex gap-2 mt-1.5 flex-wrap">
          {currentCity && (
            <span className="text-[10.5px] font-mono text-ink-onnight/55 bg-white/[0.08] px-2.5 py-1 rounded-full">
              Current: {currentCity}
            </span>
          )}
          {birthCity && (
            <span className="text-[10.5px] font-mono text-ink-onnight/55 bg-white/[0.08] px-2.5 py-1 rounded-full">
              Birth: {birthCity}
            </span>
          )}
        </div>

        {/* Time-of-day arc — line stretches fine visually; the body itself
            is a fixed-aspect HTML circle overlaid on top so it can never
            distort into an ellipse. */}
        <div className="relative h-16 mt-5">
          <svg viewBox="0 0 100 60" preserveAspectRatio="none" className="w-full h-full absolute inset-0" aria-hidden="true">
            <path d="M 3 56 Q 50 -14 97 56" fill="none" stroke="rgba(237,234,224,0.16)" strokeWidth="0.5" strokeDasharray="1.4 2.6" />
          </svg>
          <span
            className="absolute rounded-full"
            style={{
              left: pos.left, top: pos.top,
              width: 22, height: 22,
              transform: 'translate(-50%, -50%)',
              background: sky.bodyColor,
              boxShadow: sky.body === 'moon' ? 'inset -5px -2px 0 0 rgba(15,18,38,0.65)' : `0 0 18px 2px ${sky.bodyColor}55`,
            }}
          />
        </div>

        {dashaTags && (dashaTags.mahadasha || dashaTags.antardasha) && (
          <div className="flex gap-2 flex-wrap mt-3">
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
                {panchang.tithi?.name} · {typeof panchang.nakshatra === 'object' ? panchang.nakshatra?.name : panchang.nakshatra} · {panchang.yoga}
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
