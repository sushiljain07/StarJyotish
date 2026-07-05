// frontend/src/components/home/TabsBar.jsx
//
// Anchor navigation, not a show/hide toggle — every section on this page
// is relevant regardless of which "period" the person is thinking about
// (a Do/Avoid item and a life-area trend are both "today" facts, just
// framed differently), so hiding sections behind tabs was actively
// removing content people wanted to see. Clicking a tab now just scrolls
// to the matching part of one continuous page.
const TABS = [
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'This Week' },
  { id: 'month', label: 'This Month' },
]

export default function TabsBar({ active, onChange }) {
  return (
    <div className="flex gap-1.5">
      {TABS.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`text-[13px] font-semibold px-4 py-2 rounded-full border transition ${
            active === tab.id
              ? 'bg-night text-primary-light border-night'
              : 'border-line text-ink-muted hover:border-primary/50 hover:text-primary-dark'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
