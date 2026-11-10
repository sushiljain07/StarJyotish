// frontend/src/components/layout/BottomChromeSpacer.jsx
//
// Mobile-only trailing clearance, rendered as the LAST child of a footer so
// it inherits the footer's background. The fixed bars (BottomNav, raised
// NavBar) overlay whatever is at the true bottom of the page once scrolled
// to the end; padding inside the footer is what keeps its links visible.
import { useBottomChrome } from './useBottomChrome'

export default function BottomChromeSpacer() {
  const { spacerHeight } = useBottomChrome()
  if (spacerHeight === '0px') return null
  return <div className="md:hidden" style={{ height: spacerHeight }} aria-hidden="true" />
}
