// frontend/src/components/knowledge/ZodiacCard.jsx
//
// The centerpiece card for "Meet the Twelve Rashis" — distinct from
// ArticleCard on purpose. ArticleCard is a link-preview shape (title +
// description + meta/badge row); a zodiac sign isn't a piece of content
// with a read time, it's an identity with a name, an archetype, and a
// line worth sitting with. So this gets its own quieter layout: icon,
// Sanskrit/English name, archetype label, and a quoted tagline treated
// like a small pull-quote rather than body copy.
//
// Reusable beyond this one page — anywhere else in the app that needs to
// reference "Aries" as a sign (a future compatibility page, a chart
// summary) can reuse this instead of re-deriving the same card.
import { Link } from 'react-router-dom'

export default function ZodiacCard({ sanskrit, english, archetype, tagline, icon, href, comingSoon = true }) {
  const isInteractive = Boolean(href) && !comingSoon

  const inner = (
    <>
      <div className="flex items-start justify-between mb-4">
        <span className="text-primary-dark">{icon}</span>
        {comingSoon && (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-parchment text-ink-faint border border-line">
            Coming soon
          </span>
        )}
      </div>
      <h3 className="font-serif font-semibold text-lg text-ink leading-snug">
        {sanskrit} <span className="text-ink-muted font-sans font-normal text-sm">({english})</span>
      </h3>
      <p className="text-primary-dark text-xs font-semibold tracking-wide uppercase mt-1.5 mb-3">{archetype}</p>
      <p className="text-ink-muted text-sm leading-relaxed italic">&ldquo;{tagline}&rdquo;</p>
    </>
  )

  const classes = 'bg-parchment-card rounded-2xl border border-line p-6 h-full transition hover:border-primary/30 hover:shadow-md'

  if (!isInteractive) {
    return <div className={classes}>{inner}</div>
  }

  return (
    <Link to={href} className={`group block ${classes}`}>
      {inner}
    </Link>
  )
}
