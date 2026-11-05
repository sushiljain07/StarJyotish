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

// Panchang names the backend sends in English (tithi, yoga, karana, masa,
// paksha). The locale files hold <kind>_<Name>; an unknown name is shown as
// itself, and a missing one stays missing.
export const panchangName = (t, kind, name) =>
  (name ? t(`${kind}_${name}`, { defaultValue: name }) : name)

// "Total Lunar Eclipse (Chandra Grahan)" is built from the eclipse's type and
// kind (the backend sends both beside the English name).
export const eclipseName = (t, eclipse) => {
  if (!eclipse?.type || !eclipse?.kind) return eclipse?.name
  return t(`eclipse_${eclipse.type}`, {
    defaultValue: eclipse.name,
    kind: t(`eclipse_kind_${eclipse.kind}`, { defaultValue: eclipse.kind }),
  })
}

// The backend formats dates as "03 Mar 2026" (day, English short month, year);
// the month comes from the locale files (month_short_jan ... month_short_dec),
// so English reads exactly as sent and other languages are localized.
const MONTH_KEYS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
export function localizeBackendDate(t, text) {
  const m = /^(\d{1,2}) ([A-Za-z]{3}) (\d{4})$/.exec(text ?? '')
  const key = m ? MONTH_KEYS[['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'].indexOf(m[2].toLowerCase())] : null
  if (!key) return text
  return `${m[1]} ${t(`month_short_${key}`)} ${m[3]}`
}
