// frontend/src/components/home/ComingSoonStrip.jsx
// Previews upcoming features. Kept minimal but slightly lifted.
import { COMING_SOON_FEATURES } from '../../config/homeData'

export default function ComingSoonStrip({ t }) {
  return (
    <section className="text-center pt-2 pb-6">
      <p className="text-ink-faint text-xs uppercase tracking-widest mb-3">{t('home_coming_soon_title')}</p>
      <div className="flex flex-wrap justify-center gap-2">
        {COMING_SOON_FEATURES.map(id => (
          <span
            key={id}
            className="text-xs text-ink-muted border border-line rounded-full px-3 py-1 bg-parchment-card"
          >
            {t(`home_coming_soon_${id}`)}
          </span>
        ))}
      </div>
    </section>
  )
}
