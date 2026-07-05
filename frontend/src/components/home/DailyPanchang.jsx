import { useTranslation } from 'react-i18next'

function Fact({ label, value }) {
  return (
    <div className="bg-parchment-card border border-line rounded-lg px-3 py-2.5">
      <p className="text-[10px] text-ink-faint uppercase tracking-widest mb-1">{label}</p>
      <p className="font-serif font-semibold text-sm text-ink">{value ?? '—'}</p>
    </div>
  )
}

function MuhurtaChip({ name, window, tone }) {
  if (!window?.start) return null
  const dotColor = tone === 'avoid' ? 'bg-vermillion' : 'bg-sage'
  const textColor = tone === 'avoid' ? 'text-vermillion' : 'text-sage'
  return (
    <div className="flex items-center gap-2.5 bg-parchment-card border border-line rounded-lg px-3.5 py-2.5 flex-1 min-w-[160px]">
      <span className={`w-2 h-2 rounded-full shrink-0 ${dotColor}`} />
      <div>
        <p className="text-xs font-semibold text-ink">{name}</p>
        <p className={`text-[11px] font-medium ${textColor}`}>{window.start} – {window.end}</p>
      </div>
    </div>
  )
}

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

  const m = data.muhurtas
  const eclipse = data.upcoming_eclipse

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <Fact label={t('panchang_tithi')} value={data.tithi ? `${data.tithi.name} (${data.tithi.paksha})` : null} />
        <Fact label={t('panchang_nakshatra')} value={data.nakshatra} />
        <Fact label={t('panchang_yoga')} value={data.yoga} />
        <Fact label={t('panchang_karana')} value={data.karana} />
        <Fact label={t('panchang_sunrise')} value={data.sunrise} />
        <Fact label={t('panchang_sunset')} value={data.sunset} />
        <Fact label={t('panchang_moonrise')} value={data.moonrise} />
        <Fact label={t('panchang_moonset')} value={data.moonset} />
      </div>

      {m && (
        <div>
          <p className="text-xs font-semibold text-ink-muted mb-2.5">{t('panchang_auspicious_heading')}</p>
          <div className="flex flex-wrap gap-2.5">
            <MuhurtaChip name={t('panchang_rahu_kaal')} window={m.rahu_kaal} tone="avoid" />
            <MuhurtaChip name={t('panchang_yamaganda')} window={m.yamaganda} tone="avoid" />
            <MuhurtaChip name={t('panchang_gulika_kaal')} window={m.gulika_kaal} tone="avoid" />
            <MuhurtaChip name={t('panchang_abhijit_muhurta')} window={m.abhijit_muhurta} tone="favorable" />
          </div>
        </div>
      )}

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
