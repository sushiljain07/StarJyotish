// frontend/src/components/home/QuickPanchangStrip.jsx
//
// The compact Panchang entry point. Shows the 4 classical limbs + the 4
// sky times in a single row — saves ~60% vertical space vs. the full
// DailyPanchang card. A <details> expands inline to MobileTimelineCard +
// DailyTimeline + DailyPanchang for users who want more.
//
// Apple principle applied: start with the summary, let the user pull
// the detail. Never push everything upfront.
//
// SkyRhythm replaced by MobileTimelineCard — the SVG arc is beautiful on
// desktop but collapses to an unreadable tangle on 375px mobile screens.
// MobileTimelineCard delivers the same information as 4 scannable zones.
import { useTranslation } from 'react-i18next'
import MobileTimelineCard from './MobileTimelineCard'
import DailyTimeline from './DailyTimeline'
import DailyPanchang from './DailyPanchang'

function SkyItem({ emoji, label, time }) {
  if (!time) return null
  return (
    <div className="flex items-center gap-1 text-[10px] sm:text-[11px]" style={{ color: 'rgba(248,242,228,0.7)' }}>
      <span>{emoji}</span>
      <span className="font-medium" style={{ color: 'rgba(248,242,228,0.9)' }}>{time}</span>
      <span style={{ color: 'rgba(248,242,228,0.4)' }}>{label}</span>
    </div>
  )
}

function PanchangFact({ label, value }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] uppercase tracking-wider font-bold" style={{ color: '#D9A441' }}>{label}</p>
      <p className="font-serif font-semibold text-[13px] leading-tight" style={{ color: 'rgba(248,242,228,0.92)' }}>
        {value ?? '—'}
      </p>
    </div>
  )
}

export default function QuickPanchangStrip({ data, loading, location, error }) {
  const { t } = useTranslation()

  if (!data && loading) {
    return (
      <div className="rounded-2xl border border-primary/20 px-5 py-3 bg-night-light animate-pulse h-14" />
    )
  }
  if (!data) return null

  const nakName = typeof data.nakshatra === 'object' ? data.nakshatra?.name : data.nakshatra
  const tithiName = data.tithi?.name ?? data.tithi

  return (
    <details className="group rounded-2xl border border-primary/20 bg-night-light overflow-hidden">
      <summary className="list-none cursor-pointer">
        <div className="flex items-center gap-0 px-4 py-3 sm:px-5">

          {/* 4 classical limbs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2 flex-1 min-w-0">
            <PanchangFact label={t('panchang_tithi')} value={tithiName} />
            <PanchangFact label={t('panchang_nakshatra')} value={nakName} />
            <PanchangFact label={t('panchang_yoga')} value={data.yoga} />
            <PanchangFact label={t('panchang_karana')} value={data.karana} />
          </div>

          {/* Sky times */}
          <div className="flex flex-col gap-0.5 shrink-0 ml-2 mr-1">
            <div className="flex gap-2 sm:gap-4">
              <SkyItem emoji="☀" label={t('sky_sunrise')} time={data.sunrise} />
              <SkyItem emoji="☀" label={t('sky_sunset')} time={data.sunset} />
            </div>
            <div className="flex gap-2 sm:gap-4">
              <SkyItem emoji="☽" label={t('sky_moonrise')} time={data.moonrise} />
              <SkyItem emoji="☽" label={t('sky_moonset')} time={data.moonset} />
            </div>
          </div>

          {/* Chevron */}
          <span className="text-[10px] font-bold uppercase tracking-wider shrink-0 flex items-center gap-1"
                style={{ color: 'rgba(248,242,228,0.4)' }}>
            {t('panchang_expand')}
            <span className="inline-block transition-transform group-open:rotate-180">▾</span>
          </span>
        </div>
      </summary>

      {/* Progressive disclosure: mobile timeline card + classic list + panchang facts */}
      <div className="border-t border-primary/10 px-4 pb-4 pt-3 sm:px-5 space-y-4">
        <MobileTimelineCard panchang={data} />
        <DailyTimeline panchang={data} />
        <DailyPanchang location={location} data={data} loading={false} error={error} />
      </div>
    </details>
  )
}
