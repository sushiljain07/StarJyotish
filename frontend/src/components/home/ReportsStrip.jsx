// frontend/src/components/home/ReportsStrip.jsx
//
// "Full report" vs "Quick insight" reflects real capability, not a
// generation/cache state that doesn't exist in this app — every report
// tab (TopicReportTab / CareerReportTab) generates on open, nothing is
// pre-computed or stored as "ready". As of the health report going live
// (see services/health_analysis.py), all four topics now get the same
// full-depth TopicReportTab/CareerReportTab treatment.
const REPORTS = [
  { id: 'career',       icon: '💼', label: 'Career report',            note: 'D10 chart + current dasha' },
  { id: 'finance',      icon: '💰', label: 'Wealth & finance',         note: 'D2 & D11 charts' },
  { id: 'relationship', icon: '💞', label: 'Marriage & relationships', note: 'D9 & D7 charts' },
  { id: 'health',       icon: '🌿', label: 'Wellbeing report',         note: 'D6 chart + Lagna lord' },
]

export default function ReportsStrip({ onOpenReport }) {
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
            <span className="text-[10px] font-bold uppercase tracking-wide text-sage">Full report</span>
          </div>
          <h4 className="font-serif font-semibold text-sm text-ink mb-1 group-hover:text-primary-dark transition">{r.label}</h4>
          <p className="text-[11px] text-ink-faint leading-snug mb-3">{r.note}</p>
          <span className="text-xs font-bold text-primary-dark">Open →</span>
        </button>
      ))}
    </div>
  )
}
