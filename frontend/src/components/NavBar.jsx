// frontend/src/components/NavBar.jsx
//
// Mobile-only bottom nav for the 3 top-level tabs (Kundli/Insights/Ask).
// With only 3 items there's no overflow case to handle — this used to need
// a "primary + More sheet" split when there were 11 flat tabs; now it's
// just 3 buttons. Desktop's tab bar is handled separately by Result.jsx.
import TabIcon from './TabIcon'

function NavIcon({ icon, className }) {
  if (icon.startsWith('/')) {
    return <img src={icon} alt="" className={className} />
  }
  return <TabIcon id={icon} className={className} />
}

export default function NavBar({ tabs, activeTab, onTabChange }) {
  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-parchment-card border-t border-line pb-safe">
      <div className="flex justify-around items-center py-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className="relative flex flex-col items-center gap-0.5 px-4 py-1 min-w-0"
          >
            <NavIcon icon={tab.icon} className="w-[1.125rem] h-[1.125rem] object-contain" />
            {tab.locked && <span className="absolute -top-0.5 right-1 text-[9px]">🔒</span>}
            <span className={`text-[10px] font-medium leading-none truncate ${
              activeTab === tab.id ? 'text-primary-dark' : 'text-ink-faint'
            }`}>
              {tab.label}
            </span>
          </button>
        ))}
      </div>
    </nav>
  )
}
