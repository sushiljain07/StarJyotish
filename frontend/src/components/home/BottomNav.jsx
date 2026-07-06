import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const NAV = [
  {
    id: 'today', key: 'nav_today', to: '/home',
    icon: <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true"><path d="M11 2L3 8.5V19a1 1 0 001 1h5v-5h4v5h5a1 1 0 001-1V8.5L11 2z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg>,
  },
  {
    id: 'learn', key: 'nav_learn', to: '/learn',
    icon: <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true"><path d="M4 6h14M4 11h14M4 16h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>,
  },
  {
    id: 'library', key: 'nav_library', to: '/learn/zodiac',
    icon: <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true"><path d="M11 2l2.5 5.5L19 8.6l-4 4 .9 5.4L11 15.5l-4.9 2.5.9-5.4-4-4 5.5-1.1L11 2z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg>,
  },
  {
    id: 'profile', key: 'nav_profile', to: '/profile',
    icon: <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true"><circle cx="11" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.6"/><path d="M4 19c0-3.9 3.1-7 7-7s7 3.1 7 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>,
  },
]

export default function BottomNav() {
  const { t } = useTranslation()
  const { pathname } = useLocation()

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-stretch"
      style={{
        background: 'rgba(19,24,58,0.97)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '0.5px solid rgba(248,242,228,0.12)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        minHeight: 60,
      }}
      aria-label={t('nav_bottom_aria')}
    >
      {NAV.map(item => {
        const isActive = pathname === item.to || pathname.startsWith(item.to + '/')
        const color = isActive ? '#F0CB80' : 'rgba(248,242,228,0.45)'
        const s = {
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '10px 4px 8px', background: 'none',
          border: 'none', textDecoration: 'none', cursor: 'pointer',
        }
        return (
          <Link key={item.id} to={item.to} style={s}>
            <span style={{ color, display: 'flex', justifyContent: 'center', marginBottom: 3 }}>
              {item.icon}
            </span>
            <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.3px', color, lineHeight: 1 }}>
              {t(item.key)}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
