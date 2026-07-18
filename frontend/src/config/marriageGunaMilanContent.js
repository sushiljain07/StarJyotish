// frontend/src/config/marriageGunaMilanContent.js
export const HERO = {
  title: 'Guna Milan: What the Compatibility Score Actually Means',
  subtitle: 'Guna Milan is the most widely used compatibility system in Vedic astrology — a 36-point scoring system based on eight categories. Understanding what each category measures, and what a score actually indicates, is far more useful than the number alone.',
}
export const QUICK_FACTS = [
  { label: 'System name', value: 'Ashtakoot Milan (eight-category matching)' },
  { label: 'Total points', value: '36 maximum' },
  { label: 'Basis', value: 'Birth Nakshatras (Moon\'s lunar mansions) of both partners' },
  { label: 'Minimum threshold', value: '18/36 traditionally considered acceptable' },
]
export const EIGHT_KOOTS = {
  eyebrow: 'The Eight Categories',
  title: 'What each Koot actually measures',
  items: [
    { koot: 'Varna (1 point)', measures: 'Spiritual compatibility and ego alignment; whether the two people\'s approach to life purpose and caste archetype are harmonious. Often the least practically significant in modern reading.' },
    { koot: 'Vashya (2 points)', measures: 'Natural influence and control dynamics between the two Nakshatras\' corresponding zodiac types. Which sign tends to have natural influence over the other.' },
    { koot: 'Tara (3 points)', measures: 'Natal star compatibility — whether the partner\'s Nakshatra is in a supportive position (3, 5, 7 stars away) from one\'s own. Related to health and general fortune in the relationship.' },
    { koot: 'Yoni (4 points)', measures: 'Sexual compatibility and physical nature harmony. Each Nakshatra is associated with a specific animal symbol; certain animals are natural pairs (friendly Yoni), others are incompatible (enemy Yoni).' },
    { koot: 'Graha Maitri (5 points)', measures: 'Mental compatibility — whether the Moon sign rulers of both partners are friendly, neutral, or enemy to each other. One of the higher-weighted and more practically significant categories.' },
    { koot: 'Gana (6 points)', measures: 'Nature compatibility — whether both partners share Gana (Deva/divine, Manushya/human, Rakshasa/fierce). Same-Gana pairs score highest; Deva-Manushya is generally acceptable; Deva-Rakshasa the most challenging.' },
    { koot: 'Bhakoot (7 points)', measures: 'Family welfare and financial compatibility — based on the numerical relationship between the two Moon signs. Certain Moon sign combinations (2-12, 5-9, 6-8) score zero and are traditionally considered most problematic.' },
    { koot: 'Nadi (8 points)', measures: 'Physiological and hereditary compatibility — related to ayurvedic body type (Vata, Pitta, Kapha). Same Nadi (both Adi, or both Madhya, or both Antya) traditionally scores zero and is considered the most serious incompatibility. Also related to progeny considerations.' },
  ],
}
export const WHAT_SCORE_MEANS = {
  eyebrow: 'Understanding the Score',
  title: 'What different scores actually indicate',
  paragraphs: [
    'A score of 36/36 is theoretically possible but extraordinarily rare. A score of 30 or above is considered excellent. 24–30 is very good. 18–24 is acceptable — the traditional threshold below which a match is said to warrant careful additional consideration. Below 18 is traditionally considered inadvisable without mitigating factors.',
    'However, these thresholds describe statistical tendencies in the Nakshatra-based system, not the full chart. A score of 26/36 between two people whose full charts complement each other beautifully is a much stronger compatibility indicator than a score of 30/36 between people with severely conflicting 7th house lords or incompatible Dashas.',
    'The most heavily weighted categories (Nadi, Bhakoot, Gana) deserve special attention. A zero on Nadi is traditionally the most serious Dosha in Guna Milan, and experienced astrologers typically flag it even when the overall score is otherwise good. Conversely, some astrologers also note that a low Nadi score combined with otherwise very high scores can sometimes be mitigated by other chart factors.',
  ],
}
export const FAQ = [
  { question: 'We scored 17/36 — should we not get married?', answer: 'Guna Milan is a starting point for analysis, not a verdict. A score of 17 is below the traditional threshold and warrants attention — but the full chart analysis (7th house, 7th lord, Venus/Jupiter, D9) and the Dasha timing for both partners together give a far more complete picture. Many happily married couples have low Guna Milan scores; many couples with high scores still face relationship challenges. Use the score as a lens, not a lock.' },
  { question: 'What is Nadi Dosha and how serious is it?', answer: 'Nadi Dosha occurs when both partners share the same Nadi (Adi, Madhya, or Antya) — the Nakshatra group associated with ayurvedic body type and hereditary constitution. Classical texts list it as the most serious Dosha in Guna Milan, associated with health challenges and progeny difficulties. Cancellation conditions exist: when both partners share the same Nakshatra, or when the lord of each Nakshatra is the same planet, or when the Moon signs are different despite the same Nadi.' },
  { question: 'Is Guna Milan based on birth Nakshatra or Moon sign?', answer: 'Guna Milan is based on the birth Nakshatra (Janma Nakshatra) — the specific lunar mansion occupied by the Moon at birth. The Moon sign is a component of this (you can\'t have a Nakshatra without a sign), but the matching system uses the 27-Nakshatra framework rather than the 12-sign framework. This is why two people with the same Moon sign but different Nakshatras (e.g., both with Moon in Scorpio but one in Vishakha and one in Jyeshtha) will have different Guna Milan results.' },
]
export const CTA = { eyebrow: 'Star Jyotish', title: 'Find Your Birth Nakshatra', description: 'Guna Milan requires knowing both partners\' exact birth Nakshatras. Generate your free Kundli to see your Janma Nakshatra — then compare with your partner\'s for Ashtakoot scoring.', buttonLabel: 'Generate My Free Kundli' }
