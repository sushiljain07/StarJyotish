// frontend/src/components/AnimatedTabRow.jsx
//
// Two variants:
//   - 'underline': top-level Kundli/Advanced/Insights/Ask row.
//     Sliding background indicator that looks like the active tab's
//     own card background + top-border.
//   - 'pill': SubTabBar's filled accent-colored pills. Horizontally
//     scrollable on mobile to accommodate up to 6 labels.
//
// Indicator positioning uses offsetLeft/offsetTop (container-relative)
// rather than getBoundingClientRect (viewport-relative) so it stays
// correct inside scrollable or sticky containers.
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

export default function AnimatedTabRow({
  tabs, active, onChange, renderIcon,
  variant = 'underline', accent = 'primary', className = ''
}) {
  const containerRef = useRef(null)
  const buttonRefs  = useRef({})
  const [indicatorStyle, setIndicatorStyle] = useState({ opacity: 0 })

  useEffect(() => {
    const activeBtn = buttonRefs.current[active]
    if (!activeBtn) return

    function measure() {
      // offsetLeft/offsetTop are relative to offsetParent (the container
      // div with position:relative), so they're unaffected by page scroll
      // or the container's own horizontal scroll position.
      setIndicatorStyle({
        opacity:   1,
        transform: `translate(${activeBtn.offsetLeft}px, ${activeBtn.offsetTop}px)`,
        width:     `${activeBtn.offsetWidth}px`,
        height:    `${activeBtn.offsetHeight}px`,
      })
    }

    measure()

    // For pill rows (horizontal scroll): scroll the active pill into
    // view within the row — inline only, never touch vertical page scroll.
    if (variant === 'pill') {
      activeBtn.scrollIntoView?.({ block: 'nearest', inline: 'nearest' })
    }

    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [active, tabs, variant])

  const isUnderline = variant === 'underline'

  return (
    <div
      ref={containerRef}
      className={`relative flex gap-1 ${
        isUnderline
          ? 'flex-wrap hidden sm:flex mt-1'
          : 'flex-nowrap overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
      } ${className}`}
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
              : `relative z-10 shrink-0 whitespace-nowrap text-xs px-3 py-1.5 rounded-lg border transition-colors duration-200 ${
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
