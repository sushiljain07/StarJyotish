import { expect } from 'vitest'

// Test-only guardrail: a Hindi-rendered container must hold no English words.
export const ALLOWED_LATIN = [
  /https?:\/\/\S+/g,
  /\b[\w.+-]+@[\w-]+(\.[\w-]+)+\b/g,
  /\bwww\.\S+/g,
  /\bStar Jyotish\b/g,
  /\bD\d+\b/g,
  /\b(AI|KP|PDF|AM|PM|EN)\b/g,
]

export function expectNoEnglish(container, extraAllow = []) {
  const parts = [container.textContent ?? '']
  container.querySelectorAll('[aria-label],[placeholder],[title],[alt]').forEach(el => {
    for (const a of ['aria-label', 'placeholder', 'title', 'alt']) {
      const v = el.getAttribute(a)
      if (v) parts.push(v)
    }
  })
  let text = parts.join('\n')
  for (const extra of extraAllow) {
    text = extra instanceof RegExp
      ? text.replace(new RegExp(extra.source, extra.flags.includes('g') ? extra.flags : extra.flags + 'g'), ' ')
      : text.split(extra).join(' ')
  }
  for (const re of ALLOWED_LATIN) text = text.replace(re, ' ')
  const offenders = [...new Set(text.match(/[A-Za-z]{3,}/g) ?? [])]
  expect(offenders, `English text found: ${offenders.join(', ')}`).toEqual([])
}
