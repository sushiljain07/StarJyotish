// A failed load must show an error — not a false "KYC verification rejected"
// banner (profile was null, so `kyc_status !== 'pending'`) or a spinner that
// never stops (the profile form was never initialised).
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../contexts/AuthContext', () => ({ useAuth: () => ({ user: { role: 'astrologer' }, accessToken: 't' }) }))
vi.mock('../components/Seo', () => ({ default: () => null }))
vi.mock('../components/AccountMenu', () => ({ default: () => null }))
vi.mock('../api/admin', () => ({
  astrologerGetProfile: vi.fn(),
  astrologerGetEarnings: vi.fn(),
  astrologerGetBookings: vi.fn(),
  astrologerUpdateProfile: vi.fn(),
}))

import * as api from '../api/admin'
import AstrologerDashboard from './AstrologerDashboard'

const PROFILE = {
  name: 'Pandit', phone_number: '+91', kyc_status: 'pending', rating_avg: 4.5, rating_count: 2,
  price_per_session: 500, experience_years: 5, bio: '', specialties: [], languages: [],
}

function renderDashboard() {
  return render(<MemoryRouter><AstrologerDashboard /></MemoryRouter>)
}

beforeEach(() => {
  api.astrologerGetProfile.mockReset()
  api.astrologerGetEarnings.mockReset()
  api.astrologerGetBookings.mockReset()
})

describe('AstrologerDashboard load failures', () => {
  it('overview shows an error, not a KYC-rejected banner', async () => {
    api.astrologerGetProfile.mockRejectedValue(new Error('Server error'))
    api.astrologerGetEarnings.mockRejectedValue(new Error('Server error'))
    renderDashboard()
    expect(await screen.findByRole('alert')).toHaveTextContent(/couldn't load/i)
    expect(screen.queryByText(/KYC verification rejected/)).not.toBeInTheDocument()
  })

  it('profile tab shows an error instead of spinning forever', async () => {
    api.astrologerGetProfile.mockRejectedValue(new Error('Server error'))
    api.astrologerGetEarnings.mockResolvedValue({})
    renderDashboard()
    fireEvent.click(screen.getByRole('button', { name: 'My Profile' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(/couldn't load/i)
  })

  it('bookings tab shows an error', async () => {
    api.astrologerGetProfile.mockResolvedValue(PROFILE)
    api.astrologerGetEarnings.mockResolvedValue({})
    api.astrologerGetBookings.mockRejectedValue(new Error('Server error'))
    renderDashboard()
    fireEvent.click(screen.getByRole('button', { name: 'Bookings' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(/couldn't load/i)
  })

  it('pending KYC still shows the in-progress banner when loading works', async () => {
    api.astrologerGetProfile.mockResolvedValue(PROFILE)
    api.astrologerGetEarnings.mockResolvedValue({ total_earned: 0 })
    renderDashboard()
    expect(await screen.findByText('KYC verification in progress')).toBeInTheDocument()
  })
})
