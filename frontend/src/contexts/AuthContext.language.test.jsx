import { render, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import '../i18n'
import i18n from 'i18next'
import { LANG_STORAGE_KEY, LANG_SOURCE_KEY } from '../i18n'

// Like the real api/auth: a successful refresh is announced to listeners.
const listeners = new Set()
let profileLanguage = 'hi'
vi.mock('../api/auth', () => ({
  verifyOtp: vi.fn(), loginWithGoogle: vi.fn(),
  refreshSession: vi.fn(() => {
    const data = { access_token: 't', user: { id: 'u', preferred_language: profileLanguage } }
    listeners.forEach(fn => fn(data))
    return Promise.resolve(data)
  }),
  onSessionRefreshed: fn => { listeners.add(fn); return () => listeners.delete(fn) },
  logout: vi.fn(() => Promise.resolve()),
  updateProfile: vi.fn(() => Promise.resolve({})), sendPhoneLinkOtp: vi.fn(), verifyPhoneLinkOtp: vi.fn(),
  sendEmailLinkOtp: vi.fn(), verifyEmailLinkOtp: vi.fn(),
}))

import { updateProfile } from '../api/auth'
import { AuthProvider } from './AuthContext'

async function signIn({ device, source, profile }) {
  localStorage.clear()
  await i18n.changeLanguage(device ?? 'en')  // the device is already showing it
  localStorage.clear()
  if (device) localStorage.setItem(LANG_STORAGE_KEY, device)
  if (source) localStorage.setItem(LANG_SOURCE_KEY, source)
  profileLanguage = profile
  updateProfile.mockClear()
  render(<AuthProvider><div /></AuthProvider>)
  await waitFor(() => expect(updateProfile).toBeDefined())
  await new Promise(r => setTimeout(r, 20))
}

describe('AuthProvider language sync', () => {
  beforeEach(() => { listeners.clear() })

  it('applies the profile language when nothing is saved (c)', async () => {
    await signIn({ profile: 'hi' })
    await waitFor(() => expect(i18n.language).toBe('hi'))
    expect(localStorage.getItem(LANG_SOURCE_KEY)).toBe('profile')
  })

  it('keeps a user-chosen device language and pushes it to the profile (a)', async () => {
    await signIn({ device: 'hi', source: 'user', profile: 'en' })
    expect(i18n.language).toBe('hi')
    expect(updateProfile).toHaveBeenCalledTimes(1)
    expect(updateProfile.mock.calls[0][1]).toEqual({ preferred_language: 'hi' })
  })

  it('treats a saved language with no source as user-chosen (b)', async () => {
    await signIn({ device: 'hi', profile: 'en' })
    expect(i18n.language).toBe('hi')
    expect(updateProfile).toHaveBeenCalledTimes(1)
  })

  it('lets the profile win over a profile-sourced device language (d)', async () => {
    await signIn({ device: 'en', source: 'profile', profile: 'hi' })
    await waitFor(() => expect(i18n.language).toBe('hi'))
    expect(updateProfile).not.toHaveBeenCalled()
  })

  it('does not touch the profile when it already matches (e)', async () => {
    await signIn({ device: 'hi', source: 'user', profile: 'hi' })
    expect(i18n.language).toBe('hi')
    expect(updateProfile).not.toHaveBeenCalled()
  })
})
