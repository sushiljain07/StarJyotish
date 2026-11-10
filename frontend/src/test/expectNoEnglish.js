import { expect } from 'vitest'
import { currentLanguage, languageEntry } from '../i18n/languages'

// Test-only guardrail: a Hindi-rendered container must hold no English words.
export const ALLOWED_LATIN = [
  /https?:\/\/\S+/g,
  /\b[\w.+-]+@[\w-]+(\.[\w-]+)+\b/g,
  /\bwww\.\S+/g,
  /\bStar Jyotish\b/g,
  /\bD\d+\b/g,
  /\b(AI|KP|PDF|AM|PM|EN)\b/g,
]

export function expectNoEnglish(container, extraAllow = [], { script } = {}) {
  // <style>/<script> text is in textContent but not on screen.
  const visible = container.cloneNode(true)
  visible.querySelectorAll('style,script').forEach(el => el.remove())

  // Text nodes are joined with a space so adjacent elements never fuse into one word.
  const parts = []
  const walker = document.createTreeWalker(visible, NodeFilter.SHOW_TEXT)
  while (walker.nextNode()) parts.push(walker.currentNode.nodeValue)
  const textOnly = parts.join(' ')
  expect(textOnly.trim(), 'container is empty — still loading?').not.toBe('')

  const range = script ?? languageEntry(currentLanguage()).scriptRange
  if (range) expect(textOnly, `no text in the ${currentLanguage()} script`).toMatch(range)

  visible.querySelectorAll('[aria-label],[placeholder],[title],[alt]').forEach(el => {
    for (const a of ['aria-label', 'placeholder', 'title', 'alt']) {
      const v = el.getAttribute(a)
      if (v) parts.push(v)
    }
  })
  let text = parts.join(' ')
  for (const extra of extraAllow) {
    text = extra instanceof RegExp
      ? text.replace(new RegExp(extra.source, extra.flags.includes('g') ? extra.flags : extra.flags + 'g'), ' ')
      : text.split(extra).join(' ')
  }
  for (const re of ALLOWED_LATIN) text = text.replace(re, ' ')
  const offenders = [...new Set(text.match(/[A-Za-z]{3,}/g) ?? [])]
  expect(offenders, `English text found: ${offenders.join(', ')}`).toEqual([])
}
