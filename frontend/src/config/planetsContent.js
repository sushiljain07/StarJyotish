// frontend/src/config/planetsContent.js
//
// All copy for /learn/basics/planets-guide.

export const PLANETS_HERO = {
  title: 'The 9 Planets, Simply Explained',
  subtitle:
    'Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, Ketu — what each one governs, without the jargon.',
}

export const PLANETS_QUICK_FACTS = [
  { label: 'Sanskrit term',     value: 'Graha (that which seizes)' },
  { label: 'Total Navagrahas',  value: '9 (7 visible + 2 shadow nodes)' },
  { label: 'Natural benefics',  value: 'Jupiter, Venus, waxing Moon, unafflicted Mercury' },
  { label: 'Natural malefics',  value: 'Sun, Mars, Saturn, Rahu, Ketu' },
  { label: 'Fastest moving',    value: 'Moon (~2.25 days per sign)' },
  { label: 'Slowest moving',    value: 'Saturn (~2.5 years per sign)' },
]

export const GRAHAS_INTRO = {
  eyebrow: 'What planets actually mean',
  title: 'Grahas: forces, not rocks',
  paragraphs: [
    'The Sanskrit word for planet is graha — literally, "that which seizes." Vedic astrology does not think of planets as distant rocks influencing people through some mysterious gravitational field. It treats them as archetypal forces, each one governing a particular slice of human experience and the qualities of reality associated with it.',
    'The Sun governs the soul, father, authority, and identity. Mars governs courage, conflict, land, and the capacity to act. Saturn governs time, karma, discipline, and everything that must be earned through patience. These are not metaphors — they are the grammar through which a Kundli is read.',
    'Vedic astrology uses nine grahas — the Navagrahas. Two of them (Rahu and Ketu) are not physical planets at all, but the mathematical points where the Moon\'s orbital path crosses the Earth\'s orbital path around the Sun. Both are treated as potent forces in a chart because they are: their effects on the mind, timing, and life patterns are consistently observed across traditions and centuries.',
  ],
  callout: {
    variant: 'tip',
    title: 'Natural benefics vs natural malefics',
    body: 'Jupiter, Venus, waxing Moon, and unafflicted Mercury are natural benefics — they generally improve the houses they influence. Sun, Mars, Saturn, Rahu, and Ketu are natural malefics — they create intensity, pressure, or challenge. But context is everything: a benefic in a difficult house can underperform; a malefic in a strong house can deliver outstanding results through struggle.',
  },
}

export const NINE_GRAHAS = [
  {
    name: 'Sun', skt: 'Surya', emoji: '☀️', keyword: 'Soul',
    owns: 'Leo', exalted: 'Aries (10°)', debilitated: 'Libra (10°)',
    governs: 'Soul, authority, father, government, vitality, ego',
    body: 'The Sun is the atmakaraka — the significator of the soul and the self. Where the Sun sits in your chart reveals how you want to be seen, what you take pride in, and where you seek recognition and respect. It governs your relationship with authority figures and your capacity to lead. A strong Sun gives confidence, clarity of purpose, and leadership; a weak or afflicted Sun can manifest as insecurity, a need for external validation, or a complicated relationship with the father.',
  },
  {
    name: 'Moon', skt: 'Chandra', emoji: '🌙', keyword: 'Mind',
    owns: 'Cancer', exalted: 'Taurus (3°)', debilitated: 'Scorpio (3°)',
    governs: 'Mind, emotions, mother, public, memory, liquids, fluctuation',
    body: 'The Moon rules the manas — the thinking, feeling mind. It is the fastest-moving graha, changing signs every 2.25 days, which is why your emotional state can feel so cyclical. The Moon\'s phase at your birth also matters: a bright, waxing Moon (Shukla Paksha) is considered stronger than a dark, waning one (Krishna Paksha). Your Moon sign (Rashi) shows your relationship with your mother, your emotional needs, and how you instinctively seek comfort under stress.',
  },
  {
    name: 'Mars', skt: 'Mangal', emoji: '🔴', keyword: 'Drive',
    owns: 'Aries, Scorpio', exalted: 'Capricorn (28°)', debilitated: 'Cancer (28°)',
    governs: 'Energy, courage, brothers, land, surgery, engineering, conflict',
    body: 'Mars is the commander-in-chief of the planetary cabinet — the Senapati. It governs your will to act, your capacity to fight for what you want, and your relationship with physical energy and aggression. Mangal Dosha — the placement of Mars in houses 1, 2, 4, 7, 8, or 12 — is one of the most discussed placements in marriage compatibility consultations. A well-placed Mars gives courage, decisiveness, and physical vitality. An afflicted Mars can bring aggression, accidents, inflammation, or conflict with siblings.',
  },
  {
    name: 'Mercury', skt: 'Budha', emoji: '💬', keyword: 'Intellect',
    owns: 'Gemini, Virgo', exalted: 'Virgo (15°)', debilitated: 'Pisces (15°)',
    governs: 'Intelligence, communication, trade, mathematics, skin, speech',
    body: 'Mercury governs how you learn, how you speak, and how you trade — both ideas and goods. It is the planet of the analytical mind, language, commerce, and all forms of communication. Because Mercury is always physically close to the Sun, it is frequently combust (within 14° of the Sun) in a chart, which mutes its significations. A strong Mercury is invaluable for careers in writing, data analysis, law, medicine, commerce, teaching, or any field that requires sharp verbal and analytical agility.',
  },
  {
    name: 'Jupiter', skt: 'Guru', emoji: '🟡', keyword: 'Wisdom',
    owns: 'Sagittarius, Pisces', exalted: 'Cancer (5°)', debilitated: 'Capricorn (5°)',
    governs: 'Wisdom, children, dharma, wealth, teachers, philosophy, husband (in a woman\'s chart)',
    body: 'Jupiter is the Guru — the divine teacher, and the most natural benefic in the chart. It expands whatever it touches, which is why its aspect on any house or planet is considered protective and auspicious. Jupiter in the 7th house can bring a wise, generous spouse. Jupiter in the 11th can signal significant gains over time. A strong Jupiter is one of the best things a chart can have. However, unchecked Jupiter (no Saturn to temper it) can bring excess — overconfidence, over-optimism, weight gain, and an inability to deal with practical constraints.',
  },
  {
    name: 'Venus', skt: 'Shukra', emoji: '♀️', keyword: 'Desire',
    owns: 'Taurus, Libra', exalted: 'Pisces (27°)', debilitated: 'Virgo (27°)',
    governs: 'Love, beauty, luxury, marriage, arts, vehicles, wife (in a man\'s chart)',
    body: 'Venus is the planet of pleasure, aesthetics, relationships, and material comfort. It governs what you find beautiful, how you attract others, and your capacity for enjoyment. Venus exalted in Pisces is considered the pinnacle of Venusian expression — unconditional love, artistic sensitivity, and spiritual devotion combined. In a man\'s chart, Venus often indicates the type of partner he will be drawn to, and its strength indicates ease in marriage. A well-placed Venus also correlates with talent in music, visual arts, design, and creative industries.',
  },
  {
    name: 'Saturn', skt: 'Shani', emoji: '⏳', keyword: 'Karma',
    owns: 'Capricorn, Aquarius', exalted: 'Libra (20°)', debilitated: 'Aries (20°)',
    governs: 'Discipline, delays, service, longevity, karma, oil, iron, labourers, chronic illness',
    body: 'Saturn is the great equaliser — the planet that does not destroy but compresses, delays, and demands accountability. The areas of life where Saturn sits in your chart are the areas where nothing comes easily or quickly. But they are also the areas where, with sustained effort over time, you build something that genuinely lasts. Saturn\'s Sade Sati (the 7.5-year transit of Saturn through the sign before, over, and after your natal Moon) is one of the most discussed periods in Vedic astrology — intense, clarifying, and ultimately worth understanding rather than fearing.',
  },
  {
    name: 'Rahu', skt: 'Rahu', emoji: '🐍', keyword: 'Obsession',
    owns: '— (north node, no sign ownership)', exalted: 'Taurus / Gemini (disputed)', debilitated: 'Scorpio / Sagittarius (disputed)',
    governs: 'Obsession, ambition, foreigners, technology, illusions, unconventional paths, materialism',
    body: 'Rahu is a shadow planet — a mathematical point, not a physical body — representing the Moon\'s north node. It governs the area of life you are obsessed with in this lifetime, the hunger you brought in from past-life experience and still have not satisfied. Rahu amplifies everything around it, often bringing worldly success and public achievement, but also confusion, insatiability, and a tendency to cloud reality with illusion. The house Rahu occupies is where you will constantly push beyond your comfort zone, sometimes brilliantly, sometimes compulsively.',
  },
  {
    name: 'Ketu', skt: 'Ketu', emoji: '🔱', keyword: 'Liberation',
    owns: '— (south node, no sign ownership)', exalted: 'Scorpio / Sagittarius (disputed)', debilitated: 'Taurus / Gemini (disputed)',
    governs: 'Liberation, past-life mastery, spirituality, detachment, research, sudden losses, moksha',
    body: 'Ketu is always exactly opposite Rahu in the chart. Where Rahu is the hunger, Ketu is the disinterest — the area of life where you already have deep competence from past experience, and consequently feel little appetite to compete in. This can manifest as extraordinary intuitive skill in that domain (Ketu in the 2nd house can produce gifted financial instincts or natural speakers) alongside puzzling neglect of it. Ketu Mahadasha and transit periods are often intensely spiritual, introspective, and stripping away of what no longer belongs.',
  },
]

export const PLANETARY_STRENGTH = {
  eyebrow: 'How strength is assessed',
  title: 'Not all placements are equal',
  intro: 'A planet\'s power in a chart is not fixed — it varies based on the sign it occupies, the house it sits in, its aspects, and its conjunctions. Three fundamental categories set the baseline:',
  items: [
    {
      term: 'Exaltation (Uchcha)',
      desc: 'The sign where a planet operates at its peak — Jupiter in Cancer, Venus in Pisces, Sun in Aries. These produce the clearest, most elevated expression of that planet\'s qualities. A planet near its exact exaltation degree (e.g. Jupiter at 5° Cancer) is especially strong.',
    },
    {
      term: 'Own sign (Swa Rashi)',
      desc: 'A planet in a sign it rules. Sun in Leo, Mars in Aries or Scorpio, Jupiter in Sagittarius or Pisces. Comfortable, self-sufficient, naturally at ease — the planet expresses its core nature without interference.',
    },
    {
      term: 'Debilitation (Neecha)',
      desc: 'The sign where a planet struggles most — Saturn in Aries, Moon in Scorpio, Venus in Virgo. This does not ruin a chart; a debilitated planet\'s significations take more work to access. Neecha Bhanga (cancellation of debility through a specific planetary combination) can flip a debilitated planet into an unusual source of strength.',
    },
  ],
  callout: {
    variant: 'note',
    title: 'Combustion (Asta)',
    body: 'When a planet comes too close to the Sun in the chart, it is said to be combust — burned up by solar fire. Mercury (within 14°), Venus (within 10°), Mars (within 17°), Jupiter (within 11°), Saturn (within 15°) lose strength when combust. The Moon is combust within 12°, producing an Amavasya (new Moon) effect that weakens its significations.',
  },
}

export const PLANETS_FAQ = [
  {
    q: 'Why does Vedic astrology use 9 planets when there are more in the solar system?',
    a: 'Vedic astrology developed its system based on the visible sky — the grahas observable to the naked eye plus the lunar nodes (Rahu and Ketu). Uranus, Neptune, and Pluto were not discovered until the telescope era and are not part of classical Vedic calculation, though some modern Vedic astrologers incorporate them as supplementary factors.',
  },
  {
    q: 'What does it mean when a planet is retrograde?',
    a: 'A retrograde planet appears to move backward in the sky from Earth\'s perspective. In Vedic astrology, a retrograde planet is considered stronger in some respects (its energy is more internalised and intense) but also more difficult to express cleanly outward. Saturn retrograde, for example, can intensify its Karmic lessons. Jupiter retrograde often deepens philosophical and spiritual questioning.',
  },
  {
    q: 'Can a malefic planet be good for my chart?',
    a: 'Absolutely. The "natural benefic / natural malefic" classification is just a baseline. What matters more is a planet\'s "functional" role for your specific Lagna — which houses it rules — and its placement. Saturn, a natural malefic, is an excellent Yoga-karaka (a planet that simultaneously rules a Kendra and a Trikona) for Taurus and Libra Lagnas. A naturally benefic Jupiter can actually harm certain charts by ruling the 6th or 8th house.',
  },
  {
    q: 'What is a planet\'s "dignity" and why does it matter?',
    a: 'Dignity refers to how comfortable and strong a planet is in its current sign — from exaltation (peak strength) through own sign, friend\'s sign, neutral sign, enemy\'s sign, to debilitation (weakest). A planet in dignity expresses its significations clearly and positively. A planet out of dignity still works, but with more friction, misdirection, or need for effort to access its gifts.',
  },
]
