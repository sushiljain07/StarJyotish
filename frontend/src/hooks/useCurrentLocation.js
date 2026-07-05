// frontend/src/hooks/useCurrentLocation.js
//
// Drives the home page's location bar: on first load, tries a saved
// location, then browser geolocation, and otherwise leaves it null so the
// UI can prompt for a manual city instead. Deliberately never falls back
// to the person's BIRTH place — showing Rahu Kaal for a city they were
// born in but don't live in is the exact bug this hook exists to avoid.
import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import {
  getCurrentLocation, setCurrentLocation, isLocationStale, requestBrowserLocation,
} from '../services/currentLocation'

export function useCurrentLocation() {
  const { user } = useAuth()
  const [location, setLocation] = useState(() => getCurrentLocation(user?.id))
  const [status, setStatus] = useState('idle') // idle | requesting | denied | ready

  const tryGeolocation = useCallback(async () => {
    setStatus('requesting')
    try {
      const { lat, lon } = await requestBrowserLocation()
      const saved = setCurrentLocation(user?.id, { lat, lon, label: null, source: 'geolocation' })
      setLocation(saved)
      setStatus('ready')
    } catch {
      // Permission denied, timeout, or unsupported — all treated the same:
      // fall through to manual entry rather than showing an error state.
      // A denied browser prompt is routine, not exceptional.
      setStatus('denied')
    }
  }, [user?.id])

  useEffect(() => {
    const saved = getCurrentLocation(user?.id)
    if (saved && !isLocationStale(saved)) {
      setLocation(saved)
      setStatus('ready')
      return
    }
    // Stale or missing — ask the browser once automatically. If that fails,
    // status becomes 'denied' and LocationBar shows the manual picker.
    tryGeolocation()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  const setManualLocation = useCallback(({ lat, lon, label }) => {
    const saved = setCurrentLocation(user?.id, { lat, lon, label, source: 'manual' })
    setLocation(saved)
    setStatus('ready')
  }, [user?.id])

  return { location, status, retryGeolocation: tryGeolocation, setManualLocation }
}
