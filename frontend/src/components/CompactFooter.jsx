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

// Link set mirrors Footer.jsx's bottom bar + key destinations, and the
// EN/हि toggle matches Footer.jsx, so the two footers never disagree on
// essentials — only on marketing weight (newsletter, brand, badges).
const LINKS = [
  { to: '/learn',         key: 'footer_link_knowledge_center', fallback: 'Knowledge Center' },
  { to: '/faq',           key: 'footer_link_faq' },
  { to: '/about',         key: 'footer_link_about' },
  { to: '/contact',       key: 'footer_link_contact' },
  { to: '/terms',         key: 'footer_bottom_terms' },
  { to: '/privacy',       key: 'footer_bottom_privacy' },
  { to: '/refund-policy', key: 'footer_bottom_refund' },
  { to: '/disclaimer',    key: 'footer_bottom_disclaimer' },
]

const FOOTER_YEAR = new Date().getFullYear()

export default function CompactFooter() {
  const { t, i18n } = useTranslation()

  return (
    <footer className="border-t border-white/10 bg-night">
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
        <div className="flex items-center justify-center gap-3 mt-3">
          <p className="text-ink-onnight/40 text-xs">
            {t('footer_copyright', { year: FOOTER_YEAR })}
          </p>
          <div className="flex gap-1">
            {['en', 'hi'].map(lang => (
              <button
                key={lang}
                onClick={() => i18n.changeLanguage(lang)}
                className={`px-2 py-0.5 rounded-full text-[11px] font-semibold transition ${
                  i18n.language.startsWith(lang) ? 'bg-primary text-night' : 'bg-white/5 text-ink-onnight/60 hover:bg-white/10'
                }`}
              >
                {lang === 'en' ? 'EN' : 'हि'}
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
