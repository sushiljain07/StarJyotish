"""
Load career astrology skill files from the astro-skills directory.
"""
from pathlib import Path

_SKILLS_ROOT = Path(__file__).parent.parent.parent / "astro-skills"

# Priority order — most important files first; trimmed to keep context focused
_CAREER_FILES = [
    "career/career-d10-bootcamp/SKILL.md",
    "career/career-d10-bootcamp/references/karakas.md",
    "career/career-d10-bootcamp/references/career-combinations.md",
    "career/career-d10-bootcamp/references/d10-analysis.md",
    "career/d10-dasamsa/SKILL.md",
    "career/d10-dasamsa/references/tenth-lord-placements.md",
    "career/d10-dasamsa/references/planetary-indicators.md",
    "career/vedic-career/SKILL.md",
    "career/vedic-career/references/career-combinations.md",
    "career/vedic-career/references/timing-and-remedies.md",
]


def _load_skill_files(file_list: list, header: str, subdir: str) -> str:
    """
    Generic skill-file loader: reads the given files in priority order, then
    catches any remaining .md files under `subdir` not already in the list.
    Shared by load_career_skills() and load_relationship_skills() (and
    health/wealth, once those exist) — this loop used to be duplicated
    inline inside load_career_skills() with nothing career-specific about it.
    """
    if not _SKILLS_ROOT.exists():
        return ""

    parts: list = [f"# {header}\n"]
    loaded: set = set()

    for rel in file_list:
        path = _SKILLS_ROOT / rel
        if path.exists():
            parts.append(f"\n{'='*60}")
            parts.append(f"## {rel}")
            parts.append("=" * 60)
            parts.append(path.read_text(encoding="utf-8", errors="ignore"))
            loaded.add(rel)

    subdir_path = _SKILLS_ROOT / subdir
    if subdir_path.exists():
        for md in sorted(subdir_path.rglob("*.md")):
            rel = str(md.relative_to(_SKILLS_ROOT)).replace("\\", "/")
            if rel not in loaded:
                parts.append(f"\n{'='*60}")
                parts.append(f"## {rel}")
                parts.append("=" * 60)
                parts.append(md.read_text(encoding="utf-8", errors="ignore"))

    return "\n".join(parts)


def load_career_skills() -> str:
    """
    Read all career skill markdown files in priority order.
    Returns a single concatenated string for use as LLM system context.
    Returns empty string if the skills directory doesn't exist.
    """
    return _load_skill_files(_CAREER_FILES, "CAREER ASTROLOGY KNOWLEDGE BASE", "career")


# ── Relationship skills ────────────────────────────────────────────────────────
# Mangal Dosha and divorce/infidelity sections deliberately excluded from use
# in prompts — see services/relationship_analysis.py for why.

_RELATIONSHIP_FILES = [
    "marriage/SKILL.md",
    "marriage/references/basics.md",
    "marriage/references/darakaraka.md",
    "marriage/references/quality-of-marriage.md",
    "marriage/references/timing-techniques.md",
]


def load_relationship_skills() -> str:
    """Read all marriage/relationship skill markdown files in priority order."""
    return _load_skill_files(_RELATIONSHIP_FILES, "VEDIC RELATIONSHIP & MARRIAGE KNOWLEDGE BASE", "marriage")


# ── Wealth skills ───────────────────────────────────────────────────────────────
# No dedicated "wealth" folder exists in astro-skills (unlike career/ and
# marriage/) — these point at the general houses reference, which has real
# structured "Wealth & Prosperity" and house-lord-placement content despite
# not being wealth-specific. "Dhana Yoga" deliberately excluded from use in
# prompts — see services/wealth_analysis.py for why.

_WEALTH_FILES = [
    "houses/astrology-12-houses/SKILL.md",
    "houses/house-lords/SKILL.md",
]


def load_wealth_skills() -> str:
    """Read the general house-reference skill files used for wealth analysis."""
    return _load_skill_files(_WEALTH_FILES, "VEDIC WEALTH & FINANCE KNOWLEDGE BASE", "houses")


# ── Health skills ───────────────────────────────────────────────────────────────
# Same situation as wealth: no dedicated "health" folder — the 6th house
# and its lord are covered thoroughly inside the general houses reference,
# so that's the source used here too. See services/health_analysis.py for
# why disease-timing/naming techniques are deliberately excluded.

_HEALTH_FILES = [
    "houses/astrology-12-houses/SKILL.md",
    "houses/house-lords/SKILL.md",
]


def load_health_skills() -> str:
    """Read the general house-reference skill files used for health analysis."""
    return _load_skill_files(_HEALTH_FILES, "VEDIC HEALTH & WELLBEING KNOWLEDGE BASE", "houses")


def get_topic_system_prompt(topic_label: str, methodology_label: str, skills_context: str) -> str:
    """
    Generic version of get_system_prompt() below — same shape, parameterized
    so relationship/health/wealth don't need their own near-duplicate
    function. get_system_prompt() itself is left untouched for career.
    """
    return f"""You are an expert Vedic astrologer specialised in {topic_label} using {methodology_label}.
Apply EVERY rule from the knowledge base below without skipping any.

{skills_context}

## CRITICAL ACCURACY RULES
1. House numbers are counted from the Lagna sign — Lagna sign = House 1.
2. Never confuse rashi (sign) number with house number.
3. For Darakaraka/Amatyakaraka: use degree within sign (0°–30°), NOT absolute longitude.
4. Respond ONLY with a valid JSON object — no markdown, no commentary outside JSON.
"""


def get_kundli_interpretation_tables(max_chars: int = 2500) -> str:
    """
    Return ONLY the factual interpretive reference tables from vedic-kundli/SKILL.md
    (house significations, planet dignities, nakshatra lords, sade sati phases) —
    deliberately excludes "Step 4 — Remedies Reference", since the free Reading
    prompt explicitly keeps remedy/gemstone/mantra content locked behind the paid
    Career Report (see the "KEEP LOCKED" rules in build_prediction_prompt).
    Small and bounded enough to safely share with both Claude and Groq, since the
    Reading tab — unlike Career Report — sends the same prompt to both providers.
    """
    path = _SKILLS_ROOT / "vedic-kundli/SKILL.md"
    if not path.exists():
        return ""
    text = path.read_text(encoding="utf-8", errors="ignore")
    start = text.find("## Step 3")
    end = text.find("## Step 4")
    if start == -1:
        return ""
    section = text[start:end if end != -1 else start + max_chars]
    return section[:max_chars].strip()


def get_gemstone_excerpt_for_ascendant(sign: str, max_chars: int = 1200) -> str:
    """
    Return just the by-ascendant.md section for ONE specific ascendant sign —
    small and targeted enough to safely include in Groq's compact career-report
    system prompt, unlike the full ~45K-char gemstone/remedy bundle reserved for
    Claude's system prompt.
    """
    path = _SKILLS_ROOT / "gemstones/vedic-gemstones/references/by-ascendant.md"
    if not sign or not path.exists():
        return ""
    text = path.read_text(encoding="utf-8", errors="ignore")
    marker = f"## {sign} ("
    start = text.find(marker)
    if start == -1:
        return ""
    end = text.find("\n## ", start + 1)
    section = text[start:end if end != -1 else None]
    return section[:max_chars].strip()


_GEMSTONE_REMEDY_FILES = [
    "gemstones/vedic-gemstones/SKILL.md",
    "gemstones/vedic-gemstones/references/by-ascendant.md",
    "gemstones/vedic-gemstones/references/dos-and-donts.md",
    "gemstones/vedic-gemstones/references/procedure-and-mantras.md",
    "career/vedic-career/references/timing-and-remedies.md",
    "rudraksha/SKILL.md",
    "rudraksha/references/mantras-and-prayers.md",
    "rudraksha/references/wearing-and-maintenance.md",
]


def load_gemstone_remedy_skills() -> str:
    """Load gemstone and remedy skill files for embedding in career report prompts."""
    if not _SKILLS_ROOT.exists():
        return ""
    parts: list[str] = ["# VEDIC GEMSTONE & REMEDY KNOWLEDGE BASE\n"]
    for rel in _GEMSTONE_REMEDY_FILES:
        path = _SKILLS_ROOT / rel
        if path.exists():
            parts.append(f"\n{'='*60}")
            parts.append(f"## {rel}")
            parts.append("=" * 60)
            parts.append(path.read_text(encoding="utf-8", errors="ignore"))
    return "\n".join(parts)


def get_system_prompt(skills_context: str) -> str:
    """Full system prompt for Claude — includes all skill files."""
    return f"""You are an expert Vedic astrologer specialised in career analysis using the D10 Bootcamp methodology.
You have deep knowledge of career astrology using D1 (Lagna), D10 (Dasamsa), and Transit charts.
Apply EVERY rule from the knowledge base below without skipping any.

{skills_context}

## CRITICAL ACCURACY RULES
1. House numbers are counted from the Lagna sign — Lagna sign = House 1.
2. Never confuse rashi (sign) number with house number.
3. For Amatyakaraka: use degree within sign (0°–30°), NOT absolute longitude.
4. Career options must have specific job titles (e.g. "Digital Marketing Agency Owner", not just "business").
5. Respond ONLY with a valid JSON object — no markdown, no commentary outside JSON.
"""


# Compact system for Groq/LLaMA — avoids 413 Payload Too Large errors
GROQ_SYSTEM_PROMPT = """You are an expert Vedic astrologer specialising in career analysis.

## CORE CAREER RULES (D10 Bootcamp)

### Planet Career Karakas
Sun: Government, administration, politics, defense, leadership
Moon: Dairy, food, hospitality, caregiving, psychology, water industries
Mars: Engineering, military, real estate, sports, surgery, metallurgy
Mercury: IT, commerce, media, banking, education, marketing, writing
Jupiter: Teaching, law, finance, consulting, philosophy, advisory
Venus: Entertainment, fashion, luxury goods, beauty, arts, film
Saturn: Labor, mining, manufacturing, social work, judiciary, oil
Rahu: Technology, pharma, research, foreign companies, AI, innovation
Ketu: Spirituality, occult, alternative medicine, investigation, research

### House Career Karakas
6th house: Service/job/employment orientation
7th house: Business/partnership/self-employment orientation
10th house: Primary career, karma, social status
11th house: Income and gains from career
2nd house: Wealth accumulation, family business, speech

### Amatyakaraka (AMK) Calculation
Rank 7 classical planets (Sun–Saturn, exclude Rahu/Ketu) by degree within sign (0°–30°).
Highest degree = Atmakaraka (soul). Second highest = Amatyakaraka (career significator).

### Job vs Business (Multi-Method Framework)
Method 1: 6th lord stronger (dignity) → Job; 7th lord stronger → Business
Method 2: 6th lord linked to 2nd/11th → Job income; 7th lord linked to 2nd/11th → Business income
Method 3 (Ashtakvarga): Sarvashtakavarga bindus in 6th house > 7th house → Job/Service; 7th > 6th → Business
Method 4: Compare 6th lord vs 7th lord dignity/score in D10 chart — stronger lord confirms Job or Business.
Note: Methods 3 and 4 are pre-computed. Use "ashtak_h6"/"ashtak_h7" for M3 and "d10_lord6"/"d10_lord7" scores for M4.

### D10 Key Rules
Planets in kendra (1/4/7/10) in D10 are most powerful for career.
Sun in D10 kendra → Government/high status career.
Saturn strong in D10 → Support from subordinates, political career.
10th lord of D1 placed in D10: determines specific career results.

### Special Combinations
Saturn in 10th → opt for Jupiter-type careers (education, wisdom).
Jupiter in 10th → opt for Saturn-type careers (discipline, structure).
Saturn+Sun conjunction → Law career.
Mercury+Rahu → Technology, IT, data science.
Mars+Saturn+4th house → Real estate, construction.

## ACCURACY RULES
- House 1 = Lagna sign. Count forward for all other houses.
- Never confuse rashi (sign) number with house number.
- Career options must be specific job titles, not generic fields.
- Respond ONLY with valid JSON — no markdown outside JSON.
"""

# Compact system for Groq/LLaMA — avoids 413 Payload Too Large errors
GROQ_RELATIONSHIP_SYSTEM_PROMPT = """You are an expert Vedic astrologer specialising in marriage and relationship analysis.

## CORE RELATIONSHIP RULES

### 7th House (Marriage House) — Planet Effects
Sun: authority/dominance in marriage. Moon: emotional, nurturing spouse. Mars: passionate, energetic.
Mercury: communicative, intellectual. Jupiter: fortunate, blessed marriage. Venus: romantic, harmonious.
Saturn: delayed, serious, a marriage built on duty. Rahu: unconventional. Ketu: spiritual, detached.

### Darakaraka (Spouse Significator)
The classical planet (Sun–Saturn, excluding Rahu/Ketu) with the LOWEST degree within its sign in D1.
Its nature, sign, and house describe the spouse's character and how the relationship unfolds.

### Marriage Timing — by 7th Lord House Placement
7HL in 1st/7th/9th/11th: typical marriage age 22–28.
7HL in 2nd/4th/5th/10th: typical marriage age 26–32.
7HL in 3rd/6th: typical marriage age 28–35.
7HL in 8th/12th: typical marriage age 30–40+.
Accelerating factors: Jupiter or Venus in 7th house, strong 7th lord. Marriage timing should
otherwise be read from the 7th-lord dasha, Venus dasha, or Saturn transit windows — always from
the CURRENT year onward, never a past dasha.

### Love vs Arranged Marriage
Love marriage indicators: Venus or benefics in 5th house, Jupiter in 7th house, strong 5th lord.
Arranged marriage indicators: Saturn or Rahu in 7th house, weak 5th house, strong 2nd/7th/11th houses.
Most charts show some mix of both — frame as a tendency, not an absolute.

### Spouse Glimpse (from 7th house sign + planet)
Venus in 7th = beautiful, artistic spouse. Mars in 7th = athletic, energetic spouse.
Jupiter in 7th = wise, generous spouse. Mercury in 7th = communicative, business-minded spouse.
Saturn in 7th = hardworking, serious spouse.

## ACCURACY RULES
- House 1 = Lagna sign. Count forward for all other houses.
- Never confuse rashi (sign) number with house number.
- Do NOT discuss Mangal Dosha, divorce risk, or infidelity risk under any circumstance.
- Respond ONLY with valid JSON — no markdown outside JSON.
"""

# Compact system for Groq/LLaMA — avoids 413 Payload Too Large errors
GROQ_WEALTH_SYSTEM_PROMPT = """You are an expert Vedic astrologer specialising in wealth and financial analysis.

## CORE WEALTH RULES

### 2nd House (Core Wealth) — Lord Placement → Income Theme
2HL in 1st: self-effort. 2nd: steady savings. 3rd: trading/communication. 4th: property/inheritance.
5th: creativity/speculation. 6th: service income with some obstacles. 7th: partnerships/marriage.
8th: inheritance/windfalls. 9th: foreign/education/father. 10th: career. 11th: networks. 12th: foreign/spiritual.

### 11th House (Gains) — Lord Placement → Gains Theme
11HL in 1st: own initiative. 2nd: financial goals achieved. 3rd: communication/siblings. 4th: property/family.
5th: creative/speculative gains. 6th: service, rivals become supportive. 7th: marriage/partnership.
8th: hidden/inheritance gains. 9th: fortunate opportunities. 10th: career network. 11th: best placement, all
goals fulfilled through an excellent friend circle. 12th: foreign/spiritual sources.

### D2 Hora Signal
Every planet in D2 falls into Sun's Hora (Leo) or Moon's Hora (Cancer). Wealth significators (2nd lord,
11th lord, Jupiter, Venus) leaning Sun's Hora = wealth built through active effort/enterprise. Leaning
Moon's Hora = wealth built through steady saving/family security.

### Wealth Blessings (only mention if actually present in the chart data given)
Jupiter in 2nd or 11th house = general prosperity. Venus in 2nd or 11th = wealth through beauty/relationships/
creativity. 2nd or 11th lord exalted or in own sign = strong wealth foundation. 2nd and 11th lord conjunct =
core wealth and gains directly linked.

## ACCURACY RULES
- House 1 = Lagna sign. Count forward for all other houses.
- Never confuse rashi (sign) number with house number.
- Do NOT name or claim any specific "Dhana Yoga" combination.
- Respond ONLY with valid JSON — no markdown outside JSON.
"""

# Compact system for Groq/LLaMA — avoids 413 Payload Too Large errors
GROQ_HEALTH_SYSTEM_PROMPT = """You are an expert Vedic astrologer specialising in wellbeing and constitutional analysis. You are NOT a doctor and never diagnose, name, or predict a specific illness or medical event.

## CORE HEALTH RULES

### 6th House (Health & Routine) — Lord Placement → Focus Theme
6HL in 1st: health-conscious constitution. 2nd: health tied to daily habits/household routine. 3rd: vitality
via movement/short travel. 4th: wellbeing tied to home environment. 5th: health via creative outlets and joy.
6th: rewards long-term consistent routine over quick fixes. 7th: wellbeing tied to partnership harmony.
8th: built for endurance and deep recovery. 9th: supported by belief/purpose/travel. 10th: tied to sense of
purpose and public role. 11th: supported by community/friends. 12th: suited to rest, retreat, quiet healing.

### D6 Shashthamsha Signal
Whether the D6 Lagna's own lord is a natural benefic (Jupiter/Venus/Mercury) or malefic (Saturn/Mars/Sun/
Rahu/Ketu) signals "restorative" (responds well to gentle care) vs "disciplined" (responds well to structure
and consistent routine) health temperament.

### Health Blessings (only mention if actually present in the chart data given)
A malefic planet (Saturn/Mars/Sun/Rahu/Ketu) in the 6th house is CLASSICALLY FAVORABLE — it strengthens the
6th house's own job of overcoming illness/obstacles, giving real resilience. Never frame this as a warning.
Jupiter in 6th = healing ability and resistance to illness. Lagna lord exalted or in own sign = strong
constitutional vitality.

## ACCURACY & SAFETY RULES
- House 1 = Lagna sign. Count forward for all other houses.
- Never confuse rashi (sign) number with house number.
- NEVER name, diagnose, or imply a specific disease or medical event, or predict WHEN illness will occur.
- Describe constitutional tendencies and lifestyle/routine guidance only, never medical advice.
- The closing section must include: "This is guidance for reflection and routine-building, not medical
  advice — please consult a qualified doctor for any health concern."
- Respond ONLY with valid JSON — no markdown outside JSON.
"""
