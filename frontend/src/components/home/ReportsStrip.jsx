// Reports as a Personal Library — not four equal buttons but a curated
// shelf. The most relevant report (highest life area score today) is
// featured full-width; the others sit below as smaller tiles.
// Each has unique gradient cover art, a one-line relevance note, and
// bullet points so the user knows what they'll get before they open it.
import { useTranslation } from 'react-i18next'

const REPORTS = [
  {
    id: 'career',
    icon: '💼',
    labelKey: 'report_career_label',
    noteKey: 'report_career_note',
    bullets: ['report_career_b1', 'report_career_b2'],
    gradient: 'linear-gradient(135deg, #1d3557 0%, #457b9d 100%)',
    accent: '#90CAF9',
  },
  {
    id: 'finance',
    icon: '💰',
    labelKey: 'report_finance_label',
    noteKey: 'report_finance_note',
    bullets: ['report_finance_b1', 'report_finance_b2'],
    gradient: 'linear-gradient(135deg, #1b4332 0%, #52b788 100%)',
    accent: '#95D5B2',
  },
  {
    id: 'relationship',
    icon: '💞',
    labelKey: 'report_relationship_label',
    noteKey: 'report_relationship_note',
    bullets: ['report_relationship_b1', 'report_relationship_b2'],
    gradient: 'linear-gradient(135deg, #4a1942 0%, #9b2335 100%)',
    accent: '#F4A0B5',
  },
  {
    id: 'health',
    icon: '🌿',
    labelKey: 'report_health_label',
    noteKey: 'report_health_note',
    bullets: ['report_health_b1', 'report_health_b2'],
    gradient: 'linear-gradient(135deg, #2d2d2d 0%, #6b4c11 100%)',
    accent: '#FFD180',
  },
]

function FeaturedReport({ report, onOpen, t }) {
  return (
    <button
      onClick={() => onOpen(report.id)}
      className="w-full text-left rounded-2xl overflow-hidden group transition hover:opacity-95"
      style={{ background: report.gradient }}
    >
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-2xl">{report.icon}</span>
          <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.7)' }}>
            {t('report_full_tag')}
          </span>
        </div>
        <h4 className="font-serif font-semibold text-lg text-white mb-1 leading-snug group-hover:opacity-90">
          {t(report.labelKey)}
        </h4>
        <p className="text-[12px] mb-3" style={{ color: 'rgba(255,255,255,0.55)' }}>
          {t(report.noteKey)}
        </p>
        <div className="flex flex-col gap-1 mb-4">
          {report.bullets.map(bk => (
            <span key={bk} className="flex items-start gap-2 text-[12px]"
                  style={{ color: report.accent }}>
              <span className="mt-1 w-1 h-1 rounded-full shrink-0 inline-block"
                    style={{ background: report.accent }} />
              {t(bk)}
            </span>
          ))}
        </div>
        <span className="text-[13px] font-bold" style={{ color: report.accent }}>
          {t('report_open')} →
        </span>
      </div>
    </button>
  )
}

function SmallReport({ report, onOpen, t }) {
  return (
    <button
      onClick={() => onOpen(report.id)}
      className="text-left rounded-2xl overflow-hidden group transition hover:opacity-95 flex flex-col"
      style={{ background: report.gradient }}
    >
      <div className="px-4 py-4 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xl">{report.icon}</span>
          <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.6)' }}>
            {t('report_full_tag')}
          </span>
        </div>
        <h4 className="font-serif font-semibold text-sm text-white mb-1 leading-snug group-hover:opacity-90">
          {t(report.labelKey)}
        </h4>
        <p className="text-[11px] mt-auto pt-2 font-semibold" style={{ color: report.accent }}>
          {t('report_open')} →
        </p>
      </div>
    </button>
  )
}

export default function ReportsStrip({ onOpenReport, featuredId }) {
  const { t } = useTranslation()
  const featuredIdx = REPORTS.findIndex(r => r.id === featuredId)
  const featured = REPORTS[featuredIdx >= 0 ? featuredIdx : 0]
  const rest = REPORTS.filter(r => r.id !== featured.id)

  return (
    <div className="space-y-2.5">
      <FeaturedReport report={featured} onOpen={onOpenReport} t={t} />
      <div className="grid grid-cols-3 gap-2.5">
        {rest.map(r => (
          <SmallReport key={r.id} report={r} onOpen={onOpenReport} t={t} />
        ))}
      </div>
    </div>
  )
}
