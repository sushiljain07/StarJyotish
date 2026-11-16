// components/ui/Badge.jsx
//
// The one chip / pill. Replaces hand-typed `rounded-full px-2 py-0.5 text-[11px]`
// recipes. Callers add `font-mono` or `uppercase tracking-widest` via className.
const SIZES = {
  sm: 'text-2xs px-2 py-0.5',
  md: 'text-2xs px-2.5 py-1',
}

const TONES = {
  light: {
    neutral: 'bg-parchment text-ink-muted border border-line',
    gold: 'bg-primary/10 text-primary-ink border border-primary/30',
    sage: 'bg-sage-light text-sage',
  },
  night: {
    neutral: 'bg-white/[0.08] text-ink-onnight',
    gold: 'bg-primary/10 text-primary-glow border border-primary/20',
    sage: 'bg-white/[0.08] text-ink-onnight',
  },
}

export default function Badge({
  tone = 'neutral',
  surface = 'light',
  size = 'sm',
  className = '',
  children,
  ...rest
}) {
  const tones = TONES[surface === 'night' ? 'night' : 'light']
  const classes = [
    'inline-flex items-center gap-1 rounded-full font-semibold whitespace-nowrap',
    SIZES[size] ?? SIZES.sm,
    tones[tone] ?? tones.neutral,
    className,
  ].join(' ')
  return <span className={classes} {...rest}>{children}</span>
}
