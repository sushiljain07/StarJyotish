// frontend/src/pages/BlogArticle.jsx
//
// Renders a single blog article. Content is fetched from the AppSetting
// key "blog_article_{slug}" via the public settings endpoint.
// No hardcoded content — everything is managed from the admin dashboard.
import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { API_BASE } from '../api/config'
import Seo from '../components/Seo'
import Reveal from '../components/Reveal'
import SiteHeader from '../components/SiteHeader'
import Footer from '../components/Footer'
import { useScrollProgress } from '../hooks/useScrollProgress'

const CATEGORY_COLORS = {
  Basics:   'bg-primary-light text-primary-dark',
  Timing:   'bg-mauve-light text-mauve',
  Planets:  'bg-sage-light text-sage',
  Remedies: 'bg-vermillion-light text-vermillion',
}

// ── Section renderers ──────────────────────────────────────────────────────
// Section types: intro | h2 | h3 | body | callout | list | table
// Content format matches what the admin editor stores in AppSetting.value.

function Section({ section }) {
  switch (section.type) {
    case 'intro':
      return <p className="text-lg sm:text-xl text-ink leading-relaxed font-medium border-l-4 border-primary pl-5 mb-8">{section.content}</p>
    case 'h2':
      return <h2 className="font-serif font-semibold text-xl sm:text-2xl text-ink mt-10 mb-4">{section.content}</h2>
    case 'h3':
      return <h3 className="font-semibold text-base text-ink mt-7 mb-3">{section.content}</h3>
    case 'body':
      return <p className="text-ink text-sm sm:text-base leading-relaxed mb-4">{section.content}</p>
    case 'callout':
      return (
        <div className="bg-primary-light border-l-4 border-primary rounded-r-xl px-5 py-4 my-6">
          <p className="text-sm text-ink leading-relaxed">{section.content}</p>
        </div>
      )
    case 'list':
      return (
        <ul className="mb-6 space-y-2">
          {(section.content || []).map((item, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-ink leading-relaxed">
              <svg viewBox="0 0 16 16" className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" fill="currentColor">
                <circle cx="8" cy="8" r="2.5"/>
              </svg>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )
    case 'table':
      return (
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-night text-primary-light">
                {(section.content.headers || []).map((h, i) => (
                  <th key={i} className="text-left px-4 py-2.5 font-semibold text-xs uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(section.content.rows || []).map((row, ri) => (
                <tr key={ri} className={ri % 2 === 0 ? 'bg-parchment-card' : 'bg-parchment'}>
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-4 py-2.5 text-ink border-b border-line">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    default:
      return null
  }
}

function ReadingProgressBar() {
  useEffect(() => {
    function update() {
      const bar = document.getElementById('rp-bar')
      if (!bar) return
      const pct = Math.min(100, (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100)
      bar.style.width = `${pct}%`
    }
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])
  return (
    <div className="fixed top-0 left-0 right-0 h-0.5 bg-line z-50">
      <div id="rp-bar" className="h-full bg-primary transition-none" style={{ width: '0%' }} />
    </div>
  )
}

export default function BlogArticle() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const scrollProgress = useScrollProgress(80)
  const [article, setArticle] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
    setLoading(true)
    setNotFound(false)

    fetch(`${API_BASE}/api/account/settings/public`)
      .then(r => r.ok ? r.json() : {})
      .then(data => {
        const art = data[`blog_article_${slug}`]
        if (!art || art.status === 'archived') { setNotFound(true); return }
        setArticle({ slug, ...art })

        // Fetch related articles
        const relatedSlugs = art.relatedSlugs || []
        const relatedList = relatedSlugs
          .map(s => { const a = data[`blog_article_${s}`]; return a ? { slug: s, ...a } : null })
          .filter(Boolean)
        setRelated(relatedList)
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [slug])

  if (notFound && !loading) {
    navigate('/blog')
    return null
  }

  return (
    <div className="min-h-screen bg-parchment">
      <ReadingProgressBar />
      <Seo
        title={article ? `${article.title} — Star Jyotish Blog` : 'Blog — Star Jyotish'}
        description={article?.excerpt ?? ''}
        path={`/blog/${slug}`}
      />
      <SiteHeader scrollProgress={scrollProgress} onCtaClick={() => navigate('/generate')} />

      {loading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-3xl animate-spin">🪐</div>
        </div>
      ) : article ? (
        <>
          {/* Article header */}
          <div className="bg-night px-6 pt-24 pb-12">
            <div className="max-w-2xl mx-auto">
              <Reveal>
                <div className="flex items-center gap-2.5 mb-5">
                  <Link to="/blog" className="text-ink-onnight hover:text-primary text-xs transition">← Blog</Link>
                  <span className="text-ink-onnight/40 text-xs">/</span>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${CATEGORY_COLORS[article.category] ?? 'bg-parchment text-ink'}`}>{article.category}</span>
                </div>
                <h1 className="font-serif font-semibold text-2xl sm:text-3xl text-primary-light leading-snug mb-4">{article.title}</h1>
                <div className="flex items-center gap-4 text-ink-onnight text-xs">
                  <span>{article.date}</span>
                  <span>·</span>
                  <span>{article.readMin} min read</span>
                </div>
              </Reveal>
            </div>
          </div>

          {/* Article body */}
          <article className="max-w-2xl mx-auto px-4 py-10">
            {(article.content || []).map((section, i) => (
              <Reveal key={i} delay={i < 3 ? i * 60 : 0}>
                <Section section={section} />
              </Reveal>
            ))}

            {(article.tags || []).length > 0 && (
              <div className="flex flex-wrap gap-2 mt-10 pt-6 border-t border-line">
                {article.tags.map(tag => (
                  <span key={tag} className="text-xs bg-parchment-card border border-line px-3 py-1 rounded-full text-ink-muted">{tag}</span>
                ))}
              </div>
            )}
          </article>

          {/* CTA */}
          <div className="bg-night px-6 py-10 text-center">
            <p className="text-primary text-xs font-bold tracking-widest uppercase mb-2">Star Jyotish</p>
            <h2 className="font-serif font-semibold text-xl text-primary-light mb-2">See this in your own chart</h2>
            <p className="text-ink-onnight text-sm mb-5 max-w-sm mx-auto">Everything in this article becomes personal when you generate your free Kundli.</p>
            <button onClick={() => navigate('/generate')} className="bg-primary hover:bg-primary-dark text-night font-semibold text-sm px-7 py-3 rounded-full shadow-md hover:shadow-lg transition">
              Generate My Free Kundli →
            </button>
          </div>

          {/* Related articles */}
          {related.length > 0 && (
            <section className="max-w-2xl mx-auto px-4 py-10">
              <h3 className="font-semibold text-sm text-ink-muted uppercase tracking-wide mb-5">Related reading</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {related.map(rel => (
                  <Link key={rel.slug} to={`/blog/${rel.slug}`}
                    className="group bg-parchment-card rounded-xl border border-line p-4 hover:border-primary/30 hover:shadow-md transition">
                    <span className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full mb-2 ${CATEGORY_COLORS[rel.category] ?? ''}`}>{rel.category}</span>
                    <p className="font-semibold text-sm text-ink group-hover:text-primary-dark transition leading-snug">{rel.title}</p>
                    <p className="text-xs text-ink-faint mt-1">{rel.readMin} min read</p>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </>
      ) : null}

      <Footer />
    </div>
  )
}
