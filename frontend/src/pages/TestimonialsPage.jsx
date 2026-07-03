// frontend/src/pages/TestimonialsPage.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_BASE } from '../api/config'
import Seo from '../components/Seo'
import Reveal from '../components/Reveal'
import SiteHeader from '../components/SiteHeader'
import Footer from '../components/Footer'
import { useScrollProgress } from '../hooks/useScrollProgress'

const ACCENT_RING = ['ring-primary/30','ring-sage/30','ring-mauve/30','ring-primary/30','ring-sage/30','ring-mauve/30']
const AVATAR_BG   = ['bg-primary-light text-primary-dark','bg-sage-light text-sage','bg-mauve-light text-mauve','bg-primary-light text-primary-dark','bg-sage-light text-sage','bg-mauve-light text-mauve']
const MARKS       = ['✦','✧','✦','✧','✦','✧']

function TestimonialCard({ t, i }) {
  return (
    <figure className="bg-parchment-card rounded-2xl border border-line p-5 sm:p-6 flex flex-col h-full">
      <div className="font-serif text-4xl leading-none text-primary/30 mb-1 select-none" aria-hidden="true">"</div>
      <blockquote className="text-ink text-sm leading-relaxed flex-1">{t.text}</blockquote>
      {t.detail && (
        <div className="mt-4 mb-4">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-primary-dark bg-primary-light px-2.5 py-1 rounded-full">
            <svg viewBox="0 0 16 16" className="w-3 h-3" fill="currentColor"><circle cx="8" cy="8" r="2.5"/></svg>
            {t.detail}
          </span>
        </div>
      )}
      <figcaption className="flex items-center gap-3 pt-4 border-t border-line">
        <div className={`w-9 h-9 rounded-full ring-2 ${ACCENT_RING[i % 6]} flex items-center justify-center text-sm font-bold flex-shrink-0 ${AVATAR_BG[i % 6]}`}>
          {MARKS[i % 6]}
        </div>
        <div>
          <div className="text-sm font-semibold text-ink">{t.display_name}</div>
          {t.location && <div className="text-xs text-ink-faint">{t.location}</div>}
        </div>
      </figcaption>
    </figure>
  )
}

function SubmitForm() {
  const [form, setForm]       = useState({ display_name: '', location: '', text: '', detail: '' })
  const [saving, setSaving]   = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError]     = useState('')
  const remaining = 500 - form.text.length

  async function handleSubmit(e) {
    e.preventDefault()
    if (form.text.trim().length < 20) { setError('Please write at least 20 characters.'); return }
    setSaving(true); setError('')
    try {
      const r = await fetch(`${API_BASE}/api/testimonials/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          display_name: form.display_name,
          location: form.location || undefined,
          text: form.text,
          detail: form.detail || undefined,
        }),
      })
      const data = await r.json()
      if (!r.ok) throw new Error(data.detail ?? 'Submission failed')
      setSuccess(true)
      setForm({ display_name: '', location: '', text: '', detail: '' })
    } catch (e) { setError(e.message) }
    finally { setSaving(false) }
  }

  if (success) {
    return (
      <div className="bg-sage-light border border-sage/30 rounded-2xl px-6 py-8 text-center">
        <div className="text-3xl mb-3">🙏</div>
        <div className="font-semibold text-ink mb-2">Thank you for sharing your experience</div>
        <p className="text-sm text-ink-muted">Your testimonial has been submitted for review. Once approved by our team, it will appear on this page and may be featured on the homepage.</p>
      </div>
    )
  }

  return (
    <div className="bg-parchment-card border border-line rounded-2xl p-6 sm:p-8">
      <h3 className="font-serif font-semibold text-xl text-ink mb-1">Share your experience</h3>
      <p className="text-xs text-ink-muted mb-6">Your testimonial will be reviewed before it appears publicly. We only show genuine experiences — no edits to your words without asking.</p>

      {error && <div className="bg-vermillion-light text-vermillion text-sm rounded-lg px-4 py-3 mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-ink-muted mb-1 block">Your name *</label>
            <input required value={form.display_name} onChange={e => setForm(p => ({...p, display_name: e.target.value}))}
              placeholder="e.g. Priya M."
              className="w-full bg-parchment border border-line rounded-lg px-3 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-primary-dark" />
          </div>
          <div>
            <label className="text-xs text-ink-muted mb-1 block">City / Location</label>
            <input value={form.location} onChange={e => setForm(p => ({...p, location: e.target.value}))}
              placeholder="e.g. Bengaluru"
              className="w-full bg-parchment border border-line rounded-lg px-3 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-primary-dark" />
          </div>
        </div>

        <div>
          <label className="text-xs text-ink-muted mb-1 block">What you used <span className="text-ink-faint">(optional)</span></label>
          <input value={form.detail} onChange={e => setForm(p => ({...p, detail: e.target.value}))}
            placeholder="e.g. Career report + full Kundli"
            className="w-full bg-parchment border border-line rounded-lg px-3 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-primary-dark" />
        </div>

        <div>
          <label className="text-xs text-ink-muted mb-1 block">Your experience * <span className="text-ink-faint">(20–500 characters)</span></label>
          <textarea required rows={5} value={form.text} onChange={e => setForm(p => ({...p, text: e.target.value}))}
            placeholder="What did you find useful or surprising? What would you tell someone considering using Star Jyotish?"
            className="w-full bg-parchment border border-line rounded-lg px-3 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-primary-dark resize-none" />
          <div className={`text-xs mt-1 text-right ${remaining < 50 ? 'text-vermillion' : 'text-ink-faint'}`}>
            {remaining} characters remaining
          </div>
        </div>

        <p className="text-xs text-ink-faint">By submitting, you agree that your name, location, and testimonial may be displayed publicly on starjyotish.com. We will not edit your words without asking.</p>

        <button type="submit" disabled={saving || form.text.length < 20}
          className="w-full py-3 bg-primary-dark text-night text-sm font-semibold rounded-xl hover:opacity-90 transition disabled:opacity-50">
          {saving ? 'Submitting…' : 'Submit Testimonial'}
        </button>
      </form>
    </div>
  )
}

export default function TestimonialsPage() {
  const navigate = useNavigate()
  const scrollProgress = useScrollProgress(80)
  const [items, setItems]     = useState([])
  const [loading, setLoading] = useState(true)
  const [offset, setOffset]   = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const LIMIT = 12

  function loadMore(off = 0) {
    setLoading(true)
    fetch(`${API_BASE}/api/testimonials?limit=${LIMIT}&offset=${off}`)
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        if (off === 0) setItems(data)
        else setItems(prev => [...prev, ...data])
        setHasMore(data.length === LIMIT)
        setOffset(off + data.length)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadMore(0) }, [])

  return (
    <div className="min-h-screen bg-parchment">
      <Seo
        title="User Testimonials — Star Jyotish"
        description="Read what people are discovering with Star Jyotish's AI-powered Vedic astrology. Share your own experience."
        path="/testimonials"
      />
      <SiteHeader scrollProgress={scrollProgress} onCtaClick={() => navigate('/generate')} />

      {/* Header */}
      <div className="bg-night px-6 pt-24 pb-12 text-center">
        <Reveal>
          <p className="text-primary text-xs font-bold tracking-widest uppercase mb-2">Real experiences</p>
          <h1 className="font-serif font-semibold text-3xl sm:text-4xl text-primary-light mb-3">What people are discovering</h1>
          <p className="text-ink-onnight text-sm max-w-md mx-auto">Every testimonial here was written by a real user and reviewed by our team before being shown.</p>
        </Reveal>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Testimonial grid */}
        {loading && items.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="bg-parchment-card rounded-2xl border border-line p-6 animate-pulse">
                <div className="h-3 w-8 bg-line rounded mb-3" />
                <div className="h-3 w-full bg-line rounded mb-2" />
                <div className="h-3 w-full bg-line rounded mb-2" />
                <div className="h-3 w-2/3 bg-line rounded mb-6" />
                <div className="h-3 w-1/3 bg-line rounded" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-ink-faint text-sm">No testimonials yet — be the first to share your experience.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {items.map((item, i) => (
                <Reveal key={item.id} delay={i < 4 ? i * 70 : 0}>
                  <TestimonialCard t={item} i={i} />
                </Reveal>
              ))}
            </div>
            {hasMore && (
              <div className="text-center mb-10">
                <button onClick={() => loadMore(offset)} disabled={loading}
                  className="px-6 py-2.5 border border-line bg-parchment-card text-ink text-sm rounded-lg hover:border-primary/30 transition disabled:opacity-50">
                  {loading ? 'Loading…' : 'Load more'}
                </button>
              </div>
            )}
          </>
        )}

        {/* Divider */}
        <div className="flex items-center justify-center gap-3 my-8" aria-hidden="true">
          <span className="h-px flex-1 bg-line" />
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-primary/70" fill="currentColor"><path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8z"/></svg>
          <span className="h-px flex-1 bg-line" />
        </div>

        {/* Submission form */}
        <Reveal>
          <SubmitForm />
        </Reveal>
      </div>

      <Footer />
    </div>
  )
}
