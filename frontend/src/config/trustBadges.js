// frontend/src/config/trustBadges.js
//
// Single source of truth for the 4 trust badge i18n keys used in both
// Footer.jsx and Landing.jsx. Previously defined separately in each file —
// extracting here ensures a change to the badge copy only needs to happen
// once.
export const TRUST_BADGE_KEYS = [
  'landing_badge_accuracy',
  'landing_badge_free',
  'landing_badge_bilingual',
  'landing_badge_ai',
]
