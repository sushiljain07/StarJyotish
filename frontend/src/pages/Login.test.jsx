import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import i18n from '../i18n'
import en from '../i18n/en.json'

const google = vi.hoisted(() => ({ GOOGLE_ENABLED: false, GOOGLE_CLIENT_ID: '' }))
vi.mock('../config/google', () => google)
vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ isAuthenticated: false, user: null, loginWithPhone: vi.fn() }),
}))
vi.mock('../api/auth', () => ({ sendOtp: vi.fn() }))
vi.mock('../components/auth/GoogleLoginButton', () => ({ default: () => <div data-testid="google-btn" /> }))

import Login from './Login'

const renderLogin = () => render(<HelmetProvider><MemoryRouter><Login /></MemoryRouter></HelmetProvider>)

beforeEach(async () => {
  google.GOOGLE_ENABLED = false
  await i18n.changeLanguage('en')
})

describe('Login', () => {
  it('shows the privacy line exactly once', () => {
    renderLogin()
    expect(screen.getAllByText(en.login_disclaimer)).toHaveLength(1)
  })

  it('renders no Google button or "or" divider without a client id', () => {
    google.GOOGLE_ENABLED = false
    renderLogin()
    expect(screen.queryByTestId('google-btn')).toBeNull()
    expect(screen.queryByText(en.login_or)).toBeNull()
  })

  it('renders the Google button and divider when enabled', () => {
    google.GOOGLE_ENABLED = true
    renderLogin()
    expect(screen.getByTestId('google-btn')).toBeInTheDocument()
    expect(screen.getByText(en.login_or)).toBeInTheDocument()
  })
})
