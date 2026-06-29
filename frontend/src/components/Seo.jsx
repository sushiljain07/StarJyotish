// frontend/src/components/Seo.jsx
//
// One shared component for all per-page SEO tags, built on react-helmet-async
// (added specifically for this — see App.jsx for the HelmetProvider it needs
// at the root). Every page passes its own title/description; this component
// owns the repetitive boilerplate (OG, Twitter Card, canonical) so individual
// pages stay short and so the tag set can't drift between pages.
//
// `path` should be the route's path (e.g. "/privacy") — used to build the
// canonical URL and the matching og:url. SITE_URL is the one place that
// would need updating if the production domain ever changes.
import { Helmet } from 'react-helmet-async'

const SITE_URL = 'https://starjyotish.com'
const DEFAULT_OG_IMAGE = `${SITE_URL}/starjyotish-logo.webp`

export default function Seo({ title, description, path = '/', image = DEFAULT_OG_IMAGE, noindex = false }) {
  const fullTitle = title ? `${title} | Star Jyotish` : 'Star Jyotish — AI-Powered Vedic Astrology'
  const canonical = `${SITE_URL}${path}`

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="Star Jyotish" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  )
}
