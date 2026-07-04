// frontend/src/components/home/ComingSoonStrip.jsx
//
// Gracefully introduces future capabilities without competing for
// attention — plain outlined pills, not cards, deliberately the least
// visually prominent section on the page (see PRODUCT_HOME.md).
import { COMING_SOON_FEATURES } from '../../config/homeData'

export default function ComingSoonStrip({ t }) {
  return (
    <section className="text-center pt-2 pb-6">
      <p className="text-ink-faint text-xs uppercase tracking-wide mb-3">{t('home_coming_soon_title')}</p>
      <div className="flex flex-wrap justify-center gap-2">
        {COMING_SOON_FEATURES.map(id => (
          <span
            key={id}
            className="text-xs text-ink-muted border border-line rounded-full px-3 py-1"
          >
            {t(`home_coming_soon_${id}`)}
          </span>
        ))}
      </div>
    </section>
  )
}
