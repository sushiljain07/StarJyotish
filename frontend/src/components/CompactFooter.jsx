// frontend/src/components/CompactFooter.jsx
//
// Footer.jsx (the full marketing footer — brand column, newsletter,
// trust/payment badges) is right for Landing/Learn/Blog/Pricing, but it's
// too heavy to repeat on every screen inside the authenticated workspace
// (PersonalHome, Profile, the /generate form) — SJ-006.8 asks for a
// "compact footer" there instead, so premium users can always reach
// policies/support without it competing with the page's actual content.
//
// Every link here reuses an existing i18n key and an existing route —
// no new pages, no new copy. `sticky` is intentionally not used: this
// sits at the natural end of the page's content, the same way Footer.jsx
// does, rather than pinned to the viewport.
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const LINKS = [
  { to: '/learn', key: 'footer_link_knowledge_center', fallback: 'Knowledge Center' },
  { to: '/about', key: 'footer_link_about' },
  { to: '/faq', key: 'footer_link_faq' },
  { to: '/contact', key: 'footer_link_contact' },
  { to: '/privacy', key: 'footer_bottom_privacy' },
  { to: '/terms', key: 'footer_bottom_terms' },
  { to: '/refund-policy', key: 'footer_bottom_refund' },
]

export default function CompactFooter() {
  const { t } = useTranslation()
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-line bg-parchment-card">
      <div className="max-w-3xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5">
          {LINKS.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className="text-ink-faint hover:text-primary-dark text-xs font-medium transition"
            >
              {t(link.key, link.fallback)}
            </Link>
          ))}
        </nav>
        <p className="text-ink-faint text-xs text-center sm:text-right shrink-0">
          {t('footer_copyright', { year })}
        </p>
      </div>
    </footer>
  )
}
