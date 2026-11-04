// Localized astrological names. The data lives in the locale files
// (planets.*, signs.*, nakshatras.*, planet_abbr.*); nothing here knows a
// language. An unknown name is shown as itself.
export const planetName = (t, name) => t(`planets.${name}`, { defaultValue: name })
export const signName = (t, name) => t(`signs.${name}`, { defaultValue: name })
export const nakshatraName = (t, name) => t(`nakshatras.${name}`, { defaultValue: name })
// Three-letter (en) or full (hi) planet form for small badges.
export const planetShort = (t, name) =>
  t(`planet_short.${name}`, { defaultValue: String(name ?? '').slice(0, 3) })
// Lagna is passed as 'Ascendant'.
export const planetAbbr = (t, name) =>
  t(`planet_abbr.${name}`, { defaultValue: String(name ?? '').slice(0, 2) })
