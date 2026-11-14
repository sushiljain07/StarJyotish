import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import config from '../../tailwind.config.js'
import { ratio, composite } from './contrastUtil.js'
import { ASHTAKAVARGA_BANDS, ASHTAKAVARGA_BAND_ORDER } from '../config/ashtakavargaBands.js'

const HERE = path.dirname(fileURLToPath(import.meta.url))

const c = config.theme.extend.colors
const fills = ASHTAKAVARGA_BAND_ORDER.map(k => {
  const b = ASHTAKAVARGA_BANDS[k]
  return { k, hex: composite(c[b.token].DEFAULT, b.alpha, c.parchment.card) }
})

describe('ashtakavarga heat-map bands', () => {
  it('class strings match the declared token and alpha', () => {
    for (const b of Object.values(ASHTAKAVARGA_BANDS)) expect(b.cls).toBe(`bg-${b.token}/${Math.round(b.alpha * 100)}`)
  })
  it('adjacent bands differ by at least 1.15:1', () => {
    for (let i = 0; i < fills.length - 1; i++) {
      expect(ratio(fills[i].hex, fills[i + 1].hex), `${fills[i].k} vs ${fills[i + 1].k}`).toBeGreaterThanOrEqual(1.15)
    }
  })
  it('text-ink is at least 4.5:1 on every band', () => {
    for (const f of fills) expect(ratio(c.ink.DEFAULT, f.hex), f.k).toBeGreaterThanOrEqual(4.5)
  })
})

describe('AshtakavargaTable uses the shared bands', () => {
  const src = fs.readFileSync(path.resolve(HERE, '../components/AshtakavargaTable.jsx'), 'utf8')
  it('imports the band constants and has no *-light tint fills', () => {
    expect(src).toContain('ASHTAKAVARGA_BANDS')
    expect(src).not.toMatch(/bg-(good|caution|bad)-light/)
    expect(src).not.toMatch(/bg-bad\/25/)
  })
})
