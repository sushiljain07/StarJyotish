// frontend/src/components/home/MobileTimelineCard.jsx
//
// Full-height timeline card: the single source of truth for today's
// muhurta windows. Used inside QuickPanchangStrip's expanded section.
//
// Four zones:
//   1. StatusCard   — "Is now a good time?" (current window + next event)
//   2. BarTimeline  — Visual sunrise-to-sunset bar with colour-coded segments
//   3. WindowList   — All muhurta slots, tappable for good-for/avoid detail
//   4. AiInsight    — One-line contextual guidance
//
// Data contract: receives `panchang` prop (same shape as QuickPanchangStrip).
// No extra API calls.

import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

// ─── Time helpers ─────────────────────────────────────────────────────────────

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

function fmt(min) {
  if (min == null) return '—'
  const h = Math.floor(min / 60)
  const m = min % 60
  const ampm = h >= 12 ? 'PM' : 'AM'
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`
}

// ─── Window detail content ────────────────────────────────────────────────────

const SLOT_DETAILS = {
  sunrise:   { do: ['Morning prayers / meditation', 'Starting new ventures', 'Physical activity'],               avoid: ['Oversleeping this window'] },
  gulika:    { do: ['Routine admin work', 'Desk work and correspondence'],                                        avoid: ['Starting new projects', 'Financial commitments', 'Beginning travel'] },
  yamaganda: { do: ['Reading, study, inner work'],                                                                avoid: ['Signing documents', 'New negotiations', 'Medical procedures'] },
  abhijit:   { do: ['Financial conversations', 'Interviews & negotiations', 'Starting anything important'],       avoid: ['Emotional confrontations'] },
  rahu:      { do: ['Routine tasks', 'Exercise', 'Reading'],                                                     avoid: ['Signing contracts', 'New investments', 'Starting travel'] },
  sunset:    { do: ['Evening prayers', 'Reflection & journaling', 'Family time'],                                 avoid: [] },
}

// ─── Slot builder ─────────────────────────────────────────────────────────────

function buildSlots(panchang) {
  const m = panchang?.muhurtas
  const sunriseMin = parseMin(panchang?.sunrise)
  const sunsetMin  = parseMin(panchang?.sunset)
  if (!m || sunriseMin == null) return []

  return [
    { id: 'sunrise',   start: sunriseMin,                           end: sunriseMin,                            kind: 'anchor', labelKey: 'slot_sunrise_label',   badgeKey: 'slot_sunrise_badge' },
    { id: 'gulika',    start: parseMin(m.gulika_kaal?.start),        end: parseMin(m.gulika_kaal?.end),           kind: 'avoid',  labelKey: 'slot_gulika_label',    badgeKey: 'slot_badge_avoid'   },
    { id: 'yamaganda', start: parseMin(m.yamaganda?.start),          end: parseMin(m.yamaganda?.end),             kind: 'avoid',  labelKey: 'slot_yamaganda_label', badgeKey: 'slot_badge_avoid'   },
    { id: 'abhijit',   start: parseMin(m.abhijit_muhurta?.start),    end: parseMin(m.abhijit_muhurta?.end),       kind: 'good',   labelKey: 'slot_abhijit_label',   badgeKey: 'slot_badge_best'    },
    { id: 'rahu',      start: parseMin(m.rahu_kaal?.start),          end: parseMin(m.rahu_kaal?.end),             kind: 'avoid',  labelKey: 'slot_rahu_label',      badgeKey: 'slot_badge_avoid'   },
    { id: 'sunset',    start: sunsetMin,                             end: sunsetMin,                             kind: 'anchor', labelKey: 'slot_sunset_label',    badgeKey: 'slot_sunset_badge'  },
  ].filter(s => s.start != null).sort((a, b) => a.start - b.start)
}

function findCurrent(slots, nowMin) {
  return slots.find(s =>
    s.kind === 'anchor'
      ? Math.abs(nowMin - s.start) < 5
      : s.end != null && nowMin >= s.start && nowMin < s.end
  ) ?? null
}

function findNextGood(slots, nowMin) {
  return slots.find(s => s.kind === 'good' && s.start > nowMin) ?? null
}

// ─── Zone 1: Status card ──────────────────────────────────────────────────────

const STATUS_THEME = {
  good:   { bg: '#1A3B2F', border: '#2E7D5E', dot: '#4CAF7D', text: '#7FCFA0', labelKey: 'status_favorable', icon: '✓' },
  avoid:  { bg: '#3B1A1A', border: '#8B3A3A', dot: '#E05555', text: '#E08080', labelKey: 'status_avoid',     icon: '✗' },
  anchor: { bg: '#2A2410', border: '#9A7B2A', dot: '#D9A441', text: '#D9A441', labelKey: 'status_neutral',   icon: '◎' },
  none:   { bg: '#1E2240', border: '#3A4070', dot: '#6A7CC0', text: '#9AA8D8', labelKey: 'status_neutral',   icon: '◎' },
}

function StatusCard({ slot, nowMin, slots, t }) {
  const theme = STATUS_THEME[slot?.kind ?? 'none']
  const next = slots.find(s => s.kind !== 'anchor' && s.start > nowMin) ?? null
  const minsToNext = next ? next.start - nowMin : null
  const nextTimeStr = minsToNext != null
    ? minsToNext < 60
      ? t('timeline_away_mins', { m: minsToNext })
      : t('timeline_away_hours', { h: Math.floor(minsToNext / 60), m: minsToNext % 60 })
    : null

  return (
    <div style={{ background: theme.bg, border: `1px solid ${theme.border}`, borderRadius: 14, padding: '14px 16px 12px', marginBottom: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <div>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: theme.text, opacity: 0.75, marginBottom: 2 }}>
            {t('status_current_time')}
          </p>
          <p style={{ fontSize: 22, fontWeight: 700, color: theme.text, lineHeight: 1.15, fontFamily: 'Fraunces, Georgia, serif' }}>
            {t(theme.labelKey)}
          </p>
          {slot && (
            <p style={{ fontSize: 12, color: 'rgba(248,242,228,0.55)', marginTop: 2 }}>
              {t(slot.labelKey)}{slot.kind !== 'anchor' && slot.end != null ? ` · until ${fmt(slot.end)}` : ''}
            </p>
          )}
        </div>
        <div style={{ width: 42, height: 42, borderRadius: '50%', background: theme.border, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: '#fff', fontWeight: 700, flexShrink: 0 }}>
          {theme.icon}
        </div>
      </div>

      {next && nextTimeStr && (
        <div style={{ background: 'rgba(0,0,0,0.25)', borderRadius: 8, padding: '7px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: next.kind === 'good' ? '#4CAF7D' : next.kind === 'avoid' ? '#E05555' : '#D9A441', flexShrink: 0 }} />
            <div>
              <p style={{ fontSize: 10, color: 'rgba(248,242,228,0.4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {t('status_card_next_event')}
              </p>
              <p style={{ fontSize: 12, fontWeight: 600, color: 'rgba(248,242,228,0.85)' }}>
                {t(next.labelKey)}
              </p>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: 'rgba(248,242,228,0.7)' }}>{fmt(next.start)}</p>
            <p style={{ fontSize: 10, color: 'rgba(248,242,228,0.4)' }}>{nextTimeStr}</p>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Zone 2: Bar timeline ─────────────────────────────────────────────────────

const BAR_COLOR = { avoid: '#C0392B', good: '#2E7D5E', neutral: '#3D4466' }

function BarTimeline({ slots, nowMin, sunriseMin, sunsetMin }) {
  const START = sunriseMin ?? 360
  const END   = sunsetMin  ?? 1110
  const SPAN  = END - START

  function pct(min) {
    return Math.max(0, Math.min(100, ((min - START) / SPAN) * 100))
  }

  // Build coloured segments between windows
  const segments = []
  let cursor = START
  const windows = [...slots.filter(s => s.kind !== 'anchor' && s.start != null && s.end != null)]
    .sort((a, b) => a.start - b.start)

  for (const s of windows) {
    const gapEnd = Math.min(s.start, END)
    if (gapEnd > Math.max(cursor, START)) {
      segments.push({ start: Math.max(cursor, START), end: gapEnd, kind: 'neutral' })
    }
    if (s.start < END) {
      segments.push({ start: Math.max(s.start, START), end: Math.min(s.end, END), kind: s.kind })
    }
    cursor = Math.max(cursor, s.end)
  }
  if (cursor < END) {
    segments.push({ start: Math.max(cursor, START), end: END, kind: 'neutral' })
  }

  const nowPct  = pct(nowMin)
  const showNow = nowMin >= START && nowMin <= END

  return (
    <div style={{ marginBottom: 10 }}>
      {/* Coloured bar */}
      <div style={{ position: 'relative', height: 10, borderRadius: 10, overflow: 'hidden', background: BAR_COLOR.neutral }}>
        {segments.map((seg, i) => (
          <div key={i} style={{
            position: 'absolute', left: `${pct(seg.start)}%`,
            width: `${pct(seg.end) - pct(seg.start)}%`,
            height: '100%', background: BAR_COLOR[seg.kind],
          }} />
        ))}
        {showNow && (
          <div style={{ position: 'absolute', left: `${nowPct}%`, top: -3, bottom: -3, width: 3, background: '#fff', borderRadius: 2, transform: 'translateX(-50%)', zIndex: 2 }} />
        )}
      </div>

      {/* Axis labels */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5, position: 'relative' }}>
        <span style={{ fontSize: 10, color: 'rgba(248,242,228,0.4)', fontWeight: 600 }}>🌅 Sunrise</span>
        {showNow && (
          <span style={{ fontSize: 9, fontWeight: 800, color: '#fff', background: 'rgba(80,80,80,0.8)', borderRadius: 6, padding: '1px 6px', position: 'absolute', left: `${nowPct}%`, transform: 'translateX(-50%)', top: 0, whiteSpace: 'nowrap' }}>
            NOW
          </span>
        )}
        <span style={{ fontSize: 10, color: 'rgba(248,242,228,0.4)', fontWeight: 600 }}>🌇 Sunset</span>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 12, marginTop: 6 }}>
        {[['#C0392B', 'Avoid'], ['#2E7D5E', 'Favorable'], ['#3D4466', 'Neutral']].map(([color, label]) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: color, display: 'inline-block' }} />
            <span style={{ fontSize: 9, color: 'rgba(248,242,228,0.4)', fontWeight: 600 }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Zone 3: Window row ───────────────────────────────────────────────────────

const SLOT_ICONS = { sunrise: '☀', gulika: '⚡', yamaganda: '⚡', abhijit: '★', rahu: '⚡', sunset: '☀' }

function WindowRow({ slot, isNow, t }) {
  const [open, setOpen] = useState(false)
  const details = SLOT_DETAILS[slot.id]
  const timeStr = slot.kind === 'anchor' ? fmt(slot.start) : `${fmt(slot.start)} – ${fmt(slot.end)}`

  const badgeBg    = isNow ? '#4A4010' : slot.kind === 'good' ? '#1A3B2F' : slot.kind === 'avoid' ? '#3B1A1A' : '#2A2240'
  const badgeColor = isNow ? '#D9A441' : slot.kind === 'good' ? '#7FCFA0' : slot.kind === 'avoid' ? '#E08080' : '#9AA8D8'

  return (
    <div>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, border: isNow ? '1px solid rgba(217,164,65,0.35)' : '1px solid transparent', background: isNow ? 'rgba(217,164,65,0.06)' : open ? 'rgba(255,255,255,0.04)' : 'transparent', cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s' }}
      >
        <div style={{ width: 34, height: 34, borderRadius: '50%', background: badgeBg, border: `1px solid ${badgeColor}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0, color: badgeColor }}>
          {SLOT_ICONS[slot.id]}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(248,242,228,0.9)' }}>{t(slot.labelKey)}</span>
            {isNow && (
              <span style={{ fontSize: 8, fontWeight: 800, letterSpacing: '0.08em', color: '#D9A441', background: 'rgba(217,164,65,0.15)', borderRadius: 4, padding: '1px 5px', textTransform: 'uppercase' }}>
                NOW
              </span>
            )}
          </div>
          <span style={{ fontSize: 11, color: 'rgba(248,242,228,0.4)' }}>{timeStr}</span>
        </div>
        <span style={{ fontSize: 10, fontWeight: 700, background: badgeBg, color: badgeColor, borderRadius: 20, padding: '3px 10px', flexShrink: 0 }}>
          {t(slot.badgeKey)}
        </span>
        {details && (
          <span style={{ fontSize: 10, color: 'rgba(248,242,228,0.3)', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}>▾</span>
        )}
      </button>

      {open && details && (
        <div style={{ margin: '2px 8px 6px', padding: '10px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <p style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#7FCFA0', marginBottom: 6 }}>{t('timeline_good_for')}</p>
            {details.do.map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 5, marginBottom: 4 }}>
                <span style={{ color: '#4CAF7D', fontSize: 11, flexShrink: 0, marginTop: 1 }}>✓</span>
                <span style={{ fontSize: 11, color: 'rgba(248,242,228,0.55)', lineHeight: 1.4 }}>{item}</span>
              </div>
            ))}
          </div>
          <div>
            <p style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#E08080', marginBottom: 6 }}>{t('timeline_avoid')}</p>
            {details.avoid.length > 0
              ? details.avoid.map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: 5, marginBottom: 4 }}>
                    <span style={{ color: '#E05555', fontSize: 11, flexShrink: 0, marginTop: 1 }}>✗</span>
                    <span style={{ fontSize: 11, color: 'rgba(248,242,228,0.55)', lineHeight: 1.4 }}>{item}</span>
                  </div>
                ))
              : <span style={{ fontSize: 11, color: 'rgba(248,242,228,0.3)' }}>{t('timeline_no_restrictions')}</span>
            }
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Zone 4: AI insight ───────────────────────────────────────────────────────

function AiInsight({ slot, nextGood, t }) {
  let msg = ''
  if (!slot || slot.kind === 'anchor') {
    msg = nextGood
      ? t('ai_insight_neutral', { window: t(nextGood.labelKey), time: fmt(nextGood.start) })
      : t('ai_insight_default')
  } else if (slot.kind === 'avoid') {
    msg = nextGood
      ? t('ai_insight_avoid', { window: t(nextGood.labelKey), time: fmt(nextGood.start) })
      : t('ai_insight_avoid_no_next')
  } else {
    msg = t('ai_insight_good', { window: t(slot.labelKey), end: fmt(slot.end) })
  }

  return (
    <div style={{ marginTop: 10, borderRadius: 12, background: 'rgba(217,164,65,0.06)', border: '1px solid rgba(217,164,65,0.2)', padding: '10px 14px', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
      <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>✦</span>
      <div>
        <p style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#D9A441', marginBottom: 3 }}>
          {t('ai_insight_label')}
        </p>
        <p style={{ fontSize: 12, color: 'rgba(248,242,228,0.65)', lineHeight: 1.55 }}>{msg}</p>
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function MobileTimelineCard({ panchang }) {
  const { t } = useTranslation()
  const [nowMin, setNowMin] = useState(() => {
    const d = new Date(); return d.getHours() * 60 + d.getMinutes()
  })

  useEffect(() => {
    const id = setInterval(() => {
      const d = new Date(); setNowMin(d.getHours() * 60 + d.getMinutes())
    }, 30_000)
    return () => clearInterval(id)
  }, [])

  const slots      = useMemo(() => buildSlots(panchang), [panchang])
  const sunriseMin = parseMin(panchang?.sunrise)
  const sunsetMin  = parseMin(panchang?.sunset)

  if (!panchang?.sunrise || slots.length === 0) return null

  const active   = findCurrent(slots, nowMin)
  const nextGood = findNextGood(slots, nowMin)

  return (
    <div style={{ background: '#13183a', borderRadius: 14, padding: '14px 12px 12px', overflow: 'hidden' }}>
      <StatusCard slot={active} nowMin={nowMin} slots={slots} t={t} />
      <BarTimeline slots={slots} nowMin={nowMin} sunriseMin={sunriseMin} sunsetMin={sunsetMin} />

      <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(248,242,228,0.35)', margin: '12px 0 4px 4px' }}>
        {t('timeline_windows_heading')}
      </p>
      <div>
        {slots.map(slot => (
          <WindowRow key={slot.id} slot={slot} isNow={active?.id === slot.id} t={t} />
        ))}
      </div>

      <AiInsight slot={active} nextGood={nextGood} t={t} />
    </div>
  )
}
