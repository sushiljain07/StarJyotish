// frontend/src/components/home/ReflectionPrompt.jsx
// One calm open-ended daily prompt. Redesigned with a subtle night-tinted
// background pill so it reads as an intentional section break, not a
// forgotten paragraph.
import HomeIcon from './HomeIcons'

export default function ReflectionPrompt({ t, reflectionKey }) {
  return (
    <section className="rounded-2xl bg-night px-6 py-8 text-center shadow-lg">
      <HomeIcon id="compass" className="w-5 h-5 text-primary mx-auto mb-4" />
      <p className="font-serif text-xl sm:text-2xl text-primary-light leading-snug max-w-lg mx-auto">
        "{t(reflectionKey)}"
      </p>
    </section>
  )
}
