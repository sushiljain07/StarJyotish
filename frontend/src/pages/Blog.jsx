// frontend/src/pages/Blog.jsx
//
// Articles are stored in AppSetting:
//   key: "blog_index"   → value: ordered array of slugs (admin controls order/visibility)
//   key: "blog_article_{slug}" → value: { title, excerpt, category, readMin, tags,
//                                          date, featured, content: [...sections] }
//
// All fetched from /api/account/settings/public (is_public=true).
// Admin manages everything from the admin dashboard → Blog tab.
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { API_BASE } from '../api/config'
import Seo from '../components/Seo'
import Reveal from '../components/Reveal'
import SiteHeader from '../components/SiteHeader'
import Footer from '../components/Footer'
import { useScrollProgress } from '../hooks/useScrollProgress'

const CATEGORIES = ['All', 'Basics', 'Planets', 'Timing', 'Remedies']
const CATEGORY_COLORS = {
  Basics:   'bg-primary-light text-primary-dark',
  Timing:   'bg-mauve-light text-mauve',
  Planets:  'bg-sage-light text-sage',
  Remedies: 'bg-vermillion-light text-vermillion',
}

function ArticleCard({ article, featured = false, onClick }) {
  if (featured) {
    return (
      <button onClick={onClick} className="w-full text-left bg-night rounded-2xl overflow-hidden hover:opacity-95 transition group">
        <div className="p-7 sm:p-9">
          <div className="flex items-center gap-2.5 mb-4">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${CATEGORY_COLORS[article.category] ?? 'bg-parchment text-ink-muted'}`}>{article.category}</span>
            <span className="text-ink-onnight text-xs">{article.readMin} min read</span>
          </div>
          <h2 className="font-serif font-semibold text-xl sm:text-2xl text-primary-light leading-snug group-hover:text-primary transition mb-3">{article.title}</h2>
          <p className="text-ink-onnight text-sm leading-relaxed line-clamp-3">{article.excerpt}</p>
          <div className="flex items-center justify-between mt-6">
            <span className="text-ink-onnight text-xs">{article.date}</span>
            <span className="text-primary text-sm font-medium group-hover:translate-x-0.5 transition-transform">Read article →</span>
          </div>
        </div>
      </button>
    )
  }
  return (
    <button onClick={onClick} className="w-full text-left bg-parchment-card rounded-xl border border-line hover:border-primary/30 hover:shadow-md transition group p-5 flex flex-col h-full">
      <div className="flex items-center gap-2 mb-3">
        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${CATEGORY_COLORS[article.category] ?? 'bg-parchment text-ink-muted'}`}>{article.category}</span>
        <span className="text-ink-faint text-[11px]">{article.readMin} min</span>
      </div>
      <h3 className="font-semibold text-sm text-ink leading-snug group-hover:text-primary-dark transition mb-2 flex-1">{article.title}</h3>
      <p className="text-xs text-ink-muted leading-relaxed line-clamp-3 mb-4">{article.excerpt}</p>
      <div className="flex items-center justify-between pt-3 border-t border-line">
        <span className="text-ink-faint text-[11px]">{article.date}</span>
        <span className="text-primary-dark text-xs font-medium">Read →</span>
      </div>
    </button>
  )
}

function Skeleton() {
  return (
    <div className="bg-parchment-card rounded-xl border border-line p-5 animate-pulse">
      <div className="h-3 w-16 bg-line rounded mb-3" />
      <div className="h-4 w-full bg-line rounded mb-2" />
      <div className="h-4 w-3/4 bg-line rounded mb-4" />
      <div className="h-3 w-full bg-line rounded mb-1" />
      <div className="h-3 w-2/3 bg-line rounded" />
    </div>
  )
}

export default function Blog() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('All')
  const [email, setEmail] = useState('')
  const scrollProgress = useScrollProgress(80)

  useEffect(() => {
    fetch(`${API_BASE}/api/account/settings/public`)
      .then(r => r.ok ? r.json() : {})
      .then(data => {
        // Primary path: blog_index controls order and visibility
        // Fallback: scan all blog_article_* keys directly — handles the
        // case where blog_index wasn't saved as public yet (e.g. first
        // publish where the admin saves an article before blog_index exists)
        const index = Array.isArray(data.blog_index)
          ? data.blog_index
          : Object.keys(data)
              .filter(k => k.startsWith('blog_article_'))
              .map(k => k.replace('blog_article_', ''))

        const list = index
          .map(slug => {
            const art = data[`blog_article_${slug}`]
            return art ? { slug, ...art } : null
          })
          .filter(Boolean)
          .filter(a => a.status !== 'archived')
        setArticles(list)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const visible = articles.filter(a => category === 'All' || a.category === category)
  const featured = visible.find(a => a.featured)
  const rest = visible.filter(a => !a.featured)

  return (
    <div className="min-h-screen bg-parchment">
      <Seo title={t('blog_seo_title')} description={t('blog_seo_desc')} path="/blog" />
      <SiteHeader scrollProgress={scrollProgress} onCtaClick={() => navigate('/generate')} />

      <div className="bg-night px-6 pt-24 pb-10">
        <div className="max-w-3xl mx-auto text-center">
          <Reveal>
            <p className="text-primary text-xs font-bold tracking-widest uppercase mb-2">Vedic Astrology</p>
            <h1 className="font-serif font-semibold text-3xl sm:text-4xl text-primary-light mb-3">{t('blog_heading')}</h1>
            <p className="text-ink-onnight text-sm max-w-md mx-auto">{t('blog_subhead')}</p>
          </Reveal>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Category filter */}
        <Reveal className="flex gap-2 overflow-x-auto pb-1 mb-6">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)}
              className={`whitespace-nowrap text-xs px-4 py-2 rounded-lg border transition ${category === cat ? 'bg-primary-dark text-night border-primary-dark font-semibold shadow-sm' : 'bg-parchment-card border-line text-ink-muted hover:border-primary/40'}`}>
              {cat}
            </button>
          ))}
        </Reveal>

        {loading ? (
          <div>
            <div className="h-40 bg-night/10 rounded-2xl animate-pulse mb-6" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1,2,3].map(i => <Skeleton key={i} />)}
            </div>
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-ink-faint text-sm mb-4">No articles published yet.</p>
            <p className="text-ink-faint text-xs">Check back soon — content is on the way.</p>
          </div>
        ) : (
          <>
            {featured && category === 'All' && (
              <Reveal className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <span className="h-px flex-1 bg-line" />
                  <span className="text-xs font-bold text-ink-faint uppercase tracking-widest">{t('blog_featured')}</span>
                  <span className="h-px flex-1 bg-line" />
                </div>
                <ArticleCard article={featured} featured onClick={() => navigate(`/blog/${featured.slug}`)} />
              </Reveal>
            )}
            {rest.length === 0 && <p className="text-ink-faint text-sm text-center py-8">{t('blog_empty')}</p>}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {rest.map((article, i) => (
                <Reveal key={article.slug} delay={i * 60}>
                  <ArticleCard article={article} onClick={() => navigate(`/blog/${article.slug}`)} />
                </Reveal>
              ))}
            </div>
          </>
        )}

        {/* Newsletter */}
        <Reveal className="mt-12">
          <div className="bg-night rounded-2xl px-6 py-8 text-center">
            <div className="font-serif font-semibold text-xl text-primary-light mb-2">{t('blog_newsletter_heading')}</div>
            <p className="text-ink-onnight text-sm mb-5 max-w-sm mx-auto">{t('blog_newsletter_body')}</p>
            <div className="flex gap-2 max-w-sm mx-auto">
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="Your email"
                className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2.5 text-sm text-primary-light placeholder:text-ink-onnight focus:outline-none focus:border-primary/60" />
              <button className="bg-primary hover:bg-primary-dark text-night font-semibold text-sm px-4 py-2.5 rounded-lg transition whitespace-nowrap">
                {t('blog_notify_cta')}
              </button>
            </div>
            <p className="text-ink-onnight text-xs mt-2">{t('blog_no_spam')}</p>
          </div>
        </Reveal>
      </div>
      <Footer />
    </div>
  )
}
