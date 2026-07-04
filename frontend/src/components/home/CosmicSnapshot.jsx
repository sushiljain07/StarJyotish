// frontend/src/components/home/CosmicSnapshot.jsx
//
// "Today's Cosmic Snapshot" — deliberately states, not predicts: current
// Mahadasha/Antardasha/Moon sign, plus one theme paragraph. No forecast
// language ("today you will..."), matching the app's existing house style
// of describing a chart rather than telling a fortune (see ChartReading.jsx).
//
// The signature element here is the Mahadasha progress ring — real
// information (how far through the current ~decade-plus period the chart
// is), not decoration, computed the same way DashaTable.jsx's progress
// bars are. Reveal.jsx's "coming into view" is deliberately skipped for
// this section since it's the first thing under the fold and should be
// present immediately, not animate in.
import HomeIcon from './HomeIcons'

function Ring({ pct, label }) {
  const r = 42
  const c = 2 * Math.PI * r
  const offset = c - (Math.max(0, Math.min(100, pct)) / 100) * c

  return (
    <div className="relative w-28 h-28 shrink-0">
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke="currentColor" strokeWidth="7" className="text-line" />
        <circle
          cx="50" cy="50" r={r} fill="none" stroke="currentColor" strokeWidth="7" strokeLinecap="round"
          className="text-primary transition-[stroke-dashoffset] duration-700 ease-out"
          strokeDasharray={c} strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-serif font-semibold text-xl text-ink">{pct}%</span>
        <span className="text-[10px] text-ink-faint uppercase tracking-wide">{label}</span>
      </div>
    </div>
  )
}

export default function CosmicSnapshot({ t, snapshot }) {
  const { currentMahadasha, currentAntardasha, moonSign, mahadashaProgressPct } = snapshot

  return (
    <section className="bg-parchment-card rounded-2xl shadow-sm border border-line p-5 sm:p-7">
      <div className="flex items-center gap-2 mb-5">
        <HomeIcon id="moon" className="w-4 h-4 text-primary-dark" />
        <h2 className="font-serif font-semibold text-lg text-ink">{t('home_snapshot_title')}</h2>
      </div>

      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <Ring pct={mahadashaProgressPct} label={t('home_snapshot_ring_label')} />

        <div className="flex-1 w-full">
          <dl className="grid grid-cols-3 gap-3 mb-4 text-center sm:text-left">
            <div>
              <dt className="text-[11px] text-ink-faint uppercase tracking-wide mb-0.5">{t('home_snapshot_mahadasha')}</dt>
              <dd className="font-semibold text-ink text-sm sm:text-base">{currentMahadasha.planet}</dd>
            </div>
            <div>
              <dt className="text-[11px] text-ink-faint uppercase tracking-wide mb-0.5">{t('home_snapshot_antardasha')}</dt>
              <dd className="font-semibold text-ink text-sm sm:text-base">{currentAntardasha.planet}</dd>
            </div>
            <div>
              <dt className="text-[11px] text-ink-faint uppercase tracking-wide mb-0.5">{t('home_snapshot_moon_sign')}</dt>
              <dd className="font-semibold text-ink text-sm sm:text-base">{moonSign}</dd>
            </div>
          </dl>
          <p className="text-ink-muted text-sm leading-relaxed">{t('home_snapshot_theme')}</p>
        </div>
      </div>
    </section>
  )
}
