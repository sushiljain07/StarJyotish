// frontend/src/components/knowledge/Hero.jsx
//
// The dark "look up at the stars" band every Knowledge Center page opens
// with — same bg-night + primary-light heading pattern already used by
// Blog.jsx and BlogArticle.jsx, pulled into one component so the ~15 future
// guide pages don't each re-implement it slightly differently. Takes an
// optional breadcrumb trail (rendered in the dark variant, see
// Breadcrumb.jsx) and an optional `meta` row for article-specific bits
// (category pill, read time) that the landing page doesn't need but a
// guide page does.
import Breadcrumb from './Breadcrumb'
import Reveal from '../Reveal'

export default function Hero({
  eyebrow,
  title,
  subtitle,
  breadcrumbItems,
  meta,
  align = 'center',
  size = 'lg',
  children,
}) {
  const alignClass = align === 'left' ? 'text-left items-start' : 'text-center items-center'
  const titleSize = size === 'lg' ? 'text-3xl sm:text-4xl md:text-5xl' : 'text-2xl sm:text-3xl'

  return (
    <div className="bg-night px-6 pt-24 pb-12 sm:pb-14">
      <div className={`max-w-3xl mx-auto flex flex-col ${alignClass}`}>
        {breadcrumbItems && (
          <Breadcrumb items={breadcrumbItems} variant="dark" className="mb-5" />
        )}
        <Reveal as="div" className={`flex flex-col ${alignClass} w-full`}>
          {eyebrow && (
            <p className="text-primary text-xs font-bold tracking-widest uppercase mb-3">{eyebrow}</p>
          )}
          <h1 className={`font-serif font-semibold ${titleSize} text-primary-light leading-tight mb-4`}>
            {title}
          </h1>
          {subtitle && (
            <p className="text-ink-onnight text-sm sm:text-base leading-relaxed max-w-xl">{subtitle}</p>
          )}
          {meta && <div className="mt-5">{meta}</div>}
          {children && <div className="mt-7 w-full">{children}</div>}
        </Reveal>
      </div>
    </div>
  )
}
