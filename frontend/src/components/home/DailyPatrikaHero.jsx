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
  opportunity: { track: 'rgba(240,203,128,0.12)', fill: '#D9A441', glyph: 'rgba(240,203,128,0.9)' },
  steady:      { track: 'rgba(91,122,94,0.18)',   fill: '#9FC7A2', glyph: 'rgba(159,199,162,0.9)' },
  caution:     { track: 'rgba(162,59,59,0.18)',   fill: '#E09090', glyph: 'rgba(224,144,144,0.9)' },
}

// ── Cosmic Ring — unchanged from v3 ─────────────────────────────────────────
function CosmicRing({ score, tone, mdPlanet, label, pulse }) {
  const R = 44, cx = 50, cy = 50, lw = 6
  const circ = 2 * Math.PI * R
  const filled = score != null ? (score / 10) * circ : 0
  const colors = RING_COLORS[tone] || RING_COLORS.steady
  const glyph = PLANET_GLYPHS[mdPlanet] || "✦"

  return (
    <div className="sj-ring-wrap">
      <svg width="100" height="100" viewBox="0 0 100 100" aria-hidden="true">
        <circle cx={cx} cy={cy} r={R} fill="none" stroke={colors.track} strokeWidth={lw}/>
        {score != null && (
          <circle cx={cx} cy={cy} r={R} fill="none"
                  stroke={colors.fill} strokeWidth={lw} strokeLinecap="round"
                  strokeDasharray={`${filled} ${circ - filled}`}
                  strokeDashoffset={circ / 4}
                  className={`sj-ring-arc${pulse ? " sj-ring-pulse" : ""}`}/>
        )}
        <text x={cx} y={cy - 5} textAnchor="middle" dominantBaseline="middle"
              fontSize="18" fontWeight="700" fill="rgba(248,242,228,0.95)" fontFamily="Georgia,serif">
          {score ?? "—"}
        </text>
        <text x={cx} y={cy + 12} textAnchor="middle"
              fontSize="7.5" fontWeight="600" fill="rgba(248,242,228,0.42)"
              fontFamily="system-ui,sans-serif" letterSpacing="0.8">
          {label?.toUpperCase() ?? ""}
        </text>
        <text x={cx} y={cy + R - 5} textAnchor="middle"
              fontSize="9" fill={colors.glyph} fontFamily="Georgia,serif">
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
      defaultValue: 'Why: transit {{planet}} activates your {{house}}th house today.',
      planet: ev.planet, house: ev.house,
    })
  }
  return t('patrika_why_planet', { defaultValue: 'Why: transit {{planet}} is active today.', planet: ev.planet })
}

// ── Reaction chips + confirmation ──────────────────────────────────────────
function ReactionRow({ cardType, event, reacted, onReaction, t }) {
  const OPTIONS = [
    { id: 'up',       label: t('patrika_react_resonates', '✓ Resonates') },
    { id: 'skip',     label: t('patrika_react_notsure', 'Not sure') },
    { id: 'tellmore', label: t('patrika_react_tellmore', 'Tell me more') },
  ]
  return (
    <div className="mt-3.5">
      <div className="flex flex-wrap gap-2" role="group" aria-label={t('patrika_react_group', 'Rate this insight')}>
        {OPTIONS.map(opt => (
          <button
            key={opt.id}
            onClick={() => onReaction?.(cardType, opt.id, event)}
            className={`text-xs rounded-full px-3.5 py-1.5 border transition ${
              reacted === opt.id
                ? 'bg-primary/15 border-primary text-primary-glow'
                : 'border-white/[0.16] text-ink-onnight/75 hover:border-primary/50 hover:text-primary-glow'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
      {reacted && (
        <p className="text-2xs text-sage mt-2.5">
          {reacted === 'tellmore'
            ? t('patrika_note_tellmore', 'Jyoti will unpack this in your next reading.')
            : t('patrika_note_default', "Noted — Jyoti will remember this against tomorrow's sky.")}
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
        aria-label={t('patrika_tap_hint', 'Tap for the next insight')}
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
          <span className="text-3xs tracking-wide text-ink-onnight/40">{t('patrika_tap_next', 'tap for next ›')}</span>
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
          className="block mx-auto mt-3 text-3xs font-semibold text-ink-onnight/40 border border-white/[0.1] rounded-full px-3.5 py-1.5 hover:text-ink-onnight/70 hover:border-white/[0.2] transition"
        >
          {t('patrika_refresh', '↺ Different insight')}
        </button>
      )}
    </div>
  )
}

// ── Countdown strip — unchanged from v3 ─────────────────────────────────────
function CountdownStrip({ countdowns, chapterLabelFn }) {
  if (!countdowns?.length) return null
  return (
    <div className="sj-cd-strip">
      {countdowns.slice(0, 3).map((c, i) => (
        <div key={`${c.planet}-${i}`} className="sj-cd-chip" style={{ animationDelay: `${180 + i * 70}ms` }}>
          <span className="sj-cd-glyph">{c.glyph || PLANET_GLYPHS[c.planet] || "✦"}</span>
          <div>
            <p className="sj-cd-in">In {c.days} day{c.days !== 1 ? "s" : ""}</p>
            <p className="sj-cd-name">{chapterLabelFn?.(c.planet) ?? c.planet} → {c.house}th house</p>
            <p className="sj-cd-theme">{c.theme}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Chapter bar — unchanged from v3 ─────────────────────────────────────────
function ChapterBar({ chapter, chapterLabelFn }) {
  if (!chapter) return null
  return (
    <div className="sj-chap">
      <div className="sj-chap-row">
        <span>{chapterLabelFn?.(chapter.md) ?? chapter.md}{chapter.ad ? ` · ${chapterLabelFn?.(chapter.ad) ?? chapter.ad}` : ""} chapter</span>
        <span>{chapter.pct}% · {chapter.days_remaining}d left</span>
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
    opportunity: { bg: "rgba(91,122,94,0.22)", border: "rgba(91,122,94,0.45)", ac: "#9FC7A2" },
    steady:      { bg: "rgba(217,164,65,0.12)", border: "rgba(217,164,65,0.30)", ac: "#F0CB80" },
    caution:     { bg: "rgba(184,64,64,0.16)",  border: "rgba(184,64,64,0.35)",  ac: "#E09090" },
  }[action.tone] || {}

  function openJyoti() {
    window.dispatchEvent(new CustomEvent("sj:open-jyoti", {
      detail: { prefill: t("action_jyoti_prefill", { verb: action.verb, context: action.context }) }
    }))
  }

  return (
    <div className="sj-action sj-fade-up" style={{ animationDelay: "120ms" }}>
      <p className="sj-action-eyebrow">One thing to do today</p>
      <div className="sj-action-card" style={{ background: ts.bg, border: `1px solid ${ts.border}` }}>
        <p className="sj-action-text">
          <span style={{ color: ts.ac }}>{action.verb}</span>{" "}{action.context}
        </p>
        <p className="sj-action-why">{action.why}</p>
        <button className="sj-why-btn" onClick={openJyoti}
                style={{ color: ts.ac, border: `1px solid ${ts.border}` }}>
          Why?
        </button>
      </div>
    </div>
  )
}

// ── Greeting ────────────────────────────────────────────────────────────────
function greet() {
  const h = new Date().getHours()
  if (h < 5)  return "Still up?"
  if (h < 12) return "Good morning,"
  if (h < 17) return "Good afternoon,"
  if (h < 21) return "Good evening,"
  return "Still up?"
}

// ── Main export ────────────────────────────────────────────────────────────────
export default function DailyPatrikaHero({
  firstName, edition, dayScore, chapterLabelFn, oneAction, onRefresh, onReaction,
  cardReactions,
}) {
  const { i18n } = useTranslation()
  const locale = i18n.language?.startsWith("hi") ? "hi-IN" : "en-GB"
  const dateStr = new Date().toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "long" })

  const chapter = edition?.chapter
  const score = dayScore?.score
  const tone = score >= 7 ? "opportunity" : score >= 4.5 ? "steady" : "caution"
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
              <p className="sj-greet">{greet()}</p>
              <p className="sj-name">{firstName}</p>
            </div>
            <div className="sj-datebox">
              <p className="sj-eyebrow-gold">Today's Patrika</p>
              <p className="sj-datestr">{dateStr}</p>
              {chapter && (
                <p className="sj-chapday">Day {chapter.day} · {chapterLabelFn?.(chapter.md) ?? chapter.md}</p>
              )}
            </div>
          </div>

          {/* Body: ring + deck
              Mobile: ring centered above, deck below (flex-col)
              sm+:    ring left, deck right (flex-row) */}
          <div className="sj-body">
            <CosmicRing score={score} tone={tone} mdPlanet={chapter?.md} label={dayScore?.label} pulse={pulse}/>
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

      <style>{`
        /* ── Root ── */
        .sj-hero-root { font-family: inherit; }

        /* ── Night card ── */
        .sj-night-card {
          position:relative; overflow:hidden; border-radius:20px;
          border:1px solid rgba(217,164,65,0.18);
          background:linear-gradient(135deg,#1e2247 0%,#171B33 60%,#0F1226 100%);
        }
        .sj-night-inner { position:relative; padding:22px 18px 20px; }
        @media(min-width:640px){ .sj-night-inner{ padding:30px 28px 26px; } }

        .sj-glow{
          position:absolute;top:-70px;right:-50px;
          width:220px;height:220px;border-radius:50%;
          background:radial-gradient(circle,rgba(217,164,65,0.08),transparent 70%);
          pointer-events:none;
        }

        /* ── Top row ── */
        .sj-top-row{
          display:flex;align-items:flex-start;
          justify-content:space-between;margin-bottom:18px;gap:8px;
        }
        .sj-greet{
          font-family:Fraunces,Georgia,serif;font-size:15px;
          color:rgba(248,242,228,0.48);line-height:1.2;
        }
        .sj-name{
          font-family:Fraunces,Georgia,serif;font-weight:600;
          font-size:clamp(20px,5vw,26px);
          color:rgba(248,242,228,0.95);line-height:1.1;
        }
        .sj-datebox{ text-align:right;flex-shrink:0;min-width:0; }
        .sj-eyebrow-gold{
          font-size:10px;font-weight:700;letter-spacing:.12em;
          text-transform:uppercase;color:#D9A441;
        }
        .sj-datestr{ font-size:11px;color:rgba(248,242,228,0.32);margin-top:2px; }
        .sj-chapday{ font-size:10px;color:rgba(248,242,228,0.2);margin-top:2px; }

        /* ── Body: mobile = col, sm+ = row ── */
        .sj-body{
          display:flex;flex-direction:column;align-items:center;
          gap:14px;margin-bottom:2px;
        }
        @media(min-width:480px){
          .sj-body{ flex-direction:row;align-items:flex-start;gap:18px; }
        }
        .sj-ring-wrap{ flex-shrink:0; }
        .sj-body-right{ flex:1;min-width:0;width:100%; }

        /* ── One action ── */
        .sj-action{ margin-top:14px; }
        .sj-action-eyebrow{
          font-size:10px;text-transform:uppercase;letter-spacing:.12em;
          font-weight:700;margin-bottom:7px;color:rgba(248,242,228,0.38);
        }
        .sj-action-card{
          border-radius:14px;padding:12px 14px;
        }
        .sj-action-text{
          font-family:Fraunces,Georgia,serif;font-weight:600;
          font-size:clamp(13px,3.6vw,15px);line-height:1.35;
          color:rgba(248,242,228,0.95);margin:0 0 4px;
        }
        .sj-action-why{
          font-size:11px;color:rgba(248,242,228,0.4);margin:0 0 8px;
        }
        .sj-why-btn{
          background:rgba(248,242,228,0.07);border-radius:99px;
          padding:5px 12px;font-size:11px;font-weight:700;
          cursor:pointer;transition:all 150ms;
          -webkit-tap-highlight-color:transparent;
        }

        /* ── Chapter bar ── */
        .sj-chap{ margin-top:14px; }
        .sj-chap-row{
          display:flex;justify-content:space-between;
          font-size:10px;color:rgba(248,242,228,0.28);margin-bottom:4px;
        }
        .sj-chap-track{
          height:2px;border-radius:99px;
          background:rgba(248,242,228,0.07);overflow:hidden;
        }
        .sj-chap-fill{
          height:100%;border-radius:99px;background:rgba(217,164,65,0.48);
        }

        /* ── Countdown strip — 1 col mobile, 3 col md+ ── */
        .sj-cd-strip{
          display:grid;
          grid-template-columns:1fr;
          gap:7px;margin-top:8px;
        }
        @media(min-width:600px){
          .sj-cd-strip{ grid-template-columns:repeat(3,1fr); }
        }
        .sj-cd-chip{
          display:flex;align-items:flex-start;gap:10px;
          border-radius:14px;padding:12px 13px;
          background:rgba(23,27,51,0.72);
          border:1px solid rgba(248,242,228,0.07);
          animation:sj-fade-up 220ms both;
        }
        .sj-cd-glyph{ font-size:17px;color:#D9A441;margin-top:1px;flex-shrink:0; }
        .sj-cd-in{
          font-size:10px;font-weight:700;letter-spacing:.1em;
          text-transform:uppercase;color:#D9A441;margin:0 0 2px;
        }
        .sj-cd-name{
          font-size:12px;font-weight:600;color:rgba(248,242,228,0.78);margin:0 0 1px;
        }
        .sj-cd-theme{ font-size:10px;color:rgba(248,242,228,0.32);margin:0; }

        /* ── Shimmer (loading placeholder) ── */
        .sj-shimmer{
          height:15px;border-radius:7px;
          background:linear-gradient(90deg,rgba(248,242,228,0.04) 25%,rgba(248,242,228,0.09) 50%,rgba(248,242,228,0.04) 75%);
          background-size:200% 100%;
          animation:sj-shimmer-a 1.6s ease-in-out infinite;
        }
        @keyframes sj-shimmer-a{from{background-position:200% 0}to{background-position:-200% 0}}

        /* ── Shared animations ── */
        .sj-fade-up{animation:sj-fade-up 220ms cubic-bezier(.2,.7,.3,1) both}
        @keyframes sj-fade-up{from{opacity:0;transform:translateY(7px)}to{opacity:1;transform:translateY(0)}}
        .sj-grow-bar{animation:sj-grow 240ms cubic-bezier(.2,.8,.3,1) both;transform-origin:left}
        @keyframes sj-grow{from{transform:scaleX(0)}to{transform:scaleX(1)}}
        .sj-ring-arc{animation:sj-ring-a 240ms cubic-bezier(.2,.8,.3,1) both}
        @keyframes sj-ring-a{from{stroke-dasharray:0 999}}
        .sj-ring-pulse{animation:sj-ring-a 240ms cubic-bezier(.2,.8,.3,1) both,sj-pulse 2.4s ease-in-out 400ms infinite}
        @keyframes sj-pulse{0%,100%{opacity:1}50%{opacity:.72}}

        @media(prefers-reduced-motion:reduce){
          .sj-fade-up,.sj-shimmer,.sj-grow-bar,.sj-ring-arc,
          .sj-ring-pulse,.sj-cd-chip{animation:none!important}
        }
      `}</style>
    </div>
  )
}
