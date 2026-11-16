// frontend/src/hooks/useCurrentLocation.js
//
// Drives the home page's location bar: on first load, tries a saved
// location, then browser geolocation, and otherwise leaves it null so the
// UI can prompt for a manual city instead. Deliberately never falls back
// to the person's BIRTH place — showing Rahu Kaal for a city they were
// born in but don't live in is the exact bug this hook exists to avoid.
import { useState, useEffect, useCallback, useRef } from 'react'
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

  // Bumped by every setManualLocation. A geolocation request started before
  // the latest pick must not overwrite it — the browser's permission prompt
  // can stay open while the person picks a city.
  const pickRef = useRef(0)

  const tryGeolocation = useCallback(async () => {
    const pickAtStart = pickRef.current
    setStatus('requesting')
    try {
      const { lat, lon } = await requestBrowserLocation()
      if (pickRef.current !== pickAtStart) return
      const saved = setCurrentLocation(user?.id, { lat, lon, label: null, source: 'geolocation' })
      setLocation(saved)
      setStatus('ready')
    } catch {
      // Permission denied, timeout, or unsupported — all treated the same:
      // fall through to manual entry rather than showing an error state.
      // A denied browser prompt is routine, not exceptional.
      if (pickRef.current !== pickAtStart) return
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
    // status becomes 'denied' and the home page's location UI offers the manual picker.
    tryGeolocation()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, profile?.current_lat, profile?.current_lon])

  // `source` defaults to 'manual' (a chosen city, which never expires). Pass
  // 'geolocation' for a device fix the person asked for, so it expires like
  // any other fix.
  const setManualLocation = useCallback(({ lat, lon, label, timezone, source = 'manual' }) => {
    pickRef.current += 1
    const saved = setCurrentLocation(user?.id, { lat, lon, label, timezone, source })
    setLocation(saved)
    setStatus('ready')
  }, [user?.id])

  return { location, status, retryGeolocation: tryGeolocation, setManualLocation }
}
