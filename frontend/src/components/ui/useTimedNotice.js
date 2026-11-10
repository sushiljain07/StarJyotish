import { useCallback, useEffect, useRef, useState } from 'react'

// Show/hide state for an inline notice that hides itself after `ms`.
// Calling show() again restarts the timer; it is cleared on unmount.
export default function useTimedNotice(ms = 8000) {
  const [visible, setVisible] = useState(false)
  const timer = useRef(null)
  const clear = () => { if (timer.current) { clearTimeout(timer.current); timer.current = null } }
  const hide = useCallback(() => { clear(); setVisible(false) }, [])
  const show = useCallback(() => {
    clear()
    setVisible(true)
    timer.current = setTimeout(() => { timer.current = null; setVisible(false) }, ms)
  }, [ms])
  useEffect(() => clear, [])
  return { visible, show, hide }
}
