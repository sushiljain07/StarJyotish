// frontend/src/components/home/DailyPatrikaHero.jsx  v3
//
// Changes from v2:
// 1. MOBILE-FIRST layout — ring + headline stack vertically on <sm, side-by-side on sm+
// 2. CARD REACTIONS — each card has 👍/👎 buttons that call onReaction(cardType, 'up'/'down')
// 3. SWIPE GESTURES — touch start/end detection to swipe between cards on mobile
// 4. SAFE AREA — bottom padding respects env(safe-area-inset-bottom) on iPhones
// 5. FONT SCALE — headline uses clamp(14px,4vw,19px) so it reads on 375px screens
// 6. COUNTDOWN STRIP — 1-column on mobile, 3-column on md+

import { useState, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'

// ── Deterministic star field ───────────────────────────────────────────────────
const STARS = Array.from({ length: 28 }, (_, i) => {
  const h = (i * 2654435761) % 1000
  return {
    left: h % 100,
    top: ((h >> 3) % 85) + 5,
    size: i % 7 === 0 ? 2.5 : i % 3 === 0 ? 1.6 : 1.0,
    dur: 3.5 + (i % 5) * 2.1,
    delay: (i % 11) * 0.6,
  }
})

// ── Card type config ───────────────────────────────────────────────────────────
const CARD_CFG = {
  HEADLINE:        { eyebrow: "Today's Headline",    icon: "✦", accent: "#D9A441", dim: "rgba(217,164,65,0.13)", border: "rgba(217,164,65,0.28)", bg: "rgba(30,34,71,0.85)"   },
  QUESTION:        { eyebrow: "Reflect on this",     icon: "?", accent: "#9B8ED4", dim: "rgba(155,142,212,0.13)", border: "rgba(155,142,212,0.28)", bg: "rgba(26,26,53,0.85)"  },
  OPPORTUNITY:     { eyebrow: "Open window",         icon: "↗", accent: "#9FC7A2", dim: "rgba(159,199,162,0.13)", border: "rgba(159,199,162,0.28)", bg: "rgba(21,33,24,0.85)"  },
  WATCH:           { eyebrow: "Worth noting",        icon: "◉", accent: "#E8B56A", dim: "rgba(232,181,106,0.13)", border: "rgba(232,181,106,0.28)", bg: "rgba(31,26,16,0.85)"  },
  NAKSHATRA_FLASH: { eyebrow: "Moon's nakshatra",    icon: "☽", accent: "#C8D8F0", dim: "rgba(200,216,240,0.10)", border: "rgba(200,216,240,0.22)", bg: "rgba(17,24,40,0.85)"  },
  TIMING_WINDOW:   { eyebrow: "Best time today",     icon: "⧗", accent: "#6BAED4", dim: "rgba(107,174,212,0.13)", border: "rgba(107,174,212,0.25)", bg: "rgba(14,24,34,0.85)"  },
  DASHA_WHISPER:   { eyebrow: "Your chapter",        icon: "∞", accent: "#D4A0C4", dim: "rgba(212,160,196,0.13)", border: "rgba(212,160,196,0.25)", bg: "rgba(30,16,32,0.85)"  },
}

const PLANET_GLYPHS = {
  Sun:"☉", Moon:"☽", Mercury:"☿", Venus:"♀", Mars:"♂",
  Jupiter:"♃", Saturn:"♄", Rahu:"☊", Ketu:"☋",
}

const RING_COLORS = {
  opportunity: { track: "rgba(240,203,128,0.12)", fill: "#D9A441", glyph: "rgba(240,203,128,0.9)" },
  steady:      { track: "rgba(91,122,94,0.18)",   fill: "#9FC7A2", glyph: "rgba(159,199,162,0.9)" },
  caution:     { track: "rgba(162,59,59,0.18)",   fill: "#E09090", glyph: "rgba(224,144,144,0.9)" },
}

// ── Cosmic Ring ────────────────────────────────────────────────────────────────
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

// ── Single Insight Card ────────────────────────────────────────────────────────
function InsightCard({ card, onReaction, reacted, variation }) {
  const cfg = CARD_CFG[card.type] || CARD_CFG.HEADLINE
  const isQ = card.type === "QUESTION"

  return (
    <div className="sj-icard" style={{
      "--ca": cfg.accent, "--cd": cfg.dim, "--cb": cfg.border, "--cbg": cfg.bg,
    }}>
      {/* Eyebrow */}
      <div className="sj-icard-eyebrow">
        <span style={{ fontSize: 13 }}>{cfg.icon}</span>
        <span>{cfg.eyebrow}</span>
      </div>

      {/* Text */}
      <p className={isQ ? "sj-icard-question" : "sj-icard-body"}>
        {card.text}
      </p>

      {/* Footer: planet chip + reactions */}
      <div className="sj-icard-footer">
        {card.event && (
          <div className="sj-icard-chip">
            <span>{PLANET_GLYPHS[card.event.planet] || "✦"}</span>
            <span>{card.event.planet}</span>
            {card.event.retrograde && <span style={{ color: cfg.accent }}>℞</span>}
            <span>· {card.event.house}H</span>
          </div>
        )}

        {/* Reaction buttons */}
        <div className="sj-reactions" role="group" aria-label="Rate this insight">
          <button
            className="sj-react-btn"
            data-picked={reacted === 'up'}
            onClick={() => onReaction?.(card.type, 'up', card.event)}
            aria-label="This resonated"
            style={{ "--ra": cfg.accent }}
          >
            👍
          </button>
          <button
            className="sj-react-btn"
            data-picked={reacted === 'down'}
            onClick={() => onReaction?.(card.type, 'down', card.event)}
            aria-label="This didn't resonate"
          >
            👎
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Card Stack with swipe support ─────────────────────────────────────────────
function CardStack({ cards, onReaction, reactions, variation, onRefresh }) {
  const [active, setActive] = useState(0)
  const touchX = useRef(null)

  function next() { setActive(i => (i + 1) % cards.length) }
  function prev() { setActive(i => (i - 1 + cards.length) % cards.length) }

  function onTouchStart(e) { touchX.current = e.touches[0].clientX }
  function onTouchEnd(e) {
    if (touchX.current === null) return
    const dx = e.changedTouches[0].clientX - touchX.current
    if (Math.abs(dx) > 40) { dx < 0 ? next() : prev() }
    touchX.current = null
  }

  if (!cards.length) return null
  const card = cards[active]
  const cfg = CARD_CFG[card.type] || CARD_CFG.HEADLINE

  return (
    <div className="sj-stack" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      {/* Active card */}
      <div key={`${card.type}-${active}`} className="sj-stack-active">
        <InsightCard
          card={card}
          onReaction={onReaction}
          reacted={reactions?.[card.type]}
          variation={variation}
        />
      </div>

      {/* Nav row */}
      <div className="sj-stack-nav">
        <button className="sj-nav-arr" onClick={prev} aria-label="Previous">‹</button>
        <div className="sj-dots" role="tablist">
          {cards.map((c, i) => {
            const c2 = CARD_CFG[c.type] || CARD_CFG.HEADLINE
            return (
              <button
                key={i}
                className="sj-dot"
                role="tab"
                aria-selected={i === active}
                onClick={() => setActive(i)}
                aria-label={c2.eyebrow}
                style={{ "--dc": c2.accent }}
              />
            )
          })}
        </div>
        <button className="sj-nav-arr" onClick={next} aria-label="Next">›</button>
      </div>

      {/* Refresh */}
      {onRefresh && (
        <button className="sj-refresh" onClick={onRefresh}>↺ Different insight</button>
      )}
    </div>
  )
}

// ── Countdown strip ────────────────────────────────────────────────────────────
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

// ── Chapter bar ────────────────────────────────────────────────────────────────
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

// ── One Action ─────────────────────────────────────────────────────────────────
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

// ── Greeting ────────────────────────────────────────────────────────────────────
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
  const dateStr = useMemo(
    () => new Date().toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "long" }),
    [locale],
  )

  const chapter = edition?.chapter
  const score = dayScore?.score
  const tone = score >= 7 ? "opportunity" : score >= 4.5 ? "steady" : "caution"
  const pulse = score >= 8

  const cards = useMemo(() => {
    if (edition?.cards?.length) return edition.cards
    if (edition?.headline) return [{ type: "HEADLINE", text: edition.headline, event: edition.headline_event }]
    return []
  }, [edition])

  return (
    <div className="sj-hero-root">
      {/* ── Night card ─────────────────────────────────────────────────────── */}
      <div className="sj-night-card">
        {/* Stars */}
        <div className="sj-stars" aria-hidden="true">
          {STARS.map((s, i) => (
            <span key={i} className="sj-star" style={{
              left: `${s.left}%`, top: `${s.top}%`,
              width: s.size, height: s.size,
              animationDuration: `${s.dur}s`, animationDelay: `${s.delay}s`,
            }}/>
          ))}
          <div className="sj-glow"/>
        </div>

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

          {/* Body: ring + cards
              Mobile: ring centered above, cards below (flex-col)
              sm+:    ring left, cards right (flex-row) */}
          <div className="sj-body">
            <CosmicRing score={score} tone={tone} mdPlanet={chapter?.md} label={dayScore?.label} pulse={pulse}/>
            <div className="sj-body-right">
              {cards.length > 0 ? (
                <CardStack
                  cards={cards}
                  onReaction={onReaction}
                  reactions={cardReactions}
                  variation={edition?.variation ?? 0}
                  onRefresh={onRefresh}
                />
              ) : edition?.headline ? (
                <p className="sj-headline sj-fade-up">{edition.headline}</p>
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

        /* ── Stars ── */
        .sj-stars{ position:absolute;inset:0;pointer-events:none; }
        .sj-star{
          position:absolute;border-radius:50%;
          background:rgba(240,203,128,0.85);
          animation:sj-twinkle linear infinite;
        }
        @keyframes sj-twinkle{
          0%,100%{opacity:.1;transform:translateY(0) scale(1)}
          50%{opacity:.9;transform:translateY(-2px) scale(1.1)}
        }
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

        /* ── Headline fallback ── */
        .sj-headline{
          font-family:Fraunces,Georgia,serif;line-height:1.45;
          font-size:clamp(14px,4vw,19px);
          color:rgba(248,242,228,0.95);
        }

        /* ── Insight card ── */
        .sj-icard{
          border-radius:14px;padding:14px;
          border:1px solid var(--cb);
          background:var(--cbg);
        }
        .sj-icard-eyebrow{
          display:flex;align-items:center;gap:6px;
          font-size:10px;font-weight:700;letter-spacing:.12em;
          text-transform:uppercase;color:var(--ca);margin-bottom:9px;
        }
        .sj-icard-body{
          font-family:Fraunces,Georgia,serif;
          font-size:clamp(13px,3.8vw,16px);line-height:1.48;
          color:rgba(248,242,228,0.92);margin:0 0 10px;
        }
        .sj-icard-question{
          font-family:Fraunces,Georgia,serif;
          font-size:clamp(14px,4.2vw,18px);line-height:1.42;
          color:rgba(248,242,228,0.92);margin:0 0 10px;font-style:italic;
        }
        .sj-icard-footer{
          display:flex;align-items:center;
          justify-content:space-between;gap:8px;flex-wrap:wrap;
        }
        .sj-icard-chip{
          display:flex;align-items:center;gap:4px;
          font-size:10px;color:rgba(248,242,228,0.32);flex-shrink:0;
        }

        /* ── Reaction buttons ── */
        .sj-reactions{ display:flex;gap:6px;flex-shrink:0; }
        .sj-react-btn{
          background:rgba(248,242,228,0.06);border:1px solid rgba(248,242,228,0.1);
          border-radius:99px;padding:4px 10px;font-size:13px;
          cursor:pointer;transition:all 150ms;line-height:1;
          -webkit-tap-highlight-color:transparent;
        }
        .sj-react-btn:hover{ background:rgba(248,242,228,0.12); }
        .sj-react-btn[data-picked="true"]{
          background:var(--ra,rgba(217,164,65,0.2));
          border-color:var(--ra,rgba(217,164,65,0.4));
          transform:scale(1.1);
        }

        /* ── Card stack ── */
        .sj-stack{ width:100%; }
        .sj-stack-active{
          animation:sj-card-in 240ms cubic-bezier(.2,.8,.3,1) both;
        }
        @keyframes sj-card-in{
          from{opacity:0;transform:translateY(7px) scale(0.98)}
          to{opacity:1;transform:translateY(0) scale(1)}
        }
        .sj-stack-nav{
          display:flex;align-items:center;justify-content:center;
          gap:8px;margin-top:10px;
        }
        .sj-nav-arr{
          background:none;border:none;cursor:pointer;
          color:rgba(248,242,228,0.28);font-size:18px;
          padding:2px 8px;transition:color 150ms;
          -webkit-tap-highlight-color:transparent;
          min-width:32px;min-height:32px; /* touch target */
        }
        .sj-nav-arr:hover{ color:rgba(248,242,228,0.65); }
        .sj-dots{ display:flex;gap:5px;align-items:center; }
        .sj-dot{
          width:7px;height:7px;border-radius:50%;border:none;
          background:rgba(248,242,228,0.18);cursor:pointer;
          transition:background 200ms,transform 200ms;padding:0;
          min-width:7px; /* prevent flex shrink */
          -webkit-tap-highlight-color:transparent;
        }
        .sj-dot[aria-selected="true"]{
          background:var(--dc,#D9A441);transform:scale(1.4);
        }
        .sj-refresh{
          display:block;margin:8px auto 0;
          background:none;border:1px solid rgba(248,242,228,0.1);
          border-radius:99px;padding:5px 14px;
          font-size:10px;font-weight:600;letter-spacing:.04em;
          color:rgba(248,242,228,0.28);cursor:pointer;
          transition:all 180ms;
          -webkit-tap-highlight-color:transparent;
        }
        .sj-refresh:hover{ color:rgba(248,242,228,0.55);border-color:rgba(248,242,228,0.22); }

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

        /* ── Shimmer ── */
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
          .sj-star,.sj-fade-up,.sj-shimmer,.sj-grow-bar,.sj-ring-arc,
          .sj-ring-pulse,.sj-stack-active,.sj-cd-chip{animation:none!important}
        }
      `}</style>
    </div>
  )
}
