// frontend/src/hooks/useCurrentLocation.js
//
// Drives the home page's location bar: on first load, tries a saved
// location, then browser geolocation, and otherwise leaves it null so the
// UI can prompt for a manual city instead. Deliberately never falls back
// to the person's BIRTH place — showing Rahu Kaal for a city they were
// born in but don't live in is the exact bug this hook exists to avoid.
import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { getPrimaryProfile } from '../services/astrologyProfiles'
import {
  getCurrentLocation, setCurrentLocation, isLocationStale, requestBrowserLocation,
} from '../services/currentLocation'

export function useCurrentLocation() {
  const { user } = useAuth()
  // Current location lives on the astrology profile (see db/models/
  // birth_profile.py), not the user account — it's "where the person
  // this chart belongs to is right now," which only makes sense in the
  // context of a profile, and there's only ever one per account.
  const profile = getPrimaryProfile(user)
  const profileLocation = (profile?.current_lat != null && profile?.current_lon != null)
    ? { lat: profile.current_lat, lon: profile.current_lon, label: profile.current_location_label, source: 'profile' }
    : null

  const [location, setLocation] = useState(() => profileLocation ?? getCurrentLocation(user?.id))
  const [status, setStatus] = useState(profileLocation ? 'ready' : 'idle') // idle | requesting | denied | ready

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
    // The profile's saved location (signup or the profile page's edit
    // form) wins whenever it's present — it's the person's deliberate,
    // cross-device choice, not a one-off per-browser geolocation grant.
    if (profileLocation) {
      setLocation(profileLocation)
      setStatus('ready')
      return
    }
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
  }, [user?.id, profile?.current_lat, profile?.current_lon])

  const setManualLocation = useCallback(({ lat, lon, label }) => {
    const saved = setCurrentLocation(user?.id, { lat, lon, label, source: 'manual' })
    setLocation(saved)
    setStatus('ready')
  }, [user?.id])

  return { location, status, retryGeolocation: tryGeolocation, setManualLocation }
}
