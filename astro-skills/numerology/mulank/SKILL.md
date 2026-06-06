---
name: mulank-numerology
description: >
  Answer questions about Vedic Numerology (मूलांक / Mulank) — the root number system
  . Covers complete personality traits, strengths, weaknesses, lucky
  colors, and favorable/unfavorable time periods for ALL Mulanks 1 through 9. Use this
  skill whenever the user asks about their birth number, mulank, root number, psychic
  number, numerology reading, lucky colors by birth date, auspicious time periods, or
  personality based on date of birth. Trigger for questions like "mera mulank kya hai",
  "born on 15th what is my number", "mulank 3 ki visheshta", "lucky color for number 1",
  "favorable time for psychic number 2", "sun mulank", "moon mulank", "jupiter number",
  "shani mulank", "mangal mulank", or any Hindi/English/Hinglish numerology query
  referencing birth dates, planetary rulers, or occult guidance from .
---

# Mulank Numerology Skill
**Source:** Advance Numerology Mentorship Program 
**Languages:** English (Mulank 1–3), Hindi (Mulank 5–9)

---

## How to Determine Mulank

Mulank = **single digit of birth date only** (not month or year).

| Birth Dates  | Mulank | Ruling Planet       |
|--------------|--------|---------------------|
| 1, 10, 19, 28 | 1     | Sun (सूर्य)         |
| 2, 11, 20, 29 | 2     | Moon (चंद्र)        |
| 3, 12, 21, 30 | 3     | Jupiter (गुरु)      |
| 4, 13, 22, 31 | 4     | Rahu *(not in skill yet)* |
| 5, 14, 23    | 5      | Mercury (बुध)       |
| 6, 15, 24    | 6      | Venus (शुक्र)       |
| 7, 16, 25    | 7      | Ketu (केतु)         |
| 8, 17, 26    | 8      | Saturn (शनि)        |
| 9, 18, 27    | 9      | Mars (मंगल)         |

---

## Workflow

When a user asks about their Mulank:
1. **Identify the Mulank** from their birth date (day only).
2. **Load the relevant reference file** from `references/` for that number.
3. **Answer the specific question** — personality, colors, timing, or full reading.
4. **Respond in the user's language** — Hindi, English, or Hinglish as appropriate.

---

## Reference Files

| File | Mulank | Language | Contents |
|------|--------|----------|----------|
| `references/mulank-1.md` | 1 | English | Sun — leadership, confidence, timing, color (Red) |
| `references/mulank-2.md` | 2 | English | Moon — nurturing, intuition, timing, color (White) |
| `references/mulank-3.md` | 3 | English | Jupiter — ambition, communication, timing |
| `references/mulank-5.md` | 5 | Hindi   | Mercury — lucky color (Green) only |
| `references/mulank-6.md` | 6 | Hindi   | Venus — full profile, love, timing, color (White/Rainbow) |
| `references/mulank-7.md` | 7 | Hindi   | Ketu — intuition, occult, timing, color (Black/Grey) |
| `references/mulank-8.md` | 8 | Hindi   | Saturn — resilience, karma, timing, color (Blue) |
| `references/mulank-9.md` | 9 | Hindi   | Mars — leadership, energy, timing, color (Red) |

> **Mulank 4** data is not yet available in this skill.

**Always load the specific reference file before answering.**

---

## Quick Reference Summary

| Mulank | Planet  | Lucky Color         | Best Period               |
|--------|---------|---------------------|---------------------------|
| 1      | Sun     | Red                 | Mar 21 – Aug 20           |
| 2      | Moon    | White               | June – July               |
| 3      | Jupiter | Yellow* (unconfirmed) | Mid Feb–Mid Mar & Nov 25–Dec 25 |
| 5      | Mercury | Green               | *(not specified)*         |
| 6      | Venus   | White + Rainbow     | Apr 20–May 20 & Sep 20–Oct 20 |
| 7      | Ketu    | Black/Grey/Kale     | Jun 20 – Jul 20           |
| 8      | Saturn  | Blue                | Sep 20 – Oct 20           |
| 9      | Mars    | Red                 | Mar 20 – Apr 25           |

---

## Response Format Guidelines

- **Personality query** → 3–5 key traits in bullet or short paragraph form.
- **Lucky color query** → Name color + practical daily ways to incorporate it.
- **Timing query** → Clearly separate favourable vs unfavourable periods with dates.
- **Full reading** → Personality → strengths/challenges → timing → lucky color.
- Warm, respectful tone — numerology is personal and meaningful.
- Match the user's language: Hindi, English, or Hinglish naturally.

---

## Important Notes

- Mulank 4 is not yet included in this skill — say so clearly if asked.
- Mulank 5 has lucky color data only (full traits not captured in source).
- Do not fabricate data for Mulanks outside this skill.
