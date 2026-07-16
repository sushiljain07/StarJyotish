// components/ui/Card.jsx
//
// The one card surface. Collapses the two vocabularies that grew apart:
//   light (parchment) cards: bg-parchment-card + border-line + shadow-card
//   night cards:             translucent white-alpha, no shadow (glow comes
//                            from the border, not elevation — shadows are
//                            invisible on bg-night-deep anyway)
// Radius is always rounded-card (see tailwind.config.js) — the app had
// drifted across rounded-lg/xl/2xl with no rule.
const SURFACES = {
  light: 'bg-parchment-card border border-line shadow-card',
  night: 'bg-white/[0.045] border border-white/[0.09]',
  // Accented night card — for the one emphasized card in a group
  // (e.g. "Coming up" highlight). Use sparingly.
  'night-accent': 'bg-gradient-to-br from-night-light to-night border border-primary/25',
}

const PADDING = {
  none: '',
  sm: 'p-3',
  md: 'p-4 sm:p-5',
  lg: 'p-5 sm:p-7',
}

export default function Card({
  surface = 'light',
  padding = 'md',
  interactive = false,
  as: Tag = 'div',
  className = '',
  children,
  ...rest
}) {
  const classes = [
    'rounded-card',
    SURFACES[surface] ?? SURFACES.light,
    PADDING[padding] ?? PADDING.md,
    interactive
      ? 'transition hover:shadow-lift active:scale-[0.99] motion-reduce:active:scale-100 cursor-pointer'
      : '',
    className,
  ].join(' ')

  return <Tag className={classes} {...rest}>{children}</Tag>
}
