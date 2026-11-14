// Colours for chart SVGs and inline styles, derived from the Tailwind tokens so
// there is one palette. Where a colour sits in a className, use the Tailwind
// class instead. Planet colours live in config/planetColors.js (separate).
import config from '../../tailwind.config.js'

const c = config.theme.extend.colors

export const chartPalette = Object.freeze({
  paper:      c.parchment.card,
  paperAlt:   c.parchment.DEFAULT,
  ascFill:    c.primary.light,
  line:       c.primary.dark,      // chart frames and lines
  signText:   c.primary.ink,       // sign numbers
  asc:        c.vermillion.DEFAULT, // ascendant stroke and label
  text:       c.ink.DEFAULT,
  muted:      c.ink.muted,
  hairline:   c.line,
  good:       c.good.DEFAULT,
  goodFill:   c.good.light,
  caution:    c.caution.DEFAULT,
  cautionFill: c.caution.light,
  bad:        c.bad.DEFAULT,
  badFill:    c.bad.light,
  sage:       c.sage.DEFAULT,
  gold:       c.primary.DEFAULT,   // decoration only
  night:      c.night.DEFAULT,
  nightLight: c.night.light,
  nightDeep:  c.night.deep,
  onNight:    c.ink.onnight,
})

export function withAlpha(hex, alpha) {
  const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16))
  return `rgba(${r},${g},${b},${alpha})`
}
