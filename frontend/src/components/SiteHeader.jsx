// frontend/src/components/SiteHeader.jsx
//
// Fixed top header.
// Desktop (md+): Logo + horizontal nav links (Home, Charts, Predictions, Remedies, Panchang, Insights) + avatar/CTA
// Mobile: Logo + avatar/CTA only (nav is in BottomNav)

import { useTranslation } from 'react-i18next'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import AccountMenu from './AccountMenu'
import { getPrimaryProfile } from '../services/astrologyProfiles'

// Each link's activeTab/activeSubtab matches what Result.jsx (the /kundli
// page) expects in navigation state — see BottomNav.jsx's onGuidanceClick
// for the same pattern. Without this state, /kundli has no chart to show,
// which is why these links looked "broken": they navigated, but to an
// empty page.
//
// "Remedies" is deliberately removed rather than pointed at /kundli like
// the rest — there's no remedies feature in the app yet (no route, no
// tab, no content), so linking it anywhere would just be a second broken
// link with better styling. Real fix is building that feature, not faking
// a destination for it.
const NAV_LINKS = [
  { label: 'Home',        to: '/home' },
  { label: 'My Charts',   to: '/kundli',   activeTab: 'birth_chart', activeSubtab: 'chart' },
  { label: 'AI Guidance', to: '/insights' },
  { label: 'Explore',     to: '/learn' },
  { label: 'Panchang',    to: '/panchang' },
]

export default function SiteHeader({ scrollProgress = 1, onCtaClick }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { user, isAuthenticated } = useAuth()
  const profile = isAuthenticated ? getPrimaryProfile(user) : null

  const p = Math.min(1, Math.max(0, scrollProgress))
  const blurPx      = 6 + p * 6
  const borderAlpha = 0.06 + p * 0.08

  function handleNav(link) {
    if (link.to !== '/kundli' && link.to !== '/insights') { navigate(link.to); return }
    if (!profile) { navigate('/generate'); return }
    navigate(link.to, {
      state: {
        data: profile.chart,
        input: { name: profile.label, date: profile.birth_date, time: profile.birth_time, place: profile.place },
        activeTab: link.activeTab,
        activeSubtab: link.activeSubtab,
      },
    })
  }

  return (
    <header
      className="fixed top-0 inset-x-0 z-40 bg-night border-b transition-[backdrop-filter,border-color] duration-150 ease-out"
      style={{
        backdropFilter:       `blur(${blurPx}px)`,
        WebkitBackdropFilter: `blur(${blurPx}px)`,
        borderColor: `rgba(255, 255, 255, ${borderAlpha})`,
      }}
    >
      <div className="max-w-6xl mx-auto px-4 py-0 flex items-center justify-between gap-4" style={{height:60}}>
        {/* Logo */}
        <button
          onClick={() => navigate(isAuthenticated ? '/home' : '/')}
          className="flex items-center gap-2 shrink-0"
          aria-label={t('app_title')}
        >
          <img src="/starjyotish.svg" alt="" className="w-7 h-7" />
          <span className="font-serif font-semibold text-lg text-primary-light">
            {t('app_title')}
          </span>
        </button>

        {/* Desktop nav — authenticated users get full nav; anon users get public links */}
        {isAuthenticated ? (
          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            {NAV_LINKS.map(link => {
              const isActive = location.pathname === link.to && !link.hash
              return (
                <button
                  key={link.label}
                  onClick={() => handleNav(link)}
                  className="relative px-4 py-2 text-sm font-medium transition-colors rounded-md"
                  style={{
                    color: isActive ? '#F0CB80' : 'rgba(248,242,228,0.65)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => { if(!isActive) e.currentTarget.style.color='rgba(248,242,228,0.9)' }}
                  onMouseLeave={e => { if(!isActive) e.currentTarget.style.color='rgba(248,242,228,0.65)' }}
                >
                  {link.label}
                  {isActive && (
                    <span
                      style={{
                        position:'absolute',bottom:-1,left:'50%',
                        transform:'translateX(-50%)',
                        width:24,height:2,borderRadius:99,
                        background:'#D9A441',display:'block',
                      }}
                    />
                  )}
                </button>
              )
            })}
          </nav>
        ) : (
          <nav className="hidden md:flex items-center gap-1" aria-label="Public navigation">
            {[
              { label: 'Panchang', to: '/panchang' },
              { label: 'Explore',  to: '/learn'    },
            ].map(link => {
              const isActive = location.pathname === link.to
              return (
                <button
                  key={link.label}
                  onClick={() => navigate(link.to)}
                  className="relative px-4 py-2 text-sm font-medium transition-colors rounded-md"
                  style={{
                    color: isActive ? '#F0CB80' : 'rgba(248,242,228,0.65)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => { if(!isActive) e.currentTarget.style.color='rgba(248,242,228,0.9)' }}
                  onMouseLeave={e => { if(!isActive) e.currentTarget.style.color='rgba(248,242,228,0.65)' }}
                >
                  {link.label}
                  {isActive && (
                    <span
                      style={{
                        position:'absolute',bottom:-1,left:'50%',
                        transform:'translateX(-50%)',
                        width:24,height:2,borderRadius:99,
                        background:'#D9A441',display:'block',
                      }}
                    />
                  )}
                </button>
              )
            })}
          </nav>
        )}

        {/* Right: auth actions */}
        <div className="flex items-center gap-2 shrink-0">
          {!isAuthenticated && (
            <button
              onClick={() => navigate('/login')}
              className="bg-white/10 hover:bg-white/20 text-ink-onnight hover:text-primary-light text-xs font-semibold px-3 py-1.5 rounded-full transition"
            >
              {t('nav_sign_in')}
            </button>
          )}
          {onCtaClick && (
            <button
              onClick={onCtaClick}
              className="bg-primary hover:bg-primary-dark text-night text-xs font-semibold px-3.5 py-1.5 rounded-full transition whitespace-nowrap"
            >
              <span className="md:hidden">{t('nav_cta_mobile')}</span>
              <span className="hidden md:inline">{t('nav_cta_compact')}</span>
            </button>
          )}
          {isAuthenticated && <AccountMenu />}
        </div>
      </div>
    </header>
  )
}
