// frontend/src/components/StaticPageLayout.jsx
//
// Extracted from Disclaimer.jsx, which had this exact shell (back-link +
// heading + body + Footer) hardcoded inline. Privacy/Terms/Refund/About/
// FAQ/Contact all need the same shell, so rather than copy-paste it five
// more times, every static content page — including Disclaimer.jsx itself,
// refactored onto this — now shares one layout. Page-specific SEO tags are
// NOT handled here; each page renders its own <Seo /> alongside this, since
// title/description are inherently per-page (see Seo.jsx).
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Footer from './Footer'
import { useAuth } from '../contexts/AuthContext'

export default function StaticPageLayout({ title, eyebrow, maxWidth = 'max-w-2xl', children }) {
  const { t } = useTranslation()
  const { isAuthenticated } = useAuth()

  return (
    <div className="min-h-screen bg-parchment flex flex-col">
      <div className={`flex-1 px-4 sm:px-6 py-10 sm:py-12 ${maxWidth} mx-auto w-full`}>
        <Link to={isAuthenticated ? '/home' : '/'} className="text-primary-dark text-sm font-medium hover:underline">
          {/* Reusing the existing disclaimer key — the copy ("← Back to
              Home") is identical and generic, so a second key would just be
              a duplicate string to keep translated in sync. Where it
              actually goes now depends on who's reading: a signed-in
              visitor's "Home" is their own workspace (see
              pages/PersonalHome.jsx), not the marketing page. */}
          {t('disclaimer_page_back')}
        </Link>
        {eyebrow && (
          <p className="text-primary-dark text-xs font-bold tracking-wide uppercase mt-5 mb-1">{eyebrow}</p>
        )}
        <h1 className="font-serif font-semibold text-3xl text-ink mt-4 mb-4 break-words">{title}</h1>
        <div className="text-ink-muted text-sm leading-relaxed space-y-4">
          {children}
        </div>
      </div>
      <Footer />
    </div>
  )
}
