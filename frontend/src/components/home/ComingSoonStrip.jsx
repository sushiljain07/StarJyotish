// frontend/src/components/home/ComingSoonStrip.jsx
// Upcoming features preview — styled as a Knowledge Center Callout.
import { COMING_SOON_FEATURES } from '../../config/homeData'

export default function ComingSoonStrip({ t }) {
  return (
    <div className="bg-primary-light border-l-4 border-primary rounded-r-xl px-5 py-4">
      <p className="text-xs font-bold tracking-widest uppercase text-primary-dark mb-2">
        {t('home_coming_soon_title')}
      </p>
      <div className="flex flex-wrap gap-2">
        {COMING_SOON_FEATURES.map(id => (
          <span
            key={id}
            className="text-xs text-primary-dark bg-white/60 border border-primary/20 rounded-full px-3 py-1"
          >
            {t(`home_coming_soon_${id}`)}
          </span>
        ))}
      </div>
    </div>
  )
}
