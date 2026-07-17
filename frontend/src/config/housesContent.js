// frontend/src/config/housesContent.js
//
// All copy for /learn/houses — hub page for the 12 Bhavas.

export const HOUSES_HERO = {
  title: 'The 12 Houses (Bhavas)',
  subtitle:
    'The houses are where astrology gets personal. While planets describe energies and signs describe styles, houses tell you which areas of life those energies play out in — your career, relationships, health, wealth, and everything else.',
}

export const WHAT_ARE_HOUSES = {
  eyebrow: 'The Foundation',
  title: 'What the houses actually represent',
  paragraphs: [
    'In Vedic astrology, the birth chart is divided into 12 houses (Bhavas) — one for each sign, anchored by your Ascendant. The first house begins at your Ascendant: the degree of the zodiac rising on the eastern horizon at the moment of your birth. This is why time of birth is so critical in Vedic astrology — even a difference of four minutes shifts the Ascendant (and therefore all 12 houses) by one degree.',
    'Each house governs a distinct domain of life: the 1st house governs the self and body, the 7th governs marriage and partnerships, the 10th governs career and public reputation. A planet placed in a house activates that house\'s themes — and the sign on the house cusp and the planet ruling that sign (the house lord) add further layers of interpretation.',
    'One of the most distinctive features of Vedic chart reading is that planets aspect houses — not just other planets. Saturn, for example, has special aspects to the 3rd, 7th, and 10th houses from wherever it sits. This means a planet placed in the 1st house is simultaneously influencing the 7th house through its direct opposition aspect, shaping themes in both simultaneously.',
  ],
  didYouKnow: {
    title: 'Did you know?',
    body: 'Houses in Vedic astrology are classified by quality: Kendras (angular houses: 1, 4, 7, 10) are the strongest positions; Trikonas (trine houses: 1, 5, 9) are the most auspicious; Dusthanas (difficult houses: 6, 8, 12) are associated with adversity and transformation. A planet in a Kendra and Trikona is doubly powerful — which is the principle behind Raj Yoga formations.',
  },
}

export const HOUSES = [
  {
    number: 1,
    name: 'Ascendant (Lagna)',
    sanskrit: 'Tanu Bhava',
    governs: 'Self, body, personality, vitality, early childhood, general outlook',
    keywords: 'Identity · Appearance · Health · Beginning',
    description: 'The most important house in the chart. Sets the frame for all other houses and is the primary indicator of physical constitution and overall life direction.',
  },
  {
    number: 2,
    name: 'Second House',
    sanskrit: 'Dhana Bhava',
    governs: 'Wealth, accumulated assets, family, speech, face, food, values',
    keywords: 'Money · Speech · Family · Values',
    description: 'Governs what you accumulate — not earned income (that\'s the 11th) but accumulated wealth, savings, and material security. Also governs voice and communication quality.',
  },
  {
    number: 3,
    name: 'Third House',
    sanskrit: 'Sahaja Bhava',
    governs: 'Siblings, short journeys, communication, courage, skills, hands',
    keywords: 'Siblings · Courage · Skills · Short Travel',
    description: 'The house of initiative and effort. Younger siblings, writing, media, short trips, and the courage to act on one\'s own behalf. A strong 3rd house supports self-effort.',
  },
  {
    number: 4,
    name: 'Fourth House',
    sanskrit: 'Sukha Bhava',
    governs: 'Mother, home, property, happiness, emotional foundation, vehicles',
    keywords: 'Home · Mother · Happiness · Roots',
    description: 'The house of inner contentment and roots. Governs the mother, the home environment, real estate, emotional security, and the foundation on which a person\'s inner life rests.',
  },
  {
    number: 5,
    name: 'Fifth House',
    sanskrit: 'Putra Bhava',
    governs: 'Children, creativity, intelligence, romance, education, speculation, past life merit',
    keywords: 'Children · Creativity · Intelligence · Romance',
    description: 'One of the most auspicious houses (a Trikona). Governs children, creative output, romantic love, and earned merit from past actions (Purva Punya). Strong 5th house indicators tend toward good fortune.',
  },
  {
    number: 6,
    name: 'Sixth House',
    sanskrit: 'Ripu Bhava',
    governs: 'Health, enemies, service, debts, disputes, competition, illness',
    keywords: 'Health · Enemies · Service · Obstacles',
    description: 'One of the three Dusthana (difficult) houses. Governs adversity, but also the capacity to overcome it. A strong 6th house can indicate both significant challenges and a powerful ability to defeat them.',
  },
  {
    number: 7,
    name: 'Seventh House',
    sanskrit: 'Yuvati Bhava',
    governs: 'Marriage, partnerships, business partners, open enemies, public dealings',
    keywords: 'Marriage · Partnership · Contracts · The Other',
    description: 'The house of the other person in any significant relationship — romantic partner, business partner, or open adversary. Directly opposite the Ascendant, making it the primary relationship axis.',
  },
  {
    number: 8,
    name: 'Eighth House',
    sanskrit: 'Mrityu Bhava',
    governs: 'Longevity, inheritance, transformation, occult, sudden events, hidden matters',
    keywords: 'Transformation · Longevity · Hidden · Inheritance',
    description: 'One of the three Dusthana houses. Governs death, rebirth, and transformation — which makes it the house of the most significant changes a life will contain. Also governs other people\'s money, inheritance, and hidden knowledge.',
  },
  {
    number: 9,
    name: 'Ninth House',
    sanskrit: 'Dharma Bhava',
    governs: 'Dharma, father, guru, higher education, long journeys, luck, religion',
    keywords: 'Dharma · Luck · Wisdom · Father',
    description: 'The most auspicious house in the chart (the strongest Trikona, called the Bhagya Sthana or "fortune house"). Governs luck, the father, teachers and gurus, higher learning, pilgrimage, and one\'s adherence to dharmic principles.',
  },
  {
    number: 10,
    name: 'Tenth House',
    sanskrit: 'Karma Bhava',
    governs: 'Career, status, reputation, authority, government, public life, actions in the world',
    keywords: 'Career · Reputation · Authority · Actions',
    description: 'The strongest angular house (Kendra) and the primary indicator of career, public life, and one\'s capacity to impact the world. The planet ruling the 10th house and any planet placed there significantly shape career themes.',
  },
  {
    number: 11,
    name: 'Eleventh House',
    sanskrit: 'Labha Bhava',
    governs: 'Gains, income, elder siblings, social networks, goals fulfilled, aspirations',
    keywords: 'Income · Gains · Network · Aspirations',
    description: 'The house of gains and fulfillment of desires. Governs earned income (as opposed to accumulated wealth in the 2nd), elder siblings, friendships, and the social networks that support achievement of goals.',
  },
  {
    number: 12,
    name: 'Twelfth House',
    sanskrit: 'Vyaya Bhava',
    governs: 'Loss, liberation, foreign lands, isolation, retreat, expenses, spiritual practice, bed pleasures',
    keywords: 'Liberation · Loss · Foreign · Seclusion',
    description: 'The house of dissolution and transcendence. Governs expenses, losses, foreign travel and residence, seclusion, hidden matters, and — at its highest expression — moksha (liberation). A strong 12th house can indicate both significant material loss and profound spiritual attainment.',
  },
]

export const HOUSE_GROUPS = {
  eyebrow: 'House Classification',
  title: 'How houses are grouped',
  description: 'Vedic astrology classifies the 12 houses into overlapping groups, each carrying a different quality of experience. Understanding these groups helps interpret why certain houses produce the results they do.',
  groups: [
    {
      name: 'Kendras (Angular Houses)',
      houses: '1, 4, 7, 10',
      quality: 'The most powerful positions in the chart. Planets placed here are strong and highly expressive. The Kendra houses govern the primary domains of life: self, home, partnership, and career.',
    },
    {
      name: 'Trikonas (Trine Houses)',
      houses: '1, 5, 9',
      quality: 'The most auspicious houses. Planets placed here tend to produce fortunate results regardless of their nature. The Trikona houses (particularly the 9th) are associated with grace, luck, and dharmic alignment.',
    },
    {
      name: 'Dusthanas (Difficult Houses)',
      houses: '6, 8, 12',
      quality: 'Traditionally associated with difficulty, adversity, and loss — but also with transformation, hidden knowledge, and liberation. Natural benefics struggle here; natural malefics can perform surprisingly well, particularly in the 6th (which helps defeat enemies and overcome illness).',
    },
    {
      name: 'Maraka Houses (Death-Inflicting)',
      houses: '2, 7',
      quality: 'These houses are associated with the timing of death (in classical texts) and more broadly with endings and transitions. Planets ruling or placed in Maraka houses can trigger significant life endings when active in Dasha periods at the appropriate stage of life.',
    },
    {
      name: 'Upachaya (Growing Houses)',
      houses: '3, 6, 10, 11',
      quality: 'These houses improve over time. Malefic planets placed here often produce better results as life progresses — which is why Saturn in the 11th, for instance, can build significant wealth through disciplined effort over decades.',
    },
  ],
}

export const HOUSES_MYTHS = [
  {
    myth: 'The 8th and 12th houses are always bad.',
    reality: 'These houses govern transformation and dissolution — experiences that can be genuinely painful but are also the context for the most significant growth. Planets placed there are not "ruined"; they are active in challenging but potentially transformative life areas. Strong benefics in the 8th or 12th can produce spiritual depth, research ability, or extraordinary resilience.',
  },
  {
    myth: 'A planet in your 10th house means you\'ll have a successful career.',
    reality: 'A planet in the 10th house activates career themes — but whether that activation is beneficial depends on which planet it is, how strong it is, and what else is happening in the chart. Saturn in the 10th can produce career through discipline and delay; Mars in the 10th can produce competitive, active professions. The planet\'s nature, sign placement, and aspects all matter.',
  },
  {
    myth: 'You can ignore the houses and just focus on planets and signs.',
    reality: 'Without houses, you cannot tell where in someone\'s life planetary energies operate. Two people can have Saturn in Libra — but if one has Libra in the 2nd house (wealth, speech) and the other has Libra in the 10th (career, authority), Saturn produces entirely different themes. Houses are what connect abstract planetary principles to specific life areas.',
  },
]

export const HOUSES_FAQ = [
  {
    question: 'Why does the time of birth matter so much in Vedic astrology?',
    answer: 'The Ascendant — the starting point for all 12 houses — changes roughly every two hours. An error of even four minutes in birth time can shift the Ascendant by one degree. If the Ascendant is near the boundary of two signs, an error of a few minutes can change the entire house layout, shifting every planet into a different house. This is why Vedic astrologers are particularly careful about birth time accuracy.',
  },
  {
    question: 'What is the house lord (Bhavesh)?',
    answer: 'Each house has a sign on its cusp, and the planet ruling that sign is the house lord (Bhavesh). The lord\'s placement in the chart tells you how that house\'s themes manifest: if the 7th house lord (marriage) is placed in the 10th house (career), relationship themes get expressed through professional contexts. The house lord is often more telling than planets simply placed within the house.',
  },
  {
    question: 'What does an empty house mean?',
    answer: 'An empty house (no planet placed there) is not malefic or especially problematic. The themes of that house are still active — they are primarily governed by the house lord\'s placement, sign, and aspects. A house without planets does not mean the life area it governs is absent or damaged; it means the story is told through the house lord rather than through a directly placed planet.',
  },
  {
    question: 'What is the difference between Whole Sign houses and Bhava Chalit?',
    answer: 'Whole Sign houses (the primary system used by most Vedic astrologers) assign an entire sign to each house, with the Ascendant sign as the 1st house. Bhava Chalit (or Chalit chart) uses house cusps calculated from the exact degree of the Ascendant, so a planet near the edge of a sign may shift into the adjacent house. Most astrologers use Whole Sign for general reading and consult Bhava Chalit when a planet\'s house placement is borderline.',
  },
  {
    question: 'Can I predict specific life events from the houses?',
    answer: 'Houses tell you which life areas are activated; Dashas (planetary time periods) tell you when that activation is most likely to produce visible events. The 7th house governs marriage, but marriage typically happens during the Dasha or Antardasha of the 7th house lord, a planet in the 7th, or Venus (the natural significator of marriage) — not just because the 7th house exists. Houses set the stage; Dashas determine the timing.',
  },
]

export const HOUSES_CTA = {
  eyebrow: 'Star Jyotish',
  title: 'See Your Complete House Layout',
  description: 'Your 12 houses are anchored to your Ascendant — calculated from your exact birth date, time, and place. Generate your free Kundli to see which sign governs each house in your chart.',
  buttonLabel: 'Generate My Free Kundli',
}
