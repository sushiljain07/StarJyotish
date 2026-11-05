// Devanagari needs its own font stack and must not inherit Latin tracking or
// uppercase. CSS keys these rules on the <html data-script> attribute, never
// on a language code, so a future Bengali or Tamil entry gets them for free.
import { fileURLToPath } from 'node:url'
import { readFileSync } from 'node:fs'
import { afterAll, describe, expect, it } from 'vitest'
import tailwindConfig from '../../tailwind.config.js'
import i18n from './index'

const read = rel => readFileSync(fileURLToPath(new URL(rel, import.meta.url)), 'utf8')

const indexHtml = read('../../index.html')
const indexCss = read('../index.css')

// Returns the declaration block of the rule whose selector is exactly `selector`.
function ruleBody(css, selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = css.match(new RegExp(`${escaped}\\s*\\{([^}]*)\\}`))
  return match ? match[1] : null
}

describe('Devanagari web fonts', () => {
  it('loads Noto Sans Devanagari and Tiro Devanagari Hindi from Google Fonts', () => {
    expect(indexHtml).toContain('Noto+Sans+Devanagari')
    expect(indexHtml).toContain('Tiro+Devanagari+Hindi')
    expect(indexHtml).toContain('display=swap')
  })

  it('falls back to Noto Sans Devanagari in the sans stack', () => {
    expect(tailwindConfig.theme.extend.fontFamily.sans).toContain('Noto Sans Devanagari')
  })

  it('falls back to Tiro Devanagari Hindi in the serif stack', () => {
    expect(tailwindConfig.theme.extend.fontFamily.serif).toContain('Tiro Devanagari Hindi')
  })
})

describe('script-keyed typography rules', () => {
  it('defaults the static <html> to the Latin script', () => {
    expect(indexHtml).toMatch(/<html[^>]*data-script="latn"/)
  })

  it('removes letter-spacing from tracking- classes outside Latin', () => {
    const body = ruleBody(indexCss, 'html:not([data-script="latn"]) [class*="tracking-"]')
    expect(body).not.toBeNull()
    expect(body).toMatch(/letter-spacing:\s*0\s*!important/)
  })

  it('removes uppercase transform outside Latin', () => {
    const body = ruleBody(indexCss, 'html:not([data-script="latn"]) .uppercase')
    expect(body).not.toBeNull()
    expect(body).toMatch(/text-transform:\s*none/)
  })

  it('uses no language-keyed selectors', () => {
    expect(indexCss).not.toContain(':lang(hi)')
  })
})

describe('data-script follows the active language', () => {
  afterAll(async () => {
    await i18n.changeLanguage('en')
  })

  it('sets data-script to deva after switching to Hindi', async () => {
    await i18n.changeLanguage('hi')
    expect(document.documentElement.dataset.script).toBe('deva')
  })
})
