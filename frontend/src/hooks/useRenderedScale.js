import { useLayoutEffect, useState } from 'react'

// Chart SVGs draw in a fixed viewBox (e.g. 500 units) and are scaled to fit
// their container. On a 360px phone a 500-unit chart renders at ~296px, so a
// 15-unit label shows at ~9px. This hook reports that scale: rendered width
// divided by the viewBox width. It is 1 until the first measurement, and
// stays 1 where ResizeObserver does not exist (jsdom).
export function useRenderedScale(ref, viewBoxWidth) {
  const [scale, setScale] = useState(1)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el || typeof ResizeObserver === 'undefined') return undefined
    const ro = new ResizeObserver(entries => {
      const width = entries[0]?.contentRect?.width
      // A hidden chart (display:none tab) reports 0: keep the last scale.
      if (!(width > 0)) return
      // Two decimals avoid re-rendering on sub-pixel changes. Round down, so
      // sizes derived from the scale never render below their minimum.
      setScale(Math.floor((width / viewBoxWidth) * 100) / 100)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [ref, viewBoxWidth])

  return scale
}

// The font size, in viewBox units, that renders at least `minPx` CSS pixels.
export function legibleSize(base, scale, minPx) {
  return Math.max(base, minPx / scale)
}

// Below this scale the degree superscripts are hidden (the Planets table
// carries the degrees) and status markers become a full-size suffix.
export const COMPACT_SCALE = 0.75
