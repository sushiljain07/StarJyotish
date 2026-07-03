// frontend/src/components/knowledge/CTA.jsx
//
// The "see this in your own chart" dark banner — already duplicated once
// between Blog.jsx's newsletter block and BlogArticle.jsx's end-of-article
// CTA with slightly different markup each time. Pulled into one component
// with two layout variants instead of a third copy:
//   - "full"   — full-bleed page-level band (Learn.jsx's closing CTA)
//   - "inline" — rounded card meant to sit inside a Section/article body
import { Link } from 'react-router-dom'

export default function CTA({
  eyebrow,
  title,
  description,
  buttonLabel,
  to = '/generate',
  variant = 'full',
}) {
  const isFull = variant === 'full'

  return (
    <div className={isFull ? 'bg-night px-6 py-14 sm:py-16 text-center' : 'bg-night rounded-2xl px-6 py-10 text-center'}>
      {eyebrow && (
        <p className="text-primary text-xs font-bold tracking-widest uppercase mb-2">{eyebrow}</p>
      )}
      {title && (
        <h2 className="font-serif font-semibold text-xl sm:text-2xl text-primary-light mb-3">{title}</h2>
      )}
      {description && (
        <p className="text-ink-onnight text-sm mb-6 max-w-sm mx-auto">{description}</p>
      )}
      <Link
        to={to}
        className="inline-block bg-primary hover:bg-primary-dark text-night font-semibold text-sm px-7 py-3 rounded-full shadow-md hover:shadow-lg transition"
      >
        {buttonLabel}
      </Link>
    </div>
  )
}
