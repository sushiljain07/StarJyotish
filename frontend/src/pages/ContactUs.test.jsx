import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import '../i18n'
import i18n from '../i18n'
import ContactUs from './ContactUs'

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ isAuthenticated: false, isLoading: false, user: null }),
}))

if (!window.matchMedia) {
  window.matchMedia = q => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} })
}

let alertSpy
beforeEach(async () => {
  vi.useFakeTimers()
  alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
  await i18n.changeLanguage('en')
})
afterEach(async () => {
  vi.useRealTimers()
  alertSpy.mockRestore()
  await i18n.changeLanguage('en')
})

const renderPage = () => render(<HelmetProvider><MemoryRouter><ContactUs /></MemoryRouter></HelmetProvider>)

describe('ContactUs WhatsApp notice', () => {
  it('shows an inline status note, never alert()', () => {
    renderPage()
    expect(screen.queryByRole('status')).toBeNull()
    fireEvent.click(screen.getByText(i18n.t('contact_whatsapp_cta')))
    expect(screen.getByRole('status').textContent).toContain(i18n.t('contact_whatsapp_alert'))
    expect(alertSpy).not.toHaveBeenCalled()
  })

  it('can be dismissed', () => {
    renderPage()
    fireEvent.click(screen.getByText(i18n.t('contact_whatsapp_cta')))
    fireEvent.click(screen.getByRole('button', { name: i18n.t('jump_nav_close') }))
    expect(screen.queryByRole('status')).toBeNull()
  })

  it('auto-hides after 8 seconds, and a re-click restarts the timer', () => {
    renderPage()
    const cta = screen.getByText(i18n.t('contact_whatsapp_cta'))
    fireEvent.click(cta)
    act(() => { vi.advanceTimersByTime(5000) })
    fireEvent.click(cta)
    act(() => { vi.advanceTimersByTime(5000) })
    expect(screen.getByRole('status')).toBeTruthy()
    act(() => { vi.advanceTimersByTime(3100) })
    expect(screen.queryByRole('status')).toBeNull()
  })

  it('is in Hindi under hi', async () => {
    await i18n.changeLanguage('hi')
    renderPage()
    fireEvent.click(screen.getByText(i18n.t('contact_whatsapp_cta')))
    expect(screen.getByRole('status').textContent).toContain(i18n.t('contact_whatsapp_alert'))
    expect(screen.getByRole('button', { name: 'बंद करें' })).toBeTruthy()
    expect(i18n.t('contact_whatsapp_alert')).not.toMatch(/[A-Za-z]{4,}/)
  })
})
