// frontend/src/components/SegmentedToggle.jsx
//
// Small "how should this view render" control — distinct in purpose from
// SubTabBar (Result.jsx, "which view am I looking at"), but visually
// matching it: same filled-pill treatment, just used for fewer, denser
// options. Previously this existed as three separate implementations —
// a bordered-segment style here, and two near-identical hand-rolled pill
// versions duplicated inline in PlanetTable.jsx and ShodashvargaPanel.jsx —
// which is what produced the Birth Chart vs Planets inconsistency. One
// shared component now backs all three call sites.
export default function SegmentedToggle({ label, options, active, onChange, className = '' }) {
  return (
    <div className={`flex items-center gap-2 flex-wrap ${className}`}>
      {label && <span className="text-xs text-ink-muted">{label}</span>}
      <div className="flex gap-1">
        {options.map(o => (
          <button key={o.id} onClick={() => onChange(o.id)}
                  className={`text-xs px-3 py-1 rounded-lg border transition ${
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
