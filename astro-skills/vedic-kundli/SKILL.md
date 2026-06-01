---
name: vedic-kundli-reader
description: >
  Read, interpret, and answer questions about Vedic astrology horoscope (kundli) reports — including PDF reports from AstroSage, AstroVed, Jagannatha Hora, or hand-written charts. Use this skill whenever a user uploads or pastes a kundli/horoscope report and wants interpretation, gemstone advice, dasha analysis, dosha checks, predictions, or remedies. Also trigger when a user mentions their lagna, rasi, nakshatra, mahadasha, Sade Sati, Mangal Dosha, Kalsarpa, or planetary positions and asks what any of it means. Works with partial data too — even if the user only knows their moon sign and nakshatra, use this skill to help them.
---

# Vedic Kundli Reader

A skill for reading and interpreting Vedic astrology (Jyotish) horoscope reports, whether from PDF files, screenshots, or data typed by the user.

---

## Step 1 — Extract Key Data

When a kundli document or data is provided, always extract and organize these fields first (silently, no need to repeat all of them back unless asked):

### Identity Fields
| Field | Look for |
|---|---|
| **Lagna (Ascendant)** | "Lagna", "Asc", "Rising Sign" |
| **Lagna Lord** | Planet ruling the lagna sign |
| **Rasi (Moon Sign)** | "Rasi", "Moon Sign", "Chandra Rashi" |
| **Nakshatra & Pada** | "Nakshatra-Pada", "Star-Pada" |
| **Nakshatra Lord** | Planet ruling the nakshatra |
| **Sun Sign (Indian)** | Sidereal sun sign (Lahiri ayanamsa) |
| **Dasa Balance** | Remaining dasha at birth |

### Planetary Positions
Extract the sign + house + nakshatra for all 9 Jyotish planets:
Sun (Su), Moon (Mo), Mars (Ma), Mercury (Me), Jupiter (Ju), Venus (Ve), Saturn (Sa), Rahu (Ra), Ketu (Ke)

Also note retrograde planets marked `[R]`.

### Dasha Timeline (Vimshottari)
Extract current and upcoming Mahadasha + Antardasha periods with dates.

### Dosha Checks
- **Mangal Dosha**: Present in Lagna chart? Moon chart? Both?
- **Kalsarpa Yoga**: Present or absent?
- **Sade Sati**: Current phase (Rising/Peak/Setting) or upcoming dates?

### Favourable Points
Lucky stone, lucky days, good planets, lucky numbers, friendly signs.

---

## Step 2 — Interpret Based on Question Type

### A) General Chart Reading
Give a structured overview:
1. **Lagna** — personality, body, overall life direction
2. **Moon Sign + Nakshatra** — emotional nature, mind, instincts
3. **Sun Sign** — soul purpose, father, authority
4. **Key planetary strengths** — exalted, own sign, or well-placed planets
5. **Key challenges** — debilitated, combust, or afflicted planets

### B) Current Period (Dasha / Antardasha)
1. Identify the current Mahadasha lord and its house + sign in the natal chart
2. Identify the current Antardasha lord similarly
3. Interpret the combined effect: which houses are activated, what themes emerge (career, health, relationship, finance, spirituality)
4. Mention approximate duration remaining

### C) Sade Sati Analysis
- Identify current phase: **Rising** (12th from Moon), **Peak** (Moon sign), or **Setting** (2nd from Moon)
- Explain what that phase typically indicates (see reference below)
- Always remind: Sade Sati effects depend heavily on Saturn's natal placement and current dasha

### D) Mangal Dosha
- State clearly: present in Lagna chart / Moon chart / both / neither
- Explain implications only if present
- Mention cancellation conditions (both partners manglik, Mars in own/exalted sign, etc.)
- Give standard remedies if asked (see Remedies section)

### E) Kalsarpa Yoga
- State present or absent
- If present: identify which Kalsarpa type by Rahu's sign/house
- Explain general effects and remedies

### F) Gemstone Recommendations
→ Cross-reference with the `vedic-gemstones` skill if available, OR use the logic below:
- Recommend stones for **lagna lord** and **yoga-karaka** planets
- Caution against stones for 6th, 8th, 12th lords
- Always mention metal, finger, day, and weight range

---

## Step 3 — Interpretation Reference Tables

### Sade Sati Phases
| Phase | Saturn's Position | General Theme |
|---|---|---|
| Rising | 12th from Moon | Financial pressure, hidden enemies, foreign travel, sleep disruption |
| Peak | On natal Moon | Mental stress, health issues, identity challenges, spiritual growth |
| Setting | 2nd from Moon | Family/financial tensions, speech issues, slow resolution |

### House Significations (quick reference)
| House | Theme |
|---|---|
| 1st | Self, health, appearance, personality |
| 2nd | Wealth, family, speech, food |
| 3rd | Courage, siblings, short travel, communication |
| 4th | Home, mother, vehicles, happiness |
| 5th | Children, intelligence, past-life merit, creativity |
| 6th | Enemies, disease, service, debt |
| 7th | Marriage, partnership, business |
| 8th | Longevity, transformation, inheritance, occult |
| 9th | Dharma, father, guru, higher learning, luck |
| 10th | Career, status, karma, authority |
| 11th | Gains, income, elder siblings, social network |
| 12th | Losses, moksha, foreign lands, expenses, spirituality |

### Planet Dignities
| Planet | Exaltation | Debilitation | Own Signs |
|---|---|---|---|
| Sun | Aries | Libra | Leo |
| Moon | Taurus | Scorpio | Cancer |
| Mars | Capricorn | Cancer | Aries, Scorpio |
| Mercury | Virgo | Pisces | Gemini, Virgo |
| Jupiter | Cancer | Capricorn | Sagittarius, Pisces |
| Venus | Pisces | Virgo | Taurus, Libra |
| Saturn | Libra | Aries | Capricorn, Aquarius |
| Rahu | Gemini/Taurus | Sagittarius/Scorpio | — |
| Ketu | Sagittarius/Scorpio | Gemini/Taurus | — |

### Nakshatra Lords (Vimshottari)
Ashwini/Magha/Moola → Ketu | Bharani/PurvaPhalguni/PurvaAshadha → Venus | Krittika/Uttara/Uttarashadha → Sun | Rohini/Hasta/Shravana → Moon | Mrigasira/Chitra/Dhanishtha → Mars | Ardra/Swati/Shatabhisha → Rahu | Punarvasu/Vishakha/PurvaBhadra → Jupiter | Pushya/Anuradha/UttaraBhadra → Saturn | Ashlesha/Jyeshtha/Revati → Mercury

---

## Step 4 — Remedies Reference

### General Planetary Remedies
| Planet | Day | Color | Mantra | Charity |
|---|---|---|---|---|
| Sun | Sunday | Red/Orange | Om Hraam Hreem Hroum Sah Suryaya Namah | Wheat, jaggery |
| Moon | Monday | White | Om Shram Shreem Shroum Sah Chandraya Namah | Rice, milk, silver |
| Mars | Tuesday | Red | Om Kraam Kreem Kroum Sah Bhaumaya Namah | Red lentils, copper |
| Mercury | Wednesday | Green | Om Braam Breem Broum Sah Budhaya Namah | Green moong, books |
| Jupiter | Thursday | Yellow | Om Graam Greem Groum Sah Gurave Namah | Yellow dal, turmeric |
| Venus | Friday | White/Pink | Om Draam Dreem Droum Sah Shukraya Namah | White sweets, rice |
| Saturn | Saturday | Blue/Black | Om Praam Preem Proum Sah Shanaischaraya Namah | Sesame, black cloth |
| Rahu | Saturday | Grey | Om Bhraam Bhreem Bhroum Sah Rahave Namah | Coconut, blue flowers |
| Ketu | Tuesday | Mixed | Om Sraam Sreem Sroum Sah Ketave Namah | Sesame, blankets |

### Mangal Dosha Remedies
**Before marriage**: Kumbha Vivah (marriage with a pot), Vishnu Vivah, Ashwatha Vivah (peepal tree)
**After marriage**: Kesariya Ganapati puja, Hanuman Chalisa daily, Mahamrityunjaya mantra
**Lal Kitab**: Feed birds sweets, keep ivory at home, worship banyan tree with sweetened milk

### Sade Sati General Remedies
- Worship Shani (Saturn) on Saturdays
- Recite Shani Chalisa or Hanuman Chalisa
- Donate sesame seeds, black cloth, mustard oil on Saturdays
- Wear iron ring on middle finger (right hand) — consult astrologer first

---

## Step 5 — Tone & Caveats

- Be warm, grounded, and culturally respectful — Vedic astrology is a sacred tradition for many
- Distinguish between **general indications** and **certainties** — no prediction is absolute
- For health predictions, always add: *"Please consult a qualified medical professional for health decisions"*
- For major life decisions (marriage, investment, surgery), recommend consulting a qualified Jyotishi
- When data is incomplete, say so clearly and work with what's available
- Do not make fatalistic statements — karma can be modified through effort and remedies

---

## Triggering Examples

This skill should activate when the user:
- Uploads a kundli PDF or screenshot and asks "what does this say?"
- Says "my lagna is Scorpio, rasi is Gemini — what does that mean?"
- Asks "I'm in Saturn Mahadasha, what should I expect?"
- Says "my report says Mangal Dosha is present, should I worry?"
- Asks "what gemstone should I wear based on my chart?"
- Wants to know "is Sade Sati affecting me right now?"
- Asks about Kalsarpa Yoga, any dosha, or any planetary period

---

## Notes

- AstroSage PDFs use standard North Indian chart format with house numbers 1–12
- "Bhav" = house; "Graha" = planet; "Rashi" = sign; "Nakshatra" = lunar mansion
- Retrograde planets [R] behave differently — their results may be internalized or delayed
- Ayanamsa: Most Indian software uses **Lahiri** (Chitrapaksha) ayanamsa — confirm before interpreting
- For Navamsa (D9) chart analysis, look at the Navamsa chart separately from the Lagna chart
