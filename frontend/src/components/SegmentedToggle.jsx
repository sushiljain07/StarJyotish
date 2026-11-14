// frontend/src/components/SegmentedToggle.jsx
//
// Small "how should this view render" control — distinct in purpose from
// SubTabBar (Result.jsx, "which view am I looking at"), but visually
// matching it: same filled-pill treatment, just used for fewer, denser
// options. It replaced separate hand-rolled pill toggles (one of them
// inline in PlanetTable.jsx), whose drift produced the Birth Chart vs
// Planets inconsistency; one shared component now backs every call site.
//
// `ariaLabel` names the button group for screen readers when there is no
// visible `label`; each button reports its state with aria-pressed.
import { useId } from 'react'

export default function SegmentedToggle({ label, ariaLabel, options, active, onChange, className = '' }) {
  const labelId = useId()
  return (
    <div className={`flex items-center gap-2 flex-wrap ${className}`}>
      {label && <span id={labelId} className="text-xs text-ink-muted">{label}</span>}
      <div className="flex gap-1 flex-wrap" role="group"
           aria-labelledby={label ? labelId : undefined}
           aria-label={label ? undefined : ariaLabel}>
        {options.map(o => (
          <button key={o.id} type="button" onClick={() => onChange(o.id)} aria-pressed={active === o.id}
                  className={`text-xs px-3 min-h-11 min-w-11 rounded-lg border transition ${
                    active === o.id
                      ? 'bg-primary border-primary text-night'
                      : 'bg-parchment-card border-line text-ink-muted hover:border-primary/50'
                  }`}>
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}
