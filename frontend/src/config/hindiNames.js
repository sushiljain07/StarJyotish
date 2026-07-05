// frontend/src/config/hindiNames.js
//
// English -> Hindi (Devanagari, Roman-transliterated per the existing site
// convention — see tailwind.config.js's note on Fraunces having no
// Devanagari glyphs) names for zodiac signs and planets. Used to show
// "Mesha Lagna (Aries)" instead of just "Aries" on PersonalHome, matching
// how a Vedic astrologer would actually refer to these terms — English
// alone reads as generic Western astrology to anyone raised on Hindi
// astrology terminology.
//
// Deliberately plain data, not i18n keys: these are the same fixed
// transliterations regardless of whether the UI language is English or
// Hindi (i18n/hi.json already handles full-Hindi mode separately), so a
// lookup table is simpler and correct in both cases.

export const SIGN_HINDI = {
  Aries: 'Mesha',
  Taurus: 'Vrishabha',
  Gemini: 'Mithuna',
  Cancer: 'Karka',
  Leo: 'Simha',
  Virgo: 'Kanya',
  Libra: 'Tula',
  Scorpio: 'Vrishchika',
  Sagittarius: 'Dhanu',
  Capricorn: 'Makara',
  Aquarius: 'Kumbha',
  Pisces: 'Meena',
}

export const PLANET_HINDI = {
  Sun: 'Surya',
  Moon: 'Chandra',
  Mars: 'Mangal',
  Mercury: 'Budh',
  Jupiter: 'Guru',
  Venus: 'Shukra',
  Saturn: 'Shani',
  Rahu: 'Rahu',
  Ketu: 'Ketu',
}

// "Mesha (Aries)" — Hindi name leads, since that's how an astrologer says
// it aloud, with the English gloss in parentheses for anyone still
// building their vocabulary. Falls back to the English name alone if the
// lookup ever misses (e.g. an unexpected value from the backend).
export function withHindiSign(englishSign) {
  const hindi = SIGN_HINDI[englishSign]
  return hindi ? `${hindi} (${englishSign})` : englishSign
}

export function withHindiPlanet(englishPlanet) {
  const hindi = PLANET_HINDI[englishPlanet]
  return hindi ? `${hindi} (${englishPlanet})` : englishPlanet
}
