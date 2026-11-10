import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import i18n from '../../i18n'
import PhoneOtpForm from './PhoneOtpForm'

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({ loginWithPhone: vi.fn().mockRejectedValue(new Error('Bad code')) }),
}))
vi.mock('../../api/auth', () => ({ sendOtp: vi.fn().mockResolvedValue({}) }))

describe('PhoneOtpForm accessibility', () => {
  it('associates the identifier label with its input', () => {
    render(<PhoneOtpForm />)
    const input = screen.getByLabelText(i18n.t('login_email_label', 'Email address'))
    expect(input.tagName).toBe('INPUT')
    expect(input).toHaveAttribute('autocomplete', 'email')
    expect(input).toHaveAttribute('name')
  })

  it('labels the OTP input, sets one-time-code, and announces errors via aria-describedby', async () => {
    render(<PhoneOtpForm />)
    fireEvent.change(screen.getByLabelText(i18n.t('login_email_label', 'Email address')), { target: { value: 'a@b.co' } })
    fireEvent.submit(screen.getByLabelText(i18n.t('login_email_label', 'Email address')).closest('form'))
    const otp = await screen.findByLabelText(i18n.t('login_code_label'))
    expect(otp).toHaveAttribute('autocomplete', 'one-time-code')
    expect(otp).toHaveAttribute('name', 'otp')
    fireEvent.change(otp, { target: { value: '123' } })
    fireEvent.submit(otp.closest('form'))
    const alert = await waitFor(() => screen.getByRole('alert'))
    expect(alert).toHaveTextContent('Bad code')
    expect(otp).toHaveAttribute('aria-describedby', alert.id)
  })
})
