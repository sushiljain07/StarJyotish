// frontend/src/components/home/ComingUpStrip.jsx
export default function ComingUpStrip({ events }) {
  if (!events?.length) return null
  return (
    <div className="flex gap-3.5 overflow-x-auto pb-2 -mx-1 px-1">
      {events.map((ev, i) => (
        <div
          key={i}
          className="min-w-[250px] shrink-0 bg-gradient-to-br from-night-light to-night border border-primary/20 rounded-2xl p-5"
        >
          <p className="text-[11px] font-bold uppercase tracking-wide text-primary">{ev.when}</p>
          <h4 className="font-serif font-semibold text-[15px] text-primary-light mt-2 mb-1.5 leading-snug">{ev.title}</h4>
          <p className="text-xs text-ink-onnight/60 leading-relaxed">{ev.description}</p>
        </div>
      ))}
    </div>
  )
}
