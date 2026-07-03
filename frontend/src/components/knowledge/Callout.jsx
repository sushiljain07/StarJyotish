// frontend/src/components/knowledge/Callout.jsx
//
// Inline highlight box for asides within long-form content — "here's the
// one thing to remember", a caveat, a warning about a common
// misreading. Four variants, each mapped straight onto an existing
// *-light / DEFAULT color pair from tailwind.config.js (no new colors
// introduced): the same pairing already used for category pills in
// Blog.jsx / BlogArticle.jsx, just applied to a block instead of a chip.
const VARIANTS = {
  tip:     { bg: 'bg-primary-light',    border: 'border-primary',    label: 'text-primary-dark' },
  note:    { bg: 'bg-sage-light',       border: 'border-sage',       label: 'text-sage' },
  warning: { bg: 'bg-vermillion-light', border: 'border-vermillion', label: 'text-vermillion' },
  insight: { bg: 'bg-mauve-light',      border: 'border-mauve',      label: 'text-mauve' },
}

export default function Callout({ variant = 'tip', title, children }) {
  const tone = VARIANTS[variant] ?? VARIANTS.tip

  return (
    <div className={`${tone.bg} border-l-4 ${tone.border} rounded-r-xl px-5 py-4 my-6`} role="note">
      {title && (
        <p className={`text-xs font-bold tracking-wide uppercase ${tone.label} mb-1.5`}>{title}</p>
      )}
      <div className="text-sm text-ink leading-relaxed">{children}</div>
    </div>
  )
}
