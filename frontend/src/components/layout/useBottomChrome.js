// frontend/src/components/layout/useBottomChrome.js
//
// One source of truth for the fixed bars at the bottom of a phone screen:
// the app BottomNav (signed in, every page but /kundli), Result.jsx's NavBar
// on /kundli (the one bottom bar there, at the true bottom edge) and
// AskPersonaPanel's floating button. NavBar's `raised` mode (stacked above
// BottomNav) is still supported here but no page uses it now.
// Each of those components registers itself while it actually renders
// (useChromeRegistration), so pages that have a Footer but no BottomNav get no
// phantom clearance. Heights come from CSS variables in index.css
// (--bottom-nav-h, --sub-nav-h, --safe-bottom). BottomChromeSpacer,
// ScrollToTop and the Ask FAB all use `spacerHeight`.
import { useEffect, useSyncExternalStore } from 'react'

// Phone-size height of the button in components/home/AskPersonaPanel.jsx
// (w-12 h-12 below sm). Keep in sync.
export const FAB_HEIGHT = '3rem'

const counts = { bottomNav: 0, fab: 0, subNav: 0, raisedSubNav: 0 }
let snapshot = { ...counts }
const listeners = new Set()

function change(name, delta) {
  counts[name] += delta
  snapshot = { ...counts }
  listeners.forEach(l => l())
}
const subscribe = l => { listeners.add(l); return () => listeners.delete(l) }
const getSnapshot = () => snapshot

// Call from a component that renders a fixed bottom bar / FAB while `active`.
// names: 'bottomNav' | 'fab' | 'subNav' | 'raisedSubNav'
export function useChromeRegistration(names, active = true) {
  const key = [].concat(names).join(',')
  useEffect(() => {
    if (!active) return undefined
    const list = key.split(',')
    list.forEach(n => change(n, 1))
    return () => list.forEach(n => change(n, -1))
  }, [key, active])
}

export function useBottomChrome() {
  const s = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
  const bottomNav = s.bottomNav > 0
  const subNav = s.subNav > 0
  const raisedSubNav = s.raisedSubNav > 0
  const hasFab = s.fab > 0

  let spacerHeight = '0px'
  if (bottomNav) {
    spacerHeight = 'calc(var(--bottom-nav-h) + var(--safe-bottom) + 1rem'
      + (raisedSubNav ? ' + var(--sub-nav-h))' : ')')
  } else if (subNav) {
    spacerHeight = 'calc(var(--sub-nav-h) + var(--safe-bottom))'
  }
  // Footer content must also end above whichever floating button shows: the
  // Ask FAB (FAB_HEIGHT plus a 0.75rem gap, and ScrollToTop is then not
  // rendered) or else ScrollToTop, 0.75rem over the bars and 2.75rem tall.
  // Keep in sync with ScrollToTop.jsx.
  const sttReach = hasFab ? `${FAB_HEIGHT} + 0.75rem` : '3.5rem'
  const footerClearance = spacerHeight === '0px'
    ? `calc(${sttReach})`
    : `calc(${spacerHeight} + ${sttReach})`
  return { bottomNav, subNav, raisedSubNav, hasFab, spacerHeight, footerClearance }
}
