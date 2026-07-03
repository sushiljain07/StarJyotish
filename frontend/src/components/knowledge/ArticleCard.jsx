// frontend/src/components/knowledge/ArticleCard.jsx
//
// The one card every grid on the Learn landing page (and every future
// guide index) is built from — generalized from Blog.jsx's ArticleCard,
// which only knew about blog posts (article.category, article.readMin,
// article.excerpt). This version takes generic title/description/meta/
// badge/icon props instead, so it works equally for a guide preview, a
// category tile, or a learning-path card.
//
// `comingSoon` (no `href`) renders a non-interactive card with a muted
// "Coming soon" pill instead of a dead link — this repo's Footer.jsx
// already points a few nav items at "#" for pages that don't exist yet;
// this is the same situation but surfaced honestly instead of silently,
// since a whole grid of these is a much more visible promise than one
// footer link.
import { Link } from 'react-router-dom'

export default function ArticleCard({
  title,
  description,
  href,
  badge,
  meta,
  icon,
  featured = false,
  comingSoon = false,
}) {
  const isInteractive = Boolean(href) && !comingSoon

  const inner = (
    <>
      <div className="flex items-center gap-2.5 mb-3">
        {icon && (
          <span className={`shrink-0 ${featured ? 'text-primary' : 'text-primary-dark'}`}>{icon}</span>
        )}
        {badge && (
          <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
            featured ? 'bg-white/10 text-primary-light' : 'bg-primary-light text-primary-dark'
          }`}>
            {badge}
          </span>
        )}
        {comingSoon && (
          <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-parchment text-ink-faint border border-line ml-auto">
            Coming soon
          </span>
        )}
      </div>
      <h3 className={`font-semibold leading-snug mb-2 ${
        featured ? 'font-serif text-lg sm:text-xl text-primary-light' : 'text-sm text-ink'
      } ${isInteractive ? 'group-hover:text-primary-dark transition' : ''}`}>
        {title}
      </h3>
      {description && (
        <p className={`text-xs leading-relaxed ${featured ? 'text-ink-onnight' : 'text-ink-muted'} ${!featured ? 'flex-1' : ''}`}>
          {description}
        </p>
      )}
      {meta && (
        <div className={`flex items-center justify-between mt-4 pt-3 border-t ${featured ? 'border-white/10' : 'border-line'}`}>
          <span className={`text-[11px] ${featured ? 'text-ink-onnight' : 'text-ink-faint'}`}>{meta}</span>
          {isInteractive && (
            <span className={`text-xs font-medium transition-transform group-hover:translate-x-0.5 ${featured ? 'text-primary' : 'text-primary-dark'}`}>
              Read →
            </span>
          )}
        </div>
      )}
    </>
  )

  const baseClasses = featured
    ? 'bg-night rounded-2xl p-7 sm:p-9'
    : 'bg-parchment-card rounded-xl border border-line p-5 flex flex-col h-full'

  if (!isInteractive) {
    return (
      <div className={`${baseClasses} ${comingSoon ? 'opacity-70' : ''}`}>
        {inner}
      </div>
    )
  }

  return (
    <Link
      to={href}
      className={`group w-full text-left block transition hover:border-primary/30 hover:shadow-md ${baseClasses} ${featured ? 'hover:opacity-95' : ''}`}
    >
      {inner}
    </Link>
  )
}
