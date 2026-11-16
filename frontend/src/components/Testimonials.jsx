// frontend/src/components/Testimonials.jsx
//
// Fetches featured testimonials from /api/testimonials/featured.
// Falls back to 4 hardcoded defaults if DB is not configured or returns
// nothing — ensures the landing page never shows an empty section.
// Users submit testimonials via the /testimonials page.
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { API_BASE } from '../api/config'
import Reveal from './Reveal'
import { Badge, Card } from './ui'

const ACCENT_RING = ['ring-primary/30','ring-sage/30','ring-mauve/30','ring-primary/30']
const AVATAR_BG   = ['bg-primary-light text-primary-ink','bg-sage-light text-sage','bg-mauve-light text-mauve','bg-primary-light text-primary-ink']
const MARKS       = ['✦','✧','✦','✧']

// Default testimonials — shown while loading or when DB returns nothing.
// These are also seeded into the DB via migration 0007 with status=featured,
// so once the DB is running they'll come from the API instead.
const DEFAULT_PEOPLE = [
  { id: '1', display_name: 'Priya Mehta',  location: 'Bengaluru' },
  { id: '2', display_name: 'Rahul Sharma', location: 'Delhi' },
  { id: '3', display_name: 'Kavitha Nair', location: 'Kochi' },
  { id: '4', display_name: 'Arjun Bose',   location: 'Kolkata' },
]

function TestimonialCard({ t, i }) {
  return (
    <Card as="figure" className="h-full flex flex-col">
      <div className="font-serif text-4xl leading-none text-primary/30 mb-1 select-none" aria-hidden="true">"</div>
      <blockquote className="text-ink text-sm leading-relaxed flex-1">{t.text}</blockquote>
      {t.detail && (
        <div className="mt-4 mb-4">
          <Badge tone="gold" size="md">
            <svg viewBox="0 0 16 16" className="w-3 h-3" fill="currentColor" aria-hidden="true"><circle cx="8" cy="8" r="2.5"/></svg>
            {t.detail}
          </Badge>
        </div>
      )}
      <figcaption className="flex items-center gap-3 pt-4 border-t border-line">
        <div className={`w-9 h-9 rounded-full ring-2 ${ACCENT_RING[i % 4]} flex items-center justify-center text-sm font-bold flex-shrink-0 ${AVATAR_BG[i % 4]}`} aria-hidden="true">
          {MARKS[i % 4]}
        </div>
        <div>
          <div className="text-sm font-semibold text-ink">{t.display_name}</div>
          {t.location && <div className="text-xs text-ink-muted">{t.location}</div>}
        </div>
      </figcaption>
    </Card>
  )
}

// eslint-disable-next-line react/prop-types
export default function Testimonials() {
  const { t } = useTranslation()
  const [fetched, setFetched] = useState(null)
  // Defaults are translated at render time; names and cities stay as written.
  const items = fetched || DEFAULT_PEOPLE.map(p => ({
    ...p,
    text: t(`testimonial_default_${p.id}_text`),
    detail: t(`testimonial_default_${p.id}_detail`),
  }))

  useEffect(() => {
    fetch(`${API_BASE}/api/testimonials/featured`)
      .then(r => r.ok ? r.json() : [])
      .then(data => { if (Array.isArray(data) && data.length > 0) setFetched(data) })
      .catch(() => {/* keep defaults */})
  }, [])

  return (
    <section className="px-4 py-12 sm:py-16" aria-label={t('testimonials_aria')}>
      <div className="max-w-4xl mx-auto">
        <Reveal className="text-center mb-10">
          <p className="text-primary-ink text-xs font-bold tracking-widest uppercase mb-2">{t('testimonials_subhead')}</p>
          <h2 className="font-serif font-semibold text-2xl sm:text-3xl text-ink">{t('testimonials_heading')}</h2>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          {items.slice(0, 4).map((item, i) => (
            <Reveal key={item.id} delay={i * 90}>
              <TestimonialCard t={item} i={i} />
            </Reveal>
          ))}
        </div>

        <Reveal delay={200} className="text-center mt-10">
          <Link to="/testimonials"
            className="inline-flex items-center gap-2 min-h-11 text-sm text-primary-ink hover:underline font-medium">
            {t('testimonials_read_all')}
          </Link>
          <p className="text-ink-muted text-xs mt-2">{t('landing_footer_note')}</p>
        </Reveal>
      </div>
    </section>
  )
}
