// frontend/src/components/AccountMenu.jsx
//
// The logged-in state's account control: a circular initial-avatar that
// opens a small dropdown on click (name/contact line, Profile link,
// Logout). Replaces the old inline "name text + Logout pill" pattern —
// that approach scaled badly (a long name or email pushed everything else
// in the header sideways, and there was nowhere to add a second action
// without the header growing every time). An avatar is a fixed width
// regardless of identity length, and the dropdown is where this app's
// account surface area is meant to grow (My Profile today; Billing,
// Saved Charts, etc. later) without ever touching SiteHeader's layout
// again.
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

function initialFor(user) {
  const source = user?.name || user?.email || user?.phone_number || '?'
  // Phone numbers start with "+" — skip past the country-code prefix so
  // the avatar shows an actual digit/letter instead of a meaningless "+".
  const firstMeaningfulChar = source.replace(/^\+/, '').trim()[0] || '?'
  return firstMeaningfulChar.toUpperCase()
}

export default function AccountMenu() {
  const { t } = useTranslation()
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const [avatarError, setAvatarError] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    if (!open) return
    function handleOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false)
    }
    function handleEscape(e) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open])

  const displayName = user?.name || user?.phone_number || user?.email || ''
  const secondaryLine = user?.name ? (user?.phone_number || user?.email) : null

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setOpen(o => !o)}
        aria-label={t('nav_account_menu')}
        aria-expanded={open}
        className="w-8 h-8 rounded-full overflow-hidden hover:ring-2 hover:ring-primary/40 transition shrink-0"
      >
        {user?.avatar_url && !avatarError ? (
          <img
            src={user.avatar_url}
            alt=""
            className="w-full h-full object-cover"
            onError={() => setAvatarError(true)}
          />
        ) : (
          <span className="w-full h-full bg-primary text-night font-semibold text-sm flex items-center justify-center">
            {initialFor(user)}
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-56 bg-parchment-card rounded-xl shadow-xl border border-line py-1.5 z-50"
        >
          <div className="px-3.5 py-2 border-b border-line">
            <p className="text-ink text-sm font-medium truncate">{displayName}</p>
            {secondaryLine && <p className="text-ink-faint text-xs truncate mt-0.5">{secondaryLine}</p>}
          </div>
          <Link
            to="/"
            onClick={() => setOpen(false)}
            role="menuitem"
            className="block px-3.5 py-2 text-sm text-ink hover:bg-primary-light/60 transition"
          >
            {t('nav_about_product', 'About Star Jyotish')}
          </Link>
          <Link
            to="/home"
            onClick={() => setOpen(false)}
            role="menuitem"
            className="block px-3.5 py-2 text-sm text-ink hover:bg-primary-light/60 transition"
          >
            {t('nav_my_home')}
          </Link>
          <Link
            to="/account"
            onClick={() => setOpen(false)}
            role="menuitem"
            className="block px-3.5 py-2 text-sm text-ink hover:bg-primary-light/60 transition"
          >
            {t('nav_my_profile')}
          </Link>
          {user?.role === 'admin' && (
            <Link
              to="/admin"
              onClick={() => setOpen(false)}
              role="menuitem"
              className="block px-3.5 py-2 text-sm text-ink hover:bg-primary-light/60 transition"
            >
              Admin Dashboard
            </Link>
          )}
          {user?.role === 'astrologer' && (
            <Link
              to="/astrologer"
              onClick={() => setOpen(false)}
              role="menuitem"
              className="block px-3.5 py-2 text-sm text-ink hover:bg-primary-light/60 transition"
            >
              My Dashboard
            </Link>
          )}
          <button
            onClick={() => { setOpen(false); logout() }}
            role="menuitem"
            className="w-full text-left px-3.5 py-2 text-sm text-vermillion hover:bg-vermillion-light/60 transition"
          >
            {t('nav_logout')}
          </button>
        </div>
      )}
    </div>
  )
}
