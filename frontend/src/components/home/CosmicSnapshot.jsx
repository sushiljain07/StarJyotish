// frontend/src/components/home/CosmicSnapshot.jsx
//
// Today's Cosmic Snapshot — current Mahadasha/Antardasha/Moon sign.
// Uses the same QuickFacts/Callout visual language as the Knowledge Center.
//
// The "% Mahadasha" figure answers: "how far through your current
// Mahadasha period are you?" Each Mahadasha lasts 6–20 years. Knowing
// you are 20% through Saturn (19 years) vs 80% through the same period
// is genuinely meaningful planning information for a Vedic astrologer.
// The label explains this directly rather than leaving a bare number.
import HomeIcon from './HomeIcons'

function Ring({ pct, planet }) {
  const r = 42
  const c = 2 * Math.PI * r
  const offset = c - (Math.max(0, Math.min(100, pct)) / 100) * c

  return (
    <div className="relative w-28 h-28 shrink-0">
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90" aria-hidden="true">
        <circle cx="50" cy="50" r={r} fill="none" stroke="currentColor" strokeWidth="7" className="text-white/10" />
        <circle
          cx="50" cy="50" r={r} fill="none" stroke="currentColor" strokeWidth="7" strokeLinecap="round"
          className="text-primary"
          strokeDasharray={c} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.7s ease-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-serif font-semibold text-xl text-primary-light">{pct}%</span>
        <span className="text-[9px] text-ink-onnight/50 uppercase tracking-wide leading-none mt-0.5">through</span>
        <span className="text-[10px] text-ink-onnight/70 font-medium">{planet}</span>
      </div>
    </div>
  )
}

export default function CosmicSnapshot({ t, snapshot }) {
  const { currentMahadasha, currentAntardasha, moonSign, mahadashaProgressPct } = snapshot

  // Human-readable duration remaining from Mahadasha end date
  const yearsRemaining = currentMahadasha?.end
    ? Math.max(0, Math.round((new Date(currentMahadasha.end) - Date.now()) / (365.25 * 24 * 3600 * 1000)))
    : null

  return (
    <section className="rounded-2xl overflow-hidden shadow-lg">
      {/* Dark header — Knowledge Center Hero pattern */}
      <div className="bg-night px-5 pt-5 pb-6">
        <div className="flex items-center gap-2 mb-5">
          <HomeIcon id="moon" className="w-4 h-4 text-primary" />
          <h2 className="font-serif font-semibold text-base text-primary-light">
            {t('home_snapshot_title')}
          </h2>
        </div>

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* The ring shows how far through the current Mahadasha you are.
              Each Mahadasha lasts 6–20 years — 20% through Saturn (19 yrs)
              vs 80% through the same period is meaningful planning info. */}
          <Ring
            pct={mahadashaProgressPct}
            planet={currentMahadasha.planet}
          />

          <div className="flex-1 w-full">
            <dl className="grid grid-cols-3 gap-3 mb-4 text-center sm:text-left">
              <div>
                <dt className="text-[10px] text-ink-onnight/50 uppercase tracking-widest mb-1">
                  {t('home_snapshot_mahadasha')}
                </dt>
                <dd className="font-semibold text-primary-light text-sm sm:text-base">
                  {currentMahadasha.planet}
                </dd>
                {yearsRemaining !== null && (
                  <dd className="text-[10px] text-ink-onnight/50 mt-0.5">
                    {yearsRemaining}y left
                  </dd>
                )}
              </div>
              <div>
                <dt className="text-[10px] text-ink-onnight/50 uppercase tracking-widest mb-1">
                  {t('home_snapshot_antardasha')}
                </dt>
                <dd className="font-semibold text-primary-light text-sm sm:text-base">
                  {currentAntardasha.planet}
                </dd>
              </div>
              <div>
                <dt className="text-[10px] text-ink-onnight/50 uppercase tracking-widest mb-1">
                  {t('home_snapshot_moon_sign')}
                </dt>
                <dd className="font-semibold text-primary-light text-sm sm:text-base">
                  {moonSign}
                </dd>
              </div>
            </dl>

            {/* What the ring means — explained once, briefly */}
            <p className="text-[11px] text-ink-onnight/50 leading-relaxed">
              The ring shows how far through your {currentMahadasha.planet} Mahadasha you are —
              each period shapes life themes for years at a time.
            </p>
          </div>
        </div>
      </div>

      {/* Light body — same split as ChartPreviewCard */}
      <div className="bg-parchment-card border border-t-0 border-line px-5 py-4 rounded-b-2xl">
        <p className="text-ink-muted text-sm leading-relaxed">{t('home_snapshot_theme')}</p>
        <a
          href="/learn"
          className="mt-3 inline-block text-xs text-primary-dark hover:underline font-medium"
        >
          Learn about Vimshottari Dasha →
        </a>
      </div>
    </section>
  )
}
