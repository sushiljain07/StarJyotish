import { render, screen, act, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import i18n from '../i18n'
import rajyogas from '../test/fixtures/rajyogas_hi.json'

vi.mock('../config/entitlements', () => ({ hasPremiumAccess: () => true }))

import RajyogasTab from './RajyogasTab'

const INPUT = { date: '1990-08-16', time: '19:05', place: 'New Delhi, India' }
const reply = body => ({ ok: true, status: 200, json: async () => body, text: async () => JSON.stringify(body) })
const deferred = () => { let resolve; const promise = new Promise(r => { resolve = r }); return { promise, resolve } }
const EN_BODY = { ...rajyogas, yogas: rajyogas.yogas.map(y => ({ ...y, present: false })) }
let fetchMock

beforeEach(async () => {
  sessionStorage.clear()
  await act(() => i18n.changeLanguage('en'))
  fetchMock = vi.fn()
  vi.stubGlobal('fetch', fetchMock)
})
afterEach(async () => {
  vi.unstubAllGlobals()
  await act(() => i18n.changeLanguage('en'))
})

describe('RajyogasTab language follow', () => {
  it('refetches in the new language', async () => {
    fetchMock.mockResolvedValue(reply(rajyogas))
    render(<RajyogasTab input={INPUT} />)
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))
    await act(() => i18n.changeLanguage('hi'))
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2))
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).language).toBe('en')
    expect(JSON.parse(fetchMock.mock.calls[1][1].body).language).toBe('hi')
    expect(fetchMock.mock.calls[1][0]).toContain('/api/rajyogas')
  })

  it('ignores an English response that arrives after the Hindi one', async () => {
    const en = deferred()
    const hi = deferred()
    fetchMock.mockReturnValueOnce(en.promise).mockReturnValueOnce(hi.promise)
    render(<RajyogasTab input={INPUT} />)
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))
    await act(() => i18n.changeLanguage('hi'))
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2))
    await act(async () => { hi.resolve(reply(rajyogas)) })
    await screen.findByText(i18n.t('rajyogas_title'))
    await act(async () => { en.resolve(reply(EN_BODY)) })
    // The Hindi result (3 present yogas) must still be on screen, not the
    // stale English one (none present).
    expect(screen.queryByText(i18n.t('rajyogas_none'))).toBeNull()
    expect(screen.getByText(rajyogas.yogas.find(y => y.present).yoga)).toBeInTheDocument()
  })
})
