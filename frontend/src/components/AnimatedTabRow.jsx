// frontend/src/components/AnimatedTabRow.jsx
//
// Replaces Result.jsx's old plain tab buttons (instant color swap) with a
// sliding background indicator that animates to the clicked tab — paired
// with the `prediction-fade` class on each tab's content panel (see
// index.css), so switching tabs now reads as one connected motion instead
// of the previous abrupt "hidden" toggle. Measures the active button's
// position via a ref map and animates a single absolutely-positioned
// indicator underneath the (transparent-background) buttons, rather than
// pulling in an animation library — this app has none installed, and one
// element sliding between a handful of fixed buttons doesn't need one.
//
// Two variants, matching the two tab styles already in Result.jsx:
//   - 'underline': the top-level Kundli/Advanced/Insights/Ask row —
//     indicator looks like the active tab's own background+top-border.
//   - 'pill': SubTabBar's filled accent-colored pills.
import { useEffect, useRef, useState } from 'react'

const PILL_ACCENT_BG = {
  primary: 'bg-primary',
  mauve:   'bg-mauve',
  sage:    'bg-sage',
}

const PILL_ACCENT_TEXT = {
  primary: 'text-night',
  mauve:   'text-white',
  sage:    'text-white',
}

export default function AnimatedTabRow({ tabs, active, onChange, renderIcon, variant = 'underline', accent = 'primary', className = '' }) {
  const containerRef = useRef(null)
  const buttonRefs = useRef({})
  const [indicatorStyle, setIndicatorStyle] = useState({ opacity: 0 })

  useEffect(() => {
    const container = containerRef.current
    const activeBtn = buttonRefs.current[active]
    if (!container || !activeBtn) return

    function measure() {
      const containerRect = container.getBoundingClientRect()
      const btnRect = activeBtn.getBoundingClientRect()
      setIndicatorStyle({
        opacity: 1,
        transform: `translate(${btnRect.left - containerRect.left}px, ${btnRect.top - containerRect.top}px)`,
        width: `${btnRect.width}px`,
        height: `${btnRect.height}px`,
      })
    }
    measure()
    // Tab label widths/wrapping can change with viewport, so keep the
    // indicator honest on resize rather than freezing it at the wrong spot.
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [active, tabs])

  const isUnderline = variant === 'underline'

  return (
    <div
      ref={containerRef}
      className={`relative flex gap-1 flex-wrap ${isUnderline ? 'hidden sm:flex mt-1' : 'mb-4'} ${className}`}
    >
      <div
        className={`absolute top-0 left-0 transition-all duration-300 ease-out ${
          isUnderline
            ? 'bg-parchment border-t border-x border-line rounded-t-lg'
            : `${PILL_ACCENT_BG[accent]} rounded-lg shadow-sm`
        }`}
        style={{ ...indicatorStyle, transitionProperty: 'transform, width, height' }}
      />
      {tabs.map(tab => (
        <button
          key={tab.id}
          ref={el => { buttonRefs.current[tab.id] = el }}
          onClick={() => onChange(tab.id)}
          aria-current={active === tab.id ? 'true' : undefined}
          className={
            isUnderline
              ? `relative z-10 whitespace-nowrap px-4 py-1.5 rounded-t-lg text-sm font-medium transition-colors duration-200 inline-flex items-center gap-1.5 ${
                  active === tab.id ? 'text-primary-dark' : 'text-ink-muted hover:text-ink'
                }`
              : `relative z-10 text-xs px-3 py-1.5 rounded-lg border transition-colors duration-200 ${
                  active === tab.id
                    ? `${PILL_ACCENT_TEXT[accent]} font-medium border-transparent`
                    : 'text-ink-muted hover:text-ink border-line hover:border-primary/50'
                }`
          }
        >
          {renderIcon?.(tab)}
          {tab.label}
        </button>
      ))}
    </div>
  )
}
