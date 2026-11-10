// frontend/src/components/NavBar.jsx
//
// Mobile-only bottom nav for the 3 top-level tabs (Kundli/Insights/Ask).
// With only 3 items there's no overflow case to handle — this used to need
// a "primary + More sheet" split when there were 11 flat tabs; now it's
// just 3 buttons. Desktop's tab bar is handled separately by Result.jsx.
import { useTranslation } from 'react-i18next'
import TabIcon from './TabIcon'
import { useChromeRegistration } from './layout/useBottomChrome'

// `raised` — set when the app shell's BottomNav occupies the true bottom
// edge (authenticated mobile): this bar then stacks directly above it
// instead of overlapping. The safe-area inset only applies at the real
// screen bottom, so it's skipped when raised.
export default function NavBar({ tabs, activeTab, onTabChange, raised = false }) {
  const { t } = useTranslation()
  useChromeRegistration(raised ? ['subNav', 'raisedSubNav'] : 'subNav')
  return (
    <nav
      className={`md:hidden fixed left-0 right-0 z-50 border-t min-h-[var(--sub-nav-h)] ${raised ? '' : 'bottom-0'}`}
      aria-label={t('nav_kundli_sections_aria', 'Kundli sections')}
      style={{
        background: "rgba(19,24,58,0.97)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderColor: "rgba(248,242,228,0.12)",
        ...(raised
          ? { bottom: 'calc(var(--bottom-nav-h) + var(--safe-bottom))' }
          : { paddingBottom: 'var(--safe-bottom)' }),
      }}
    >
      <div className="flex justify-around items-center py-2">
        {tabs.map(tab => {
          const active = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              aria-current={active ? 'page' : undefined}
              className="relative flex flex-col items-center gap-0.5 px-4 min-h-11 justify-center min-w-0"
            >
              {/* Active top-bar indicator */}
              {active && (
                <span
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full bg-primary"
                  aria-hidden="true"
                />
              )}
              <span style={{ color: active ? '#F0CB80' : 'rgba(248,242,228,0.65)' }}>
                <TabIcon id={tab.icon} className="w-[1.125rem] h-[1.125rem]" />
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
