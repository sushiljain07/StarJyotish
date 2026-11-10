// frontend/src/components/layout/BottomChromeSpacer.jsx
//
// Trailing clearance, rendered as the LAST child of a footer so it inherits the
// footer's background. On a phone the fixed bars (BottomNav, raised NavBar)
// overlay whatever is at the true bottom of the page once scrolled to the end,
// and the floating ScrollToTop button hovers just above them: padding inside
// the footer is what keeps its links visible. Below xl the button can still
// sit over the footer's right edge (no bars on marketing pages, or md+ widths
// where the footer reaches the screen edge), so a button-height strip stays.
import { useBottomChrome } from './useBottomChrome'

export default function BottomChromeSpacer() {
  const { footerClearance } = useBottomChrome()
  return (
    <div
      className="h-[var(--chrome-clear)] md:h-14 xl:hidden"
      style={{ '--chrome-clear': footerClearance }}
      aria-hidden="true"
    />
  )
}
