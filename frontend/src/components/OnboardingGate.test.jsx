// A returning user on a new device has no local profile cache; the gate
// must ask the server before sending them to onboarding (where re-entering
// details used to overwrite their saved profile).
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../contexts/AuthContext', () => ({ useAuth: () => ({ user: { id: 'u1' }, accessToken: 'tok' }) }))
vi.mock('../services/astrologyProfiles', () => ({
  hasAnyProfile: vi.fn(),
  hasSkippedOnboarding: vi.fn(),
  loadProfiles: vi.fn(),
}))

import * as profiles from '../services/astrologyProfiles'
import OnboardingGate from './OnboardingGate'

function renderGate() {
  return render(
    <MemoryRouter initialEntries={['/home']}>
      <Routes>
        <Route path="/home" element={<OnboardingGate><div>HOME</div></OnboardingGate>} />
        <Route path="/onboarding" element={<div>ONBOARDING</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  profiles.hasAnyProfile.mockReturnValue(false)
  profiles.hasSkippedOnboarding.mockReturnValue(false)
  profiles.loadProfiles.mockReset()
})

describe('OnboardingGate', () => {
  it('lets a user with a locally cached profile through without a server call', () => {
    profiles.hasAnyProfile.mockReturnValue(true)
    renderGate()
    expect(screen.getByText('HOME')).toBeInTheDocument()
    expect(profiles.loadProfiles).not.toHaveBeenCalled()
  })

  it('new device: server has a profile → home, not onboarding', async () => {
    profiles.loadProfiles.mockResolvedValue([{ id: 'p1' }])
    renderGate()
    expect(await screen.findByText('HOME')).toBeInTheDocument()
    expect(profiles.loadProfiles).toHaveBeenCalledWith({ id: 'u1' }, 'tok')
  })

  it('no profile anywhere → onboarding', async () => {
    profiles.loadProfiles.mockResolvedValue([])
    renderGate()
    expect(await screen.findByText('ONBOARDING')).toBeInTheDocument()
  })

  it('server unreachable → onboarding (fails open to the safe default)', async () => {
    profiles.loadProfiles.mockRejectedValue(new Error('offline'))
    renderGate()
    expect(await screen.findByText('ONBOARDING')).toBeInTheDocument()
  })
})
