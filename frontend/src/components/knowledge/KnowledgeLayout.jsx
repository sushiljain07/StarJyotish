// frontend/src/components/knowledge/KnowledgeLayout.jsx
//
// The shell every future guide page (Zodiac sign, Nakshatra, Dasha, ...)
// mounts into. This is the piece that makes each guide page itself close
// to trivial to build: it owns Seo, SiteHeader, ReadingProgress,
// Breadcrumb-in-Hero, the max-readable-width article column, and Footer,
// so a guide page only has to supply its own content as children.
//
// `sidebar` is an intentional stub for the "support left nav / table of
// contents later" requirement — it renders a second column on large
// screens if passed, but this component does not generate a TOC or
// section nav itself. Building that (scroll-spy, heading extraction) is
// real, separate work that belongs with the first guide page that
// actually needs it — wiring an empty stub for it now would be guessing
// at an API before there's a real consumer to validate it against.
import Seo from '../Seo'
import SiteHeader from '../SiteHeader'
import Footer from '../Footer'
import Hero from './Hero'
import ReadingProgress from './ReadingProgress'
import { useScrollProgress } from '../../hooks/useScrollProgress'
import { useNavigate } from 'react-router-dom'

export default function KnowledgeLayout({
  seoTitle,
  seoDescription,
  path,
  breadcrumbItems,
  eyebrow,
  title,
  subtitle,
  meta,
  sidebar,
  contentWidth = 'max-w-2xl',
  children,
}) {
  const navigate = useNavigate()
  const scrollProgress = useScrollProgress(80)

  return (
    <div className="min-h-screen bg-parchment">
      <ReadingProgress />
      <Seo title={seoTitle} description={seoDescription} path={path} />
      <SiteHeader scrollProgress={scrollProgress} onCtaClick={() => navigate('/generate')} />

      <Hero eyebrow={eyebrow} title={title} subtitle={subtitle} breadcrumbItems={breadcrumbItems} meta={meta} align="left" />

      {sidebar ? (
        <div className="max-w-5xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-10">
          <article className={`${contentWidth} min-w-0`}>{children}</article>
          <aside className="hidden lg:block">
            <div className="sticky top-24">{sidebar}</div>
          </aside>
        </div>
      ) : (
        <article className={`${contentWidth} mx-auto px-4 py-10`}>{children}</article>
      )}

      <Footer />
    </div>
  )
}
