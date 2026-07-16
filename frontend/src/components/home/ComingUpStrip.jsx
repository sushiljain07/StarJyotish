// frontend/src/components/home/ComingUpStrip.jsx  v2 (Home reimagined)
//
// Same events prop (already the nearest-first slice buildComingUpEvents
// returns) — reduced to just the 2 nearest so this beat stays a teaser,
// not a full list; "See all →" is the escape hatch into /week-ahead for
// the rest. Restyled onto the same night-surface card language the rest
// of the reimagined home uses (bg-white/[0.045] + a thin gold edge)
// instead of the old per-card blue/gold gradient block.
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function ComingUpStrip({ events }) {
  const { t } = useTranslation()
  if (!events?.length) return null
  const nearest = events.slice(0, 2)

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {nearest.map((ev, i) => (
          <div
            key={i}
            className="bg-white/[0.045] border border-primary/20 rounded-card p-5"
          >
            <p className="text-2xs font-bold uppercase tracking-wide text-primary mb-2">{ev.when}</p>
            <h4 className="font-serif font-semibold text-[15px] text-primary-light mb-1.5 leading-snug">{ev.title}</h4>
            <p className="text-xs text-ink-onnight/60 leading-relaxed">{ev.description}</p>
          </div>
        ))}
      </div>
      <Link
        to="/week-ahead"
        className="inline-block mt-3.5 text-2xs font-bold text-primary hover:text-primary-glow transition"
      >
        {t('home_coming_up_see_all', 'See all →')}
      </Link>
    </div>
  )
}
