// frontend/src/components/Reveal.jsx
//
// Wraps a section/card so it fades and slides up into place the first time
// it scrolls into view. `delay` (ms) lets sibling items stagger slightly —
// used for the topic cards and the "what's inside" grid. Respects
// prefers-reduced-motion via Tailwind's motion-reduce: variant: motion is
// skipped but the content still renders (never permanently hidden).
import { useInView } from '../hooks/useInView'

export default function Reveal({ as: Tag = 'div', delay = 0, className = '', children }) {
  const [ref, inView] = useInView()

  return (
    <Tag
      ref={ref}
      className={`transition-all duration-700 ease-out motion-reduce:transition-none motion-reduce:transform-none ${
        inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      } ${className}`}
      style={{ transitionDelay: inView ? `${delay}ms` : '0ms' }}
    >
      {children}
    </Tag>
  )
}
