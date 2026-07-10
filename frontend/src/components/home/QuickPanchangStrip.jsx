// frontend/src/components/home/QuickPanchangStrip.jsx
//
// Premium panchang card with a compact dashboard summary and expandable
// timeline details for the mobile-first day view.
import { useTranslation } from 'react-i18next'
import MobileTimelineCard from './MobileTimelineCard'

const SKY_META = {
  sunrise: { emoji: 'Sunrise', labelKey: 'sky_sunrise' },
  sunset: { emoji: 'Sunset', labelKey: 'sky_sunset' },
  moonrise: { emoji: 'Moonrise', labelKey: 'sky_moonrise' },
  moonset: { emoji: 'Moonset', labelKey: 'sky_moonset' },
}

function skyLabel(location) {
  if (!location?.label) return null
  return location.label.split(',')[0]
}

function PanchangFact({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/6 px-4 py-3">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary-light/70">{label}</p>
      <p className="mt-1.5 font-serif text-[15px] font-semibold leading-tight text-parchment">{value ?? '—'}</p>
    </div>
  )
}

function SkyPill({ id, time, t }) {
  if (!time) return null
  const meta = SKY_META[id]
  return (
    <div className="rounded-2xl border border-primary/10 bg-white/80 px-3.5 py-3">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary-dark/75">{t(meta.labelKey)}</p>
      <p className="mt-1 text-sm font-semibold text-ink">{time}</p>
      <p className="mt-1 text-[11px] text-ink-faint">{meta.emoji}</p>
    </div>
  )
}

export default function QuickPanchangStrip({ data, loading, location }) {
  const { t } = useTranslation()

  if (!data && loading) {
    return <div className="h-[96px] animate-pulse rounded-[30px] border border-primary/20 bg-night-light" />
  }
  if (!data) return null

  const nakshatraName = typeof data.nakshatra === 'object' ? data.nakshatra?.name : data.nakshatra
  const tithiName = data.tithi?.name ?? data.tithi

  return (
    <details className="group overflow-hidden rounded-[30px] border border-primary/20 bg-[linear-gradient(135deg,#261f5f_0%,#1b1f41_62%,#12172f_100%)] shadow-[0_24px_70px_rgba(26,19,64,0.32)]">
      <summary className="list-none cursor-pointer select-none">
        <div className="px-5 py-5 sm:px-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-primary-light/72">
                {t('home_today_panchang')}
              </p>
              <p className="mt-2 font-serif text-xl font-semibold text-parchment">{tithiName ?? '—'}</p>
              <p className="mt-1 text-sm text-ink-onnight/65">
                {nakshatraName ?? '—'}
                {skyLabel(location) ? ` · ${skyLabel(location)}` : ''}
              </p>
            </div>

            <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/8 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.24em] text-primary-light/75">
              {t('panchang_expand')}
              <span className="inline-block transition-transform duration-200 group-open:rotate-180">▾</span>
            </span>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <PanchangFact label={t('panchang_tithi')} value={tithiName} />
            <PanchangFact label={t('panchang_nakshatra')} value={nakshatraName} />
            <PanchangFact label={t('panchang_yoga')} value={data.yoga} />
            <PanchangFact label={t('panchang_karana')} value={data.karana} />
          </div>
        </div>
      </summary>

      <div className="border-t border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05)_0%,rgba(255,255,255,0.02)_100%)] px-4 py-4 sm:px-5">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <SkyPill id="sunrise" time={data.sunrise} t={t} />
          <SkyPill id="sunset" time={data.sunset} t={t} />
          <SkyPill id="moonrise" time={data.moonrise} t={t} />
          <SkyPill id="moonset" time={data.moonset} t={t} />
        </div>
        <div className="mt-4 rounded-[26px] border border-white/8 bg-night/35 p-3">
          <MobileTimelineCard panchang={data} />
        </div>
      </div>
    </details>
  )
}
