// Reports as a personal library shelf with one featured report and three
// premium secondary tiles.
import { useTranslation } from 'react-i18next'

const REPORTS = [
  {
    id: 'career',
    icon: 'Career',
    labelKey: 'report_career_label',
    noteKey: 'report_career_note',
    bullets: ['report_career_b1', 'report_career_b2'],
    gradient: 'linear-gradient(135deg, #1d3557 0%, #3a5f8a 45%, #5c89c4 100%)',
    accent: '#C7DCF9',
  },
  {
    id: 'finance',
    icon: 'Wealth',
    labelKey: 'report_finance_label',
    noteKey: 'report_finance_note',
    bullets: ['report_finance_b1', 'report_finance_b2'],
    gradient: 'linear-gradient(135deg, #1b4332 0%, #3b7a57 48%, #6ec59b 100%)',
    accent: '#D7F7E6',
  },
  {
    id: 'relationship',
    icon: 'Love',
    labelKey: 'report_relationship_label',
    noteKey: 'report_relationship_note',
    bullets: ['report_relationship_b1', 'report_relationship_b2'],
    gradient: 'linear-gradient(135deg, #4a1942 0%, #7d2948 50%, #ca6277 100%)',
    accent: '#FFE0E8',
  },
  {
    id: 'health',
    icon: 'Wellbeing',
    labelKey: 'report_health_label',
    noteKey: 'report_health_note',
    bullets: ['report_health_b1', 'report_health_b2'],
    gradient: 'linear-gradient(135deg, #2d2d2d 0%, #5f4e22 42%, #b7964b 100%)',
    accent: '#FFF0C8',
  },
]

function FeaturedReport({ report, onOpen, t }) {
  return (
    <button
      type="button"
      onClick={() => onOpen(report.id)}
      className="group w-full overflow-hidden rounded-[30px] text-left shadow-[0_24px_70px_rgba(26,19,64,0.22)] transition hover:-translate-y-0.5"
      style={{ background: report.gradient }}
    >
      <div className="px-5 pb-5 pt-6 sm:px-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="rounded-full bg-white/12 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-white/70">
              {t('report_full_tag')}
            </span>
            <h4 className="mt-4 font-serif text-[1.4rem] font-semibold leading-snug text-white">
              {t(report.labelKey)}
            </h4>
          </div>
          <span className="rounded-2xl border border-white/12 bg-white/10 px-3 py-2 text-[11px] font-semibold text-white/72">
            {report.icon}
          </span>
        </div>

        <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/72">{t(report.noteKey)}</p>

        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          {report.bullets.map(bullet => (
            <span key={bullet} className="rounded-2xl border border-white/10 bg-white/8 px-3.5 py-3 text-sm" style={{ color: report.accent }}>
              {t(bullet)}
            </span>
          ))}
        </div>

        <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold" style={{ color: report.accent }}>
          {t('report_open')} →
        </span>
      </div>
    </button>
  )
}

function SmallReport({ report, onOpen, t }) {
  return (
    <button
      type="button"
      onClick={() => onOpen(report.id)}
      className="group flex flex-col rounded-[26px] text-left shadow-[0_16px_36px_rgba(26,19,64,0.18)] transition hover:-translate-y-0.5"
      style={{ background: report.gradient }}
    >
      <div className="flex h-full flex-col px-4 py-4">
        <div className="flex items-start justify-between gap-3">
          <span className="rounded-full bg-white/12 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.22em] text-white/70">
            {t('report_full_tag')}
          </span>
          <span className="text-[11px] font-semibold text-white/72">{report.icon}</span>
        </div>
        <h4 className="mt-4 font-serif text-base font-semibold leading-snug text-white">
          {t(report.labelKey)}
        </h4>
        <span className="mt-auto pt-4 text-xs font-semibold" style={{ color: report.accent }}>
          {t('report_open')} →
        </span>
      </div>
    </button>
  )
}

export default function ReportsStrip({ onOpenReport, featuredId }) {
  const { t } = useTranslation()
  const featuredIndex = REPORTS.findIndex(report => report.id === featuredId)
  const featured = REPORTS[featuredIndex >= 0 ? featuredIndex : 0]
  const others = REPORTS.filter(report => report.id !== featured.id)

  return (
    <div className="space-y-3.5">
      <FeaturedReport report={featured} onOpen={onOpenReport} t={t} />
      <div className="grid gap-3 sm:grid-cols-3">
        {others.map(report => (
          <SmallReport key={report.id} report={report} onOpen={onOpenReport} t={t} />
        ))}
      </div>
    </div>
  )
}
