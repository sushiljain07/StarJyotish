// frontend/src/components/knowledge/RelatedArticles.jsx
//
// End-of-guide "where to go next" module — started as just a "related
// reading" grid (see git history), extended this sprint with a second
// variant for a single, prominent recommendation (Recommended Next Guide
// / Continue Learning). Both share one component because they're the
// same underlying idea at different weights: one strong recommendation
// gets a full-width card, several loosely-related ones get a compact
// grid — "You May Also Like" is just the grid variant with different
// copy.
//
// Both variants are coming-soon-safe: an item without a real `href` (or
// with `comingSoon: true`) renders as a non-interactive card with a
// "Coming soon" / "Soon" pill instead of a dead or broken link — same
// rule ArticleCard.jsx and ConceptLink.jsx already follow.
import { Link } from 'react-router-dom'

function NextGuideCard({ title, item }) {
  const isInteractive = Boolean(item.href) && !item.comingSoon
  const heading = title ?? 'Continue learning'

  const inner = (
    <>
      <p className="text-primary-dark text-xs font-bold tracking-widest uppercase mb-2">{heading}</p>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-serif font-semibold text-lg text-ink">{item.title}</p>
          {item.description && <p className="text-ink-muted text-sm mt-1 max-w-md">{item.description}</p>}
        </div>
        {isInteractive ? (
          <span className="shrink-0 text-primary-dark text-sm font-medium">Continue →</span>
        ) : (
          <span className="shrink-0 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-parchment text-ink-faint border border-line">
            Coming soon
          </span>
        )}
      </div>
    </>
  )

  const classes = 'block max-w-2xl mx-auto bg-parchment-card border border-line rounded-2xl p-6 transition'

  return isInteractive ? (
    <Link to={item.href} className={`${classes} hover:border-primary/30 hover:shadow-md`}>{inner}</Link>
  ) : (
    <div className={classes}>{inner}</div>
  )
}

function GridCard({ item }) {
  const isInteractive = Boolean(item.href) && !item.comingSoon

  const inner = (
    <>
      <div className="flex items-center gap-2 mb-2">
        {item.badge && (
          <span className="inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full bg-primary-light text-primary-dark">
            {item.badge}
          </span>
        )}
        {item.comingSoon && (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-parchment text-ink-faint border border-line ml-auto">
            Soon
          </span>
        )}
      </div>
      <p className={`font-semibold text-sm text-ink leading-snug ${isInteractive ? 'group-hover:text-primary-dark transition' : ''}`}>
        {item.title}
      </p>
      {item.meta && <p className="text-xs text-ink-faint mt-1">{item.meta}</p>}
    </>
  )

  const classes = 'bg-parchment-card rounded-xl border border-line p-4 transition'

  return isInteractive ? (
    <Link to={item.href} className={`group ${classes} hover:border-primary/30 hover:shadow-md`}>{inner}</Link>
  ) : (
    <div className={classes}>{inner}</div>
  )
}

export default function RelatedArticles({ variant = 'grid', title, items }) {
  if (!items || items.length === 0) return null

  if (variant === 'next') {
    return (
      <section className="px-4 py-6">
        <NextGuideCard title={title} item={items[0]} />
      </section>
    )
  }

  return (
    <section className="max-w-2xl mx-auto px-4 py-10">
      <h3 className="font-semibold text-sm text-ink-muted uppercase tracking-wide mb-5">{title ?? 'Related reading'}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {items.map((item, i) => <GridCard key={i} item={item} />)}
      </div>
    </section>
  )
}
