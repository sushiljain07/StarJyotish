// frontend/src/config/concepts.js
//
// Dictionary for ConceptLink.jsx — every astrology term guides can
// cross-reference inline ("Moon Sign", "Ascendant", "Nakshatra", ...).
// `href: null` means no dedicated page exists for that concept yet;
// ConceptLink renders those with a consistent "coming soon" treatment
// instead of a dead link. The moment a real page ships for a concept,
// updating this one entry makes every existing <ConceptLink id="..."/>
// across the whole app a live link — no call site has to change.
export const CONCEPTS = {
  zodiac:      { label: 'Zodiac Signs', href: '/learn/zodiac' },
  aries:       { label: 'Mesha (Aries)', href: '/learn/zodiac/aries' },
  'moon-sign': { label: 'Moon Sign',    href: null },
  ascendant:   { label: 'Ascendant',    href: null },
  nakshatra:   { label: 'Nakshatra',    href: null },
  dasha:       { label: 'Dasha',        href: null },
  planets:     { label: 'Planets',      href: null },
  houses:      { label: 'Houses',       href: null },
  yoga:        { label: 'Yoga',         href: null },
  dosha:       { label: 'Dosha',        href: null },
  mars:        { label: 'Mars (Mangal)', href: null },
  venus:       { label: 'Venus (Shukra)', href: null },
}

export function getConcept(id) {
  return CONCEPTS[id] ?? null
}
