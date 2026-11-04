import { render, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import '../i18n'
import i18n from 'i18next'

// Like the real api/auth: a successful refresh is announced to listeners.
const listeners = new Set()
vi.mock('../api/auth', () => ({
  verifyOtp: vi.fn(), loginWithGoogle: vi.fn(),
  refreshSession: vi.fn(() => {
    const data = { access_token: 't', user: { id: 'u', preferred_language: 'hi' } }
    listeners.forEach(fn => fn(data))
    return Promise.resolve(data)
  }),
  onSessionRefreshed: fn => { listeners.add(fn); return () => listeners.delete(fn) },
  logout: vi.fn(() => Promise.resolve()),
  updateProfile: vi.fn(), sendPhoneLinkOtp: vi.fn(), verifyPhoneLinkOtp: vi.fn(),
  sendEmailLinkOtp: vi.fn(), verifyEmailLinkOtp: vi.fn(),
}))

import { AuthProvider } from './AuthContext'

describe('AuthProvider language sync', () => {
  it('applies the profile language when the session resumes', async () => {
    render(<AuthProvider><div /></AuthProvider>)
    await waitFor(() => expect(i18n.language).toBe('hi'))
  })
})
