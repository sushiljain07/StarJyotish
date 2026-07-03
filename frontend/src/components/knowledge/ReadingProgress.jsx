// frontend/src/components/knowledge/ReadingProgress.jsx
//
// Sticky top-of-viewport progress bar showing how far down the page the
// reader has scrolled. Generalized from the one-off version that used to
// live inline in BlogArticle.jsx (see git history) — same DOM-direct
// width update (avoids a re-render on every scroll tick), just pulled out
// so every future guide page gets it via KnowledgeLayout instead of
// copy-pasting the effect again.
//
// Deliberately writes to style.width via a ref instead of React state:
// this fires on every scroll frame, and routing that through setState
// would re-render the whole tree that many times a second for a single
// pixel-width change nothing else on the page needs to know about.
import { useEffect, useRef } from 'react'

export default function ReadingProgress({ color = 'bg-primary' }) {
  const barRef = useRef(null)

  useEffect(() => {
    function update() {
      const el = barRef.current
      if (!el) return
      const scrollable = document.documentElement.scrollHeight - window.innerHeight
      const pct = scrollable > 0 ? Math.min(100, Math.max(0, (window.scrollY / scrollable) * 100)) : 0
      el.style.width = `${pct}%`
    }
    update() // correct immediately if the page mounts already scrolled
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  return (
    <div className="fixed top-0 left-0 right-0 h-0.5 bg-line z-50" aria-hidden="true">
      <div ref={barRef} className={`h-full ${color} transition-none`} style={{ width: '0%' }} />
    </div>
  )
}
