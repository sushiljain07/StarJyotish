// frontend/src/components/home/ComingUpStrip.jsx
//
// Upcoming transit events over the next 30 days — shown in the "This Month"
// section. Uses the night-surface card language to visually separate upcoming
// events from the current-day parchment cards above.
export default function ComingUpStrip({ events }) {
  if (!events?.length) return null
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
      {events.map((ev, i) => (
        <div
          key={i}
          className="bg-gradient-to-br from-night-light to-night border border-primary/25 rounded-2xl p-5"
        >
          <p className="text-[11px] font-bold uppercase tracking-wide text-primary mb-2">{ev.when}</p>
          <h4 className="font-serif font-semibold text-[15px] text-primary-light mb-1.5 leading-snug">{ev.title}</h4>
          <p className="text-xs text-ink-onnight/60 leading-relaxed">{ev.description}</p>
        </div>
      ))}
    </div>
  )
}
