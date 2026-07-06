// frontend/src/components/home/DailyPatrikaHero.jsx  —  Sprint 2
//
// Three design decisions that changed from Sprint 1:
//
// 1. COSMIC RING replaces the filled bar.
//    A bar says "how much." A ring says "wholeness / energy."
//    The Activity ring is the most recognized health UI ever built —
//    not because it's novel but because a circle completing itself is
//    emotionally satisfying in a way a rectangle filling is not.
//    The ring color shifts with tone: gold (opportunity), sage (steady),
//    vermillion (caution) — one glance, no reading required.
//
// 2. ONE ACTION TODAY is the centerpiece below the headline.
//    One verb. One sentence. Tappable to ask Jyoti why.
//    The page's single primary CTA — not best window, not score,
//    not rarity chip. Everything else is secondary.
//
// 3. UNIFIED VISUAL LANGUAGE — the hero is still dark/immersive but
//    the anticipation strip below it uses the same night surface instead
//    of switching to parchment cards. One material, not two.

import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

// ── Deterministic star field ─────────────────────────────────────────────────
const STARS = Array.from({ length: 22 }, (_, i) => {
  const h = (i * 2654435761) % 1000
  return {
    left: h % 100,
    top: ((h >> 3) % 85) + 5,
    size: i % 7 === 0 ? 2.2 : i % 3 === 0 ? 1.6 : 1.1,
    dur: 4 + (i % 5) * 1.8,
    delay: (i % 9) * 0.7,
  }
})

// ── Cosmic Ring SVG ──────────────────────────────────────────────────────────
const RING_COLORS = {
  opportunity: { track: 'rgba(240,203,128,0.12)', fill: 'url(#ringGold)',   glyph: 'rgba(240,203,128,0.9)' },
  steady:      { track: 'rgba(91,122,94,0.18)',   fill: 'url(#ringSage)',   glyph: 'rgba(159,199,162,0.9)' },
  caution:     { track: 'rgba(162,59,59,0.18)',   fill: 'url(#ringVerm)',   glyph: 'rgba(224,144,144,0.9)' },
}

const PLANET_GLYPHS = {
  Sun:'☉', Moon:'☽', Mercury:'☿', Venus:'♀', Mars:'♂',
  Jupiter:'♃', Saturn:'♄', Rahu:'☊', Ketu:'☋',
}

function CosmicRing({ score, tone, mdPlanet, label }) {
  const R = 52, cx = 60, cy = 60, lw = 7
  const circ = 2 * Math.PI * R
  const filled = score != null ? (score / 10) * circ : 0
  const colors = RING_COLORS[tone] || RING_COLORS.steady
  const glyph = PLANET_GLYPHS[mdPlanet] || '✦'

  return (
    <div style={{ width: 120, height: 120, flexShrink: 0, position: 'relative' }}>
      <svg width="120" height="120" viewBox="0 0 120 120" aria-hidden="true">
        <defs>
          <linearGradient id="ringGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D9A441"/>
            <stop offset="100%" stopColor="#F0CB80"/>
          </linearGradient>
          <linearGradient id="ringSage" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#5B7A5E"/>
            <stop offset="100%" stopColor="#9FC7A2"/>
          </linearGradient>
          <linearGradient id="ringVerm" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#A23B3B"/>
            <stop offset="100%" stopColor="#E09090"/>
          </linearGradient>
        </defs>
        {/* Track */}
        <circle cx={cx} cy={cy} r={R} fill="none"
                stroke={colors.track} strokeWidth={lw} />
        {/* Filled arc — starts at top (-90°) */}
        {score != null && (
          <circle cx={cx} cy={cy} r={R} fill="none"
                  stroke={colors.fill} strokeWidth={lw}
                  strokeLinecap="round"
                  strokeDasharray={`${filled} ${circ - filled}`}
                  strokeDashoffset={circ / 4}
                  className="sj-ring-fill" />
        )}
        {/* Score number */}
        <text x={cx} y={cy - 6} textAnchor="middle" dominantBaseline="middle"
              fontSize="20" fontWeight="700" fill="rgba(248,242,228,0.95)"
              fontFamily="Georgia,serif">
          {score ?? '—'}
        </text>
        {/* Label below score */}
        <text x={cx} y={cy + 14} textAnchor="middle"
              fontSize="8.5" fontWeight="600" fill="rgba(248,242,228,0.45)"
              fontFamily="system-ui,sans-serif" letterSpacing="0.8">
          {label?.toUpperCase() ?? ''}
        </text>
        {/* Planet glyph — tiny, bottom of ring */}
        <text x={cx} y={cy + R - 4} textAnchor="middle"
              fontSize="10" fill={colors.glyph} fontFamily="Georgia,serif">
          {glyph}
        </text>
      </svg>
      <style>{`
        .sj-ring-fill {
          animation: sj-ring 1.2s cubic-bezier(0.2,0.8,0.3,1) both;
        }
        @keyframes sj-ring {
          from { stroke-dasharray: 0 ${2 * Math.PI * R}; }
        }
        @media (prefers-reduced-motion: reduce) { .sj-ring-fill { animation: none; } }
      `}</style>
    </div>
  )
}

// ── One Action Today ─────────────────────────────────────────────────────────
function OneAction({ action }) {
  const { t } = useTranslation()
  if (!action) return null

  const toneStyle = {
    opportunity: { bg: 'rgba(91,122,94,0.22)', border: 'rgba(91,122,94,0.45)', accent: '#9FC7A2' },
    steady:      { bg: 'rgba(217,164,65,0.12)', border: 'rgba(217,164,65,0.3)', accent: '#F0CB80' },
    caution:     { bg: 'rgba(184,64,64,0.16)', border: 'rgba(184,64,64,0.35)', accent: '#E09090' },
  }[action.tone] || {}

  function openJyoti() {
    window.dispatchEvent(new CustomEvent('sj:open-jyoti', {
      detail: { prefill: t('action_jyoti_prefill', { verb: action.verb, context: action.context }) }
    }))
  }

  return (
    <div className="sj-fade-up" style={{ animationDelay: '100ms' }}>
      <p className="text-[10px] uppercase tracking-widest font-bold mb-2"
         style={{ color: 'rgba(248,242,228,0.4)' }}>
        {t('action_eyebrow')}
      </p>
      <div className="rounded-2xl px-4 py-3.5 flex items-center gap-3"
           style={{ background: toneStyle.bg, border: `0.5px solid ${toneStyle.border}` }}>
        <div className="flex-1 min-w-0">
          <p className="font-serif font-semibold leading-snug"
             style={{ fontSize: 'clamp(15px,1.8vw,17px)', color: 'rgba(248,242,228,0.95)' }}>
            <span style={{ color: toneStyle.accent }}>{action.verb}</span>{' '}
            {action.context}
          </p>
          <p className="text-[11px] mt-1" style={{ color: 'rgba(248,242,228,0.45)' }}>
            {action.why}
          </p>
        </div>
        <button
          onClick={openJyoti}
          className="shrink-0 text-[11px] font-bold rounded-full px-3 py-1.5 transition"
          style={{ background: 'rgba(248,242,228,0.08)', color: toneStyle.accent,
                   border: `0.5px solid ${toneStyle.border}` }}
          aria-label={t('action_why_aria')}
        >
          {t('action_why_btn')}
        </button>
      </div>
    </div>
  )
}

// ── Greeting ─────────────────────────────────────────────────────────────────
function greetingKey() {
  const h = new Date().getHours()
  if (h < 5)  return 'patrika_greeting_night'
  if (h < 12) return 'patrika_greeting_morning'
  if (h < 17) return 'patrika_greeting_afternoon'
  if (h < 21) return 'patrika_greeting_evening'
  return 'patrika_greeting_night'
}

// ── Main component ────────────────────────────────────────────────────────────
export default function DailyPatrikaHero({
  firstName, edition, dayScore, chapterLabelFn, oneAction,
}) {
  const { t, i18n } = useTranslation()

  const locale = i18n.language?.startsWith('hi') ? 'hi-IN' : 'en-GB'
  const dateStr = useMemo(
    () => new Date().toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' }),
    [locale],
  )

  const chapter = edition?.chapter
  const mdPlanet = chapter?.md
  const tone = dayScore?.score >= 7 ? 'opportunity' : dayScore?.score >= 4.5 ? 'steady' : 'caution'

  return (
    <div>
      {/* ── Night card ── */}
      <div className="relative overflow-hidden rounded-3xl border border-primary/20"
           style={{ background: 'linear-gradient(135deg, #1e2247 0%, #171B33 60%, #0F1226 100%)' }}>

        {/* Star field */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          {STARS.map((s, i) => (
            <span key={i} className="sj-star" style={{
              left: `${s.left}%`, top: `${s.top}%`,
              width: s.size, height: s.size,
              animationDuration: `${s.dur}s`, animationDelay: `${s.delay}s`,
            }} />
          ))}
          <div className="absolute -top-24 -right-20 w-72 h-72 rounded-full pointer-events-none"
               style={{ background: 'radial-gradient(circle, rgba(217,164,65,0.1), transparent 70%)' }} />
        </div>

        <div className="relative px-6 py-7 sm:px-8 sm:py-8">

          {/* Row 1: greeting + date */}
          <div className="flex items-start justify-between mb-5">
            <div>
              <p className="font-serif text-base sm:text-lg"
                 style={{ color: 'rgba(248,242,228,0.55)' }}>
                {t(greetingKey())}
              </p>
              <p className="font-serif font-semibold text-2xl sm:text-3xl leading-tight"
                 style={{ color: 'rgba(248,242,228,0.95)' }}>
                {firstName}
              </p>
            </div>
            <div className="text-right shrink-0 ml-3 min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-wider truncate"
                 style={{ color: '#D9A441' }}>
                {t('patrika_eyebrow')}
              </p>
              <p className="text-[11px]" style={{ color: 'rgba(248,242,228,0.35)' }}>
                {dateStr}
              </p>
              {chapter && (
                <p className="text-[10px] mt-0.5" style={{ color: 'rgba(248,242,228,0.25)' }}>
                  {t('patrika_chapter_day', { day: chapter.day, md: chapterLabelFn?.(chapter.md) ?? chapter.md })}
                </p>
              )}
            </div>
          </div>

          {/* Row 2: ring + headline side by side */}
          <div className="flex items-center gap-5 mb-5">
            <CosmicRing
              score={dayScore?.score}
              tone={tone}
              mdPlanet={mdPlanet}
              label={dayScore?.label}
            />
            <div className="flex-1 min-w-0">
              {edition?.headline ? (
                <p className="font-serif leading-relaxed sj-fade-up"
                   style={{ fontSize: 'clamp(15px,2vw,20px)', color: 'rgba(248,242,228,0.95)' }}>
                  {edition.headline}
                </p>
              ) : (
                <div className="space-y-2" aria-hidden="true">
                  <div className="h-4 rounded-full sj-shimmer" style={{ width: '95%' }} />
                  <div className="h-4 rounded-full sj-shimmer" style={{ width: '75%' }} />
                  <div className="h-4 rounded-full sj-shimmer" style={{ width: '55%' }} />
                </div>
              )}
            </div>
          </div>

          {/* Row 3: One Action Today — THE primary CTA */}
          <OneAction action={oneAction} />

          {/* Row 4: chapter progress — subtle, below the fold of attention */}
          {chapter && (
            <div className="mt-4 sj-fade-up" style={{ animationDelay: '200ms' }}>
              <div className="flex items-center justify-between mb-1">
                <p className="text-[10px] uppercase tracking-widest font-bold"
                   style={{ color: 'rgba(248,242,228,0.3)' }}>
                  {chapterLabelFn?.(chapter.md) ?? chapter.md}
                  {chapter.ad ? ` · ${chapterLabelFn?.(chapter.ad) ?? chapter.ad}` : ''}
                  {' '}{t('patrika_chapter_label').toLowerCase()}
                </p>
                <p className="text-[10px]" style={{ color: 'rgba(248,242,228,0.25)' }}>
                  {chapter.pct}% · {chapter.days_remaining}{t('patrika_days_remain')}
                </p>
              </div>
              <div className="h-0.5 rounded-full overflow-hidden"
                   style={{ background: 'rgba(248,242,228,0.08)' }}>
                <div className="h-full rounded-full sj-grow-bar"
                     style={{ width: `${chapter.pct}%`, background: 'rgba(217,164,65,0.5)' }} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Anticipation strip — same night surface, not parchment ── */}
      {edition?.countdowns?.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
          {edition.countdowns.slice(0, 3).map((c, i) => (
            <div key={`${c.planet}-${c.house}`}
                 className="rounded-2xl px-4 py-3 sj-fade-up"
                 style={{
                   background: 'rgba(23,27,51,0.7)',
                   border: '0.5px solid rgba(248,242,228,0.08)',
                   animationDelay: `${250 + i * 80}ms`,
                 }}>
              <p className="text-[10px] uppercase tracking-wider font-bold mb-0.5"
                 style={{ color: '#D9A441' }}>
                {t('patrika_in_days', { count: c.days })}
              </p>
              <p className="text-[12px] font-semibold leading-snug"
                 style={{ color: 'rgba(248,242,228,0.8)' }}>
                {chapterLabelFn?.(c.planet) ?? c.planet} → {t('patrika_house_n', { house: c.house })}
              </p>
              <p className="text-[10px] mt-0.5 leading-snug"
                 style={{ color: 'rgba(248,242,228,0.35)' }}>
                {c.theme}
              </p>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .sj-star {
          position: absolute; border-radius: 9999px;
          background: rgba(240,203,128,0.8);
          animation: sj-twinkle linear infinite;
        }
        @keyframes sj-twinkle {
          0%,100% { opacity:0.12; transform:translateY(0); }
          50%      { opacity:0.85; transform:translateY(-2px); }
        }
        .sj-fade-up { animation: sj-fadeup 0.5s cubic-bezier(0.2,0.7,0.3,1) both; }
        @keyframes sj-fadeup { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        .sj-shimmer {
          background: linear-gradient(90deg,rgba(248,242,228,0.05) 25%,rgba(248,242,228,0.12) 50%,rgba(248,242,228,0.05) 75%);
          background-size: 200% 100%;
          animation: sj-shimmer 1.6s ease-in-out infinite;
        }
        @keyframes sj-shimmer { from{background-position:200% 0} to{background-position:-200% 0} }
        .sj-grow-bar { animation: sj-grow 1s cubic-bezier(0.2,0.8,0.3,1) both; transform-origin:left; }
        @keyframes sj-grow { from{transform:scaleX(0)} to{transform:scaleX(1)} }
        @media (prefers-reduced-motion:reduce) {
          .sj-star,.sj-fade-up,.sj-shimmer,.sj-grow-bar,.sj-ring-fill { animation:none!important; }
        }
      `}</style>
    </div>
  )
}
