// frontend/src/components/home/DailyPatrikaHero.jsx  v4 (Home reimagined)
//
// Changes from v3:
// 1. STARFIELD REMOVED — the per-component .sj-star layer is gone;
//    Starfield.jsx now renders one page-level sky behind the whole home
//    page instead of three separate per-card star sprinkles.
// 2. PATRIKA DECK RESKIN — one card at a time, tap/click (or Enter/Space)
//    advances to the next with a slide-in; progress dots where the active
//    dot elongates; a planet glyph top-left; a gold "Why: …" line built
//    from the event's planet/house fields when present; a "tap for next ›"
//    footer hint. Per-card-type color theming (the old CARD_CFG accent/dim/
//    border/bg map) is retired in favor of one consistent night-card
//    surface — that was the v3 skin, this is the approved home-v5 mock's.
// 3. REACTIONS RESKIN — the old thumbs-up/down buttons are now three text chips
//    ("✓ Resonates" / "Not sure" / "Tell me more") that still call the
//    exact same onReaction(cardType, reaction, event) prop. "Resonates"
//    keeps the 'up' reaction id and "Not sure" keeps 'skip' specifically
//    so ContinuityStrip's yesterday's-reaction message (which pattern-
//    matches on 'up'/'down') keeps working unmodified. A confirmation
//    line appears once a reaction is recorded.
// Everything else — the day-score ring, One Action, chapter bar, countdown
// strip — is unchanged; those weren't part of this reskin.
import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { formatDate, houseOrdinal } from '../../utils/format'
import { planetName } from '../../utils/astroNames'
import { colors } from '../../theme/tokens'
import { withAlpha } from '../../theme/chartPalette'
import { dayScoreBand } from './dayScoreBand'

// ── Card type -> fallback glyph (used only when the event has no planet) ──
const ICON_BY_TYPE = {
  HEADLINE: '✦', QUESTION: '?', OPPORTUNITY: '↗', WATCH: '◉',
  NAKSHATRA_FLASH: '☽', TIMING_WINDOW: '⧗', DASHA_WHISPER: '∞',
}

const PLANET_GLYPHS = {
  Sun: '☉', Moon: '☽', Mercury: '☿', Venus: '♀', Mars: '♂',
  Jupiter: '♃', Saturn: '♄', Rahu: '☊', Ketu: '☋',
}

const RING_COLORS = {
  opportunity: { track: withAlpha(colors.primary.glow, 0.12), fill: colors.primary.DEFAULT, glyph: withAlpha(colors.primary.glow, 0.9) },
  steady:      { track: withAlpha(colors.good.onnight, 0.18),  fill: colors.good.onnight,    glyph: withAlpha(colors.good.onnight, 0.9) },
  caution:     { track: withAlpha(colors.bad.onnight, 0.18),   fill: colors.bad.onnight,     glyph: withAlpha(colors.bad.onnight, 0.9) },
}

// ── Cosmic Ring — unchanged from v3 ─────────────────────────────────────────
function CosmicRing({ score, tone, mdPlanet, label, pulse }) {
  const R = 44, cx = 50, cy = 50, lw = 6
  const circ = 2 * Math.PI * R
  const filled = score != null ? (score / 10) * circ : 0
  const ring = RING_COLORS[tone] || RING_COLORS.steady
  const glyph = PLANET_GLYPHS[mdPlanet] || "✦"

  return (
    <div className="sj-ring-wrap">
      <svg width="120" height="120" viewBox="0 0 100 100" aria-hidden="true">
        <circle cx={cx} cy={cy} r={R} fill="none" stroke={ring.track} strokeWidth={lw}/>
        {score != null && (
          <circle cx={cx} cy={cy} r={R} fill="none"
                  stroke={ring.fill} strokeWidth={lw} strokeLinecap="round"
                  strokeDasharray={`${filled} ${circ - filled}`}
                  strokeDashoffset={circ / 4}
                  className={`sj-ring-arc${pulse ? " sj-ring-pulse" : ""}`}/>
        )}
        <text x={cx} y={cy - 5} textAnchor="middle" dominantBaseline="middle"
              fontSize="18" fontWeight="700" fill={colors.parchment.DEFAULT} fontFamily="Georgia,serif">
          {score ?? "—"}
        </text>
        <text x={cx} y={cy + 12} textAnchor="middle"
              fontSize="9.2" fontWeight="600" fill={colors.ink.onnightMuted}
              fontFamily="system-ui,sans-serif" letterSpacing="0.4">
          {label?.toUpperCase() ?? ""}
        </text>
        <text x={cx} y={cy + R - 5} textAnchor="middle"
              fontSize="9" fill={ring.glyph} fontFamily="Georgia,serif">
          {glyph}
        </text>
      </svg>
    </div>
  )
}

// ── Why line — built from the event's planet/house fields when present ────
function buildWhy(card, t) {
  const ev = card.event
  if (!ev?.planet) return null
  if (ev.house) {
    return t('patrika_why_house', {
      planet: planetName(t, ev.planet),
      house: houseOrdinal(t, ev.house, { oblique: true }),
    })
  }
  return t('patrika_why_planet', { planet: planetName(t, ev.planet) })
}

// ── Reaction chips + confirmation ──────────────────────────────────────────
function ReactionRow({ cardType, event, reacted, onReaction, t }) {
  const OPTIONS = [
    { id: 'up',       label: t('patrika_react_resonates') },
    { id: 'skip',     label: t('patrika_react_notsure') },
    { id: 'tellmore', label: t('patrika_react_tellmore') },
  ]
  return (
    <div className="mt-3.5">
      <div className="flex flex-wrap gap-2" role="group" aria-label={t('patrika_react_group')}>
        {OPTIONS.map(opt => (
          <button
            key={opt.id}
            onClick={() => onReaction?.(cardType, opt.id, event)}
            className={`min-h-11 md:min-h-0 text-xs rounded-full px-3.5 py-1.5 border transition ${
              reacted === opt.id
                ? 'bg-primary/15 border-primary text-primary-glow'
                : 'border-white/[0.16] text-ink-onnight hover:border-primary/50 hover:text-primary-glow'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
      {reacted && (
        <p className="text-2xs text-good-onnight mt-2.5">
          {reacted === 'tellmore'
            ? t('patrika_note_tellmore')
            : t('patrika_note_default')}
        </p>
      )}
    </div>
  )
}

// ── The deck — one card, tap for next ──────────────────────────────────────
function PatrikaDeck({ cards, onReaction, reactions, onRefresh }) {
  const { t } = useTranslation()
  const [active, setActive] = useState(0)
  const touchX = useRef(null)

  if (!cards.length) return null
  const card = cards[active]

  function next() { setActive(i => (i + 1) % cards.length) }
  function onKeyDown(e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); next() }
  }
  function onTouchStart(e) { touchX.current = e.touches[0].clientX }
  function onTouchEnd(e) {
    if (touchX.current === null) return
    const dx = e.changedTouches[0].clientX - touchX.current
    if (Math.abs(dx) > 30) next()
    touchX.current = null
  }

  const glyph = PLANET_GLYPHS[card.event?.planet] || ICON_BY_TYPE[card.type] || '✦'
  const why = buildWhy(card, t)

  return (
    <div>
      <div
        key={active}
        role="button"
        tabIndex={0}
        aria-label={t('patrika_tap_hint')}
        onClick={next}
        onKeyDown={onKeyDown}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        className="cursor-pointer select-none rounded-card border border-primary/20 bg-gradient-to-br from-night-light via-night to-night-deep p-5 animate-fade-in-up motion-reduce:animate-none"
      >
        <span className="text-lg text-primary" aria-hidden="true">{glyph}</span>
        <p className="font-serif font-medium text-[17px] sm:text-lg leading-snug text-primary-light mt-2.5">
          {card.text}
        </p>
        {why && <p className="text-2xs text-primary mt-3">{why}</p>}

        <div className="flex items-center justify-between mt-4">
          <div className="flex gap-1.5" aria-hidden="true">
            {cards.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all motion-reduce:transition-none ${
                  i === active ? 'w-4 bg-primary-glow' : 'w-1.5 bg-primary/25'
                }`}
              />
            ))}
          </div>
          <span className="text-2xs tracking-wide text-ink-onnightMuted">{t('patrika_tap_next')}</span>
        </div>
      </div>

      <ReactionRow
        cardType={card.type}
        event={card.event}
        reacted={reactions?.[card.type]}
        onReaction={onReaction}
        t={t}
      />

      {onRefresh && (
        <button
          onClick={onRefresh}
          className="block mx-auto mt-3 min-h-11 md:min-h-0 text-2xs font-semibold text-ink-onnightMuted border border-white/[0.1] rounded-full px-3.5 py-1.5 hover:text-ink-onnight hover:border-white/[0.2] transition"
        >
          {t('patrika_refresh')}
        </button>
      )}
    </div>
  )
}

// ── Countdown strip — unchanged from v3 ─────────────────────────────────────
function CountdownStrip({ countdowns, chapterLabelFn }) {
  const { t } = useTranslation()
  if (!countdowns?.length) return null
  return (
    <div className="sj-cd-strip">
      {countdowns.slice(0, 3).map((c, i) => (
        <div key={`${c.planet}-${i}`} className="sj-cd-chip" style={{ animationDelay: `${180 + i * 70}ms` }}>
          <span className="sj-cd-glyph">{c.glyph || PLANET_GLYPHS[c.planet] || "✦"}</span>
          <div>
            <p className="sj-cd-in">{t('patrika_in_days', { count: c.days })}</p>
            <p className="sj-cd-name">{chapterLabelFn?.(c.planet) ?? c.planet} → {t('patrika_countdown_house', { house: c.house })}</p>
            <p className="sj-cd-theme">{c.theme}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Chapter bar — unchanged from v3 ─────────────────────────────────────────
function ChapterBar({ chapter, chapterLabelFn }) {
  const { t } = useTranslation()
  if (!chapter) return null
  return (
    <div className="sj-chap">
      <div className="sj-chap-row">
        <span>{t('patrika_chapter_name', { name: `${chapterLabelFn?.(chapter.md) ?? chapter.md}${chapter.ad ? ` · ${chapterLabelFn?.(chapter.ad) ?? chapter.ad}` : ''}` })}</span>
        <span>{t('patrika_chapter_left', { pct: chapter.pct, days: chapter.days_remaining })}</span>
      </div>
      <div className="sj-chap-track"><div className="sj-chap-fill sj-grow-bar" style={{ width: `${chapter.pct}%` }}/></div>
    </div>
  )
}

// ── One Action — unchanged from v3 ──────────────────────────────────────────
function OneAction({ action }) {
  const { t } = useTranslation()
  if (!action) return null
  const ts = {
    opportunity: { bg: withAlpha(colors.sage.DEFAULT, 0.22),   border: withAlpha(colors.sage.DEFAULT, 0.45),   ac: colors.good.onnight },
    steady:      { bg: withAlpha(colors.primary.DEFAULT, 0.12), border: withAlpha(colors.primary.DEFAULT, 0.30), ac: colors.primary.glow },
    caution:     { bg: withAlpha(colors.bad.DEFAULT, 0.16),    border: withAlpha(colors.bad.DEFAULT, 0.35),    ac: colors.bad.onnight },
  }[action.tone] || {}

  function openJyoti() {
    window.dispatchEvent(new CustomEvent("sj:open-jyoti", {
      detail: { prefill: t("action_jyoti_prefill", { verb: action.verb, context: action.context }) }
    }))
  }

  return (
    <div className="sj-action sj-fade-up" style={{ animationDelay: "120ms" }}>
      <p className="sj-action-eyebrow">{t('patrika_one_action')}</p>
      <div className="sj-action-card" style={{ background: ts.bg, border: `1px solid ${ts.border}` }}>
        <p className="sj-action-text">
          <span style={{ color: ts.ac }}>{action.verb}</span>{" "}{action.context}
        </p>
        <p className="sj-action-why">{action.why}</p>
        <button className="sj-why-btn inline-flex items-center min-h-11 md:min-h-0" onClick={openJyoti}
                style={{ color: ts.ac, border: `1px solid ${ts.border}` }}>
          {t('patrika_why_btn')}
        </button>
      </div>
    </div>
  )
}

// ── Greeting ────────────────────────────────────────────────────────────────
function greet(t) {
  const h = new Date().getHours()
  if (h < 5)  return t('patrika_greeting_night')
  if (h < 12) return t('patrika_greeting_morning')
  if (h < 17) return t('patrika_greeting_afternoon')
  if (h < 21) return t('patrika_greeting_evening')
  return t('patrika_greeting_night')
}

// ── Main export ────────────────────────────────────────────────────────────────
export default function DailyPatrikaHero({
  firstName, edition, dayScore, chapterLabelFn, oneAction, onRefresh, onReaction,
  cardReactions,
}) {
  const { t } = useTranslation() // also re-renders on a language change
  const dateStr = formatDate(new Date(), { weekday: "long", day: "numeric", month: "long" })

  const chapter = edition?.chapter
  const score = dayScore?.score
  // One band drives both the ring tone and its label (C5).
  const { tone, labelKey } = dayScoreBand(score)
  const pulse = score >= 8

  const cards = edition?.cards?.length
    ? edition.cards
    : edition?.headline
      ? [{ type: "HEADLINE", text: edition.headline, event: edition.headline_event }]
      : []

  return (
    <div className="sj-hero-root">
      {/* ── Night card ─────────────────────────────────────────────────────── */}
      <div className="sj-night-card">
        <div className="sj-glow" aria-hidden="true" />

        <div className="sj-night-inner">
          {/* Top: greeting + date */}
          <div className="sj-top-row">
            <div>
              <p className="sj-greet">{greet(t)}</p>
              <p className="sj-name">{firstName}</p>
            </div>
            <div className="sj-datebox">
              <p className="sj-eyebrow-gold">{t('patrika_eyebrow')}</p>
              <p className="sj-datestr">{dateStr}</p>
              {chapter && (
                <p className="sj-chapday">{t('patrika_day_md', { day: chapter.day, md: chapterLabelFn?.(chapter.md) ?? chapter.md })}</p>
              )}
            </div>
          </div>

          {/* Body: ring + deck
              Mobile: ring centered above, deck below (flex-col)
              sm+:    ring left, deck right (flex-row) */}
          <div className="sj-body">
            <CosmicRing score={score} tone={tone} mdPlanet={chapter?.md} label={labelKey ? t(labelKey) : dayScore?.label} pulse={pulse}/>
            <div className="sj-body-right">
              {cards.length > 0 ? (
                <PatrikaDeck
                  cards={cards}
                  onReaction={onReaction}
                  reactions={cardReactions}
                  onRefresh={onRefresh}
                />
              ) : (
                <div aria-hidden="true">
                  <div className="sj-shimmer" style={{ width: "95%" }}/>
                  <div className="sj-shimmer" style={{ width: "75%", marginTop: 8 }}/>
                  <div className="sj-shimmer" style={{ width: "55%", marginTop: 8 }}/>
                </div>
              )}
            </div>
          </div>

          <OneAction action={oneAction}/>
          <ChapterBar chapter={chapter} chapterLabelFn={chapterLabelFn}/>
        </div>
      </div>

      {/* Countdown strip */}
      <CountdownStrip countdowns={edition?.countdowns} chapterLabelFn={chapterLabelFn}/>
    </div>
  )
}
