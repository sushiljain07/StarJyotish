// frontend/src/config/doshasContent.js
//
// All copy for /learn/doshas — hub page for chart afflictions (Doshas).

export const DOSHAS_HERO = {
  title: 'Doshas — Chart Afflictions Explained',
  subtitle:
    'Doshas are some of the most misunderstood concepts in Vedic astrology — widely feared, rarely understood. This guide covers what each major Dosha actually means, what the classical texts say, and what most popular accounts leave out.',
}

export const WHAT_ARE_DOSHAS = {
  eyebrow: 'The Foundation',
  title: 'What a Dosha actually is',
  paragraphs: [
    'The Sanskrit word Dosha literally means "fault" or "blemish" — which gives a sense of the tradition\'s framing, though the actual effects are more nuanced than the word implies. A Dosha in Vedic astrology is a specific affliction pattern: a planetary configuration that introduces challenge, friction, or impediment in a particular area of life.',
    'The key word is "introduces." A Dosha does not determine outcomes; it introduces a quality of challenge into the relevant area. Many people with significant Doshas live successful, fulfilling lives in the very area the Dosha is supposed to afflict — because the Dosha is one factor among many, and cancellations (Bhanga), planetary strength, and overall chart context all modify the final picture.',
    'The most important thing popular astrology gets wrong about Doshas is the framing of inevitability. Mangal Dosha does not guarantee a difficult marriage or an early death of a spouse. Kaal Sarp Dosha does not doom a chart to obstacles. These patterns introduce tendencies that the full chart may amplify, moderate, or redirect. They are signals to pay attention, not verdicts.',
  ],
  didYouKnow: {
    title: 'Did you know?',
    body: 'Mangal Dosha — the most discussed Dosha in popular Indian astrology — affects a significant portion of the population: roughly 50% of charts have Mars placed in one of the houses that classically form Mangal Dosha (1, 2, 4, 7, 8, 12). If half the population were truly "afflicted" in marriage, the implications would be quite different from how Mangal Dosha is typically presented.',
  },
}

export const MAJOR_DOSHAS = [
  {
    name: 'Mangal Dosha',
    altName: 'Kuja Dosha, Angaraka Dosha',
    formation: 'Mars (Mangal) placed in the 1st, 2nd, 4th, 7th, 8th, or 12th house from the Ascendant, Moon, or Venus — with different schools using different house sets',
    effects: 'Traditionally associated with delay in marriage, difficulty in partnership, or harm to the spouse. In a broader reading, it indicates a strongly Martian influence in the area of partnership — intensity, assertiveness, sometimes conflict.',
    cancellations: [
      'When both partners have Mangal Dosha (they "cancel" each other\'s Dosha)',
      'When Mars is in its own signs (Aries, Scorpio) or exalted (Capricorn)',
      'When Mars is in the 2nd house for Aries or Scorpio Ascendant',
      'When Jupiter or Venus aspects Mars in the afflicting position',
      'When Mars is in certain Nakshatras per some schools',
    ],
    overstatement: 'The Dosha is routinely overstated in popular contexts. Mars in the 7th house, for example, can produce a partner who is energetic and direct — not necessarily harmful. The Dosha matters far more when Mars is also weak, afflicted by additional malefics, or placed in a chart where the 7th house is otherwise stressed.',
  },
  {
    name: 'Kaal Sarp Dosha',
    altName: 'Kala Sarpa Yoga',
    formation: 'All seven classical planets (Sun through Saturn) are placed between Rahu and Ketu in the chart — with Rahu and Ketu flanking them on both sides in sign sequence',
    effects: 'Associated with obstacles, setbacks, and a life that seems to resist the person\'s efforts at various junctures. Some describe it as a pattern of recurring losses before gains.',
    cancellations: [
      'When even one planet is outside the Rahu-Ketu axis (breaks the pattern)',
      'When Jupiter or the 5th lord is strong',
      'Per some practitioners, when the chart overall has significant beneficial Yogas',
    ],
    overstatement: 'Kaal Sarp Dosha is one of the most disputed patterns in Vedic astrology — many traditionalists do not recognize it as a classical Dosha at all, since it does not appear in major classical texts like BPHS. Several highly successful people have all planets between Rahu and Ketu in their charts. The pattern appears to create intensity and a quality of all-or-nothing in life experiences more than consistent obstruction.',
  },
  {
    name: 'Shani Sade Sati',
    altName: 'Saturn\'s 7.5-year transit',
    formation: 'Saturn transiting through the 12th, 1st, and 2nd signs from the natal Moon — three signs × approximately 2.5 years each = 7.5 years total',
    effects: 'Associated with pressure, restructuring, loss, and simplification across the transit period. The peak intensity is typically during Saturn\'s transit through the Moon sign itself (the middle 2.5 years).',
    cancellations: [
      'When Saturn is exalted (Libra), in its own signs (Capricorn, Aquarius), or in friendly signs during the transit',
      'When the concurrent Dasha period is that of a strong, beneficial planet',
      'When Saturn is the Ascendant or 10th lord (functional benefic) in the natal chart',
    ],
    overstatement: 'Sade Sati is routinely treated as purely inauspicious. But many people achieve their most significant accomplishments during Sade Sati — particularly when their natal Saturn is strong and the concurrent Dasha is supportive. The transit is demanding, but demand and hardship are not the same as destruction. Several periods of great national importance have coincided with Sade Sati for significant public figures.',
  },
  {
    name: 'Pitru Dosha',
    altName: 'Ancestral affliction',
    formation: 'Sun or Moon afflicted by Rahu, Ketu, or Saturn; or the 9th house and its lord significantly stressed — particularly through association with Rahu/Ketu or through retrograde planets conjunct the Sun',
    effects: 'Traditionally associated with ancestral karmic debts, father-related difficulties, challenges in having children, or recurring family patterns that seem to repeat across generations.',
    cancellations: [
      'Jupiter aspecting the afflicted Sun or the 9th house lord',
      'Specific remedies (Puja, ancestral rites) are emphasized in tradition',
      'Strong 5th house for children-related aspects of the Dosha',
    ],
    overstatement: 'Pitru Dosha has expanded in popular usage far beyond classical definitions. Any difficulty with the father, any challenge with children, and any sense of family hardship gets attributed to Pitru Dosha in some contexts. Classical definitions are narrower: specific afflictions to the 9th house (the father and dharma) or Sun (the soul and the father principle). The broader cultural usage is best understood as metaphorical rather than technical.',
  },
  {
    name: 'Kemdrum Dosha',
    altName: 'Kemadruma Yoga as affliction',
    formation: 'The Moon has no planet in the 2nd or 12th house from it, and no planet conjuncts it in the same sign — the Moon stands isolated',
    effects: 'Traditionally associated with emotional instability, material difficulty, and a quality of isolation or lack of support.',
    cancellations: [
      'Moon in a Kendra (1, 4, 7, 10) from the Ascendant',
      'Moon aspected by Jupiter',
      'Moon in its own sign (Cancer) or exalted (Taurus)',
      'Many planets in strong positions, compensating through the overall chart',
    ],
    overstatement: 'In practice, Kemadruma\'s effects are frequently mitigated by one or more of these cancellations. A chart with Moon isolated but placed in the 10th house with Jupiter aspecting it will show very little of the challenging Kemadruma pattern. The Dosha is most meaningfully present when the Moon is isolated, weak by sign, and lacks beneficial aspects.',
  },
]

export const REMEDIES_SECTION = {
  eyebrow: 'The Classical Approach',
  title: 'What tradition says about remedies',
  paragraphs: [
    'Vedic astrology has always paired diagnosis with remedy. For each Dosha, classical tradition offers specific Upayas (remedies): gemstone prescription, planetary mantras, specific charitable acts, fasting on particular days, worship of the afflicting planet\'s deity, or ancestral rites in the case of Pitru Dosha.',
    'The principle behind all classical remedies is propitiation — not appeasing an angry planet, but aligning oneself with the planet\'s higher principle. Saturn remedies, for example, often involve service to the underprivileged, because Saturn governs the principle of equitable distribution and earned effort. The remedy is simultaneously a practical action and a philosophical alignment.',
    'Contemporary Vedic astrologers vary in their emphasis on remedies. Some practitioners do not prescribe them at all and focus on understanding the chart\'s dynamics as self-knowledge. Others work extensively with mantras and gemstones. Both approaches have classical precedent. What both camps agree on: understanding the Dosha clearly is always more valuable than fearfully acting on a label.',
  ],
}

export const DOSHAS_MYTHS = [
  {
    myth: 'Mangal Dosha means you cannot have a happy marriage.',
    reality: 'Mangal Dosha introduces Martian intensity into the partnership area — which can produce passion, directness, and energy as easily as conflict. The classical texts describe specific conditions under which the Dosha is most challenging, and specific cancellations that neutralize much of the effect. Most charts with Mangal Dosha belong to people in ordinary marriages with no exceptional difficulty.',
  },
  {
    myth: 'Kaal Sarp Dosha is not in the classical texts, so it doesn\'t exist.',
    reality: 'The pattern of all planets between Rahu and Ketu is indeed not described in major classical texts as a named Dosha. But patterns produce effects regardless of whether they have classical names — and experienced practitioners consistently report that charts with all planets between the nodes carry a particular quality of intensity and "all or nothing" experience. The label is modern; the observation is real.',
  },
  {
    myth: 'Once you have a Dosha, you\'re stuck with its effects forever.',
    reality: 'Doshas are natal patterns, but their effects manifest most strongly during specific Dasha periods, transits, or life stages. The same Mangal Dosha that creates friction in a chart during Mars Mahadasha may lie largely dormant during Jupiter Mahadasha. Timing, remediation, and overall chart strength together determine when and how a Dosha expresses.',
  },
]

export const DOSHAS_FAQ = [
  {
    question: 'How do I know if I have Mangal Dosha?',
    answer: 'Generate your Vedic birth chart and check Mars\'s house position. Different schools count from different reference points: from the Ascendant, from the Moon, and from Venus. If Mars falls in the 1st, 2nd, 4th, 7th, 8th, or 12th house from any of these reference points (per your preferred school\'s definition), Mangal Dosha may apply. But also check for cancellations before drawing conclusions.',
  },
  {
    question: 'Should I avoid marriage if I have Mangal Dosha?',
    answer: 'No. Mangal Dosha is one consideration among many in a marriage assessment, not a prohibition. Classical tradition recommends matching a Mangal Dosha person with another person who has the same Dosha — the two "cancel" each other. But beyond this, the overall chart compatibility (Guna Milan, chart comparison, Dasha timing) tells a much more complete story than any single Dosha.',
  },
  {
    question: 'Are Doshas hereditary? Can my parents\' chart Doshas affect me?',
    answer: 'Pitru Dosha specifically is interpreted as ancestral in nature — it relates to unresolved karmic patterns in the family lineage. Other Doshas are personal and specific to your own natal chart. That said, family patterns do repeat across generations in Vedic thinking, and similar chart signatures can appear in parent and child charts — though each person\'s chart is their own independent document.',
  },
  {
    question: 'Can doing Puja or wearing a gemstone remove a Dosha?',
    answer: 'Classical tradition holds that Upayas (remedies) can mitigate the difficult effects of a Dosha without removing the underlying natal pattern. A more precise framing: remedies help orient a person toward the higher expression of the afflicting planet\'s principle, which tends to produce better outcomes than the lower expression. Gemstones and mantras are the most commonly prescribed remedies, but their effects are best understood as supportive rather than curative.',
  },
]

export const DOSHAS_CTA = {
  eyebrow: 'Star Jyotish',
  title: 'See Your Complete Chart — Not Just the Doshas',
  description: 'Any Dosha in your chart exists alongside the rest of your Kundli — strengths, Yogas, and planetary placements that together tell the complete story. Generate your free birth chart for the full picture.',
  buttonLabel: 'Generate My Free Kundli',
}
