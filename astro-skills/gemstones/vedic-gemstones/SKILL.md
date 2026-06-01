---
name: vedic-gemstones
description: Recommend, explain, and prescribe gemstones (Navratna) using Vedic astrology — covers Ruby/Manikya, Pearl/Moti, Red Coral/Moonga, Emerald/Panna, Yellow Sapphire/Pukhraj, Diamond/Heera, Blue Sapphire/Neelam, Hessonite/Gomed, and Cat's Eye/Lehsunia. Use this skill whenever the user asks which gemstone to wear, asks about a specific stone's astrological effects, mentions their lagna/ascendant/rashi/moon sign in connection with stones, asks about planetary remedies, mahadasha/antardasha-related stone choices, ruling planets and their stones, beej mantras for activation, the right finger/metal/day to wear a stone, panchamrit/activation rituals, gemstone substitutes, or stone combinations and incompatibilities — even if they don't say the word "Vedic" or "astrology" explicitly. Trigger this for casual phrasings like "should I wear a yellow sapphire", "is moonga good for me", "what stone for Saturn", or "I'm a Leo, which ratna suits me".
---

# Vedic Gemstones (Navratna)

This skill helps recommend gemstones as astrological remedies and explain their effects, based on classical Vedic principles. Each of the nine gemstones is tied to a planet (graha); wearing the right stone is believed to channel that planet's energy and strengthen its positive influence in the wearer's life.

## How to use this skill

The skill is split into one reference file per gemstone plus two cross-cut references. **Don't load everything at once.** Read only what the user's question needs.

| The user is asking about… | Load |
|---|---|
| A specific gemstone (its effects, who can wear it, finger/metal/day) | The matching `references/<stone>.md` |
| "Which gemstones should I wear as a [ascendant]?" | `references/by-ascendant.md` first; then drill into individual stones |
| How to wear / activate / energize a stone, or beej mantras | `references/procedure-and-mantras.md` |
| Donations (dana) for a planet | `references/procedure-and-mantras.md` (includes full donations table) |
| Comparison / combination of two or more stones | Both stone files, plus `references/dos-and-donts.md` for compatibility rules |
| Substitutes for a stone they can't afford | The matching stone file's "Substitute" line; for Venus → `references/opal.md` |
| What NOT to do, buying advice, how many stones to wear, ring rules | `references/dos-and-donts.md` |
| Opal specifically, or Venus substitute details | `references/opal.md` |

The full mapping of gemstones to their reference files:

| Planet | Gemstone (English / Hindi) | Reference file |
|---|---|---|
| Sun (Surya) | Ruby / Manikya | `references/ruby.md` |
| Moon (Chandra) | Pearl / Moti | `references/pearl.md` |
| Mars (Mangal) | Red Coral / Moonga | `references/red-coral.md` |
| Mercury (Budh) | Emerald / Panna | `references/emerald.md` |
| Jupiter (Guru) | Yellow Sapphire / Pukhraj | `references/yellow-sapphire.md` |
| Venus (Shukra) | Diamond / Heera | `references/diamond.md` |
| Venus (Shukra) — substitute | Opal | `references/opal.md` |
| Saturn (Shani) | Blue Sapphire / Neelam | `references/blue-sapphire.md` |
| Rahu | Hessonite / Gomed | `references/hessonite.md` |
| Ketu | Cat's Eye / Lehsunia | `references/cats-eye.md` |
| General rules | Do's & Don'ts | `references/dos-and-donts.md` |

## The framework: how a gemstone gets recommended

A gemstone is never recommended on the basis of one factor alone. Before suggesting any stone, work through the following — and tell the user clearly what you'd need from them if they haven't shared it:

1. **Birth chart analysis** — overall planetary positions, their houses, and influences in the native's life.
2. **Ascendant (Lagna)** — the rising sign at birth. This is the single most important factor: the same planet can be benefic for one lagna and malefic for another. The stone of a malefic planet should generally be avoided.
3. **Position of planets** — especially the planets ruling the lagna and other key houses (the I, V, IX, and X houses correlate to overall well-being, education/luck, fortune, and career).
4. **Quality of planets** — strength/weakness, benefic or malefic nature, the houses they aspect (drishti), and their conjunctions (yuti).
5. **Current dasha** — the running mahadasha and antardasha. Many stones are recommended only during the dasha period of their ruling planet.
6. **House conditions** — condition of the house the planet sits in and the house lord.
7. **Personalised problem or goal** — what the wearer is trying to address (health, marriage, career, legal battles, spiritual growth, etc.). The same chart can warrant different stones depending on the goal.
8. **Compatibility (suitability trial)** — even after analysis, a trial is recommended for "uncertain" or strong stones (Blue Sapphire and Cat's Eye especially). See `references/procedure-and-mantras.md` for trial methods.
9. **Moon sign and Rashi** — supporting factor alongside the lagna.

If the user gives you only their sun sign or only their date of birth without time/place, be honest that a precise recommendation needs the full chart. You can still offer general indications based on what they've shared, but flag the limitation.

## Quick lagna-to-favorable-stones map

This is a fast first cut — always confirm against the individual stone files for the conditions (which house the planet must sit in, whether dasha must be running, etc.).

| Ascendant | Generally favorable | Generally avoid | Conditional / dasha-only |
|---|---|---|---|
| Aries | Ruby, Red Coral, Yellow Sapphire, Pearl | Diamond, Blue Sapphire, Emerald (mostly) | Hessonite, Cat's Eye |
| Taurus | Diamond, Emerald, Blue Sapphire | Ruby, Pearl, Red Coral, Yellow Sapphire | Hessonite, Cat's Eye |
| Gemini | Emerald, Diamond | Ruby, Red Coral, Pearl (mostly), Yellow Sapphire (mostly) | Hessonite, Blue Sapphire (avoid), Cat's Eye |
| Cancer | Pearl, Red Coral, Ruby, Yellow Sapphire | Blue Sapphire, Hessonite (long-term), Emerald (mostly), Diamond (mostly) | Cat's Eye |
| Leo | Ruby, Red Coral, Yellow Sapphire | Blue Sapphire, Hessonite, Diamond, Pearl (mostly) | Emerald, Cat's Eye |
| Virgo | Emerald, Diamond | Ruby, Red Coral, Pearl (mostly), Yellow Sapphire (mostly) | Blue Sapphire, Hessonite, Cat's Eye |
| Libra | Diamond, Emerald, Blue Sapphire | Ruby (mostly), Red Coral, Yellow Sapphire (mostly) | Hessonite, Cat's Eye, Pearl |
| Scorpio | Ruby, Red Coral, Yellow Sapphire | Diamond, Emerald (mostly), Blue Sapphire, Hessonite | Pearl, Cat's Eye |
| Sagittarius | Yellow Sapphire, Red Coral, Ruby | Pearl, Blue Sapphire, Emerald (mostly), Diamond (mostly) | Hessonite, Cat's Eye |
| Capricorn | Diamond, Emerald, Blue Sapphire | Ruby, Yellow Sapphire (mostly), Pearl (mostly), Red Coral (mostly) | Hessonite, Cat's Eye |
| Aquarius | Diamond, Emerald, Blue Sapphire | Ruby, Pearl, Red Coral (mostly), Yellow Sapphire (mostly) | Hessonite, Cat's Eye |
| Pisces | Yellow Sapphire, Red Coral, Pearl | Diamond, Blue Sapphire, Hessonite (mostly), Emerald (mostly) | Ruby (rare), Cat's Eye |

For ascendant-by-ascendant detail (every stone, every lagna, in one place), use `references/by-ascendant.md`.

## Universal cautions that override any chart

- **Solitaire only.** A stone worn for astrological purposes should be a solitaire. Small ornamental stones won't give astrological results.
- **Naturally sourced only.** Lab-grown gemstones do not work as astrological remedies.
- **Substitutes must weigh more.** If using a substitute (e.g., red garnet for ruby), it must be heavier in carats than the original would have been.
- **Replace every five years.** Stones meant to be worn lifelong lose efficacy and should be re-energized/replaced roughly every five years.
- **Trial first for sensitive stones.** Blue Sapphire and Cat's Eye in particular can give sudden positive *or* negative results — a 3-day trial is mandatory.
- **Visible flaws disqualify.** Black or red speckles, dual-tone hessonites, red dots in diamonds — these are red flags. Reject the stone.
- **Activation matters.** A stone must be ritually activated (panchamrit + ganga jal + 108 beej mantra repetitions of the planet) before wearing. See `references/procedure-and-mantras.md`.

## Common combinations and incompatibilities

These come up constantly — keep them in mind when answering combo questions:

- **Ruby ↔ Blue Sapphire / Hessonite**: never together.
- **Pearl ↔ Blue Sapphire / Diamond / Hessonite**: never together.
- **Red Coral ↔ Diamond / Blue Sapphire / Emerald**: never together.
- **Emerald ↔ Red Coral / Pearl / Ruby**: never together.
- **Yellow Sapphire ↔ Diamond / Blue Sapphire / Hessonite / Emerald**: never together.
- **Diamond ↔ Red Coral / Pearl / Ruby**: never together. Also: diamond should not touch the wearer's skin.
- **Blue Sapphire ↔ Ruby / Red Coral / Pearl**: never together.
- **Hessonite ↔ Red Coral / Pearl / Yellow Sapphire / Ruby**: never together.
- **Cat's Eye ↔ Blue Sapphire / Emerald / Diamond**: never together.

Conversely, these classical *combinations* come up often and are usually safe (subject to chart):

- Ruby + Yellow Sapphire, Ruby + Coral, or Ruby + Yellow Sapphire + Coral — for Aries / Leo / Sagittarius.
- Pearl + Yellow Sapphire, Pearl + Coral, or all three — for Cancer / Scorpio / Pisces.
- Emerald + Blue Sapphire, Emerald + Diamond, or all three — for Taurus / Gemini / Virgo / Libra / Capricorn / Aquarius.
- Diamond + Blue Sapphire (or with Emerald) — for the Venus-friendly lagnas above.

## Tone and framing

Astrology is a belief system, not a clinical science. When giving recommendations:

- Speak in the tradition's own register (lagna, dasha, house lord, drishti, yuti) — but briefly translate jargon for newcomers.
- Be specific. "It depends on your chart" is a non-answer; instead say *what specifically* in the chart it depends on, and ask for that information.
- Don't over-promise. The text speaks of stones bringing wealth, marriage, fame, etc. — these are traditional claims; phrase them as what the tradition holds, not as guarantees.
- Never recommend a gemstone as a substitute for medical, legal, or financial professional advice. If the user mentions a serious health, mental health, legal, or financial issue, point them to appropriate professional help alongside any traditional remedy.
- If the user hasn't shared lagna or full chart and is asking for a personal recommendation, ask. The recommendation genuinely depends on it.
