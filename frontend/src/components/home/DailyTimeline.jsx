// frontend/src/components/home/DailyTimeline.jsx
//
// The interactive timeline that replaces the old static legend row
// under HeroDial. Each muhurta window is a row showing time, name and
// a colored badge. Tapping any row expands an in-place detail panel
// showing what to do and what to avoid in that window. If the user is
// currently inside an avoid window, a "next good window" banner shows
// how long until the next favorable period — the most actionable thing
// the old ring had no room to communicate.
//
// Data contract: accepts the same `panchang.muhurtas` object + the
// panchang's sunrise/sunset strings that HeroDial already receives, so
// it needs no additional API calls.
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

function parseTimeToMinutes(str) {
  if (!str) return null
  const [time, ampm] = str.split(' ')
  const [h0, m] = time.split(':').map(Number)
  let h = h0
  if (ampm === 'PM' && h !== 12) h += 12
  if (ampm === 'AM' && h === 12) h = 0
  return h * 60 + m
}

function fmt(min) {
  const h = Math.floor(min / 60), m = min % 60
  const ampm = h >= 12 ? 'PM' : 'AM'
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`
}

// The content for each slot — what to do and what to avoid.
// Deliberately not going through t() for the individual item text, since
// these are the same classical rules regardless of UI language (the same
// Rahu Kaal advice in Hindi and English is the same advice), and
// translating 30+ specific action items would produce a lot of keys for
// content that reads the same way to an astrology-familiar reader in both
// languages.  Section headings (Good for / Avoid) DO go through t().
const SLOT_DETAILS = {
  sunrise: {
    do:    ['Morning prayers / meditation', 'Starting new ventures', 'Physical activity'],
    avoid: ['Oversleeping this window'],
  },
  gulika: {
    do:    ['Routine administrative work', 'Desk work and correspondence'],
    avoid: ['Starting new projects', 'Financial commitments', 'Beginning travel'],
  },
  yamaganda: {
    do:    ['Reading, study, inner work'],
    avoid: ['Signing documents', 'New negotiations', 'Medical procedures'],
  },
  abhijit: {
    do:    ['Financial conversations', 'Interviews and negotiations', 'Starting anything important', 'Important emails and decisions'],
    avoid: ['Emotional confrontations'],
  },
  rahu: {
    do:    ['Routine tasks', 'Exercise', 'Reading'],
    avoid: ['Signing contracts', 'New investments', 'New purchases', 'Starting travel'],
  },
  sunset: {
    do:    ['Evening prayers', 'Reflection and journaling', 'Family time'],
    avoid: [],
  },
}

export default function DailyTimeline({ panchang }) {
  const { t } = useTranslation()
  const [openSlot, setOpenSlot] = useState(null)

  if (!panchang?.sunrise || !panchang?.muhurtas) return null

  const sunriseMin = parseTimeToMinutes(panchang.sunrise)
  const sunsetMin  = parseTimeToMinutes(panchang.sunset)
  const m = panchang.muhurtas
  const now = new Date()
  const nowMin = now.getHours() * 60 + now.getMinutes()
  const duringDay = nowMin >= sunriseMin && nowMin <= sunsetMin

  // Build slots in chronological order.
  const rawSlots = [
    { id: 'sunrise',  start: sunriseMin,                        end: sunriseMin,                      kind: 'anchor',    labelKey: 'slot_sunrise_label',  badgeKey: 'slot_sunrise_badge'  },
    { id: 'gulika',   start: parseTimeToMinutes(m.gulika_kaal?.start),   end: parseTimeToMinutes(m.gulika_kaal?.end),   kind: 'avoid',  labelKey: 'slot_gulika_label',   badgeKey: 'slot_badge_avoid'    },
    { id: 'abhijit',  start: parseTimeToMinutes(m.abhijit_muhurta?.start), end: parseTimeToMinutes(m.abhijit_muhurta?.end), kind: 'good', labelKey: 'slot_abhijit_label',  badgeKey: 'slot_badge_best'    },
    { id: 'yamaganda',start: parseTimeToMinutes(m.yamaganda?.start),   end: parseTimeToMinutes(m.yamaganda?.end),   kind: 'avoid',  labelKey: 'slot_yamaganda_label',badgeKey: 'slot_badge_avoid'   },
    { id: 'rahu',     start: parseTimeToMinutes(m.rahu_kaal?.start),    end: parseTimeToMinutes(m.rahu_kaal?.end),    kind: 'avoid',  labelKey: 'slot_rahu_label',     badgeKey: 'slot_badge_avoid'    },
    { id: 'sunset',   start: sunsetMin,                         end: sunsetMin,                       kind: 'anchor',    labelKey: 'slot_sunset_label',   badgeKey: 'slot_sunset_badge'   },
  ].filter(s => s.start != null).sort((a, b) => a.start - b.start)

  // Detect whether "now" falls inside each slot.
  function isNow(slot) {
    if (!duringDay) return false
    if (slot.kind === 'anchor') return Math.abs(nowMin - slot.start) < 5
    return nowMin >= slot.start && nowMin < slot.end
  }

  // Find the next favorable window after now.
  const nextGoodSlot = rawSlots.find(s => s.kind === 'good' && s.start > nowMin)
  const currentlyAvoiding = duringDay && rawSlots.some(s => s.kind === 'avoid' && isNow(s))

  function minsAwayStr(slot) {
    const diff = slot.start - nowMin
    const h = Math.floor(diff / 60), min = diff % 60
    if (h > 0) return t('timeline_away_hours', { h, m: min })
    return t('timeline_away_mins', { m: diff })
  }

  const dotColor = { avoid: 'bg-vermillion', good: 'bg-sage', anchor: 'bg-primary' }
  const badgeStyle = {
    avoid:  'bg-vermillion-light text-vermillion',
    good:   'bg-sage-light text-sage',
    anchor: 'bg-primary/10 text-primary-dark',
  }

  return (
    <div>
      {/* "Next good window" hint — only visible when in an avoid window */}
      {currentlyAvoiding && nextGoodSlot && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-sage-light/60 border border-sage/30 mb-4">
          <span className="text-xl shrink-0">🟢</span>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-sage mb-0.5">{t('timeline_next_window_label')}</p>
            <p className="text-sm font-semibold text-ink">{fmt(nextGoodSlot.start)} – {fmt(nextGoodSlot.end)}</p>
            <p className="text-[11px] text-ink-muted">{minsAwayStr(nextGoodSlot)} — {t(nextGoodSlot.labelKey)}</p>
          </div>
        </div>
      )}

      {/* Timeline rows */}
      <div className="flex flex-col gap-1">
        {rawSlots.map(slot => {
          const active = openSlot === slot.id
          const now = isNow(slot)
          const details = SLOT_DETAILS[slot.id]
          const timeStr = slot.kind === 'anchor'
            ? fmt(slot.start)
            : `${fmt(slot.start)} – ${fmt(slot.end)}`

          return (
            <div key={slot.id}>
              <button
                onClick={() => setOpenSlot(active ? null : slot.id)}
                className={`w-full text-left grid gap-2 px-3 py-2.5 rounded-xl border transition-colors ${
                  now
                    ? 'bg-primary/5 border-primary/25'
                    : active
                      ? 'bg-parchment-card border-line'
                      : 'bg-transparent border-transparent hover:bg-parchment-card hover:border-line'
                }`}
                style={{ gridTemplateColumns: '108px 8px 1fr auto' }}
              >
                <span className="text-[11.5px] text-ink-faint tabular-nums">{timeStr}</span>
                <span className={`w-2 h-2 rounded-full self-center shrink-0 ${dotColor[slot.kind]}`} />
                <span className="text-[12.5px] font-medium text-ink flex items-center gap-2">
                  {t(slot.labelKey)}
                  {now && <span className="text-[9px] font-bold text-primary-dark bg-primary/10 px-1.5 py-0.5 rounded-full tracking-wide uppercase">▶ NOW</span>}
                </span>
                <span className={`text-[10.5px] font-semibold px-2.5 py-1 rounded-full ${now ? 'bg-primary/10 text-primary-dark' : badgeStyle[slot.kind]}`}>
                  {now ? t('timeline_now_badge') : t(slot.badgeKey)}
                </span>
              </button>

              {active && details && (
                <div className="mx-2 mt-1 mb-2 rounded-xl bg-parchment-card border border-line px-4 py-3 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-sage mb-2">{t('timeline_good_for')}</p>
                    <ul className="space-y-1.5">
                      {details.do.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-[11.5px] text-ink-muted">
                          <span className="text-sage mt-0.5 shrink-0">✓</span>{item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-vermillion mb-2">{t('timeline_avoid')}</p>
                    <ul className="space-y-1.5">
                      {details.avoid.length > 0
                        ? details.avoid.map((item, i) => (
                            <li key={i} className="flex items-start gap-2 text-[11.5px] text-ink-muted">
                              <span className="text-vermillion mt-0.5 shrink-0">✗</span>{item}
                            </li>
                          ))
                        : <li className="text-[11.5px] text-ink-faint">{t('timeline_no_restrictions')}</li>
                      }
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
