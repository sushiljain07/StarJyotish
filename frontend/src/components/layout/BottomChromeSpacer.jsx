// frontend/src/components/layout/BottomChromeSpacer.jsx
//
// Trailing clearance, rendered as the LAST child of a footer so it inherits the
// footer's background. On a phone the fixed bars (BottomNav, NavBar)
// overlay whatever is at the true bottom of the page once scrolled to the end,
// and the floating ScrollToTop button hovers just above them: padding inside
// the footer is what keeps its links visible. Below xl the button can still
// sit over the footer's right edge (no bars on marketing pages, or md+ widths
// where the footer reaches the screen edge), so a button-height strip stays.
import { useBottomChrome } from './useBottomChrome'

export default function BottomChromeSpacer() {
  const { footerClearance, hasFab } = useBottomChrome()
  // md+: no bars, but the Ask FAB (md:bottom-6, 3.25rem pill) still floats over
  // the page end, so reserve pill + offset + gap, at xl too. Without the FAB,
  // keep the ScrollToTop strip below xl.
  const md = hasFab ? 'md:h-[5.5rem]' : 'md:h-16 xl:hidden'
  return (
    <div
      className={`h-[var(--chrome-clear)] ${md}`}
      style={{ '--chrome-clear': footerClearance }}
      aria-hidden="true"
    />
  )
}
