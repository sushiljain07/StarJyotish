import { useState } from 'react'

// Renders either an <img> (icon paths start with "/") or an emoji <span>.
function NavIcon({ icon, className }) {
  if (icon.startsWith('/')) {
    return <img src={icon} alt="" className={className} />
  }
  return <span className={className}>{icon}</span>
}

// Mobile-only bottom nav. Shows `tabs` flagged `primary: true` directly,
// plus a "More" button that opens a sheet listing the rest. Desktop nav
// is handled separately by Result.jsx's own horizontal tab bar — this
// component renders nothing above the `sm` breakpoint.
export default function NavBar({ tabs, activeTab, onTabChange }) {
  const [showMore, setShowMore] = useState(false)

  const primaryTabs = tabs.filter(t => t.primary)
  const moreTabs = tabs.filter(t => !t.primary)
  const isMoreActive = moreTabs.some(t => t.id === activeTab)

  function selectTab(id) {
    onTabChange(id)
    setShowMore(false)
  }

  return (
    <>
      {/* "More" sheet */}
      {showMore && (
        <>
          <div
            className="sm:hidden fixed inset-0 bg-black/40 z-40"
            onClick={() => setShowMore(false)}
          />
          <div className="sm:hidden fixed bottom-16 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-lg p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] grid grid-cols-4 gap-1">
            {moreTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => selectTab(tab.id)}
                className={`relative flex flex-col items-center gap-1 px-1 py-3 rounded-xl text-xs font-medium transition ${
                  activeTab === tab.id ? 'bg-indigo-50 text-primary' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <NavIcon icon={tab.icon} className="text-xl leading-none w-5 h-5 object-contain" />
                {tab.locked && (
                  <span className="absolute top-1 right-2 text-[10px]">🔒</span>
                )}
                <span className="truncate w-full text-center text-[11px]">{tab.label}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {/* Bottom nav bar */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 pb-safe">
        <div className="flex justify-around items-center py-2">
          {primaryTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => selectTab(tab.id)}
              className="relative flex flex-col items-center gap-0.5 px-2 py-1 min-w-0"
            >
              <NavIcon
                icon={tab.icon}
                className="text-lg leading-none w-[1.125rem] h-[1.125rem] object-contain"
              />
              {tab.locked && (
                <span className="absolute -top-0.5 right-1 text-[9px]">🔒</span>
              )}
              <span className={`text-[10px] font-medium leading-none truncate ${
                activeTab === tab.id ? 'text-primary' : 'text-slate-400'
              }`}>
                {tab.label}
              </span>
            </button>
          ))}
          <button
            onClick={() => setShowMore(v => !v)}
            className="flex flex-col items-center gap-0.5 px-2 py-1 min-w-0"
          >
            <span className={`text-lg leading-none ${
              isMoreActive || showMore ? 'text-primary' : 'text-slate-400'
            }`}>
              ⋯
            </span>
            <span className={`text-[10px] font-medium leading-none truncate ${
              isMoreActive || showMore ? 'text-primary' : 'text-slate-400'
            }`}>
              More
            </span>
          </button>
        </div>
      </nav>
    </>
  )
}
