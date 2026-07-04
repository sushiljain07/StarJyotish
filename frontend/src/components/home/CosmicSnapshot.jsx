// frontend/src/components/home/CosmicSnapshot.jsx
// Today's Cosmic Snapshot — Mahadasha/Antardasha/Moon sign + progress ring.
// Redesigned in SJ-009 with a richer dark accent header strip.
import HomeIcon from './HomeIcons'

function Ring({ pct, label }) {
  const r = 42
  const c = 2 * Math.PI * r
  const offset = c - (Math.max(0, Math.min(100, pct)) / 100) * c

  return (
    <div className="relative w-28 h-28 shrink-0">
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke="currentColor" strokeWidth="7" className="text-white/15" />
        <circle
          cx="50" cy="50" r={r} fill="none" stroke="currentColor" strokeWidth="7" strokeLinecap="round"
          className="text-primary transition-[stroke-dashoffset] duration-700 ease-out"
          strokeDasharray={c} strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-serif font-semibold text-xl text-primary-light">{pct}%</span>
        <span className="text-[10px] text-ink-onnight/60 uppercase tracking-wide">{label}</span>
      </div>
    </div>
  )
}

export default function CosmicSnapshot({ t, snapshot }) {
  const { currentMahadasha, currentAntardasha, moonSign, mahadashaProgressPct } = snapshot

  return (
    <section className="rounded-2xl overflow-hidden shadow-lg">
      {/* Dark header with icon + title */}
      <div className="bg-night-light px-5 pt-5 pb-6">
        <div className="flex items-center gap-2 mb-5">
          <HomeIcon id="moon" className="w-4 h-4 text-primary" />
          <h2 className="font-serif font-semibold text-base text-primary-light">{t('home_snapshot_title')}</h2>
        </div>
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <Ring pct={mahadashaProgressPct} label={t('home_snapshot_ring_label')} />
          <div className="flex-1 w-full">
            <dl className="grid grid-cols-3 gap-3 mb-4 text-center sm:text-left">
              <div>
                <dt className="text-[11px] text-ink-onnight/50 uppercase tracking-wide mb-0.5">{t('home_snapshot_mahadasha')}</dt>
                <dd className="font-semibold text-primary-light text-sm sm:text-base">{currentMahadasha.planet}</dd>
              </div>
              <div>
                <dt className="text-[11px] text-ink-onnight/50 uppercase tracking-wide mb-0.5">{t('home_snapshot_antardasha')}</dt>
                <dd className="font-semibold text-primary-light text-sm sm:text-base">{currentAntardasha.planet}</dd>
              </div>
              <div>
                <dt className="text-[11px] text-ink-onnight/50 uppercase tracking-wide mb-0.5">{t('home_snapshot_moon_sign')}</dt>
                <dd className="font-semibold text-primary-light text-sm sm:text-base">{moonSign}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
      {/* Light body with theme text */}
      <div className="bg-parchment-card border border-t-0 border-line px-5 py-4 rounded-b-2xl">
        <p className="text-ink-muted text-sm leading-relaxed">{t('home_snapshot_theme')}</p>
      </div>
    </section>
  )
}
