// components/ui/StateBlock.jsx
//
// The one loading / empty / error surface. Replaces the grab-bag this app
// had grown: three different spinner emojis (🪐 in Result, 💬 in AskPage,
// ⏳ in ChartReading), a TabLoader duplicated verbatim across two pages,
// and fake animate-pulse progress bars. Loading is skeleton-shaped (calm,
// no spinners); empty/error are icon + message + optional action.
//
//   <StateBlock loading lines={4} surface="night" />
//   <StateBlock icon="🪐" title="No chart yet" body="…" action={<Button…/>} />
import Button from './Button'

export function Skeleton({ surface = 'light', className = '' }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse motion-reduce:animate-none rounded-lg ${
        surface === 'night' ? 'bg-white/[0.08]' : 'bg-night/[0.06]'
      } ${className}`}
    />
  )
}

export default function StateBlock({
  loading = false,
  lines = 3,
  icon = null,
  title = null,
  body = null,
  action = null,
  actionLabel = null,
  onAction = null,
  surface = 'light',
  className = '',
}) {
  if (loading) {
    // Skeleton widths vary so the block reads as "content coming", not
    // as a repeated bar. Deterministic (index-based), so no layout shift
    // between renders.
    const widths = ['w-2/3', 'w-full', 'w-5/6', 'w-3/4', 'w-full', 'w-1/2']
    return (
      <div role="status" aria-label="Loading" className={`space-y-3 py-4 ${className}`}>
        {Array.from({ length: lines }, (_, i) => (
          <Skeleton key={i} surface={surface} className={`h-4 ${widths[i % widths.length]}`} />
        ))}
      </div>
    )
  }

  const muted = surface === 'night' ? 'text-ink-onnight/70' : 'text-ink-muted'
  const strong = surface === 'night' ? 'text-primary-light' : 'text-ink'
  return (
    <div className={`text-center py-10 px-4 ${className}`}>
      {icon && <div className="text-3xl mb-3" aria-hidden="true">{icon}</div>}
      {title && <div className={`font-serif font-semibold text-lg ${strong}`}>{title}</div>}
      {body && <p className={`text-sm mt-1.5 max-w-sm mx-auto leading-relaxed ${muted}`}>{body}</p>}
      {action}
      {!action && actionLabel && onAction && (
        <Button surface={surface} size="md" onClick={onAction} className="mt-4">
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
