import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MIN_LG, useMediaQuery } from './useMediaQuery'

afterEach(() => vi.unstubAllGlobals())

describe('useMediaQuery', () => {
  it('reports false without matchMedia', () => {
    vi.stubGlobal('matchMedia', undefined)
    expect(renderHook(() => useMediaQuery(MIN_LG)).result.current).toBe(false)
  })

  it('follows the query as it changes', () => {
    let listener
    vi.stubGlobal('matchMedia', q => ({
      matches: q === MIN_LG,
      addEventListener: (_e, fn) => { listener = fn },
      removeEventListener() {},
    }))
    const { result } = renderHook(() => useMediaQuery(MIN_LG))
    expect(result.current).toBe(true)
    act(() => listener({ matches: false }))
    expect(result.current).toBe(false)
  })
})
