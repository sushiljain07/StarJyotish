// frontend/src/utils/dailyInsights.js
//
// All public functions accept a `t` function (from react-i18next's
// useTranslation) so generated text is translatable. The computation
// (chart math, scoring) is language-agnostic; only the output strings
// that surface in the UI go through t().

const CHANDRA_BALA_FAVORABLE = new Set([3, 6, 7, 10, 11])

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

function chandraBalaHouse(natalMoonSignIndex, transitMoonSignIndex) {
  return ((transitMoonSignIndex - natalMoonSignIndex + 12) % 12) + 1
}

const BENEFICS = new Set(['Jupiter', 'Venus', 'Mercury'])
const MALEFICS = new Set(['Saturn', 'Mars', 'Rahu', 'Ketu'])

function findPlanet(planets, name) {
  return planets.find(p => p.name === name)
}

function houseLord(signIndex) {
  const LORDS = ['Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter']
  return LORDS[signIndex]
}

function houseSignIndex(ascSignIndex, houseNumber) {
  return (ascSignIndex + houseNumber - 1) % 12
}

function ordinalSuffix(n) {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return s[(v - 20) % 10] || s[v] || s[0]
}

// Ordinal as a simple number string — used in t() interpolations where
// the full English ordinal suffix ("1st", "4th") would read oddly in Hindi.
// Hindi uses bare ordinals ("पहला", "चौथा") but for brevity the key just
// passes the number and the translation handles the phrasing.
function houseStr(n) { return `${n}${ordinalSuffix(n)}` }

export function computeDayScore(chart, transitPlanets, t) {
  const natalMoon = findPlanet(chart.planets, 'Moon')
  const transitMoon = findPlanet(transitPlanets, 'Moon')
  const ascSignIndex = chart.ascendant.sign_index
  const mdPlanet = chart.dasha.current_mahadasha.planet
  const natalMdPlanet = findPlanet(chart.planets, mdPlanet)

  let score = 5.0

  if (natalMoon && transitMoon) {
    const cbHouse = chandraBalaHouse(natalMoon.sign_index, transitMoon.sign_index)
    score += CHANDRA_BALA_FAVORABLE.has(cbHouse) ? 1.5 : -0.4
  }

  if (natalMdPlanet) {
    score += dignityScore(mdPlanet, natalMdPlanet.sign_index)
  }

  for (const p of transitPlanets) {
    if (p.name === 'Moon') continue
    const onMoonSign = natalMoon && p.sign_index === natalMoon.sign_index
    const onLagnaSign = p.sign_index === ascSignIndex
    if (!onMoonSign && !onLagnaSign) continue
    if (BENEFICS.has(p.name)) score += 0.5
    if (MALEFICS.has(p.name)) score -= 0.5
  }

  score = Math.max(1, Math.min(10, score))
  score = Math.round(score * 10) / 10

  let labelKey = 'dial_label_mixed'
  if (score >= 8) labelKey = 'dial_label_excellent'
  else if (score >= 6.5) labelKey = 'dial_label_steady'
  else if (score >= 5) labelKey = 'dial_label_mixed'
  else if (score >= 3.5) labelKey = 'dial_label_cautious'
  else labelKey = 'dial_label_challenging'

  return { score, label: t ? t(labelKey) : labelKey }
}

export function computeDoAvoid(chart, transitPlanets, panchang, t) {
  const natalMoon = findPlanet(chart.planets, 'Moon')
  const transitMoon = findPlanet(transitPlanets, 'Moon')
  const ascSignIndex = chart.ascendant.sign_index
  const mdPlanet = chart.dasha.current_mahadasha.planet

  const doItems = []
  const avoidItems = []

  if (transitMoon && t) {
    const moonHouse = ((transitMoon.sign_index - ascSignIndex + 12) % 12) + 1
    doItems.push(t('insight_moon_do', {
      action: t(`house_do_${moonHouse}`),
      house: houseStr(moonHouse),
      theme: t(`house_name_${moonHouse}`),
    }))
    avoidItems.push(t('insight_moon_avoid', {
      action: t(`house_avoid_${moonHouse}`),
    }))
  }

  const mdTheme = t ? t(`planet_theme_${mdPlanet}`) : mdPlanet
  if (mdTheme && t) {
    doItems.push(t('insight_md_do', {
      planet: t(`planet_${mdPlanet}`, mdPlanet),
      theme: mdTheme,
    }))
  }

  if (panchang?.muhurtas?.rahu_kaal?.start && t) {
    avoidItems.push(t('insight_rahu_avoid', {
      start: panchang.muhurtas.rahu_kaal.start,
      end: panchang.muhurtas.rahu_kaal.end,
    }))
  }

  const malefic = transitPlanets.find(p => MALEFICS.has(p.name) && natalMoon && p.sign_index === natalMoon.sign_index)
  if (malefic && t) {
    avoidItems.push(t('insight_malefic_avoid', { planet: t(`planet_${malefic.name}`, malefic.name) }))
  } else {
    const benefic = transitPlanets.find(p => BENEFICS.has(p.name) && natalMoon && p.sign_index === natalMoon.sign_index)
    if (benefic && t) {
      doItems.push(t('insight_benefic_do', {
        planet: t(`planet_${benefic.name}`, benefic.name),
        theme: t(`planet_theme_${benefic.name}`),
      }))
    }
  }

  return {
    doItems: doItems.slice(0, 3),
    avoidItems: avoidItems.slice(0, 3),
  }
}

const LIFE_AREAS = [
  { id: 'career',       house: 10, topicId: 'career' },
  { id: 'wealth',       house: 2,  topicId: 'finance' },
  { id: 'relationship', house: 7,  topicId: 'relationship' },
  { id: 'health',       house: 6,  topicId: 'health' },
]

export function computeLifeAreas(chart, transitPlanets, t) {
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
    if (transitLord && !BENEFICS.has(lord)) {
      const favorableHouses = new Set([1, 4, 5, 7, 9, 10, 11])
      const transitHouse = ((transitLord.sign_index - ascSignIndex + 12) % 12) + 1
      if (favorableHouses.has(transitHouse) && trend !== 'down') trend = 'up'
    }
    pct = Math.max(15, Math.min(90, Math.round(pct)))

    const lordHouse = natalLord ? natalLord.house_number : null
    const nugget = natalLord && lordHouse && t
      ? t('insight_nugget', {
          houseN: houseStr(area.house),
          lord: t(`planet_${lord}`, lord),
          lordHouseN: houseStr(lordHouse),
          theme: t(`house_name_${lordHouse}`),
        })
      : null

    return {
      ...area,
      label: t ? t(`life_area_${area.id}`, area.id) : area.id,
      pct,
      trend,
      lord,
      nugget,
    }
  })
}


// ── One Action Today ─────────────────────────────────────────────────────────
export function computeOneAction(chart, transitPlanets, dayScore, panchang, t) {
  if (!transitPlanets || !t) return null

  const transitMoon  = transitPlanets.find(p => p.name === 'Moon') ?? null
  const ascSignIndex = chart.ascendant.sign_index
  const mdPlanet     = chart.dasha.current_mahadasha.planet
  const score        = dayScore?.score ?? 5

  if (score < 4.5) {
    return {
      verb:    t('action_protect_verb'),
      context: t('action_protect_context', { planet: t(`planet_${mdPlanet}`, mdPlanet) }),
      why:     t('action_protect_why'),
      tone:    'caution',
    }
  }

  const moonHouse = transitMoon
    ? ((transitMoon.sign_index - ascSignIndex + 12) % 12) + 1
    : null

  const HOUSE_ACTIONS = {
    1:  { verb: t('action_h1_verb'),  context: t('action_h1_ctx')  },
    2:  { verb: t('action_h2_verb'),  context: t('action_h2_ctx')  },
    3:  { verb: t('action_h3_verb'),  context: t('action_h3_ctx')  },
    4:  { verb: t('action_h4_verb'),  context: t('action_h4_ctx')  },
    5:  { verb: t('action_h5_verb'),  context: t('action_h5_ctx')  },
    6:  { verb: t('action_h6_verb'),  context: t('action_h6_ctx')  },
    7:  { verb: t('action_h7_verb'),  context: t('action_h7_ctx')  },
    8:  { verb: t('action_h8_verb'),  context: t('action_h8_ctx')  },
    9:  { verb: t('action_h9_verb'),  context: t('action_h9_ctx')  },
    10: { verb: t('action_h10_verb'), context: t('action_h10_ctx') },
    11: { verb: t('action_h11_verb'), context: t('action_h11_ctx') },
    12: { verb: t('action_h12_verb'), context: t('action_h12_ctx') },
  }

  const ha = moonHouse ? HOUSE_ACTIONS[moonHouse] : null
  const abhijit = panchang?.muhurtas?.abhijit_muhurta

  return {
    verb:    ha?.verb    ?? t('action_default_verb'),
    context: ha?.context ?? t('action_default_ctx'),
    why:     abhijit?.start
      ? t('action_why_window', { start: abhijit.start, end: abhijit.end })
      : t('action_why_md', { planet: t(`planet_${mdPlanet}`, mdPlanet) }),
    tone: score >= 7 ? 'opportunity' : 'steady',
  }
}

export function computeSpotlight(chart, transitPlanets, t) {
  const ascSignIndex = chart.ascendant.sign_index
  const transitMoon = findPlanet(transitPlanets, 'Moon')
  const md = chart.dasha.current_mahadasha
  const ad = chart.dasha.current_antardasha

  let moonSpotlight = null
  if (transitMoon && t) {
    const house = ((transitMoon.sign_index - ascSignIndex + 12) % 12) + 1
    moonSpotlight = {
      house,
      sign: transitMoon.sign,
      text: t('insight_moon_transit_text', {
        house: houseStr(house),
        theme: t(`house_name_${house}`),
        action: t(`house_do_${house}`),
      }),
    }
  }

  const yearsRemaining = md?.end
    ? Math.max(0, Math.round((new Date(md.end) - Date.now()) / (365.25 * 24 * 3600 * 1000)))
    : null

  const dashaSpotlight = {
    mahadasha: md.planet,
    antardasha: ad?.planet ?? null,
    yearsRemaining,
    text: t ? (ad
      ? t('insight_dasha_both', {
          md: t(`planet_${md.planet}`, md.planet),
          ad: t(`planet_${ad.planet}`, ad.planet),
          mdTheme: t(`planet_theme_${md.planet}`),
          adTheme: t(`planet_theme_${ad.planet}`),
        })
      : t('insight_dasha_only', {
          md: t(`planet_${md.planet}`, md.planet),
          mdTheme: t(`planet_theme_${md.planet}`),
        })
    ) : '',
  }

  return { moonSpotlight, dashaSpotlight }
}

export function buildComingUpEvents(chart, outlook, formatDate, t) {
  const events = []

  if (outlook?.sade_sati && t) {
    const phase = outlook.sade_sati.phase
    events.push(outlook.sade_sati.active
      ? {
          when: t('coming_ongoing'),
          title: t('coming_sade_sati_active', { phase: t(`coming_sade_sati_phase_${phase}`, phase) }),
          description: t('coming_sade_sati_active_body'),
        }
      : {
          when: t('coming_ongoing'),
          title: t('coming_sade_sati_inactive'),
          description: t('coming_sade_sati_inactive_body'),
        })
  }

  const sc = outlook?.upcoming_sign_changes ?? {}
  for (const planet of ['Saturn', 'Jupiter', 'Rahu']) {
    const change = sc[planet]
    if (!change || !t) continue
    const weeks = Math.max(1, Math.round(change.days_away / 7))
    events.push({
      when: t('coming_in_weeks', { weeks, s: weeks === 1 ? '' : 's', date: change.date }),
      title: t('coming_enters_sign', { planet: t(`planet_${planet}`, planet), sign: change.to_sign }),
      description: t(`coming_sign_change_${planet.toLowerCase()}`),
    })
  }

  const ad = chart.dasha.current_antardasha
  if (ad?.end && t) {
    events.push({
      when: formatDate(ad.end),
      title: t('coming_antardasha_ends', { planet: t(`planet_${ad.planet}`, ad.planet) }),
      description: t('coming_antardasha_ends_body'),
    })
  }

  return events
}
