// frontend/src/pages/NotFound.jsx
//
// Catch-all for unmatched routes. Before this existed, an unmatched URL
// (typo, dead link, old bookmark) hit React Router's <Routes> with no
// matching <Route> and rendered nothing — a blank page with no way back,
// and no signal to the user (or Search Console) that anything went wrong.
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Seo from '../components/Seo'
import StaticPageLayout from '../components/StaticPageLayout'
import { useAuth } from '../contexts/AuthContext'

export default function NotFound() {
  const { t } = useTranslation()
  const { isAuthenticated } = useAuth()

  return (
    <>
      {/* noindex: a 404 page has no business ranking in search results,
          and without this Google will happily index it under whatever
          URL the user mistyped. */}
      <Seo
        title={t('not_found_seo_title', 'Page Not Found — Star Jyotish')}
        description={t('not_found_seo_description', 'The page you were looking for could not be found.')}
        noindex
      />
      <StaticPageLayout
        title={t('not_found_title', "This page doesn't exist")}
        eyebrow="404"
      >
        <p>
          {t(
            'not_found_body',
            "The link you followed may be broken, or the page may have moved. Let's get you back on track."
          )}
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            to={isAuthenticated ? '/home' : '/'}
            className="inline-block px-5 py-2.5 rounded-full bg-primary-dark text-night text-sm font-semibold hover:opacity-90 transition"
          >
            {t('not_found_cta', 'Go to homepage')}
          </Link>
          <Link
            to="/generate"
            className="inline-block px-5 py-2.5 rounded-full border border-primary/40 text-primary-dark text-sm font-semibold hover:bg-primary-light transition"
          >
            {t('not_found_generate', 'Generate a chart')}
          </Link>
          <Link
            to="/learn"
            className="inline-block px-5 py-2.5 rounded-full border border-line text-ink-muted text-sm font-semibold hover:bg-parchment-card transition"
          >
            {t('not_found_learn', 'Browse Knowledge Center')}
          </Link>
        </div>
      </StaticPageLayout>
    </>
  )
}
