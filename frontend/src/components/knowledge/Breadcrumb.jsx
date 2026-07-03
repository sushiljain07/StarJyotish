// frontend/src/components/knowledge/Breadcrumb.jsx
//
// Generic breadcrumb trail. Content-agnostic on purpose — every future
// guide page (Zodiac, Nakshatra, Dasha, ...) passes its own `items`, this
// component only owns the semantics (nav landmark, ordered list, current
// page marked with aria-current) and the two visual variants it needs to
// render on both the dark hero band (Hero.jsx) and a plain parchment
// background (a future guide page that doesn't open with a hero).
//
// `items` is an array of { label, to? }. The last item is treated as the
// current page: it never renders as a link, regardless of whether `to`
// was passed, since linking to the page you're already on is dead weight
// for both users and crawlers.
import { Link } from 'react-router-dom'

const VARIANTS = {
  // On the night hero band — see Hero.jsx.
  dark: {
    link: 'text-ink-onnight/70 hover:text-primary transition',
    separator: 'text-ink-onnight/30',
    current: 'text-primary-light font-medium',
  },
  // On a plain parchment page background.
  light: {
    link: 'text-ink-muted hover:text-primary-dark transition',
    separator: 'text-ink-faint',
    current: 'text-ink font-medium',
  },
}

export default function Breadcrumb({ items, variant = 'light', className = '' }) {
  if (!items || items.length === 0) return null
  const tone = VARIANTS[variant] ?? VARIANTS.light

  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex flex-wrap items-center gap-1.5 text-xs">
        {items.map((item, i) => {
          const isLast = i === items.length - 1
          return (
            <li key={i} className="flex items-center gap-1.5">
              {i > 0 && <span className={tone.separator} aria-hidden="true">/</span>}
              {isLast || !item.to ? (
                <span className={tone.current} aria-current={isLast ? 'page' : undefined}>
                  {item.label}
                </span>
              ) : (
                <Link to={item.to} className={tone.link}>
                  {item.label}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
