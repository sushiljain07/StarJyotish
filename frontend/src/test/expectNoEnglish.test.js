import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import i18n from '../i18n'
import { expectNoEnglish } from './expectNoEnglish'

function html(markup) {
  const div = document.createElement('div')
  div.innerHTML = markup
  return div
}

beforeEach(() => i18n.changeLanguage('hi'))
afterEach(() => i18n.changeLanguage('en'))

describe('expectNoEnglish', () => {
  it('rejects an empty container', () => {
    expect(() => expectNoEnglish(html('<div></div>'))).toThrow(/empty/)
  })
  it('rejects a skeleton with no text', () => {
    expect(() => expectNoEnglish(html('<div><div class="animate-pulse"></div></div>'))).toThrow(/empty/)
  })
  it('allows adjacent KP labels', () => {
    expect(() => expectNoEnglish(html('<p>नमस्ते</p><span>KP</span><span>KP</span>'))).not.toThrow()
  })
  it('allows the brand name split across elements', () => {
    expect(() => expectNoEnglish(html('<p>नमस्ते</p><span>Star Jyotish</span><span>AI</span>'))).not.toThrow()
  })
  it('allows adjacent AM and PM options', () => {
    expect(() => expectNoEnglish(html('<p>नमस्ते</p><option>AM</option><option>PM</option>'))).not.toThrow()
  })
  it('lists English words', () => {
    expect(() => expectNoEnglish(html('<p>नमस्ते Hello</p>'))).toThrow(/Hello/)
  })
  it('ignores style text', () => {
    expect(() => expectNoEnglish(html('<p>नमस्ते</p><style>.x{color:red}</style>'))).not.toThrow()
  })
  it('requires the current script when only allowed Latin is present', () => {
    expect(() => expectNoEnglish(html('<p>PDF</p>'))).toThrow()
  })
  it('skips the script check in English', async () => {
    await i18n.changeLanguage('en')
    expect(() => expectNoEnglish(html('<p>PDF</p>'))).not.toThrow()
  })
})
