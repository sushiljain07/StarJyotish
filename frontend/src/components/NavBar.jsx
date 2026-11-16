// frontend/src/components/NavBar.jsx
//
// Mobile-only bottom nav for the 3 top-level tabs (Kundli/Insights/Ask).
// With only 3 items there's no overflow case to handle — this used to need
// a "primary + More sheet" split when there were 11 flat tabs; now it's
// just 3 buttons. Desktop's tab bar is handled separately by Result.jsx.
import { useTranslation } from 'react-i18next'
import TabIcon from './TabIcon'
import { useChromeRegistration } from './layout/useBottomChrome'

// The bar is box-border with an explicit height so --sub-nav-h (index.css)
// is its real height, which the spacers and ScrollToTop rely on. On /kundli
// it is the one bottom bar, at the true screen bottom. Side insets clear a
// landscape notch.
export default function NavBar({ tabs, activeTab, onTabChange }) {
  const { t } = useTranslation()
  useChromeRegistration('subNav')
  return (
    <nav
      className="md:hidden fixed left-0 right-0 z-50 border-t border-white/[0.12] bg-night/[0.97] box-border bottom-0 pl-[var(--safe-left)] pr-[var(--safe-right)]"
      aria-label={t('nav_kundli_sections_aria', 'Kundli sections')}
      style={{
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        paddingBottom: 'var(--safe-bottom)',
        height: 'calc(var(--sub-nav-h) + var(--safe-bottom))',
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
              <span className={active ? 'text-primary-glow' : 'text-ink-onnightMuted'}>
                <TabIcon id={tab.icon} className="w-[1.125rem] h-[1.125rem]" />
              </span>
              {tab.locked && (
                <span className="absolute -top-0.5 right-1 text-2xs">🔒</span>
              )}
              <span
                className={`text-2xs font-semibold leading-none truncate ${active ? 'text-primary-glow' : 'text-ink-onnightMuted'}`}
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
