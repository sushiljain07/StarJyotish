// frontend/src/components/home/ReflectionPrompt.jsx
//
// One calm, open-ended prompt — explicitly not a horoscope or prediction.
// Which prompt shows is picked deterministically by day-of-year (see
// config/homeData.js's getReflectionKey), so it's stable across a single
// day's visits without needing any storage, and simply different tomorrow.
import HomeIcon from './HomeIcons'

export default function ReflectionPrompt({ t, reflectionKey }) {
  return (
    <section className="text-center py-8 px-4">
      <HomeIcon id="compass" className="w-5 h-5 text-primary-dark mx-auto mb-3" />
      <p className="font-serif text-xl sm:text-2xl text-ink leading-snug max-w-lg mx-auto">
        “{t(reflectionKey)}”
      </p>
    </section>
  )
}
