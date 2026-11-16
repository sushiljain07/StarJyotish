// frontend/src/components/knowledge/Section.jsx
//
// One shared "block of the page" wrapper — max-width container, consistent
// vertical rhythm, and an optional eyebrow/title/description heading block
// styled like the rest of the app's section headings (Blog.jsx's "Featured"
// divider, BlogArticle's h2 treatment). Every Learn landing page section
// (Featured Learning Paths, Explore by Category, ...) uses this instead of
// each one hand-rolling its own heading markup, and future guide pages can
// use it to break long-form content into labeled parts.
//
// `tone="dark"` exists for sections that sit on a bg-night background
// (e.g. Learn.jsx's "Why Learn Vedic Astrology" band) — same heading
// structure, just swapped onto the primary-light/ink-onnight pairing
// already used everywhere else on dark surfaces (SiteHeader, Hero,
// CTA), instead of leaving dark-ink text on a night background.
//
// By default the section sits in the shared page frame (layout/frame.js), so
// its edges line up with the header and footer. Pass `maxWidth` for a
// centred prose column; that keeps its own side padding.
import Reveal from '../Reveal'
import { FRAME, GUTTER } from '../layout/frame'

const TONES = {
  light: { eyebrow: 'text-primary-ink', title: 'text-ink', description: 'text-ink-muted' },
  dark:  { eyebrow: 'text-primary',      title: 'text-primary-light', description: 'text-ink-onnight' },
}

export default function Section({
  eyebrow,
  title,
  description,
  align = 'left',
  tone = 'light',
  maxWidth,
  id,
  className = '',
  children,
}) {
  const colors = TONES[tone] ?? TONES.light

  return (
    <section id={id} className={`${maxWidth ? 'px-4 sm:px-6 ' : ''}py-12 sm:py-16 ${className}`}>
      <div className={maxWidth ? `${maxWidth} mx-auto` : `${FRAME} ${GUTTER}`}>
        {(eyebrow || title || description) && (
          <Reveal className={`mb-8 sm:mb-10 ${align === 'center' ? 'max-w-2xl mx-auto text-center' : 'max-w-2xl'}`}>
            {eyebrow && (
              <p className={`${colors.eyebrow} text-xs font-bold tracking-widest uppercase mb-2`}>{eyebrow}</p>
            )}
            {title && (
              <h2 className={`font-serif font-semibold text-2xl sm:text-3xl ${colors.title} leading-snug mb-3`}>{title}</h2>
            )}
            {description && (
              <p className={`${colors.description} text-sm sm:text-base leading-relaxed`}>{description}</p>
            )}
          </Reveal>
        )}
        {children}
      </div>
    </section>
  )
}
