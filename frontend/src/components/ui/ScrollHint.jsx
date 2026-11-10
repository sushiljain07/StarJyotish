import { useCallback, useEffect, useRef, useState } from 'react'

// Wraps a sideways-scrolling region and shows a right-edge fade while there is
// more content off-screen. The fade is decorative only. `fadeFrom` is the
// Tailwind `from-*` colour of the surface behind the region.
export default function ScrollHint({ children, className = '', fadeFrom = 'from-parchment' }) {
  const ref = useRef(null)
  const [more, setMore] = useState(false)

  const update = useCallback(() => {
    const el = ref.current
    if (!el) return
    setMore(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }, [])

  useEffect(() => {
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [update])

  return (
    <div className="relative">
      <div ref={ref} onScroll={update} className={`overflow-x-auto ${className}`}>
        {children}
      </div>
      {more && (
        <div
          data-scroll-fade
          aria-hidden="true"
          className={`pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l ${fadeFrom} to-transparent`}
        />
      )}
    </div>
  )
}
