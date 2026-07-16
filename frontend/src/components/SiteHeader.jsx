// frontend/src/components/SiteHeader.jsx
//
// Fixed top header.
// Desktop (md+): Logo + nav links (from config/nav.js) + avatar/CTA
// Mobile, signed in:  Logo + avatar only — page nav lives in BottomNav
// Mobile, signed out: Logo + hamburger menu (public links) + Sign in
//
// Active/hover states use design tokens (text-primary-glow etc.) — this
// component previously hand-rolled them with inline styles and JS
// onMouseEnter/Leave handlers, the only place in the app that did.

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import AccountMenu from './AccountMenu'
import { getPrimaryProfile } from '../services/astrologyProfiles'
import { NAV_ITEMS, PUBLIC_NAV_ITEMS, isNavActive, navTarget } from '../config/nav'

function NavButton({ item, active, onClick }) {
  const { t } = useTranslation()
  return (
    <button
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={`relative px-4 py-2 text-sm font-medium rounded-md transition-colors ${
        active ? 'text-primary-glow' : 'text-primary-light/60 hover:text-primary-light/90'
      }`}
    >
      {t(item.key, item.fallback)}
      {active && (
        <span
          aria-hidden="true"
          className="absolute -bottom-px left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-primary"
        />
      )}
    </button>
  )
}

export default function SiteHeader({ scrollProgress = 1, onCtaClick }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { user, isAuthenticated } = useAuth()
  const profile = isAuthenticated ? getPrimaryProfile(user) : null
  const [menuOpen, setMenuOpen] = useState(false)

  // Close the mobile menu on any navigation.
  useEffect(() => { setMenuOpen(false) }, [location.pathname])

  const p = Math.min(1, Math.max(0, scrollProgress))
  const blurPx      = 6 + p * 6
  const borderAlpha = 0.06 + p * 0.08

  function handleNav(item) {
    const { to, state } = navTarget(item, profile)
    navigate(to, state ? { state } : undefined)
  }

  const items = isAuthenticated ? NAV_ITEMS : PUBLIC_NAV_ITEMS.slice(0, 2)

  return (
    <header
      className="fixed top-0 inset-x-0 z-40 bg-night border-b transition-[backdrop-filter,border-color] duration-150 ease-out"
      style={{
        backdropFilter:       `blur(${blurPx}px)`,
        WebkitBackdropFilter: `blur(${blurPx}px)`,
        borderColor: `rgba(255, 255, 255, ${borderAlpha})`,
      }}
    >
      <div className="max-w-6xl mx-auto px-4 py-0 flex items-center justify-between gap-4 h-[60px]">
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

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1" aria-label={t('nav_bottom_aria', 'Main navigation')}>
          {items.map(item => (
            <NavButton
              key={item.id}
              item={item}
              active={isNavActive(location.pathname, item.to)}
              onClick={() => handleNav(item)}
            />
          ))}
        </nav>

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
          {/* Signed-out mobile: hamburger for the public links (signed-in
              mobile needs none — BottomNav is the app's mobile nav). */}
          {!isAuthenticated && (
            <button
              onClick={() => setMenuOpen(o => !o)}
              aria-expanded={menuOpen}
              aria-label={t('nav_menu', 'Menu')}
              className="md:hidden p-2 -mr-1 text-primary-light/70 hover:text-primary-light transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                {menuOpen ? (
                  <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                ) : (
                  <path d="M3 5.5h14M3 10h14M3 14.5h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                )}
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Signed-out mobile menu panel */}
      {!isAuthenticated && menuOpen && (
        <nav
          className="md:hidden border-t border-white/10 bg-night animate-fade-in-fast motion-reduce:animate-none"
          aria-label={t('nav_bottom_aria', 'Main navigation')}
        >
          <div className="max-w-6xl mx-auto px-4 py-2">
            {PUBLIC_NAV_ITEMS.map(item => {
              const active = isNavActive(location.pathname, item.to)
              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.to)}
                  aria-current={active ? 'page' : undefined}
                  className={`block w-full text-left px-2 py-3 text-sm font-medium border-b border-white/[0.06] last:border-0 transition-colors ${
                    active ? 'text-primary-glow' : 'text-primary-light/70 hover:text-primary-light'
                  }`}
                >
                  {t(item.key, item.fallback)}
                </button>
              )
            })}
          </div>
        </nav>
      )}
    </header>
  )
}
