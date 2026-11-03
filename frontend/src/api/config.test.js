import { describe, expect, it } from 'vitest'
import { normalizeApiBase } from './config'

describe('normalizeApiBase', () => {
  it('adds https:// to a scheme-less host (the Phase 0 production bug)', () => {
    expect(normalizeApiBase('api.example.up.railway.app')).toBe('https://api.example.up.railway.app')
  })
  it('keeps an explicit scheme and strips trailing slashes', () => {
    expect(normalizeApiBase('http://localhost:8000/')).toBe('http://localhost:8000')
    expect(normalizeApiBase('https://x.app//')).toBe('https://x.app')
  })
  it('empty stays empty (dev proxy)', () => {
    expect(normalizeApiBase('')).toBe('')
    expect(normalizeApiBase(undefined)).toBe('')
  })
})
