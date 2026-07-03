// frontend/src/components/knowledge/SignNav.jsx
//
// The "← Prev Sign | Next Sign →" navigation strip for individual zodiac
// sign guide pages (Aries ← → Taurus). Kept distinct from LearningPath
// because sign-to-sign is a sibling/peer traversal, not a curriculum
// progression — LearningPath is for "where am I in the big picture",
// SignNav is for "just take me to the next one."
//
// Renders nothing for a sign that has no prev/next (e.g. Aries has no
// prev, a future Pisces will have no next). Coming-soon signs are shown
// as inactive spans rather than links — same "no dead links" rule.
import { Link } from 'react-router-dom'

function NavItem({ guide, direction }) {
  const isLeft = direction === 'prev'

  const label = (
    <span className="flex flex-col">
      <span className="text-[10px] font-semibold tracking-widest uppercase text-ink-faint mb-0.5">
        {isLeft ? '← Previous' : 'Next →'}
      </span>
      <span className="text-sm font-semibold text-ink group-hover:text-primary-dark transition leading-snug">
        {guide.title}
      </span>
    </span>
  )

  const classes = `group flex items-center gap-3 ${isLeft ? 'flex-row' : 'flex-row-reverse text-right'}`

  if (guide.href && !guide.comingSoon) {
    return (
      <Link to={guide.href} className={`${classes} hover:opacity-80 transition`} aria-label={`${isLeft ? 'Previous sign' : 'Next sign'}: ${guide.title}`}>
        {label}
      </Link>
    )
  }

  return (
    <div className={classes} aria-label={`${guide.title} — coming soon`}>
      {label}
      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-parchment border border-line text-ink-faint">
        Soon
      </span>
    </div>
  )
}

export default function SignNav({ prev, next }) {
  if (!prev && !next) return null

  return (
    <nav
      aria-label="Navigate between zodiac signs"
      className="max-w-2xl mx-auto px-4 py-6 flex items-center justify-between border-t border-line"
    >
      <div>{prev ? <NavItem guide={prev} direction="prev" /> : <span />}</div>
      <div>{next ? <NavItem guide={next} direction="next" /> : <span />}</div>
    </nav>
  )
}
