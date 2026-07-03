// frontend/src/components/knowledge/RelatedArticles.jsx
//
// End-of-guide "related reading" grid — extracted from the inline version
// in BlogArticle.jsx (see git history) so a future Zodiac/Nakshatra/Dasha
// guide can point back into the Knowledge Center without re-deriving this
// markup. Compact by design: this sits after the main CTA, so it's a
// secondary "keep exploring" prompt, not another full ArticleCard grid.
import { Link } from 'react-router-dom'

export default function RelatedArticles({ title = 'Related reading', items }) {
  if (!items || items.length === 0) return null

  return (
    <section className="max-w-2xl mx-auto px-4 py-10">
      <h3 className="font-semibold text-sm text-ink-muted uppercase tracking-wide mb-5">{title}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {items.map((item, i) => (
          <Link
            key={i}
            to={item.href}
            className="group bg-parchment-card rounded-xl border border-line p-4 hover:border-primary/30 hover:shadow-md transition"
          >
            {item.badge && (
              <span className="inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full mb-2 bg-primary-light text-primary-dark">
                {item.badge}
              </span>
            )}
            <p className="font-semibold text-sm text-ink group-hover:text-primary-dark transition leading-snug">
              {item.title}
            </p>
            {item.meta && <p className="text-xs text-ink-faint mt-1">{item.meta}</p>}
          </Link>
        ))}
      </div>
    </section>
  )
}
