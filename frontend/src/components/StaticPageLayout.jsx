// frontend/src/components/StaticPageLayout.jsx
//
// Extracted from Disclaimer.jsx, which had this exact shell (heading +
// body + Footer) hardcoded inline. Privacy/Terms/Refund/About/FAQ/Contact
// all need the same shell, so rather than copy-paste it five more times,
// every static content page — including Disclaimer.jsx itself, refactored
// onto this — now shares one layout. Page-specific SEO tags are NOT
// handled here; each page renders its own <Seo /> alongside this, since
// title/description are inherently per-page (see Seo.jsx).
import SiteHeader from './SiteHeader'
import Footer from './Footer'

export default function StaticPageLayout({ title, eyebrow, maxWidth = 'max-w-2xl', children }) {
  return (
    <div className="min-h-screen bg-parchment flex flex-col">
      {/* These pages (About/FAQ/Contact/Disclaimer/Privacy/Terms/Refund)
          used to be reachable only via a "← Back to Home" text link — a
          real dead end, since there was no way from here to Learn,
          Generate Chart, or the account menu without first going Home
          (see SJ-006.8's Navigation Audit). Mounting the same SiteHeader
          every other page uses fixes that in one place instead of seven,
          and its logo is the ONE consistent Home affordance across the
          whole app (see SiteHeader.jsx — it already routes signed-in
          visitors to /home and everyone else to /). A second, separately-
          worded "back to home" link here duplicated that and had already
          drifted out of sync with ErrorFallback.jsx's differently-worded
          "Go home" button (harmonized to match, same audit) — removed
          rather than reworded, since the real fix is having exactly one
          such control per page. */}
      <SiteHeader />
      <div className={`flex-1 px-4 sm:px-6 pt-20 sm:pt-24 pb-10 sm:pb-12 ${maxWidth} mx-auto w-full`}>
        {eyebrow && (
          <p className="text-primary-dark text-xs font-bold tracking-wide uppercase mb-1">{eyebrow}</p>
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
