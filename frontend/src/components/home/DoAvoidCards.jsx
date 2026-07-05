// frontend/src/components/home/DoAvoidCards.jsx
export default function DoAvoidCards({ doItems, avoidItems }) {
  return (
    <div className="grid sm:grid-cols-2 gap-4">
      <div className="bg-night-light border border-white/10 rounded-2xl p-5 sm:p-6">
        <div className="flex items-center gap-2.5 mb-3.5">
          <span className="w-2 h-2 rounded-full bg-sage" />
          <h3 className="font-serif font-semibold text-base text-primary-light">Do today</h3>
        </div>
        <ul className="space-y-0">
          {doItems.map((item, i) => (
            <li key={i} className={`text-[13.5px] text-ink-onnight/85 leading-relaxed py-2.5 ${i > 0 ? 'border-t border-white/[0.07]' : ''}`}>
              {item}
            </li>
          ))}
        </ul>
      </div>
      <div className="bg-night-light border border-white/10 rounded-2xl p-5 sm:p-6">
        <div className="flex items-center gap-2.5 mb-3.5">
          <span className="w-2 h-2 rounded-full bg-vermillion" />
          <h3 className="font-serif font-semibold text-base text-primary-light">Avoid today</h3>
        </div>
        <ul className="space-y-0">
          {avoidItems.map((item, i) => (
            <li key={i} className={`text-[13.5px] text-ink-onnight/85 leading-relaxed py-2.5 ${i > 0 ? 'border-t border-white/[0.07]' : ''}`}>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
