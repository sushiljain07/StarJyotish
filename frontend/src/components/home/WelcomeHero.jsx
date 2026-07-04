// frontend/src/components/home/WelcomeHero.jsx
//
// The page's opening line — a greeting, not a hero banner. Deliberately
// quiet compared to the public pages' dark celestial hero (Landing.jsx,
// the old Home.jsx): this is a returning user's workspace, not a first
// impression, so the same constellation motif reappears here only as a
// faint watermark rather than a full dark band.
import CelestialBackdrop from '../CelestialBackdrop'

function greetingKeyFor(date = new Date()) {
  const hour = date.getHours()
  if (hour < 5) return 'home_greeting_night'
  if (hour < 12) return 'home_greeting_morning'
  if (hour < 17) return 'home_greeting_afternoon'
  if (hour < 21) return 'home_greeting_evening'
  return 'home_greeting_night'
}

export default function WelcomeHero({ t, name }) {
  const greeting = t(greetingKeyFor())
  const firstName = name?.split(' ')[0]

  return (
    <div className="relative overflow-hidden rounded-2xl -mx-1">
      <CelestialBackdrop className="text-primary/[0.08]" />
      <div className="relative py-2">
        <h1 className="font-serif font-semibold text-3xl sm:text-4xl text-ink tracking-tight">
          {firstName ? `${greeting}, ${firstName}` : greeting}
        </h1>
        <p className="text-ink-muted text-sm sm:text-base mt-2">{t('home_hero_subtext')}</p>
      </div>
    </div>
  )
}
