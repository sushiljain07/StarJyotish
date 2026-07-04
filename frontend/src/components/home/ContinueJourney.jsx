// frontend/src/components/home/ContinueJourney.jsx
// "Continue Your Journey" — styled exactly like the Knowledge Center's
// Featured Learning Paths section (eyebrow + serif h2 + ArticleCard grid).
import { Link } from 'react-router-dom'
import HomeIcon from './HomeIcons'

function JourneyCard({ eyebrow, title, description, href, comingSoon, comingSoonLabel }) {
  const inner = (
    <div className={`bg-parchment-card rounded-xl border p-5 h-full flex flex-col transition
      ${comingSoon
        ? 'border-line opacity-70'
        : 'border-line hover:border-primary/40 hover:shadow-md cursor-pointer'
      }`}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{eyebrow}</span>
        {comingSoon && (
          <span className="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full bg-parchment text-ink-faint border border-line">
            {comingSoonLabel}
          </span>
        )}
      </div>
      <h3 className="font-serif font-semibold text-ink text-base leading-snug mb-2">{title}</h3>
      {description && (
        <p className="text-ink-muted text-xs leading-relaxed flex-1">{description}</p>
      )}
      {!comingSoon && (
        <div className="flex items-center mt-4 pt-3 border-t border-line">
          <span className="text-xs font-medium text-primary-dark">
            Read →
          </span>
        </div>
      )}
      {comingSoon && (
        <div className="flex items-center mt-3">
          <HomeIcon id="lock" className="w-3 h-3 text-ink-faint" />
        </div>
      )}
    </div>
  )

  if (comingSoon || !href) return <div>{inner}</div>
  return <Link to={href} className="block h-full">{inner}</Link>
}

export default function ContinueJourney({ t, journey }) {
  const { recentlyViewed, recommended, nextStep } = journey

  return (
    <section>
      <p className="text-primary-dark text-xs font-bold tracking-widest uppercase mb-2">
        Knowledge Center
      </p>
      <h2 className="font-serif font-semibold text-2xl text-ink mb-1">
        {t('home_journey_title')}
      </h2>
      <p className="text-ink-muted text-sm mb-5">
        Build your understanding of Vedic astrology one guide at a time.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
      <div className="mt-4 text-center">
        <Link
          to="/learn"
          className="text-xs text-primary-dark hover:underline font-medium"
        >
          Browse the full Knowledge Center →
        </Link>
      </div>
    </section>
  )
}
