// Only the newest request a component started may update its state.
// begin() returns isCurrent() for that request; starting another request,
// or unmounting, makes it stale. Requests are deliberately NOT aborted:
// a report is a paid LLM call the server finishes either way, and letting
// it complete means fetchReport() still caches it for the next visit.
//
// `mounted` is re-set on every mount because React StrictMode (dev) runs
// mount → unmount → mount; clearing the token on unmount would drop a
// request started by the first mount's effect.
import { useCallback, useEffect, useRef } from 'react'

export function useLatestRequest() {
  const current = useRef(null)
  const mounted = useRef(false)

  useEffect(() => {
    mounted.current = true
    return () => { mounted.current = false }
  }, [])

  return useCallback(() => {
    const token = {}
    current.current = token
    return { isCurrent: () => mounted.current && current.current === token }
  }, [])
}
