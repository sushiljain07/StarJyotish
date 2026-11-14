// frontend/src/components/landing/CareerReportPreview.jsx
//
// Static, non-interactive preview of the Career Intelligence Report for the
// landing page — illustrates the depth of the real feature (an 11-section
// navigable report, a structured roadmap, a personal AI to ask) using the
// same visual language as the real CareerReportTab.jsx (gold/night cards,
// pill nav) rather than a raster screenshot, so this won't go stale again
// the next time that UI changes, and stays visually consistent with the
// rest of this page (which otherwise has zero images).
import { useTranslation } from 'react-i18next'

const PREVIEW_SECTIONS = ['overview', 'growth', 'money', 'timing', 'roadmap', 'ask_ai'].map(k => `career_preview_sec_${k}`)
const ROADMAP_HORIZONS = ['now', 'next_12', '1_3', '3_5'].map(k => `career_preview_hz_${k}`)

export default function CareerReportPreview() {
  const { t } = useTranslation()
  return (
    <div className="max-w-lg mx-auto bg-parchment-card rounded-2xl border border-line shadow-md overflow-hidden" aria-hidden="true">
      {/* Mini pill nav — mirrors SectionJumpNav's real pill row */}
      <div className="px-4 pt-4 pb-2 flex gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {PREVIEW_SECTIONS.map((label, i) => (
          <span
            key={label}
            className={`shrink-0 whitespace-nowrap text-xs px-3 py-1.5 rounded-lg font-medium ${
              i === 0 ? 'bg-mauve text-white' : 'text-ink-muted border border-line'
            }`}
          >
            {t(label)}
          </span>
        ))}
      </div>

      <div className="p-4 space-y-3">
        {/* Gold "Overview" sample card */}
        <div className="rounded-xl overflow-hidden border border-primary/30">
          <div className="bg-gradient-to-r from-primary to-primary-dark px-4 py-2.5 flex items-center gap-2">
            <span className="text-lg">✨</span>
            <span className="font-extrabold text-night text-sm">{t('career_preview_destiny_title')}</span>
          </div>
          <div className="px-4 py-3 bg-parchment-card">
            <p className="text-xs text-ink-muted leading-relaxed">
              {t('career_preview_destiny_body')}
            </p>
          </div>
        </div>

        {/* Roadmap sample card */}
        <div className="rounded-xl border border-line overflow-hidden">
          <div className="bg-night px-4 py-2.5">
            <span className="font-bold text-primary-light text-sm">{t('career_preview_roadmap_title')}</span>
          </div>
          <div className="px-4 py-3 grid grid-cols-2 gap-2">
            {ROADMAP_HORIZONS.map(label => (
              <p key={label} className="text-2xs font-semibold text-primary-ink uppercase tracking-wide">
                {t(label)}
              </p>
            ))}
          </div>
        </div>

        {/* Ask Career AI teaser */}
        <div className="rounded-xl border border-mauve/30 bg-mauve/5 px-4 py-3 flex items-center gap-2">
          <span className="text-lg">💬</span>
          <div>
            <p className="font-semibold text-ink text-xs">{t('career_preview_ask_title')}</p>
            <p className="text-2xs text-ink-muted">{t('career_preview_ask_example')}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
