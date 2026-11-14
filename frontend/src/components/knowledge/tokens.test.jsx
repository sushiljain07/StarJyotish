import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import ConceptLink from './ConceptLink'
import ArticleCard from './ArticleCard'
import { readFileSync, readdirSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { colors } from '../../theme/tokens'
import { ratio, composite } from '../../theme/contrastUtil'
import '../../i18n'

const wrap = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>)

describe('knowledge surface tokens (AA)', () => {
  it('ConceptLink light uses primary-ink, dark keeps a night gold', () => {
    wrap(
      <>
        <ConceptLink id="aries">LightLink</ConceptLink>
        <ConceptLink id="aries" tone="dark">DarkLink</ConceptLink>
      </>,
    )
    const light = screen.getByText('LightLink')
    const dark = screen.getByText('DarkLink')
    expect(light.className).toContain('text-primary-ink')
    expect(dark.className).toContain('text-primary-light')
    expect(dark.className).toContain('hover:text-primary-glow')
    expect(dark.className).not.toContain('primary-ink')
  })

  it('ArticleCard featured hover stays a night gold; non-featured uses primary-ink', () => {
    wrap(
      <>
        <ArticleCard featured title="FeatTitle" href="/x" />
        <ArticleCard title="PlainTitle" href="/y" />
      </>,
    )
    expect(screen.getByText('FeatTitle').className).toContain('group-hover:text-primary-glow')
    expect(screen.getByText('FeatTitle').className).not.toContain('primary-ink')
    expect(screen.getByText('PlainTitle').className).toContain('group-hover:text-primary-ink')
  })

  it('a coming-soon ArticleCard keeps full-strength text: no opacity, a dashed border instead', () => {
    const { container } = wrap(
      <ArticleCard comingSoon title="SoonTitle" description="Blurb" badge="Dashas" meta="10 min read" />,
    )
    let el = screen.getByText('Blurb')
    while (el && el !== container) {
      expect(el.className ?? '', 'ancestor of the blurb').not.toMatch(/(^|\s)opacity-\d/)
      el = el.parentElement
    }
    expect(container.firstChild.className).toContain('border-dashed')
    expect(screen.getByText('Dashas').className).toContain('text-primary-ink')
    expect(screen.getByText('10 min read').className).toContain('text-ink-muted')
  })
})

describe('Learn pages keep text at AA (B4)', () => {
  const SRC = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
  const walk = (dir, out = []) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, e.name)
      if (e.isDirectory()) walk(full, out)
      else if (/\.jsx$/.test(e.name) && !/\.test\.jsx$/.test(e.name)) out.push(full)
    }
    return out
  }
  const files = [join(SRC, 'pages/Learn.jsx'), ...walk(join(SRC, 'pages/learn')), ...walk(join(SRC, 'components/knowledge'))]

  it('no plain opacity-* dims a card or its text (hover:/disabled: variants are fine)', () => {
    const hits = []
    for (const f of files) {
      readFileSync(f, 'utf8').split('\n').forEach((line, i) => {
        if (/(^|[\s'"`])opacity-\d/.test(line)) hits.push(`${f.slice(SRC.length + 1)}:${i + 1}`)
      })
    }
    expect(hits).toEqual([])
  })

  it('readable night text uses onnightMuted, not text-ink-onnight/60 (4.37:1)', () => {
    for (const f of ['pages/learn/Zodiac.jsx', 'pages/learn/categories/Nakshatras.jsx']) {
      const src = readFileSync(join(SRC, f), 'utf8')
      expect(src, f).not.toMatch(/text-ink-onnight\/[0-6]\d/)
    }
    expect(ratio(composite(colors.ink.onnight, 0.6, colors.night.DEFAULT), colors.night.DEFAULT)).toBeLessThan(4.5)
    expect(ratio(colors.ink.onnightMuted, colors.night.DEFAULT)).toBeGreaterThanOrEqual(4.5)
    expect(ratio(colors.ink.onnightMuted, composite('#FFFFFF', 0.05, colors.night.DEFAULT))).toBeGreaterThanOrEqual(4.5)
  })
})
