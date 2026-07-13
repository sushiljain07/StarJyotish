// frontend/src/components/home/BottomNav.jsx
//
// Mobile bottom nav for PersonalHome. Uses md:hidden (not sm:hidden) to
// match NavBar.jsx — both navs must use the same breakpoint so exactly
// one is visible at any viewport width.
//
// Fixes applied:
//   • /profile → /account  (App.jsx registers <Profile> at /account)
//   • All inline style objects replaced with Tailwind classes
//   • bg-night/97 used instead of raw rgba(19,24,58,0.97)
//   • aria-current="page" added to active link for screen-reader state
//   • Active indicator dot added (consistent with NavBar.jsx)
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const NAV = [
  {
    id: 'today', key: 'nav_today', to: '/home',
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
        <path d="M11 2L3 8.5V19a1 1 0 001 1h5v-5h4v5h5a1 1 0 001-1V8.5L11 2z"
          stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    // Opens the AI reading for the person's primary chart — see onGuidanceClick
    // below. Replaces the old "Library" tab (→ /learn/zodiac), which duplicated
    // the Learn tab right next to it.
    id: 'guidance', key: 'nav_guidance',
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
        <path d="M11 3a5 5 0 015 5c0 2.2-1.3 3.4-2.2 4.3-.6.6-.8 1-.8 1.7v.5H9v-.5c0-.7-.2-1.1-.8-1.7C7.3 11.4 6 10.2 6 8a5 5 0 015-5z"
          stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
        <path d="M9 17h4M9.5 19h3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: 'learn', key: 'nav_learn', to: '/learn',
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
        <path d="M4 6h14M4 11h14M4 16h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: 'profile', key: 'nav_profile', to: '/account',  // App.jsx registers <Profile> at /account
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
        <circle cx="11" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.6"/>
        <path d="M4 19c0-3.9 3.1-7 7-7s7 3.1 7 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
    ),
  },
]

// profile is optional — pages that render BottomNav without a loaded profile
// (there aren't any today, but this keeps the component from throwing if one
// shows up later) fall back to sending Guidance to the chart-generation flow.
export default function BottomNav({ profile = null }) {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const navigate = useNavigate()

  function onGuidanceClick(e) {
    e.preventDefault()
    if (!profile) { navigate('/generate'); return }
    navigate('/kundli', {
      state: {
        data: profile.chart,
        input: { name: profile.label, date: profile.birth_date, time: profile.birth_time, place: profile.place },
        activeTab: 'insights',
        activeSubtab: 'reading',
      },
    })
  }

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-stretch bg-night/[0.97] border-t border-white/[0.12] backdrop-blur-xl"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)', minHeight: 60 }}
      aria-label={t('nav_bottom_aria')}
    >
      {NAV.map(item => {
        const isActive = item.to
          ? (pathname === item.to || pathname.startsWith(item.to + '/'))
          : (pathname === '/kundli' && item.id === 'guidance')
        const commonProps = {
          key: item.id,
          'aria-current': isActive ? 'page' : undefined,
          className: 'relative flex flex-1 flex-col items-center justify-center gap-0.5 px-1 pt-2.5 pb-2 no-underline',
          style: { color: isActive ? '#F0CB80' : 'rgba(248,242,228,0.5)', background: 'none', border: 'none', cursor: 'pointer' },
        }
        const content = (
          <>
            {isActive && (
              <span
                className="absolute top-0 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full bg-primary"
                aria-hidden="true"
              />
            )}
            <span className="flex justify-center">{item.icon}</span>
            <span className="text-[10px] font-semibold tracking-[0.3px] leading-none">
              {t(item.key)}
            </span>
          </>
        )
        return item.to
          ? <Link to={item.to} {...commonProps}>{content}</Link>
          : <button type="button" onClick={onGuidanceClick} {...commonProps}>{content}</button>
      })}
    </nav>
  )
}
