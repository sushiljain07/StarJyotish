// frontend/src/hooks/useScrollDirection.js
//
// 'up' | 'down' from window scroll. Moves under JITTER_PX are ignored, and
// the result is always 'up' near the top of the page so chrome is never
// hidden there.
import { useEffect, useState } from 'react'

const JITTER_PX = 8
const TOP_ZONE_PX = 120

export function useScrollDirection() {
  const [direction, setDirection] = useState('up')

  useEffect(() => {
    let lastY = window.scrollY
    function onScroll() {
      const y = window.scrollY
      if (y < TOP_ZONE_PX) {
        lastY = y
        setDirection('up')
        return
      }
      if (Math.abs(y - lastY) < JITTER_PX) return
      setDirection(y > lastY ? 'down' : 'up')
      lastY = y
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return direction
}
