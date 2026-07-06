// frontend/src/components/home/DailyPatrikaHero.jsx
//
// "Today's Patrika" — replaces HeroDial as the page's opening moment.
// Design intent (docs/vision/PRODUCT_HOME.md applies):
//
//   The hero is a *front page*, not a dashboard. One editorial headline
//   chosen by the backend's daily_editor engine (the most interesting
//   astronomical event for THIS chart TODAY), spoken to the person by
//   name with a time-of-day salutation — the page starts a conversation
//   instead of printing a profile label.
//
//   The anticipation layer (countdown cards) and the chapter bar (dasha
//   as an unfolding season of life) are what make tomorrow's page
//   different from today's — they are the return mechanic.
//
//   Signature visual: a slowly drifting star field inside the night card.
//   Pure CSS, ~2KB, honors prefers-reduced-motion. Everything else stays
//   quiet so this one element carries the atmosphere.
//
// The day score survives as a small tappable chip, not the centerpiece —
// "5.6/10" is a statistic; "the pressure lifts at 2:14 PM" is a story.
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

// Deterministic pseudo-random star positions — stable across re-renders
// (seeded by index, not Math.random) so the sky doesn't jump on state
// changes. 26 stars, three sizes, two drift speeds.
const STARS = Array.from({ length: 26 }, (_, i) => {
  const h = (i * 2654435761) % 1000
  return {
    left: (h % 100),
    top: ((h >> 3) % 90) + 5,
    size: i % 7 === 0 ? 2.5 : i % 3 === 0 ? 1.8 : 1.2,
    dur: 4 + (i % 5) * 1.7,
    delay: (i % 9) * 0.6,
  }
})

function greetingKey() {
  const h = new Date().getHours()
  if (h < 5) return 'patrika_greeting_night'
  if (h < 12) return 'patrika_greeting_morning'
  if (h < 17) return 'patrika_greeting_afternoon'
  if (h < 21) return 'patrika_greeting_evening'
  return 'patrika_greeting_night'
}

function greetingEmoji() {
  const h = new Date().getHours()
  if (h < 5) return '🌙'
  if (h < 12) return '🌅'
  if (h < 17) return '☀️'
  if (h < 21) return '🌇'
  return '🌙'
}

function Stars({ score }) {
  const full = Math.round(score / 2)
  return (
    <span className="inline-flex gap-0.5 ml-1.5 align-middle">
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} style={{ fontSize: '10px', color: i <= full ? '#D9A441' : 'rgba(248,242,228,0.2)' }}>★</span>
      ))}
    </span>
  )
}

export default function DailyPatrikaHero({
  firstName, edition, dayScore, panchang, chapterLabelFn,
}) {
  const { t, i18n } = useTranslation()
  const [scoreOpen, setScoreOpen] = useState(false)

  const locale = i18n.language?.startsWith('hi') ? 'hi-IN' : 'en-GB'
  const dateStr = useMemo(
    () => new Date().toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' }),
    [locale],
  )

  const abhijit = panchang?.muhurtas?.abhijit_muhurta
  const rahu = panchang?.muhurtas?.rahu_kaal
  const chapter = edition?.chapter

  return (
    <div>
      {/* ── Night card: greeting + headline ── */}
      <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-night-light to-night px-7 py-8 sm:px-9 sm:py-9">

        {/* Drifting star field — the card's living sky */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          {STARS.map((s, i) => (
            <span
              key={i}
              className="sj-star"
              style={{
                left: `${s.left}%`, top: `${s.top}%`,
                width: s.size, height: s.size,
                animationDuration: `${s.dur}s`,
                animationDelay: `${s.delay}s`,
              }}
            />
          ))}
          <div
            className="absolute -top-32 -right-24 w-[360px] h-[360px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(217,164,65,0.12), transparent 70%)' }}
          />
        </div>

        <div className="relative">
          {/* Greeting line — the page speaks first */}
          <p className="font-serif text-lg sm:text-xl mb-1" style={{ color: 'rgba(248,242,228,0.92)' }}>
            {greetingEmoji()} {t(greetingKey(), { name: firstName })}
          </p>
          <p className="text-[11px] tracking-widest uppercase font-bold mb-5" style={{ color: '#D9A441' }}>
            {t('patrika_eyebrow')} · {dateStr}
            {chapter && (
              <span className="normal-case tracking-normal font-medium ml-2" style={{ color: 'rgba(248,242,228,0.4)' }}>
                · {t('patrika_chapter_day', { day: chapter.day, md: chapterLabelFn ? chapterLabelFn(chapter.md) : chapter.md })}
              </span>
            )}
          </p>

          {/* THE headline — one editorial thought, serif, generous */}
          {edition?.headline ? (
            <p
              className="font-serif leading-relaxed max-w-2xl mb-5 sj-fade-up"
              style={{ fontSize: 'clamp(18px, 2.4vw, 25px)', color: 'rgba(248,242,228,0.95)' }}
            >
              {edition.headline}
            </p>
          ) : (
            <div className="max-w-2xl mb-5 space-y-2.5" aria-hidden="true">
              <div className="h-5 rounded-full sj-shimmer" style={{ width: '92%' }} />
              <div className="h-5 rounded-full sj-shimmer" style={{ width: '70%' }} />
            </div>
          )}

          {/* Cosmic Pulse bar */}
          {dayScore?.score != null && (
            <button onClick={() => setScoreOpen(o => !o)} className="w-full text-left mb-5 sj-fade-up group" style={{ animationDelay: '80ms' }}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] uppercase tracking-widest font-bold" style={{ color: 'rgba(248,242,228,0.45)' }}>
                  {t('patrika_cosmic_pulse')}
                </span>
                <span className="text-[11px] font-bold" style={{ color: '#F0CB80' }}>
                  {dayScore.score}/10 <Stars score={dayScore.score} />
                </span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(248,242,228,0.1)' }}>
                <div className="h-full rounded-full sj-grow-bar" style={{ width: `${dayScore.score * 10}%`, background: 'linear-gradient(90deg, #D9A441, #F0CB80)' }} />
              </div>
            </button>
          )}

          {/* Best Window + Watch rows */}
          <div className="flex flex-col sm:flex-row gap-2 mb-4 sj-fade-up" style={{ animationDelay: '120ms' }}>
            {abhijit?.start && (
              <div className="flex items-center gap-2.5 flex-1 rounded-xl px-3.5 py-2.5"
                   style={{ background: 'rgba(91,122,94,0.2)', border: '0.5px solid rgba(91,122,94,0.4)' }}>
                <span>⭐</span>
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-bold" style={{ color: '#9FC7A2' }}>{t('patrika_best_window')}</p>
                  <p className="text-[13px] font-semibold" style={{ color: 'rgba(248,242,228,0.92)' }}>{abhijit.start} – {abhijit.end}</p>
                </div>
              </div>
            )}
            {rahu?.start && (
              <div className="flex items-center gap-2.5 flex-1 rounded-xl px-3.5 py-2.5"
                   style={{ background: 'rgba(184,64,64,0.18)', border: '0.5px solid rgba(184,64,64,0.35)' }}>
                <span>⚠</span>
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-bold" style={{ color: '#E09090' }}>{t('patrika_watch')}</p>
                  <p className="text-[13px] font-semibold" style={{ color: 'rgba(248,242,228,0.92)' }}>{t('panchang_rahu_kaal')} {rahu.start}–{rahu.end}</p>
                </div>
              </div>
            )}
          </div>

          {edition?.rarity && (
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-xs px-3 py-1.5 rounded-full" style={{ background: 'rgba(240,203,128,0.12)', color: '#F0CB80' }}>
                ✦ {t('patrika_rarity', { rarity: edition.rarity })}
              </span>
            </div>
          )}

          {/* Score breakdown — same weights as before, now on demand */}
          {scoreOpen && (
            <div className="mt-4 max-w-sm text-[11px] leading-relaxed rounded-xl px-4 py-3 sj-fade-up"
                 style={{ background: 'rgba(248,242,228,0.05)', color: 'rgba(248,242,228,0.6)' }}>
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
        </div>
      </div>

      {/* ── Anticipation strip: countdowns + chapter progress ── */}
      {(edition?.countdowns?.length > 0 || chapter) && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3">
          {(edition?.countdowns ?? []).slice(0, 3).map((c, i) => (
            <div
              key={`${c.planet}-${c.house}`}
              className="bg-parchment-card border border-line rounded-2xl px-4 py-3.5 sj-fade-up"
              style={{ animationDelay: `${i * 90}ms` }}
            >
              <p className="text-[10px] uppercase tracking-wider font-bold text-primary-dark mb-1">
                {t('patrika_in_days', { count: c.days })}
              </p>
              <p className="text-[13px] font-semibold text-ink leading-snug">
                {chapterLabelFn ? chapterLabelFn(c.planet) : c.planet} → {t('patrika_house_n', { house: c.house })}
              </p>
              <p className="text-[11px] text-ink-muted mt-0.5 leading-snug">{c.theme}</p>
            </div>
          ))}
          {chapter && (
            <div
              className="bg-parchment-card border border-line rounded-2xl px-4 py-3.5 sj-fade-up"
              style={{ animationDelay: '270ms' }}
            >
              <p className="text-[10px] uppercase tracking-wider font-bold text-primary-dark mb-1">
                {t('patrika_chapter_label')}
              </p>
              <p className="text-[13px] font-semibold text-ink leading-snug">
                {chapterLabelFn ? chapterLabelFn(chapter.md) : chapter.md}
                {chapter.ad ? ` · ${chapterLabelFn ? chapterLabelFn(chapter.ad) : chapter.ad}` : ''}
              </p>
              <div className="mt-2 h-1.5 rounded-full bg-line overflow-hidden">
                <div
                  className="h-full rounded-full sj-grow-bar"
                  style={{ width: `${chapter.pct}%`, background: 'linear-gradient(90deg, #D9A441, #F0CB80)' }}
                />
              </div>
              <p className="text-[10px] text-ink-faint mt-1.5">
                {t('patrika_chapter_progress', { pct: chapter.pct, days: chapter.days_remaining })}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Component-scoped animation styles */}
      <style>{`
        .sj-star {
          position: absolute;
          border-radius: 9999px;
          background: rgba(240, 203, 128, 0.85);
          animation: sj-twinkle linear infinite;
        }
        @keyframes sj-twinkle {
          0%, 100% { opacity: 0.15; transform: translateY(0); }
          50% { opacity: 0.9; transform: translateY(-3px); }
        }
        .sj-fade-up {
          animation: sj-fade-up 0.55s cubic-bezier(0.2, 0.7, 0.3, 1) both;
        }
        @keyframes sj-fade-up {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .sj-shimmer {
          background: linear-gradient(90deg, rgba(248,242,228,0.06) 25%, rgba(248,242,228,0.14) 50%, rgba(248,242,228,0.06) 75%);
          background-size: 200% 100%;
          animation: sj-shimmer 1.6s ease-in-out infinite;
        }
        @keyframes sj-shimmer {
          from { background-position: 200% 0; }
          to { background-position: -200% 0; }
        }
        .sj-grow-bar {
          animation: sj-grow 1s cubic-bezier(0.2, 0.7, 0.3, 1) both;
          transform-origin: left;
        }
        @keyframes sj-grow {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
        @media (prefers-reduced-motion: reduce) {
          .sj-star, .sj-fade-up, .sj-shimmer, .sj-grow-bar { animation: none !important; }
        }
      `}</style>
    </div>
  )
}
