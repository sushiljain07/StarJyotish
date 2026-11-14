// Ashtakavarga heat-map bands. Stepped fills so adjacent bands differ in luminance (>= 1.15:1 over
// parchment-card) while bold ink text stays >= 4.5:1. Class strings are literal so Tailwind keeps them.
// `alpha` must match the class; src/theme/ashtakavargaBands.test.js checks the numbers.
export const ASHTAKAVARGA_BANDS = {
  strong: { cls: 'bg-good/20', token: 'good', alpha: 0.2 },
  average: { cls: 'bg-caution/30', token: 'caution', alpha: 0.3 },
  weak: { cls: 'bg-bad/40', token: 'bad', alpha: 0.4 },
  veryWeak: { cls: 'bg-bad/50', token: 'bad', alpha: 0.5 },
}
// Bands in order, strongest first (adjacent pairs are what the contrast test compares).
export const ASHTAKAVARGA_BAND_ORDER = ['strong', 'average', 'weak', 'veryWeak']
