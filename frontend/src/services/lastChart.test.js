import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('./astrologyProfiles', () => ({ getPrimaryProfile: vi.fn(() => null) }))

import { getPrimaryProfile } from './astrologyProfiles'
import { saveLastChart, loadLastChart, resolveChartState } from './lastChart'

const A = { data: { id: 'a' }, input: { date: '1990-08-16', time: '19:05', place: 'Delhi' } }
const B = { data: { id: 'b' }, input: { date: '1985-01-01', time: '06:00', place: 'Pune' } }

afterEach(() => { vi.restoreAllMocks(); sessionStorage.clear(); getPrimaryProfile.mockReturnValue(null) })

describe('lastChart', () => {
  it('round-trips the last chart', () => {
    saveLastChart(A)
    expect(loadLastChart()).toEqual(A)
  })

  it('router state wins over the saved chart', () => {
    saveLastChart(A)
    expect(resolveChartState({ ...B, activeTab: 'analysis' }, null)).toEqual({ ...B, activeTab: 'analysis' })
  })

  it('falls back to the saved chart when there is no router state', () => {
    saveLastChart(A)
    expect(resolveChartState(undefined, null)).toEqual(A)
  })

  it('falls back to the primary profile, then null', () => {
    getPrimaryProfile.mockReturnValue({ chart: { id: 'p' }, label: 'Asha', birth_date: '1990-08-16', birth_time: '19:05', place: 'Delhi' })
    expect(resolveChartState(undefined, { id: 'u1' })).toEqual({
      data: { id: 'p' }, input: { name: 'Asha', date: '1990-08-16', time: '19:05', place: 'Delhi' },
    })
    getPrimaryProfile.mockReturnValue(null)
    expect(resolveChartState(undefined, { id: 'u1' })).toBeNull()
  })

  it('survives blocked storage', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked') })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked') })
    expect(() => saveLastChart(A)).not.toThrow()
    expect(loadLastChart()).toBeNull()
    expect(resolveChartState(undefined, null)).toBeNull()
  })
})
