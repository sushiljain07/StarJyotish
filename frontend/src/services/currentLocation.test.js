import { describe, it, expect, beforeEach } from 'vitest'
import { getCurrentLocation, isLocationStale } from './currentLocation'

const H13 = 13 * 3600e3

describe('isLocationStale', () => {
  it('never expires a manual city', () => {
    expect(isLocationStale({ source: 'manual', savedAt: Date.now() - H13 })).toBe(false)
  })
  it('expires a geolocation fix after 12 hours', () => {
    expect(isLocationStale({ source: 'geolocation', savedAt: Date.now() - H13 })).toBe(true)
  })
})

describe('getCurrentLocation', () => {
  beforeEach(() => localStorage.clear())

  it('a manual city saved signed-out is copied to the user key on first read after sign-in', () => {
    const manual = { lat: 1, lon: 2, label: 'Pune', timezone: 'Asia/Kolkata', source: 'manual', savedAt: 5 }
    localStorage.setItem('sj_current_location_v1:anon', JSON.stringify(manual))
    expect(getCurrentLocation('u1')).toEqual(manual)
    expect(JSON.parse(localStorage.getItem('sj_current_location_v1:u1'))).toEqual(manual)
    expect(localStorage.getItem('sj_current_location_v1:anon')).toBeNull()
  })

  it('does not overwrite an existing user entry with the anon one', () => {
    const mine = { lat: 9, lon: 9, source: 'manual', savedAt: 1 }
    localStorage.setItem('sj_current_location_v1:u1', JSON.stringify(mine))
    localStorage.setItem('sj_current_location_v1:anon', JSON.stringify({ lat: 1, lon: 2, source: 'manual', savedAt: 5 }))
    expect(getCurrentLocation('u1')).toEqual(mine)
  })

  it('does not copy anon for the anon key itself', () => {
    expect(getCurrentLocation(null)).toBeNull()
  })
})
