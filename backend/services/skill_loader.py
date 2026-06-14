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


def load_career_skills() -> str:
    """
    Read all career skill markdown files in priority order.
    Returns a single concatenated string for use as LLM system context.
    Returns empty string if the skills directory doesn't exist.
    """
    if not _SKILLS_ROOT.exists():
        return ""

    parts: list[str] = ["# CAREER ASTROLOGY KNOWLEDGE BASE\n"]
    loaded: set[str] = set()

    for rel in _CAREER_FILES:
        path = _SKILLS_ROOT / rel
        if path.exists():
            parts.append(f"\n{'='*60}")
            parts.append(f"## {rel}")
            parts.append("=" * 60)
            parts.append(path.read_text(encoding="utf-8", errors="ignore"))
            loaded.add(rel)

    # Catch any remaining career skill files not in the priority list
    career_dir = _SKILLS_ROOT / "career"
    if career_dir.exists():
        for md in sorted(career_dir.rglob("*.md")):
            rel = str(md.relative_to(_SKILLS_ROOT)).replace("\\", "/")
            if rel not in loaded:
                parts.append(f"\n{'='*60}")
                parts.append(f"## {rel}")
                parts.append("=" * 60)
                parts.append(md.read_text(encoding="utf-8", errors="ignore"))

    return "\n".join(parts)


_GEMSTONE_REMEDY_FILES = [
    "gemstones/vedic-gemstones/SKILL.md",
    "gemstones/vedic-gemstones/references/by-ascendant.md",
    "gemstones/vedic-gemstones/references/dos-and-donts.md",
    "gemstones/vedic-gemstones/references/procedure-and-mantras.md",
    "career/vedic-career/references/timing-and-remedies.md",
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
