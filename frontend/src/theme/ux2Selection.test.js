import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { chartPalette as P } from './chartPalette.js'
import { colors } from './tokens.js'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const read = rel => fs.readFileSync(path.resolve(HERE, '..', rel), 'utf8')

describe('UX2 gold selection', () => {
  const tab = read('components/AnimatedTabRow.jsx')
  it('AnimatedTabRow has no accent maps; selected pill is bg-primary text-night', () => {
    expect(tab).not.toMatch(/bg-(sage|mauve)/)
    expect(tab).not.toMatch(/PILL_ACCENT/)
    expect(tab).toContain('bg-primary')
    expect(tab).toContain('text-night')
  })
  it('callers no longer pass an accent', () => {
    for (const f of ['pages/Result.jsx', 'pages/Insights.jsx', 'components/SectionJumpNav.jsx']) {
      expect(read(f), f).not.toMatch(/accent="(sage|mauve)"/)
    }
  })
})

describe('Result and Insights have no inline colour literals', () => {
  for (const f of ['pages/Result.jsx', 'pages/Insights.jsx']) {
    it(f, () => {
      const src = read(f)
      expect(src).not.toMatch(/style=\{\{[^}]*(color|background|borderColor)\s*:\s*['"]/)
      expect(src).not.toMatch(/rgba?\(\s*\d/)
      expect(src).not.toMatch(/#[0-9a-fA-F]{6}\b/)
    })
  }
})

describe('Sarvatobhadra natal / transit colours', () => {
  const src = read('components/SarvatobhadraChakra.jsx')
  it('chartPalette has natal and transit keys derived from tokens', () => {
    expect(P.transit).toBe(colors.planet.saturn)
    expect(P.natal).toBe(colors.mauve.DEFAULT)
  })
  it('markers and legend do not use status tokens', () => {
    expect(src).toContain('P.natal')
    expect(src).toContain('P.transit')
    expect(src).not.toMatch(/P\.(good|caution|goodFill|cautionFill)\b/)
    expect(src).not.toMatch(/bg-(good|caution)/)
    expect(src).not.toMatch(/border-(good|caution)/)
  })
})

describe('selection is always gold', () => {
  const walk = (dir, out = []) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, e.name)
      if (e.isDirectory()) walk(full, out)
      else if (/\.jsx$/.test(e.name) && !/\.test\.jsx$/.test(e.name)) out.push(full)
    }
    return out
  }
  const files = [...walk(path.resolve(HERE, '../components')), ...walk(path.resolve(HERE, '../pages'))]
  it('no bg-mauve / bg-sage (solid) fill sits on a selected or active state', () => {
    const hits = []
    for (const f of files) {
      fs.readFileSync(f, 'utf8').split('\n').forEach((line, i) => {
        const solid = /(?<![\w-])bg-(mauve|sage)(?![\w/-])/.test(line.replace(/bar: '[^']*'/, ''))
        if (solid && /(active|selected|aria-current|isActive)/i.test(line)) hits.push(`${path.basename(f)}:${i + 1}`)
      })
    }
    expect(hits).toEqual([])
  })
  it('no inline backgroundColor is chosen by a selected or active state', () => {
    const hits = []
    const re = /(active|selected|isActive|current)\w*\s*(===?|!==?)[^?\n]*\?\s*\{[^}]*\bbackground(Color)?\s*:/i
    for (const f of files) {
      const src = fs.readFileSync(f, 'utf8')
      src.split('\n').forEach((line, i) => { if (re.test(line)) hits.push(`${path.basename(f)}:${i + 1}`) })
    }
    expect(hits).toEqual([])
  })
  it('Ashtakavarga planet sub-tabs select gold, like Sarva; any planet cue is an aria-hidden dot', () => {
    const src = read('components/AshtakavargaTable.jsx')
    expect(src.match(/\? 'bg-primary border-primary text-night'/g)).toHaveLength(2)
    expect(src).not.toMatch(/'text-white border-transparent'/)
    expect(src).toMatch(/<span aria-hidden="true" className="[^"]*\bw-2 h-2 rounded-full/)
  })
  it('SectionJumpNav trigger and selected item use bg-primary text-night', () => {
    const src = read('components/SectionJumpNav.jsx')
    expect(src).toMatch(/active === s\.id \? 'bg-primary text-night/)
    expect(src).toMatch(/rounded-full bg-primary text-night/)
    expect(src).not.toMatch(/bg-mauve/)
  })
  it('CareerReportPreview mock selected tab is gold; DashaTable levels all select gold', () => {
    expect(read('components/landing/CareerReportPreview.jsx')).toContain("i === 0 ? 'bg-primary text-night'")
    expect(read('components/DashaTable.jsx').match(/active: 'bg-primary'/g)).toHaveLength(3)
  })
})
