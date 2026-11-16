import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'

vi.mock('../contexts/AuthContext', () => ({ useAuth: () => ({ user: { id: 'u1' } }) }))
vi.mock('../services/astrologyProfiles', () => ({ getPrimaryProfile: () => null }))

import { useCurrentLocation } from './useCurrentLocation'

const KEY = 'sj_current_location_v1:u1'
const geo = fn => Object.defineProperty(navigator, 'geolocation', {
  configurable: true, value: { getCurrentPosition: fn },
})

describe('useCurrentLocation', () => {
  beforeEach(() => localStorage.clear())

  it('a city picked while the permission prompt is open survives a late geolocation answer', async () => {
    let resolve
    geo(ok => { resolve = ok })
    const { result } = renderHook(() => useCurrentLocation())
    await waitFor(() => expect(result.current.status).toBe('requesting'))
    act(() => result.current.setManualLocation({ lat: 18.5, lon: 73.8, label: 'Pune' }))
    await act(async () => { resolve({ coords: { latitude: 1, longitude: 2 } }) })
    expect(result.current.location.label).toBe('Pune')
    expect(result.current.status).toBe('ready')
    const stored = JSON.parse(localStorage.getItem(KEY))
    expect(stored.label).toBe('Pune')
    expect(stored.source).toBe('manual')
  })

  it('a picked city survives a late geolocation failure', async () => {
    let reject
    geo((_ok, fail) => { reject = fail })
    const { result } = renderHook(() => useCurrentLocation())
    await waitFor(() => expect(result.current.status).toBe('requesting'))
    act(() => result.current.setManualLocation({ lat: 18.5, lon: 73.8, label: 'Pune' }))
    await act(async () => { reject(new Error('denied')) })
    expect(result.current.status).toBe('ready')
    expect(result.current.location.label).toBe('Pune')
  })

  it('an explicit retry after a pick still applies the new fix', async () => {
    geo((_ok, fail) => fail(new Error('denied')))
    const { result } = renderHook(() => useCurrentLocation())
    await waitFor(() => expect(result.current.status).toBe('denied'))
    act(() => result.current.setManualLocation({ lat: 18.5, lon: 73.8, label: 'Pune' }))
    geo(ok => ok({ coords: { latitude: 1, longitude: 2 } }))
    await act(async () => { await result.current.retryGeolocation() })
    expect(result.current.location.lat).toBe(1)
    expect(JSON.parse(localStorage.getItem(KEY)).source).toBe('geolocation')
  })

  it('a device fix passed with source geolocation is saved as geolocation, not manual', () => {
    geo((_ok, fail) => fail(new Error('denied')))
    const { result } = renderHook(() => useCurrentLocation())
    act(() => result.current.setManualLocation({ lat: 1, lon: 2, label: null, timezone: 'Asia/Kolkata', source: 'geolocation' }))
    const stored = JSON.parse(localStorage.getItem(KEY))
    expect(stored.source).toBe('geolocation')
    expect(stored.timezone).toBe('Asia/Kolkata')
    expect(localStorage.getItem('sj_current_location_v1:anon')).toBeNull()
  })
})
