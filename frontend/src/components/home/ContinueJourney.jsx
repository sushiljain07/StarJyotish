// frontend/src/components/home/ContinueJourney.jsx
// "Continue Your Journey" — three Knowledge Center cards.
import { Link } from 'react-router-dom'
import HomeIcon from './HomeIcons'

function JourneyCard({ eyebrow, title, description, href, comingSoon, comingSoonLabel }) {
  const body = (
    <div className="bg-parchment-card rounded-xl border border-line p-4 h-full flex flex-col hover:border-primary/50 hover:shadow-md transition shadow-sm">
      <span className="text-[10px] font-semibold text-primary uppercase tracking-wide mb-1.5">{eyebrow}</span>
      <h3 className="font-serif font-semibold text-ink text-base leading-snug mb-1">{title}</h3>
      {description && <p className="text-ink-muted text-xs leading-relaxed flex-1">{description}</p>}
      <div className="flex items-center justify-between mt-3">
        {comingSoon ? (
          <span className="inline-flex items-center gap-1 text-[11px] text-ink-faint font-medium">
            <HomeIcon id="lock" className="w-3 h-3" /> {comingSoonLabel}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[11px] text-primary font-semibold">
            <HomeIcon id="arrowRight" className="w-3.5 h-3.5" />
          </span>
        )}
      </div>
    </div>
  )

  if (comingSoon || !href) return <div className="opacity-70">{body}</div>
  return <Link to={href} className="block h-full">{body}</Link>
}

export default function ContinueJourney({ t, journey }) {
  const { recentlyViewed, recommended, nextStep } = journey

  return (
    <section>
      <h2 className="font-serif font-semibold text-lg text-ink mb-3">{t('home_journey_title')}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {recentlyViewed && (
          <JourneyCard
            eyebrow={t('home_journey_recent_label')}
            title={recentlyViewed.title}
            description={recentlyViewed.teaser}
            href={recentlyViewed.href}
            comingSoon={recentlyViewed.status === 'comingSoon'}
            comingSoonLabel={t('home_journey_coming_soon')}
          />
        )}
        {recommended && (
          <JourneyCard
            eyebrow={t('home_journey_recommended_label')}
            title={recommended.title}
            description={recommended.description}
            href={recommended.href}
            comingSoon={recommended.comingSoon}
            comingSoonLabel={t('home_journey_coming_soon')}
          />
        )}
        {nextStep && (
          <JourneyCard
            eyebrow={t('home_journey_next_step_label')}
            title={nextStep.title}
            description={nextStep.description}
            href={nextStep.href}
            comingSoon={nextStep.comingSoon}
            comingSoonLabel={t('home_journey_coming_soon')}
          />
        )}
      </div>
    </section>
  )
}
