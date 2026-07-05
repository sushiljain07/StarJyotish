// frontend/src/utils/dailyInsights.js
//
// Pure functions that turn real chart + transit + outlook data into the
// home page's daily-guidance content. None of this is a claimed classical
// prediction technique end-to-end — where a named classical technique
// exists (Chandra Bala, planetary dignity) it's used correctly and called
// out by name; where the app needs a single glanceable "day score" or a
// prioritized do/avoid list, that's a product-level synthesis ON TOP of
// real placements, not a rule found in any classical text. Every number
// and sentence here traces back to an actual chart/transit fact — nothing
// is randomly generated — but the WEIGHTING that turns those facts into a
// score is ours, and should read to users as guidance, not scripture.
// See pages/PersonalHome.jsx's disclaimer block, which this content sits
// directly above.

const DIGNITY = {
  EXALTATION:   { Sun: 0, Moon: 1, Mars: 9, Mercury: 5, Jupiter: 3, Venus: 11, Saturn: 6 },
  DEBILITATION: { Sun: 6, Moon: 7, Mars: 3, Mercury: 11, Jupiter: 9, Venus: 5, Saturn: 0 },
  OWN_SIGNS:    { Sun: [4], Moon: [3], Mars: [0, 7], Mercury: [2, 5], Jupiter: [8, 11], Venus: [1, 6], Saturn: [9, 10] },
}

function dignityScore(planetName, signIndex) {
  if (DIGNITY.EXALTATION[planetName] === signIndex) return 1
  if (DIGNITY.DEBILITATION[planetName] === signIndex) return -1
  if (DIGNITY.OWN_SIGNS[planetName]?.includes(signIndex)) return 0.5
  return 0
}

// Classical Chandra Bala: houses counted from the natal Moon's sign, not
// the ascendant. 3rd/6th/7th/10th/11th are traditionally favourable for
// starting things; the rest are comparatively neutral-to-weak, not "bad".
const CHANDRA_BALA_FAVORABLE = new Set([3, 6, 7, 10, 11])

function chandraBalaHouse(natalMoonSignIndex, transitMoonSignIndex) {
  return ((transitMoonSignIndex - natalMoonSignIndex + 12) % 12) + 1
}

const HOUSE_THEMES = {
  1:  { name: 'self & new beginnings',   do: 'starting something that puts you visibly in front',          avoid: 'making a big first impression you haven\u2019t thought through' },
  2:  { name: 'money & speech',          do: 'a careful money conversation or a document you\u2019ve been reviewing', avoid: 'harsh words you can\u2019t take back, especially about money' },
  3:  { name: 'communication & effort',  do: 'writing, pitching, or short travel',                          avoid: 'putting off a message that needs sending today' },
  4:  { name: 'home & family',           do: 'a family matter, property paperwork, or simply resting at home', avoid: 'big announcements that upend domestic routine' },
  5:  { name: 'creativity & romance',    do: 'creative work or reconnecting with someone you care about',   avoid: 'gambling on outcomes you can\u2019t control' },
  6:  { name: 'work & routine',          do: 'clearing routine tasks and health check-ins',                 avoid: 'picking fights with colleagues or ignoring a nagging symptom' },
  7:  { name: 'partnerships',            do: 'a partnership conversation, business or personal',            avoid: 'signing a partnership agreement without a second read' },
  8:  { name: 'transformation',          do: 'quiet research or closing out something unfinished',          avoid: 'high-stakes decisions made under pressure' },
  9:  { name: 'guidance & travel',       do: 'seeking advice from someone more experienced',                avoid: 'ignoring good advice because it\u2019s inconvenient' },
  10: { name: 'career & reputation',     do: 'the career conversation you\u2019ve been rehearsing',          avoid: 'undermining your own reputation for a short-term win' },
  11: { name: 'gains & networks',        do: 'following up on a pending gain or introduction',              avoid: 'overcommitting to a group plan on impulse' },
  12: { name: 'rest & release',          do: 'winding down, letting go of a grudge, or genuine rest',        avoid: 'starting something new that deserves a clearer day' },
}

const PLANET_THEMES = {
  Sun: 'stepping into visibility and taking ownership',
  Moon: 'checking in with how you actually feel before deciding',
  Mars: 'physical activity or tackling the task you\u2019ve been avoiding',
  Mercury: 'writing, negotiating, or tidying up loose details',
  Jupiter: 'learning, teaching, or generous gestures',
  Venus: 'relationships, beauty, and creative or financial partnerships',
  Saturn: 'discipline, patience, and finishing what you started',
  Rahu: 'ambition and new territory — worth a second look before committing',
  Ketu: 'letting go and quiet introspection',
}

const BENEFICS = new Set(['Jupiter', 'Venus', 'Mercury'])
const MALEFICS = new Set(['Saturn', 'Mars', 'Rahu', 'Ketu'])

function findPlanet(planets, name) {
  return planets.find(p => p.name === name)
}

function houseLord(signIndex) {
  // Whole-sign lordship — the classical ruler of each sign.
  const LORDS = ['Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter']
  return LORDS[signIndex]
}

function houseSignIndex(ascSignIndex, houseNumber) {
  return (ascSignIndex + houseNumber - 1) % 12
}

/**
 * A single 1-10 "day score" synthesizing Chandra Bala, current dasha lord's
 * natal dignity, and whether transiting benefics/malefics currently occupy
 * the person's natal Moon or Lagna sign. Documented heuristic, not a
 * classical single-number technique — see module docstring.
 */
export function computeDayScore(chart, transitPlanets) {
  const natalMoon = findPlanet(chart.planets, 'Moon')
  const transitMoon = findPlanet(transitPlanets, 'Moon')
  const ascSignIndex = chart.ascendant.sign_index
  const mdPlanet = chart.dasha.current_mahadasha.planet
  const natalMdPlanet = findPlanet(chart.planets, mdPlanet)

  let score = 5.0
  let label = 'Mixed Day'

  if (natalMoon && transitMoon) {
    const cbHouse = chandraBalaHouse(natalMoon.sign_index, transitMoon.sign_index)
    score += CHANDRA_BALA_FAVORABLE.has(cbHouse) ? 1.5 : -0.4
  }

  if (natalMdPlanet) {
    score += dignityScore(mdPlanet, natalMdPlanet.sign_index)
  }

  for (const p of transitPlanets) {
    if (p.name === 'Moon') continue // already scored via Chandra Bala above
    const onMoonSign = natalMoon && p.sign_index === natalMoon.sign_index
    const onLagnaSign = p.sign_index === ascSignIndex
    if (!onMoonSign && !onLagnaSign) continue
    if (BENEFICS.has(p.name)) score += 0.5
    if (MALEFICS.has(p.name)) score -= 0.5
  }

  score = Math.max(1, Math.min(10, score))
  score = Math.round(score * 10) / 10

  if (score >= 8) label = 'Excellent Day'
  else if (score >= 6.5) label = 'Steady Day'
  else if (score >= 5) label = 'Mixed Day'
  else if (score >= 3.5) label = 'Cautious Day'
  else label = 'Challenging Day'

  return { score, label }
}

/** 3 "do" items and 3 "avoid" items, each traceable to a real placement. */
export function computeDoAvoid(chart, transitPlanets, panchang) {
  const natalMoon = findPlanet(chart.planets, 'Moon')
  const transitMoon = findPlanet(transitPlanets, 'Moon')
  const ascSignIndex = chart.ascendant.sign_index
  const mdPlanet = chart.dasha.current_mahadasha.planet

  const doItems = []
  const avoidItems = []

  if (transitMoon) {
    const moonHouse = ((transitMoon.sign_index - ascSignIndex + 12) % 12) + 1
    const theme = HOUSE_THEMES[moonHouse]
    doItems.push(`Good window for ${theme.do} — the Moon is transiting your ${moonHouse}${ordinalSuffix(moonHouse)} house (${theme.name}) today.`)
    avoidItems.push(`Hold off on ${theme.avoid}.`)
  }

  const planetTheme = PLANET_THEMES[mdPlanet]
  if (planetTheme) {
    doItems.push(`Your ${mdPlanet} Mahadasha favours ${planetTheme} all season — a good lens for today's choices too.`)
  }

  if (panchang?.muhurtas?.rahu_kaal?.start) {
    avoidItems.push(`Avoid starting anything important or signing agreements during Rahu Kaal (${panchang.muhurtas.rahu_kaal.start} – ${panchang.muhurtas.rahu_kaal.end}).`)
  }

  const malefic = transitPlanets.find(p => MALEFICS.has(p.name) && natalMoon && p.sign_index === natalMoon.sign_index)
  if (malefic) {
    avoidItems.push(`${malefic.name} is transiting your natal Moon sign — reactions may run stronger than usual, so avoid deciding anything emotionally charged in the heat of the moment.`)
  } else {
    const benefic = transitPlanets.find(p => BENEFICS.has(p.name) && natalMoon && p.sign_index === natalMoon.sign_index)
    if (benefic) {
      doItems.push(`${benefic.name} is transiting your natal Moon sign — a genuinely supportive day for ${PLANET_THEMES[benefic.name]}.`)
    }
  }

  return {
    doItems: doItems.slice(0, 3),
    avoidItems: avoidItems.slice(0, 3),
  }
}

const LIFE_AREAS = [
  { id: 'career',       label: 'Career',       house: 10, topicId: 'career' },
  { id: 'wealth',       label: 'Wealth',       house: 2,  topicId: 'finance' },
  { id: 'relationship', label: 'Relationships', house: 7,  topicId: 'relationship' },
  { id: 'health',       label: 'Health',       house: 6,  topicId: 'health' },
]

/** One card per life area: a lord placement fact (always real), a rough
 * 0-100 bar derived from dignity + current transit support, and a trend
 * arrow. The interpretive sentence is templated off the placed house's
 * general significations, not a bespoke reading of all 144 lord/house
 * combinations — the underlying placement is exact, the gloss is general. */
export function computeLifeAreas(chart, transitPlanets) {
  const ascSignIndex = chart.ascendant.sign_index

  return LIFE_AREAS.map(area => {
    const houseSign = houseSignIndex(ascSignIndex, area.house)
    const lord = houseLord(houseSign)
    const natalLord = findPlanet(chart.planets, lord)
    const transitLord = findPlanet(transitPlanets, lord)

    let pct = 50
    let trend = 'flat'

    if (natalLord) {
      const dScore = dignityScore(lord, natalLord.sign_index)
      pct += dScore * 20
      if (dScore > 0) trend = 'up'
      if (dScore < 0) trend = 'down'
    }
    if (transitLord && BENEFICS.has(lord) === false) {
      // A malefic lord currently well-transited (kendra/trikona from Lagna)
      // softens the trend rather than flipping it outright — deliberately
      // conservative given how approximate this signal is.
      const favorableHouses = new Set([1, 4, 5, 7, 9, 10, 11])
      const transitHouse = ((transitLord.sign_index - ascSignIndex + 12) % 12) + 1
      if (favorableHouses.has(transitHouse) && trend !== 'down') trend = 'up'
    }
    pct = Math.max(15, Math.min(90, Math.round(pct)))

    const lordHouse = natalLord ? natalLord.house_number : null
    const lordHouseTheme = lordHouse ? HOUSE_THEMES[lordHouse]?.name : null
    const nugget = natalLord && lordHouse
      ? `Your ${area.house}${ordinalSuffix(area.house)} house lord ${lord} sits in your ${lordHouse}${ordinalSuffix(lordHouse)} house — a placement generally linked to ${lordHouseTheme}.`
      : null

    return {
      ...area,
      pct,
      trend,
      lord,
      nugget,
    }
  })
}

/** Moon transit + dasha spotlight — both drawn straight from real data,
 * no scoring involved. */
export function computeSpotlight(chart, transitPlanets) {
  const ascSignIndex = chart.ascendant.sign_index
  const transitMoon = findPlanet(transitPlanets, 'Moon')
  const md = chart.dasha.current_mahadasha
  const ad = chart.dasha.current_antardasha

  let moonSpotlight = null
  if (transitMoon) {
    const house = ((transitMoon.sign_index - ascSignIndex + 12) % 12) + 1
    const theme = HOUSE_THEMES[house]
    moonSpotlight = {
      house,
      sign: transitMoon.sign,
      text: `The Moon is transiting your ${house}${ordinalSuffix(house)} house today (${theme.name}) — a natural window for ${theme.do}.`,
    }
  }

  const yearsRemaining = md?.end
    ? Math.max(0, Math.round((new Date(md.end) - Date.now()) / (365.25 * 24 * 3600 * 1000)))
    : null

  const dashaSpotlight = {
    mahadasha: md.planet,
    antardasha: ad?.planet ?? null,
    yearsRemaining,
    text: ad
      ? `You're in ${md.planet} Mahadasha with ${ad.planet} Antardasha active — the theme of this period is ${PLANET_THEMES[md.planet]}, coloured right now by ${PLANET_THEMES[ad.planet]}.`
      : `You're in ${md.planet} Mahadasha — the theme of this period is ${PLANET_THEMES[md.planet]}.`,
  }

  return { moonSpotlight, dashaSpotlight }
}

/** "Coming up" event cards from outlook (Sade Sati + slow-planet sign
 * changes) plus the current Antardasha's end date, which is already on
 * the chart object and needs no extra fetch. */
export function buildComingUpEvents(chart, outlook, formatDate) {
  const events = []

  if (outlook?.sade_sati) {
    events.push(outlook.sade_sati.active
      ? {
          when: 'Ongoing',
          title: `Sade Sati is currently ${outlook.sade_sati.phase}`,
          description: 'Saturn is transiting the 12th, 1st, or 2nd sign from your natal Moon — a multi-year phase of structural growth through discipline and patience.',
        }
      : {
          when: 'Ongoing',
          title: 'No Sade Sati currently active',
          description: 'Saturn is well clear of your Moon sign for now — a comparatively lighter structural period.',
        })
  }

  const sc = outlook?.upcoming_sign_changes ?? {}
  const SIGN_CHANGE_COPY = {
    Saturn: 'A structurally significant transit — typically a multi-year phase shift in career, responsibility, or long-term commitments.',
    Jupiter: 'Jupiter\u2019s roughly year-long transits shift where growth, luck, and expansion are most available.',
    Rahu: 'Rahu and Ketu shift axis together, changing which life themes carry karmic momentum for the next ~18 months.',
  }
  for (const planet of ['Saturn', 'Jupiter', 'Rahu']) {
    const change = sc[planet]
    if (!change) continue
    const weeks = Math.max(1, Math.round(change.days_away / 7))
    events.push({
      when: `In ~${weeks} week${weeks === 1 ? '' : 's'} \u00b7 ${change.date}`,
      title: `${planet} enters ${change.to_sign}`,
      description: SIGN_CHANGE_COPY[planet],
    })
  }

  const ad = chart.dasha.current_antardasha
  if (ad?.end) {
    events.push({
      when: formatDate(ad.end),
      title: `${ad.planet} Antardasha ends`,
      description: 'Your current sub-period shifts focus as the next Antardasha begins — worth revisiting your Dasha timeline nearer the date.',
    })
  }

  return events
}

function ordinalSuffix(n) {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return s[(v - 20) % 10] || s[v] || s[0]
}
