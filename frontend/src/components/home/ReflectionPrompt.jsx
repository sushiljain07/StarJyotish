// frontend/src/components/home/ReflectionPrompt.jsx
// A daily contemplative prompt. Styled like the Knowledge Center's
// Reflection component (serif italic, mauve accent, centered card).
export default function ReflectionPrompt({ t, reflectionKey }) {
  return (
    <div className="bg-parchment-card border border-line rounded-2xl px-6 py-8 text-center">
      <p className="text-mauve text-xs font-bold tracking-widest uppercase mb-4">
        Daily Reflection
      </p>
      <p className="font-serif italic text-xl sm:text-2xl text-ink leading-snug max-w-lg mx-auto">
        "{t(reflectionKey)}"
      </p>
    </div>
  )
}
