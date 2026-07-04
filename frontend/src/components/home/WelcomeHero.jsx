// frontend/src/components/home/WelcomeHero.jsx
// Greets the user from the dark hero band. Text is light since it sits
// on the night background introduced in SJ-009's home redesign.
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
    <div className="py-4">
      <h1 className="font-serif font-semibold text-3xl sm:text-4xl text-primary-light tracking-tight">
        {firstName ? `${greeting}, ${firstName}` : greeting}
      </h1>
      <p className="text-ink-onnight/80 text-sm sm:text-base mt-2">{t('home_hero_subtext')}</p>
    </div>
  )
}
