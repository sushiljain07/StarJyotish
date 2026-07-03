// frontend/src/components/knowledge/Reflection.jsx
//
// A reflective prompt — asks the reader something about their own chart or
// experience, rather than telling them a fact (that's what Callout is
// for). Styled deliberately differently from Callout: serif italic like a
// pull-quote, mauve accent (already the app's "insight" tab color, see
// tailwind.config.js), no left-border block treatment, so the two never
// get visually confused when they appear near each other in a guide.
export default function Reflection({ title = 'Reflect', children }) {
  return (
    <div className="bg-parchment-card border border-line rounded-2xl px-6 py-6 my-8 text-center">
      <p className="text-mauve text-xs font-bold tracking-widest uppercase mb-3">{title}</p>
      <p className="font-serif italic text-lg sm:text-xl text-ink leading-snug max-w-xl mx-auto">{children}</p>
    </div>
  )
}
