import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import fs from 'node:fs'
import path from 'node:path'
import '../i18n'
import i18n from '../i18n'
import PaywallCard from './PaywallCard'

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

describe('PaywallCard checkout notice', () => {
  it('shows the coming-soon message inline, never alert()', () => {
    render(<PaywallCard title="T" body="B" />)
    expect(screen.queryByRole('status')).toBeNull()
    fireEvent.click(screen.getByText('Unlock Full Report'))
    expect(screen.getByRole('status').textContent).toContain(
      'Checkout is coming soon — your full report will unlock right here.')
    expect(alertSpy).not.toHaveBeenCalled()
  })

  it('can be dismissed and auto-hides after 8 seconds', () => {
    render(<PaywallCard title="T" body="B" />)
    const btn = screen.getByText('Unlock Full Report')
    fireEvent.click(btn)
    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(screen.queryByRole('status')).toBeNull()
    fireEvent.click(btn)
    act(() => { vi.advanceTimersByTime(8100) })
    expect(screen.queryByRole('status')).toBeNull()
  })

  it('is in Hindi under hi', async () => {
    await i18n.changeLanguage('hi')
    render(<PaywallCard title="T" body="B" />)
    fireEvent.click(screen.getByText(i18n.t('paywall_unlock_btn')))
    expect(screen.getByRole('status').textContent).toContain(
      'चेकआउट जल्द आ रहा है — आपकी पूरी रिपोर्ट यहीं अनलॉक होगी।')
  })
})

describe('no browser alert() in src', () => {
  it('has no alert( call outside tests', () => {
    const hits = []
    const walk = (dir) => {
      for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, e.name)
        if (e.isDirectory()) walk(p)
        else if (/\.(jsx?|tsx?)$/.test(e.name) && !/\.test\./.test(e.name)) {
          if (/(^|[^.\w])(window\.)?alert\(/.test(fs.readFileSync(p, 'utf8'))) hits.push(p)
        }
      }
    }
    walk(path.resolve(process.cwd(), 'src'))
    expect(hits).toEqual([])
  })
})
