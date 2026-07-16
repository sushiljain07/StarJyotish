// components/ui/Button.jsx
//
// The one button. Before this existed, the `bg-primary hover:bg-primary-dark
// text-night … rounded-full` recipe was hand-typed at 6+ call sites with
// drifting padding/radius/shadow (Landing, BirthForm, Profile, PersonalHome,
// ChartReading, Pricing). New code should never hand-roll a CTA again.
//
// Theme-aware: every variant works on both parchment and night surfaces via
// the `surface` prop, so the workspace theme decision (light vs dark) stays
// a one-line change at call sites, not a component rewrite.
import { Link } from 'react-router-dom'

const SIZES = {
  sm: 'px-3.5 py-1.5 text-xs',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3 text-base',
}

const VARIANTS = {
  // Gold CTA — identical on both surfaces (gold reads on parchment and night).
  primary: {
    light: 'bg-primary hover:bg-primary-dark text-night shadow-card',
    night: 'bg-primary hover:bg-primary-dark text-night shadow-card',
  },
  // Quiet secondary action.
  secondary: {
    light: 'bg-night/5 hover:bg-night/10 text-ink',
    night: 'bg-white/10 hover:bg-white/[0.16] text-ink-onnight hover:text-primary-light',
  },
  // Bare text action (inline "view all", "back", dismiss).
  ghost: {
    light: 'text-ink-muted hover:text-ink hover:bg-night/5',
    night: 'text-ink-onnight/70 hover:text-primary-glow hover:bg-white/[0.06]',
  },
  // Gold-outlined pill — section "view all" CTAs and low-emphasis actions
  // that still belong to the gold accent family.
  outline: {
    light: 'border border-primary/50 text-primary-dark hover:bg-primary/10',
    night: 'border border-primary/40 text-primary-glow hover:bg-primary/10',
  },
}

export default function Button({
  variant = 'primary',
  size = 'md',
  surface = 'light',
  to = null,
  className = '',
  children,
  ...rest
}) {
  const classes = [
    'inline-flex items-center justify-center gap-2 font-semibold rounded-full',
    'transition active:scale-[0.98] motion-reduce:active:scale-100',
    'disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap',
    SIZES[size] ?? SIZES.md,
    (VARIANTS[variant] ?? VARIANTS.primary)[surface === 'night' ? 'night' : 'light'],
    className,
  ].join(' ')

  if (to) {
    return <Link to={to} className={classes} {...rest}>{children}</Link>
  }
  return <button type="button" className={classes} {...rest}>{children}</button>
}
