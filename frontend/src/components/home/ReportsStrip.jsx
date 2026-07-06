import { useTranslation } from 'react-i18next'

const REPORTS = [
  {
    id: 'career',
    icon: '💼',
    labelKey: 'report_career_label',
    noteKey: 'report_career_note',
    bullets: ['report_career_b1', 'report_career_b2'],
  },
  {
    id: 'finance',
    icon: '💰',
    labelKey: 'report_finance_label',
    noteKey: 'report_finance_note',
    bullets: ['report_finance_b1', 'report_finance_b2'],
  },
  {
    id: 'relationship',
    icon: '💞',
    labelKey: 'report_relationship_label',
    noteKey: 'report_relationship_note',
    bullets: ['report_relationship_b1', 'report_relationship_b2'],
  },
  {
    id: 'health',
    icon: '🌿',
    labelKey: 'report_health_label',
    noteKey: 'report_health_note',
    bullets: ['report_health_b1', 'report_health_b2'],
  },
]

export default function ReportsStrip({ onOpenReport }) {
  const { t } = useTranslation()
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
      {REPORTS.map(r => (
        <button
          key={r.id}
          onClick={() => onOpenReport(r.id)}
          className="text-left bg-parchment-card border border-line hover:border-primary/50 rounded-2xl p-4 transition group flex flex-col"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-lg">{r.icon}</span>
            <span className="text-[10px] font-bold uppercase tracking-wide text-sage">{t('report_full_tag')}</span>
          </div>
          <h4 className="font-serif font-semibold text-sm text-ink mb-2 group-hover:text-primary-dark transition leading-snug">
            {t(r.labelKey)}
          </h4>
          <ul className="space-y-1 mb-3 flex-1">
            {r.bullets.map(bk => (
              <li key={bk} className="flex items-start gap-1.5 text-[11px] text-ink-faint leading-snug">
                <span className="mt-0.5 shrink-0 w-1 h-1 rounded-full bg-primary/50 inline-block" />
                {t(bk)}
              </li>
            ))}
          </ul>
          <span className="text-xs font-bold text-primary-dark group-hover:text-primary transition">
            {t('report_open')} →
          </span>
        </button>
      ))}
    </div>
  )
}
