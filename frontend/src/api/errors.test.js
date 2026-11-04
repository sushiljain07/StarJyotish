import { describe, it, expect, beforeAll } from 'vitest'
import i18n from '../i18n'
import en from '../i18n/en.json'
import hi from '../i18n/hi.json'
import { errorFromResponse } from './errors'

const resp = (status, body) => new Response(JSON.stringify(body), { status })

describe('errorFromResponse', () => {
  beforeAll(() => i18n.changeLanguage('en'))

  it('replaces a 503 with the translated AI-busy message (English)', async () => {
    const e = await errorFromResponse(resp(503, { detail: 'OpenRouter HTTP 401 x-api-key' }), 'fallback')
    expect(e.message).toBe(en.ai_unavailable)
    expect(e.status).toBe(503)
  })

  it('replaces a 503 with the Hindi message when the UI is in Hindi', async () => {
    await i18n.changeLanguage('hi')
    const e = await errorFromResponse(resp(503, { detail: 'busy' }), 'fallback')
    expect(e.message).toBe(hi.ai_unavailable)
    await i18n.changeLanguage('en')
  })

  it('keeps the server detail for other errors', async () => {
    const e = await errorFromResponse(resp(400, { detail: 'Place not found' }), 'fallback')
    expect(e.message).toBe('Place not found')
    expect(e.status).toBe(400)
  })

  it('uses the fallback when the body has no string detail', async () => {
    const e = await errorFromResponse(new Response('not json', { status: 500 }), 'fallback')
    expect(e.message).toBe('fallback')
    const v = await errorFromResponse(resp(422, { detail: [{ msg: 'x' }] }), 'fallback')
    expect(v.message).toBe('fallback')
  })
})
