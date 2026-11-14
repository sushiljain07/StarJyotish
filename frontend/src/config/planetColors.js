// One canonical planet palette, built from the colour tokens (theme/tokens.js).
// PLANET_COLORS is AA on parchment.card, parchment.alt and primary.light.
// PLANET_COLORS_NIGHT holds lighter variants of the same hues for night
// surfaces (/home). LORD_COLORS is an alias, so the two maps cannot disagree.
import { colors } from '../theme/tokens.js'

const cap = n => n[0].toUpperCase() + n.slice(1)
const build = tokens => Object.freeze(Object.fromEntries(Object.entries(tokens).map(([n, v]) => [cap(n), v])))

export const PLANET_COLORS = build(colors.planet)
export const PLANET_COLORS_NIGHT = build(colors.planetNight)
export const LORD_COLORS = PLANET_COLORS
