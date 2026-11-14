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
    // A region that mounts inside a display:none tab measures 0 at first;
    // re-measure whenever the region or its content changes size.
    let ro
    const el = ref.current
    if (el && typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(update)
      ro.observe(el)
      if (el.firstElementChild) ro.observe(el.firstElementChild)
    }
    return () => {
      window.removeEventListener('resize', update)
      ro?.disconnect()
    }
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
