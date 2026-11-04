import { describe, expect, it } from 'vitest'
import { removeLegacyStorage } from './legacyCleanup'

describe('removeLegacyStorage', () => {
  it('deletes WhatsApp numbers saved by the removed opt-in', () => {
    localStorage.setItem('starjyotish_wa', '{"number":"9"}')
    removeLegacyStorage()
    expect(localStorage.getItem('starjyotish_wa')).toBeNull()
  })
})
