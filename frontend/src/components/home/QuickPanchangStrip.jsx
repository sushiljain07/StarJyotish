// frontend/src/components/home/QuickPanchangStrip.jsx
//
// Compact Panchang strip with an expandable MobileTimelineCard.
//
// Design: Two-row header.
//   Row 1 — 4 classical limbs (Tithi / Nakshatra / Yoga / Karana) + expand chevron.
//   Row 2 — 4 sky-rhythm times as coloured pills (Sunrise, Sunset, Moonrise, Moonset).
//
// Expanding reveals MobileTimelineCard only. That component already covers:
//   • Current status card  • Bar timeline  • Window list  • AI insight strip
// DailyTimeline and DailyPanchang have been removed — they were duplicating
// all of that content.
import { useTranslation } from 'react-i18next'
import MobileTimelineCard from './MobileTimelineCard'

// ─── Sky pill ─────────────────────────────────────────────────────────────────

const SKY_META = {
  sunrise:  { emoji: '🌅', color: '#FFAA44', labelKey: 'sky_sunrise'  },
  sunset:   { emoji: '🌇', color: '#FF6B35', labelKey: 'sky_sunset'   },
  moonrise: { emoji: '🌕', color: '#90CAF9', labelKey: 'sky_moonrise' },
  moonset:  { emoji: '🌑', color: '#7B8FC0', labelKey: 'sky_moonset'  },
}

function SkyPill({ id, time, t }) {
  if (!time) return null
  const { emoji, color, labelKey } = SKY_META[id]
  return (
    <div className="flex items-center gap-1.5 min-w-0">
      <span aria-hidden="true" style={{ fontSize: 14, lineHeight: 1 }}>{emoji}</span>
      <div className="min-w-0">
        <p
          className="text-[9px] uppercase tracking-wide font-bold leading-none truncate"
          style={{ color, opacity: 0.7 }}
        >
          {t(labelKey)}
        </p>
        <p
          className="text-[12px] font-semibold tabular-nums leading-tight"
          style={{ color }}
        >
          {time}
        </p>
      </div>
    </div>
  )
}

// ─── Panchang fact ────────────────────────────────────────────────────────────

function PanchangFact({ label, value }) {
  return (
    <div className="min-w-0">
      <p className="text-[9px] uppercase tracking-wider font-bold leading-none mb-0.5" style={{ color: '#D9A441' }}>
        {label}
      </p>
      <p className="font-serif font-semibold text-[13px] leading-tight truncate" style={{ color: 'rgba(248,242,228,0.92)' }}>
        {value ?? '—'}
      </p>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function QuickPanchangStrip({ data, loading }) {
  const { t } = useTranslation()

  if (!data && loading) {
    return <div className="rounded-2xl border border-primary/20 bg-night-light animate-pulse h-[72px]" />
  }
  if (!data) return null

  const nakName   = typeof data.nakshatra === 'object' ? data.nakshatra?.name : data.nakshatra
  const tithiName = data.tithi?.name ?? data.tithi

  return (
    <details className="group rounded-2xl border border-primary/20 bg-night-light overflow-hidden">
      <summary className="list-none cursor-pointer select-none">
        <div className="px-4 py-3 sm:px-5 space-y-2.5">

          {/* Row 1 — 4 classical limbs + expand affordance */}
          <div className="flex items-start gap-2">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1.5 flex-1 min-w-0">
              <PanchangFact label={t('panchang_tithi')}     value={tithiName} />
              <PanchangFact label={t('panchang_nakshatra')} value={nakName}   />
              <PanchangFact label={t('panchang_yoga')}      value={data.yoga}    />
              <PanchangFact label={t('panchang_karana')}    value={data.karana}  />
            </div>
            <span
              className="shrink-0 flex items-center gap-0.5 text-[9px] font-bold uppercase tracking-wider pt-0.5"
              style={{ color: 'rgba(248,242,228,0.3)' }}
            >
              {t('panchang_expand')}
              <span className="inline-block transition-transform duration-200 group-open:rotate-180">▾</span>
            </span>
          </div>

          {/* Row 2 — sky-rhythm times */}
          <div
            className="grid gap-x-2 gap-y-1 pt-2"
            style={{ gridTemplateColumns: 'repeat(4,minmax(0,1fr))', borderTop: '0.5px solid rgba(248,242,228,0.08)' }}
          >
            <SkyPill id="sunrise"  time={data.sunrise}  t={t} />
            <SkyPill id="sunset"   time={data.sunset}   t={t} />
            <SkyPill id="moonrise" time={data.moonrise} t={t} />
            <SkyPill id="moonset"  time={data.moonset}  t={t} />
          </div>
        </div>
      </summary>

      {/* Expanded detail — MobileTimelineCard only */}
      <div className="px-3 pb-4 pt-2 sm:px-4" style={{ borderTop: '0.5px solid rgba(248,242,228,0.08)' }}>
        <MobileTimelineCard panchang={data} />
      </div>
    </details>
  )
}
