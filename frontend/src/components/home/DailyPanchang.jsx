import { useTranslation } from 'react-i18next'

export default function DailyPanchang({ location, data, loading, error }) {
  const { t } = useTranslation()

  if (!location) {
    return (
      <div className="bg-parchment-card border border-line rounded-xl p-5 text-center">
        <p className="text-ink-muted text-sm">{t('panchang_set_city_msg')}</p>
      </div>
    )
  }

  if (loading && !data) {
    return (
      <div className="bg-panchang-card border border-line rounded-xl p-5 text-center">
        <div className="text-2xl animate-spin inline-block">🪔</div>
        <p className="text-ink-faint text-xs mt-2">{t('panchang_loading_msg')}</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-parchment-card border border-line rounded-xl p-5 text-center">
        <p className="text-ink-muted text-sm">{t('panchang_error_msg')}</p>
      </div>
    )
  }

  if (!data) return null

  const eclipse = data.upcoming_eclipse

  return (
    <div className="space-y-4">
      {/* The four classical Panchanga limbs as one continuous serif strip —
          this is scripture-adjacent content, so it gets a quieter, more
          ceremonial treatment than UI cards. Rise/set times and muhurta
          windows are NOT repeated here: SkyRhythm draws them on the day
          band, and DailyTimeline holds the actionable window guidance. */}
      <div className="bg-parchment-card border border-line rounded-2xl px-5 py-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 sm:divide-x divide-line gap-y-4">
          {[
            { label: t('panchang_tithi'), value: data.tithi ? `${data.tithi.name}` : null, sub: data.tithi?.paksha },
            { label: t('panchang_nakshatra'), value: data.nakshatra, sub: null },
            { label: t('panchang_yoga'), value: data.yoga, sub: null },
            { label: t('panchang_karana'), value: data.karana, sub: null },
          ].map(f => (
            <div key={f.label} className="sm:px-4 first:pl-0 last:pr-0">
              <p className="text-[10px] text-primary-dark uppercase tracking-widest font-bold mb-1">{f.label}</p>
              <p className="font-serif font-semibold text-[15px] text-ink leading-tight">{f.value ?? '—'}</p>
              {f.sub && <p className="text-[11px] text-ink-faint mt-0.5">{f.sub} {t('panchang_paksha')}</p>}
            </div>
          ))}
        </div>
      </div>

      {eclipse && (
        <div
          className="rounded-2xl px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3.5 border border-vermillion/30"
          style={{ background: 'linear-gradient(135deg, #241221, #171B33 65%)' }}
        >
          <span className="text-2xl shrink-0">{eclipse.type === 'lunar' ? '🌑' : '🌒'}</span>
          <div className="flex-1">
            <p className="text-[11px] uppercase tracking-wide text-vermillion font-semibold mb-0.5">
              {t('panchang_eclipse_upcoming', { date: eclipse.date })}
            </p>
            <p className="font-serif font-semibold text-primary-light text-sm">{eclipse.name}</p>
            <p className="text-ink-onnight/60 text-xs mt-1">
              {t('panchang_eclipse_body', { time: eclipse.peak_time_local })}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
