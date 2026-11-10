// Pure helpers for locale-bundle checks (parity test, and the glossary check).
import { ALLOWED_LATIN } from '../test/expectNoEnglish'

const CATEGORIES = 'zero|one|two|few|many|other'
const PLURAL_RE = new RegExp(`(_ordinal)?_(${CATEGORIES})$`)

export function flatten(obj, prefix = '', out = new Map()) {
  for (const [k, v] of Object.entries(obj ?? {})) {
    const key = prefix ? `${prefix}.${k}` : k
    if (v && typeof v === 'object') flatten(v, key, out)
    else out.set(key, String(v))
  }
  return out
}

export const placeholders = str =>
  [...String(str).matchAll(/\{\{\s*([^}\s,]+)[^}]*\}\}/g)].map(m => m[1]).sort()

export const pluralBase = key => key.replace(PLURAL_RE, '')

const isPlural = key => PLURAL_RE.test(key)

export function scriptViolation(value, scriptRange) {
  let text = String(value).replace(/\{\{[^}]*\}\}/g, ' ')
  for (const re of ALLOWED_LATIN) text = text.replace(re, ' ')
  return /\p{L}/u.test(text) && !scriptRange.test(text)
}

// Compare a locale bundle to the default (en) bundle. A key with a plural
// suffix only joins a plural family when the plain base key does not exist
// (home_chart_title / home_chart_title_other are two ordinary keys).
export function parityProblems(enBundle, otherBundle) {
  const group = bundle => {
    const flat = flatten(bundle)
    const bases = new Map()
    for (const [k, v] of flat) {
      const base = isPlural(k) && !flat.has(pluralBase(k)) ? pluralBase(k) : k
      if (!bases.has(base)) bases.set(base, [])
      bases.get(base).push({ key: k, value: v })
    }
    return bases
  }
  const e = group(enBundle)
  const o = group(otherBundle)
  const missing = [...e.keys()].filter(b => !o.has(b))
  const extra = [...o.keys()].filter(b => !e.has(b))
  // Every plural family needs _other. A one/many pair is two hand-picked keys
  // (bhava_n_shifted), not an i18next plural, so it is exempt.
  const noOther = [...o]
    .filter(([base, items]) => items.length > 1 || items[0].key !== base)
    .filter(([, items]) => !items.some(i => /_other$/.test(i.key)))
    .filter(([, items]) => !items.every(i => /_(one|many)$/.test(i.key)))
    .map(([b]) => b)
  const placeholderMismatch = []
  for (const [base, items] of o) {
    const ref = e.get(base)
    if (!ref) continue
    const refItem = ref.find(i => /_other$/.test(i.key)) ?? ref[0]
    const want = placeholders(refItem.value).join(',')
    for (const i of items) {
      if (placeholders(i.value).join(',') !== want) placeholderMismatch.push(i.key)
    }
  }
  return { missing, extra, noOther, placeholderMismatch }
}
