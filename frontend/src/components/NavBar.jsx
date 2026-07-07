// frontend/src/components/NavBar.jsx
//
// Mobile-only bottom nav for the 3 top-level tabs (Kundli/Insights/Ask).
// With only 3 items there's no overflow case to handle — this used to need
// a "primary + More sheet" split when there were 11 flat tabs; now it's
// just 3 buttons. Desktop's tab bar is handled separately by Result.jsx.
import TabIcon from './TabIcon'

function NavIcon({ icon, className, style }) {
  if (icon.startsWith('/')) {
    return <img src={icon} alt="" className={className} style={style} />
  }
  return <TabIcon id={icon} className={className} />
}

export default function NavBar({ tabs, activeTab, onTabChange }) {
  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t"
      style={{
        background: "rgba(19,24,58,0.97)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderColor: "rgba(248,242,228,0.12)",
        paddingBottom: "env(safe-area-inset-bottom,0px)",
      }}
    >
      <div className="flex justify-around items-center py-2">
        {tabs.map(tab => {
          const active = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="relative flex flex-col items-center gap-0.5 px-4 py-1.5 min-w-0"
            >
              {/* Active top-bar indicator */}
              {active && (
                <span
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full bg-primary"
                  aria-hidden="true"
                />
              )}
              {/* SVG icons inherit currentColor via the span; img icons get a CSS filter */}
              <span style={{ color: active ? '#F0CB80' : 'rgba(248,242,228,0.65)' }}>
                <NavIcon
                  icon={tab.icon}
                  className="w-[1.125rem] h-[1.125rem] object-contain"
                  style={tab.icon.startsWith('/') ? {
                    filter: active
                      ? 'brightness(0) saturate(100%) invert(78%) sepia(38%) saturate(800%) hue-rotate(5deg) brightness(105%)'
                      : 'brightness(0) invert(1) opacity(0.65)',
                  } : undefined}
                />
              </span>
              {tab.locked && (
                <span className="absolute -top-0.5 right-1 text-[9px]">🔒</span>
              )}
              <span
                className="text-[10px] font-semibold leading-none truncate"
                style={{ color: active ? '#F0CB80' : 'rgba(248,242,228,0.65)' }}
              >
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
