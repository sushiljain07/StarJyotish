// frontend/src/components/GlobalScrollToTop.jsx
//
// Mounted once in App.jsx, outside <Routes> (like ScrollManager.jsx),
// so the button persists across every page without each page needing to
// wire up its own sentinel/visibility logic. See hooks/
// useWindowScrolledPast.js for why this replaced the old per-page
// (Landing.jsx, PersonalHome.jsx) instances of ScrollToTop.jsx.
import ScrollToTop from './ScrollToTop'
import { useWindowScrolledPast } from '../hooks/useWindowScrolledPast'

export default function GlobalScrollToTop() {
  const visible = useWindowScrolledPast()
  return <ScrollToTop visible={visible} />
}
