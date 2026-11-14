import { render, screen, fireEvent, act } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

const auth = vi.hoisted(() => ({ value: {} }))
vi.mock('../contexts/AuthContext', () => ({ useAuth: () => auth.value }))

import '../i18n'
import ProtectedRoute from './ProtectedRoute'

function renderAt() {
  return render(
    <MemoryRouter initialEntries={['/account']}>
      <Routes>
        <Route path="/login" element={<div>login page</div>} />
        <Route path="/account" element={<ProtectedRoute><div>secret</div></ProtectedRoute>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('ProtectedRoute', () => {
  it('shows a reconnect state with retry, and stays put, when the session is unreachable', () => {
    const retrySession = vi.fn()
    auth.value = { isAuthenticated: false, loading: false, sessionError: 'unreachable', retrySession }
    renderAt()
    expect(screen.queryByText('login page')).toBeNull()
    fireEvent.click(screen.getByRole('button'))
    expect(retrySession).toHaveBeenCalledTimes(1)
  })

  it('keeps the reconnect block up, with a busy retry button, while a retry runs', async () => {
    let finish
    const retrySession = vi.fn(() => new Promise(r => { finish = r }))
    auth.value = { isAuthenticated: false, loading: false, sessionError: 'unreachable', retrySession }
    renderAt()
    const btn = screen.getByRole('button')
    await act(async () => { fireEvent.click(btn) })
    expect(screen.getByRole('button')).toBeDisabled()
    expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true')
    fireEvent.click(screen.getByRole('button'))
    expect(retrySession).toHaveBeenCalledTimes(1)
    await act(async () => { finish() })
    expect(screen.getByRole('button')).not.toBeDisabled()
  })

  it('still redirects signed-out users to /login', () => {
    auth.value = { isAuthenticated: false, loading: false, sessionError: null, retrySession: vi.fn() }
    renderAt()
    expect(screen.getByText('login page')).toBeTruthy()
  })

  it('renders children when authenticated', () => {
    auth.value = { isAuthenticated: true, loading: false, sessionError: null, retrySession: vi.fn() }
    renderAt()
    expect(screen.getByText('secret')).toBeTruthy()
  })
})
