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
//
// Previously had `hidden md:block` which made the footer invisible on
// mobile — fix: always visible, wraps naturally on small screens.
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const LINKS = [
  { to: '/learn',        key: 'footer_link_knowledge_center', fallback: 'Knowledge Center' },
  { to: '/faq',          key: 'footer_link_faq' },
  { to: '/about',        key: 'footer_link_about' },
  { to: '/contact',      key: 'footer_link_contact' },
  { to: '/terms',        key: 'footer_bottom_terms' },
  { to: '/privacy',      key: 'footer_bottom_privacy' },
  { to: '/refund-policy', key: 'footer_bottom_refund' },
]

export default function CompactFooter() {
  const { t } = useTranslation()
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-white/10 bg-night mb-16 sm:mb-0">
      <div className="max-w-4xl mx-auto px-4 py-5">
        <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
          {LINKS.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className="text-ink-onnight/60 hover:text-primary text-xs font-medium transition whitespace-nowrap"
            >
              {t(link.key, link.fallback)}
            </Link>
          ))}
        </nav>
        <p className="text-ink-onnight/40 text-xs text-center mt-3">
          {t('footer_copyright', { year })}
        </p>
      </div>
    </footer>
  )
}
