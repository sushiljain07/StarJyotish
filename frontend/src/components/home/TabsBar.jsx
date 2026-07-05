// frontend/src/components/home/TabsBar.jsx
//
// Unlike the original mockup's tabs (which only toggled a CSS class with
// no content change), these actually control which section group is
// shown — see pages/PersonalHome.jsx's TAB_SECTIONS map. A decorative tab
// bar that does nothing when clicked would be worse than no tab bar.
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
              ? 'bg-parchment text-night border-parchment'
              : 'border-white/15 text-ink-onnight/60 hover:border-primary/50 hover:text-primary'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
