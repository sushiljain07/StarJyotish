import { useTranslation } from 'react-i18next'

const REPORTS = [
  { id: 'career',       icon: '💼', labelKey: 'report_career_label',       noteKey: 'report_career_note' },
  { id: 'finance',      icon: '💰', labelKey: 'report_finance_label',      noteKey: 'report_finance_note' },
  { id: 'relationship', icon: '💞', labelKey: 'report_relationship_label', noteKey: 'report_relationship_note' },
  { id: 'health',       icon: '🌿', labelKey: 'report_health_label',       noteKey: 'report_health_note' },
]

export default function ReportsStrip({ onOpenReport }) {
  const { t } = useTranslation()
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
      {REPORTS.map(r => (
        <button
          key={r.id}
          onClick={() => onOpenReport(r.id)}
          className="text-left bg-parchment-card border border-line hover:border-primary/50 hover:shadow-md rounded-2xl p-4 transition group"
        >
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-lg">{r.icon}</span>
            <span className="text-[10px] font-bold uppercase tracking-wide text-sage">{t('report_full_tag')}</span>
          </div>
          <h4 className="font-serif font-semibold text-sm text-ink mb-1 group-hover:text-primary-dark transition">{t(r.labelKey)}</h4>
          <p className="text-[11px] text-ink-faint leading-snug mb-3">{t(r.noteKey)}</p>
          <span className="text-xs font-bold text-primary-dark">{t('report_open')}</span>
        </button>
      ))}
    </div>
  )
}
