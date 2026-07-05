// frontend/src/components/home/ChartSpotlight.jsx
export default function ChartSpotlight({ moonSpotlight, dashaSpotlight }) {
  return (
    <div className="grid sm:grid-cols-2 gap-4">
      <div className="bg-night-light border border-white/10 rounded-2xl p-5 sm:p-6">
        <div className="flex items-center gap-2.5 mb-2.5">
          <span className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center font-serif font-semibold text-night text-sm">☾</span>
          <div>
            <h3 className="font-serif font-semibold text-[15px] text-primary-light">Moon transit</h3>
            <p className="text-[11px] text-ink-onnight/50 mt-0.5">
              Chandra Gochar · {moonSpotlight?.sign ?? '—'} → your {moonSpotlight?.house ?? '—'}
              {moonSpotlight?.house === 1 ? 'st' : moonSpotlight?.house === 2 ? 'nd' : moonSpotlight?.house === 3 ? 'rd' : 'th'} bhava
            </p>
          </div>
        </div>
        <p className="text-[13.5px] text-ink-onnight/80 leading-relaxed">{moonSpotlight?.text}</p>
      </div>
      <div className="bg-night-light border border-white/10 rounded-2xl p-5 sm:p-6">
        <div className="flex items-center gap-2.5 mb-2.5">
          <span className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center font-serif font-semibold text-night text-sm">♀</span>
          <div>
            <h3 className="font-serif font-semibold text-[15px] text-primary-light">Dasha spotlight</h3>
            <p className="text-[11px] text-ink-onnight/50 mt-0.5">
              {dashaSpotlight?.mahadasha} Mahadasha{dashaSpotlight?.antardasha ? ` · ${dashaSpotlight.antardasha} Antardasha` : ''}
            </p>
          </div>
        </div>
        <p className="text-[13.5px] text-ink-onnight/80 leading-relaxed">{dashaSpotlight?.text}</p>
      </div>
    </div>
  )
}
