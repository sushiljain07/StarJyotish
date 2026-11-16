// frontend/src/components/knowledge/QuickFacts.jsx
//
// "At a glance" summary card — the label/value grid a future Zodiac sign
// or Nakshatra page would put near the top (Element, Ruling Planet,
// Symbol, ...). Purely presentational: takes a flat `facts` array so it
// has no idea what kind of guide it's summarizing, matching FAQAccordion's
// existing "generic, pre-formatted data in" pattern.
import Card from '../ui/Card'
export default function QuickFacts({ title = 'Quick Facts', facts, columns = 2 }) {
  if (!facts || facts.length === 0) return null
  const gridCols = columns === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'

  return (
    <Card padding="none" className="p-6 my-6">
      <p className="text-xs font-bold tracking-widest uppercase text-primary-ink mb-4">{title}</p>
      <dl className={`grid grid-cols-1 ${gridCols} gap-x-6 gap-y-4`}>
        {facts.map((fact, i) => (
          <div key={i}>
            <dt className="text-ink-muted text-2xs font-semibold tracking-wide uppercase mb-0.5">{fact.label}</dt>
            <dd className="text-ink text-sm font-semibold">{fact.value}</dd>
          </div>
        ))}
      </dl>
    </Card>
  )
}
