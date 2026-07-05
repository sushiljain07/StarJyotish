// frontend/src/components/home/ReportsStrip.jsx
//
// "Full report" vs "Quick insight" reflects real capability, not a
// generation/cache state that doesn't exist in this app yet — every
// report tab (TopicReportTab / CareerReportTab / TopicInsightTab)
// generates on open, nothing is pre-computed or stored as "ready".
// Career, Wealth, and Relationship have the full TopicReportTab/
// CareerReportTab treatment; Health currently only has the lighter
// TopicInsightTab (see components/TopicReportTab.jsx's TOPIC_CONFIG and
// pages/Result.jsx's topicId branching) — this strip should be updated
// the day a full Health report ships.
const REPORTS = [
  { id: 'career',       icon: '💼', label: 'Career report',            note: 'D10 chart + current dasha',   full: true },
  { id: 'finance',      icon: '💰', label: 'Wealth & finance',         note: 'D2 & D11 charts',              full: true },
  { id: 'relationship', icon: '💞', label: 'Marriage & relationships', note: 'D9 & D7 charts',               full: true },
  { id: 'health',       icon: '🩺', label: 'Health report',            note: 'D6 chart — quick insight for now', full: false },
]

export default function ReportsStrip({ onOpenReport }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
      {REPORTS.map(r => (
        <div key={r.id} className="bg-night-light border border-white/10 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-lg">{r.icon}</span>
            <span className={`text-[10px] font-bold uppercase tracking-wide ${r.full ? 'text-sage' : 'text-ink-onnight/40'}`}>
              {r.full ? 'Full report' : 'Quick insight'}
            </span>
          </div>
          <h4 className="font-serif font-semibold text-sm text-primary-light mb-1">{r.label}</h4>
          <p className="text-[11px] text-ink-onnight/50 leading-snug mb-3">{r.note}</p>
          <button
            onClick={() => onOpenReport(r.id)}
            className="text-xs font-bold text-primary hover:underline"
          >
            Open →
          </button>
        </div>
      ))}
    </div>
  )
}
