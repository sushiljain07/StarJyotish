// components/ui/SectionHeading.jsx
//
// One heading recipe per level, theme-aware. Ends the drift where most
// pages used font-semibold but some used font-medium, and PersonalHome
// hardcoded its own Fraunces + hex-gold in an inline <style> block.
//
// eyebrow: small gold overline label above the heading — the "beat label"
// pattern from the home page, now available everywhere.
const LEVELS = {
  1: 'text-3xl sm:text-4xl',
  2: 'text-2xl',
  3: 'text-lg',
}

const COLORS = {
  light: 'text-ink',
  night: 'text-primary-light',
}

export default function SectionHeading({
  level = 2,
  surface = 'light',
  eyebrow = null,
  className = '',
  children,
  ...rest
}) {
  const Tag = `h${LEVELS[level] ? level : 2}`
  const surfaceKey = surface === 'night' ? 'night' : 'light'
  return (
    <div className={className}>
      {eyebrow && (
        <div
          className={`text-2xs font-sans font-semibold uppercase tracking-[0.14em] mb-1.5 ${
            surfaceKey === 'night' ? 'text-primary-glow' : 'text-primary-dark'
          }`}
        >
          {eyebrow}
        </div>
      )}
      <Tag
        className={`font-serif font-semibold leading-tight ${LEVELS[level] ?? LEVELS[2]} ${COLORS[surfaceKey]}`}
        {...rest}
      >
        {children}
      </Tag>
    </div>
  )
}
