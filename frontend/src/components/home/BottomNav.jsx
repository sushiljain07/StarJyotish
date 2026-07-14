// frontend/src/components/home/BottomNav.jsx
//
// Mobile bottom nav — 5 items matching the desktop SiteHeader nav exactly:
//   Home · My Charts · AI Guidance · Explore · Panchang
//
// md:hidden so it only shows on mobile; desktop uses SiteHeader nav links.

import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

// SVG icons inline — no external dependency
const HomeIcon = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
    <path d="M11 2L3 8.5V19a1 1 0 001 1h5v-5h4v5h5a1 1 0 001-1V8.5L11 2z"
      stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
  </svg>
)

const ChartIcon = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
    <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.6"/>
    <path d="M11 11L11 4M11 11L15.5 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    <path d="M7 6.5L11 11M15 6.5L11 11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.4"/>
  </svg>
)

const AIIcon = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
    <path d="M11 3a5 5 0 015 5c0 2.2-1.3 3.4-2.2 4.3-.6.6-.8 1-.8 1.7v.5H9v-.5c0-.7-.2-1.1-.8-1.7C7.3 11.4 6 10.2 6 8a5 5 0 015-5z"
      stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
    <path d="M9 17h4M9.5 19h3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
  </svg>
)

const ExploreIcon = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
    <path d="M4 6h14M4 11h14M4 16h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
  </svg>
)

const PanchangIcon = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
    <rect x="3" y="4" width="16" height="15" rx="2" stroke="currentColor" strokeWidth="1.6"/>
    <path d="M3 9h16M8 4V6M14 4V6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
  </svg>
)

const NAV = [
  { id: 'home',       key: 'nav_home_tab',      to: '/home',      icon: <HomeIcon /> },
  { id: 'charts',     key: 'nav_my_charts',      to: '/kundli',    icon: <ChartIcon />,   needsChart: true },
  { id: 'guidance',   key: 'nav_ai_guidance',    to: '/insights',  icon: <AIIcon />,      needsChart: true },
  { id: 'explore',    key: 'nav_explore',        to: '/learn',     icon: <ExploreIcon /> },
  { id: 'panchang',   key: 'nav_panchang_tab',   to: '/panchang',  icon: <PanchangIcon /> },
]

export default function BottomNav({ profile = null }) {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const navigate = useNavigate()

  function handleClick(e, item) {
    if (!item.needsChart) return  // let Link handle it

    e.preventDefault()
    if (!profile) { navigate('/generate'); return }

    const chartState = {
      data: profile.chart,
      input: { name: profile.label, date: profile.birth_date, time: profile.birth_time, place: profile.place },
    }

    if (item.id === 'charts') {
      navigate('/kundli', { state: { ...chartState, activeTab: 'birth_chart', activeSubtab: 'chart' } })
    } else if (item.id === 'guidance') {
      navigate('/insights', { state: chartState })
    }
  }

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-stretch bg-night/[0.97] border-t border-white/[0.12] backdrop-blur-xl"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)', minHeight: 60 }}
      aria-label={t('nav_bottom_aria', 'Main navigation')}
    >
      {NAV.map(item => {
        const isActive = pathname === item.to || pathname.startsWith(item.to + '/')
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
            <span className="text-[10px] font-semibold tracking-[0.3px] leading-none text-center">
              {t(item.key, item.key)}
            </span>
          </>
        )

        return item.needsChart
          ? <button type="button" onClick={e => handleClick(e, item)} {...commonProps}>{content}</button>
          : <Link to={item.to} {...commonProps}>{content}</Link>
      })}
    </nav>
  )
}
