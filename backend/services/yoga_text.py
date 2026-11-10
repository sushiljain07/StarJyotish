"""Per-language templates for the classical-yoga checks in career_analysis.

The checks decide *which* yoga fired and with what values; this module turns
that into text. YOGA_TEXT is keyed like i18n.text() tables:
    YOGA_TEXT[language][f"{id}.{state}"]        -> description template
    YOGA_TEXT[language][f"{id}.{state}.name"]   -> yoga name
    YOGA_TEXT[language][f"{id}.item"] / ".item.<kind>" -> one list element
A language with no entry falls back to English (i18n.text). To add a language,
add a YOGA_TEXT/PLANET_NAMES/SIGN_NAMES/DIGNITY_NAMES entry; nothing else changes.
"""
from services.i18n import DEFAULT_LANGUAGE, ordinal, text

PLANET_NAMES = {
    "en": {n: n for n in ("Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu")},
    "hi": {
        "Sun": "सूर्य", "Moon": "चंद्र", "Mars": "मंगल", "Mercury": "बुध", "Jupiter": "गुरु",
        "Venus": "शुक्र", "Saturn": "शनि", "Rahu": "राहु", "Ketu": "केतु",
    },
}

SIGN_NAMES = {
    "en": {n: n for n in ("Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra",
                          "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces")},
    "hi": {
        "Aries": "मेष", "Taurus": "वृषभ", "Gemini": "मिथुन", "Cancer": "कर्क", "Leo": "सिंह",
        "Virgo": "कन्या", "Libra": "तुला", "Scorpio": "वृश्चिक", "Sagittarius": "धनु",
        "Capricorn": "मकर", "Aquarius": "कुंभ", "Pisces": "मीन",
    },
}

DIGNITY_NAMES = {
    "en": {n: n for n in ("exalted", "debilitated", "own", "friendly", "enemy", "neutral", "unknown")},
    "hi": {
        "exalted": "उच्च", "debilitated": "नीच", "own": "स्वराशि", "friendly": "मित्र राशि",
        "enemy": "शत्रु राशि", "neutral": "सम राशि", "unknown": "अज्ञात",
    },
}

# Separator between rendered list items, per yoga id (same in every language).
ITEM_SEPARATOR = {
    "kendra_trikona": "; ", "neecha_bhanga": "; ", "vipareeta": "; ",
    "yogakaraka": ", ", "saraswati": ", ",
}

_MAHAPURUSHA = {
    # id: {language: (name, quality)}
    "hamsa": {"en": ("Hamsa Yoga", "wisdom, nobility, and elevated status"), "hi": ("हंस योग", "ज्ञान, कुलीनता और उच्च प्रतिष्ठा")},
    "malavya": {"en": ("Malavya Yoga", "charm, artistry, and material prosperity"), "hi": ("मालव्य योग", "आकर्षण, कलात्मकता और भौतिक समृद्धि")},
    "sasa": {"en": ("Sasa Yoga", "discipline and leadership in large institutions"), "hi": ("शश योग", "अनुशासन और बड़ी संस्थाओं में नेतृत्व")},
    "bhadra": {"en": ("Bhadra Yoga", "intellectual brilliance and analytical career"), "hi": ("भद्र योग", "बौद्धिक प्रतिभा और विश्लेषणात्मक करियर")},
    "ruchaka": {"en": ("Ruchaka Yoga", "courage, executive authority, and leadership"), "hi": ("रुचक योग", "साहस, प्रशासनिक अधिकार और नेतृत्व")},
}

# Per-language sentence templates; {quality} is filled from _MAHAPURUSHA.
_MAHAPURUSHA_TEXT = {
    "en": {
        "suffix": "Pancha Mahapurusha",
        "present": "{{planet}} in {{sign}} (H{{house}}, {{dignity}}) — {quality}.",
        "absent": "{planet} in H{house} ({dignity}) — yoga not formed.",
        "missing": "{planet} not found in chart.",
    },
    "hi": {
        "suffix": "पंच महापुरुष",
        "present": "{{planet}} {{sign}} में ({{house_ord}} भाव, {{dignity}}) — {quality}।",
        "absent": "{planet} {house_ord} भाव में ({dignity}) — योग नहीं बना।",
        "missing": "{planet} कुंडली में नहीं मिला।",
    },
}


def _mahapurusha(language: str) -> dict:
    # Unknown languages fall back to English, as services.i18n.text does.
    lang = language if language in _MAHAPURUSHA_TEXT else DEFAULT_LANGUAGE
    tpl = _MAHAPURUSHA_TEXT[lang]
    out = {}
    for yid, rows in _MAHAPURUSHA.items():
        name, quality = rows.get(lang) or rows[DEFAULT_LANGUAGE]
        out[f"{yid}.present.name"] = f"{name} ({tpl['suffix']})"
        out[f"{yid}.absent.name"] = name
        out[f"{yid}.missing.name"] = name
        out[f"{yid}.present"] = tpl["present"].format(quality=quality)
        out[f"{yid}.absent"] = tpl["absent"]
        out[f"{yid}.missing"] = tpl["missing"]
    return out


YOGA_TEXT = {
    "en": {
        "raja_yoga.present.name": "Raja Yoga",
        "raja_yoga.present": "9th lord ({lord_9}) and 10th lord ({lord_10}) conjunct in house {house} — powerful status and career elevation.",
        "raja_yoga.absent.name": "Raja Yoga",
        "raja_yoga.absent": "9th lord ({lord_9}) and 10th lord ({lord_10}) are not conjunct.",

        "dharma_karma.present.name": "Dharma-Karma Adhipati Yoga",
        "dharma_karma.present": "{lord_9} (9th lord) and {lord_10} (10th lord) exchange signs — fortune and career destiny are intertwined.",
        "dharma_karma.absent.name": "Dharma-Karma Adhipati Yoga",
        "dharma_karma.absent": "No sign exchange between 9th lord ({lord_9}) and 10th lord ({lord_10}).",

        "budha_aditya.present.name": "Budha-Aditya Yoga",
        "budha_aditya.present": "Sun and Mercury conjunct in house {house} — sharp intellect and strong communication in career.",
        "budha_aditya.absent.name": "Budha-Aditya Yoga",
        "budha_aditya.absent": "Sun and Mercury are not conjunct.",

        "gaja_kesari.present.name": "Gaja-Kesari Yoga",
        "gaja_kesari.present": "Jupiter in kendra from Moon — wisdom, reputation, and career prosperity.",
        "gaja_kesari.absent.name": "Gaja-Kesari Yoga",
        "gaja_kesari.absent": "Jupiter is not in kendra from Moon.",
        "gaja_kesari.missing.name": "Gaja-Kesari Yoga",
        "gaja_kesari.missing": "Moon or Jupiter not found in chart.",

        **_mahapurusha("en"),

        "amala.present.name": "Amala Yoga",
        "amala.present": "{planets} in 10th house — pure and untarnished career reputation.",
        "amala.absent.name": "Amala Yoga",
        "amala.absent": "No natural benefic placed in 10th house.",

        "adhi.present.name": "Adhi Yoga",
        "adhi.present": "{planets} in 6th/7th/8th from Moon — high administrative position and leadership.",
        "adhi.absent.name": "Adhi Yoga",
        "adhi.absent": "Need at least 2 of Mercury/Venus/Jupiter in 6th–8th from Moon.",
        "adhi.missing.name": "Adhi Yoga",
        "adhi.missing": "Moon not found in chart.",

        "dhana.present.name": "Dhana Yoga",
        "dhana.present": "2nd lord ({lord_2}, {dignity_2}) and 11th lord ({lord_11}, {dignity_11}) are strong — significant financial gains through career.",
        "dhana.partial.name": "Dhana Yoga (Partial)",
        "dhana.partial": "2nd lord ({lord_2}, {dignity_2}) or 11th lord ({lord_11}, {dignity_11}) is strong — good but not exceptional wealth from career.",
        "dhana.absent.name": "Dhana Yoga",
        "dhana.absent": "2nd lord ({lord_2}, {dignity_2}) and 11th lord ({lord_11}, {dignity_11}) need strengthening for significant wealth yoga.",

        "kendra_trikona.present.name": "Kendra-Trikona Rajyoga",
        "kendra_trikona.present": "{items} — highest-grade Rajyoga for power and status.",
        "kendra_trikona.item": "{lord_kendra} (lord of H{house_kendra}) + {lord_trikona} (lord of H{house_trikona}) conjunct in H{house}",
        "kendra_trikona.absent.name": "Kendra-Trikona Rajyoga",
        "kendra_trikona.absent": "No kendra lord conjunct a trikona lord in the chart.",

        "yogakaraka.present.name": "Yogakaraka Planet",
        "yogakaraka.present": "{items} — single planet rules both a kendra and a trikona, bestowing kingship.",
        "yogakaraka.item": "{planet} in {sign} (H{house}, {dignity})",
        "yogakaraka.absent.name": "Yogakaraka Planet",
        "yogakaraka.absent": "No planet simultaneously rules a kendra and a trikona for this lagna.",

        "neecha_bhanga.present.name": "Neecha Bhanga Rajyoga",
        "neecha_bhanga.present": "{items} — debilitation cancelled, turning weakness into extraordinary strength.",
        "neecha_bhanga.item.sign_lord": "{planet} debilitated but {lord} (sign lord) in kendra H{house}",
        "neecha_bhanga.item.exaltation_lord": "{planet} debilitated but {lord} (exaltation sign lord) in kendra H{house}",
        "neecha_bhanga.item.self": "{planet} debilitated in kendra (H{house}) — self-cancellation",
        "neecha_bhanga.absent.name": "Neecha Bhanga Rajyoga",
        "neecha_bhanga.absent": "No debilitated planet with sufficient cancellation factors found.",

        "vipareeta.present.name": "Vipareeta Rajyoga",
        "vipareeta.present": "{items} — dusthana lords in each other's houses transform hardship into unexpected rise.",
        "vipareeta.item": "{lord} (lord of H{house_own}) placed in H{house}",
        "vipareeta.absent.name": "Vipareeta Rajyoga",
        "vipareeta.absent": "No 6th/8th/12th lord placed in another dusthana house.",

        "kahala.present.name": "Kahala Yoga",
        "kahala.present": "{lord_4} rules both 4th and 9th houses and is in H{house} — boldness, fortune, and authority.",
        "kahala.conjunct.name": "Kahala Yoga",
        "kahala.conjunct": "{lord_4} (H4 lord) and {lord_9} (H9 lord) conjunct in H{house} — boldness, fortune, and authority.",
        "kahala.same_lord_weak.name": "Kahala Yoga",
        "kahala.same_lord_weak": "4th/9th lord ({lord_4}) not in kendra or trikona.",
        "kahala.absent.name": "Kahala Yoga",
        "kahala.absent": "4th lord ({lord_4}) and 9th lord ({lord_9}) are not conjunct.",

        "lakshmi.present.name": "Lakshmi Yoga",
        "lakshmi.present": "9th lord {lord_9} in {sign} (H{house}, {dignity}) — immense wealth, fame, and divine grace.",
        "lakshmi.absent.name": "Lakshmi Yoga",
        "lakshmi.absent": "9th lord ({lord_9}) needs to be in own/exalted sign in kendra or trikona.",
        "lakshmi.missing.name": "Lakshmi Yoga",
        "lakshmi.missing": "9th lord ({lord_9}) not found in chart.",

        "saraswati.present.name": "Saraswati Yoga",
        "saraswati.present": "{items} — exceptional intelligence, learning, and artistic excellence.",
        "saraswati.item": "{planet} in H{house}",
        "saraswati.absent.name": "Saraswati Yoga",
        "saraswati.absent": "Need at least 2 of Mercury/Venus/Jupiter in kendra, trikona, or 2nd house.",

        "chamara.present.name": "Chamara Yoga",
        "chamara.present": "Jupiter in kendra (H{house}) and lagna lord {lord} in {sign} ({dignity}) — royal bearing and learned fame.",
        "chamara.exalted.name": "Chamara Yoga",
        "chamara.exalted": "Jupiter exalted/own in kendra (H{house}) — wisdom and kingly honors.",
        "chamara.absent.name": "Chamara Yoga",
        "chamara.absent": "Jupiter must be in kendra with lagna lord exalted/own (or Jupiter itself exalted in kendra).",
        "chamara.missing.name": "Chamara Yoga",
        "chamara.missing": "Jupiter or lagna lord not found in chart.",
    },
    "hi": {
        "raja_yoga.present.name": "राजयोग",
        "raja_yoga.present": "9वें भाव के स्वामी ({lord_9}) और 10वें भाव के स्वामी ({lord_10}) {house_ord} भाव में एक साथ हैं — प्रबल प्रतिष्ठा और करियर में उन्नति।",
        "raja_yoga.absent.name": "राजयोग",
        "raja_yoga.absent": "9वें भाव के स्वामी ({lord_9}) और 10वें भाव के स्वामी ({lord_10}) एक साथ नहीं हैं।",

        "dharma_karma.present.name": "धर्म-कर्माधिपति योग",
        "dharma_karma.present": "{lord_9} (9वें भाव के स्वामी) और {lord_10} (10वें भाव के स्वामी) आपस में राशि बदलते हैं — भाग्य और करियर का भाग्य एक-दूसरे से जुड़े हैं।",
        "dharma_karma.absent.name": "धर्म-कर्माधिपति योग",
        "dharma_karma.absent": "9वें भाव के स्वामी ({lord_9}) और 10वें भाव के स्वामी ({lord_10}) के बीच राशि परिवर्तन नहीं है।",

        "budha_aditya.present.name": "बुधादित्य योग",
        "budha_aditya.present": "सूर्य और बुध {house_ord} भाव में एक साथ हैं — तीक्ष्ण बुद्धि और करियर में प्रभावी संवाद।",
        "budha_aditya.absent.name": "बुधादित्य योग",
        "budha_aditya.absent": "सूर्य और बुध एक साथ नहीं हैं।",

        "gaja_kesari.present.name": "गजकेसरी योग",
        "gaja_kesari.present": "गुरु चंद्र से केंद्र में है — ज्ञान, प्रतिष्ठा और करियर में समृद्धि।",
        "gaja_kesari.absent.name": "गजकेसरी योग",
        "gaja_kesari.absent": "गुरु चंद्र से केंद्र में नहीं है।",
        "gaja_kesari.missing.name": "गजकेसरी योग",
        "gaja_kesari.missing": "चंद्र या गुरु कुंडली में नहीं मिला।",

        **_mahapurusha("hi"),

        "amala.present.name": "अमल योग",
        "amala.present": "{planets} 10वें भाव में हैं — निर्मल और बेदाग करियर प्रतिष्ठा।",
        "amala.absent.name": "अमल योग",
        "amala.absent": "10वें भाव में कोई नैसर्गिक शुभ ग्रह नहीं है।",

        "adhi.present.name": "अधि योग",
        "adhi.present": "{planets} चंद्र से 6वें/7वें/8वें भाव में हैं — उच्च प्रशासनिक पद और नेतृत्व।",
        "adhi.absent.name": "अधि योग",
        "adhi.absent": "बुध/शुक्र/गुरु में से कम से कम 2 ग्रह चंद्र से 6वें–8वें भाव में होने चाहिए।",
        "adhi.missing.name": "अधि योग",
        "adhi.missing": "चंद्र कुंडली में नहीं मिला।",

        "dhana.present.name": "धन योग",
        "dhana.present": "2वें भाव के स्वामी ({lord_2}, {dignity_2}) और 11वें भाव के स्वामी ({lord_11}, {dignity_11}) बलवान हैं — करियर से उल्लेखनीय आर्थिक लाभ।",
        "dhana.partial.name": "धन योग (आंशिक)",
        "dhana.partial": "2वें भाव के स्वामी ({lord_2}, {dignity_2}) या 11वें भाव के स्वामी ({lord_11}, {dignity_11}) बलवान हैं — करियर से अच्छा, पर असाधारण नहीं, धन।",
        "dhana.absent.name": "धन योग",
        "dhana.absent": "2वें भाव के स्वामी ({lord_2}, {dignity_2}) और 11वें भाव के स्वामी ({lord_11}, {dignity_11}) को महत्वपूर्ण धन योग के लिए और बल चाहिए।",

        "kendra_trikona.present.name": "केंद्र-त्रिकोण राजयोग",
        "kendra_trikona.present": "{items} — सत्ता और प्रतिष्ठा के लिए सर्वोच्च श्रेणी का राजयोग।",
        "kendra_trikona.item": "{lord_kendra} ({house_kendra_ord} भाव के स्वामी) + {lord_trikona} ({house_trikona_ord} भाव के स्वामी) {house_ord} भाव में एक साथ",
        "kendra_trikona.absent.name": "केंद्र-त्रिकोण राजयोग",
        "kendra_trikona.absent": "कुंडली में कोई केंद्र स्वामी किसी त्रिकोण स्वामी के साथ नहीं है।",

        "yogakaraka.present.name": "योगकारक ग्रह",
        "yogakaraka.present": "{items} — एक ही ग्रह केंद्र और त्रिकोण दोनों का स्वामी है, जो राजसी फल देता है।",
        "yogakaraka.item": "{planet} {sign} में ({house_ord} भाव, {dignity})",
        "yogakaraka.absent.name": "योगकारक ग्रह",
        "yogakaraka.absent": "इस लग्न के लिए कोई ग्रह एक साथ केंद्र और त्रिकोण का स्वामी नहीं है।",

        "neecha_bhanga.present.name": "नीच भंग राजयोग",
        "neecha_bhanga.present": "{items} — नीचता भंग हुई, कमजोरी असाधारण बल में बदलती है।",
        "neecha_bhanga.item.sign_lord": "{planet} नीच है, पर {lord} (राशि स्वामी) केंद्र के {house_ord} भाव में है",
        "neecha_bhanga.item.exaltation_lord": "{planet} नीच है, पर {lord} (उच्च राशि स्वामी) केंद्र के {house_ord} भाव में है",
        "neecha_bhanga.item.self": "{planet} केंद्र ({house_ord} भाव) में नीच है — स्वयं भंग",
        "neecha_bhanga.absent.name": "नीच भंग राजयोग",
        "neecha_bhanga.absent": "पर्याप्त भंग कारकों वाला कोई नीच ग्रह नहीं मिला।",

        "vipareeta.present.name": "विपरीत राजयोग",
        "vipareeta.present": "{items} — दुःस्थान के स्वामी एक-दूसरे के भावों में होकर कठिनाई को अप्रत्याशित उन्नति में बदलते हैं।",
        "vipareeta.item": "{lord} ({house_own_ord} भाव के स्वामी) {house_ord} भाव में स्थित",
        "vipareeta.absent.name": "विपरीत राजयोग",
        "vipareeta.absent": "6वें/8वें/12वें भाव का कोई स्वामी किसी अन्य दुःस्थान में नहीं है।",

        "kahala.present.name": "काहल योग",
        "kahala.present": "{lord_4} 4वें और 9वें दोनों भावों का स्वामी है और {house_ord} भाव में है — साहस, भाग्य और अधिकार।",
        "kahala.conjunct.name": "काहल योग",
        "kahala.conjunct": "{lord_4} (4वें भाव के स्वामी) और {lord_9} (9वें भाव के स्वामी) {house_ord} भाव में एक साथ हैं — साहस, भाग्य और अधिकार।",
        "kahala.same_lord_weak.name": "काहल योग",
        "kahala.same_lord_weak": "4वें/9वें भाव का स्वामी ({lord_4}) केंद्र या त्रिकोण में नहीं है।",
        "kahala.absent.name": "काहल योग",
        "kahala.absent": "4वें भाव के स्वामी ({lord_4}) और 9वें भाव के स्वामी ({lord_9}) एक साथ नहीं हैं।",

        "lakshmi.present.name": "लक्ष्मी योग",
        "lakshmi.present": "9वें भाव के स्वामी {lord_9} {sign} में ({house_ord} भाव, {dignity}) — अपार धन, यश और दैवी कृपा।",
        "lakshmi.absent.name": "लक्ष्मी योग",
        "lakshmi.absent": "9वें भाव के स्वामी ({lord_9}) को केंद्र या त्रिकोण में स्वराशि/उच्च राशि में होना चाहिए।",
        "lakshmi.missing.name": "लक्ष्मी योग",
        "lakshmi.missing": "9वें भाव के स्वामी ({lord_9}) कुंडली में नहीं मिले।",

        "saraswati.present.name": "सरस्वती योग",
        "saraswati.present": "{items} — असाधारण बुद्धि, विद्या और कलात्मक उत्कृष्टता।",
        "saraswati.item": "{planet} {house_ord} भाव में",
        "saraswati.absent.name": "सरस्वती योग",
        "saraswati.absent": "बुध/शुक्र/गुरु में से कम से कम 2 ग्रह केंद्र, त्रिकोण या 2वें भाव में होने चाहिए।",

        "chamara.present.name": "चामर योग",
        "chamara.present": "गुरु केंद्र ({house_ord} भाव) में है और लग्न के स्वामी {lord} {sign} में ({dignity}) हैं — राजसी व्यक्तित्व और विद्वत्ता से यश।",
        "chamara.exalted.name": "चामर योग",
        "chamara.exalted": "गुरु उच्च/स्वराशि में केंद्र ({house_ord} भाव) में है — ज्ञान और राजसी सम्मान।",
        "chamara.absent.name": "चामर योग",
        "chamara.absent": "गुरु केंद्र में हो और लग्न के स्वामी उच्च/स्वराशि में हों (या गुरु स्वयं केंद्र में उच्च का हो)।",
        "chamara.missing.name": "चामर योग",
        "chamara.missing": "गुरु या लग्न के स्वामी कुंडली में नहीं मिले।",
    },
}

_PLANET_KEYS = ("planet", "lord")


def _lookup(table: dict, language: str, value):
    """Localized label for value, or the value itself if no table has it."""
    try:
        return text(table, language, value)
    except KeyError:
        return value


def planet_name(value, language: str = "en"):
    """Localized planet name; anything that is not a planet (e.g. "?") is returned as is."""
    return _lookup(PLANET_NAMES, language, value)


def _house_ord(value, language: str) -> str:
    return ordinal(value, language) if isinstance(value, int) else str(value)


def _localize(params: dict, language: str) -> dict:
    out = {}
    for key, value in params.items():
        if key.startswith(_PLANET_KEYS):
            out[key] = _lookup(PLANET_NAMES, language, value)
        elif key.startswith("sign"):
            out[key] = _lookup(SIGN_NAMES, language, value)
        elif key.startswith("dignity"):
            out[key] = _lookup(DIGNITY_NAMES, language, value)
        else:
            out[key] = value
        if key.startswith("house"):
            out[f"{key}_ord"] = _house_ord(value, language)
    return out


def render_yoga(entry: dict, language: str = "en") -> dict:
    """Return a copy of entry with "yoga" and "description" filled from YOGA_TEXT for language.

    entry needs id, state and params. A params value that is a list of strings
    is a list of planet names (joined with ", "); a list of dicts is a list of
    items, each rendered with the "<id>.item[.<kind>]" template.
    """
    yoga_id, state = entry["id"], entry["state"]
    params = {}
    for key, value in entry["params"].items():
        if isinstance(value, list) and value and isinstance(value[0], dict):
            rendered = []
            for item in value:
                suffix = f".{item['kind']}" if "kind" in item else ""
                rendered.append(text(YOGA_TEXT, language, f"{yoga_id}.item{suffix}",
                                     **_localize(item, language)))
            params[key] = ITEM_SEPARATOR[yoga_id].join(rendered)
        elif isinstance(value, list):
            params[key] = ", ".join(_lookup(PLANET_NAMES, language, v) for v in value)
        else:
            params.update(_localize({key: value}, language))
    return {
        **entry,
        "yoga": text(YOGA_TEXT, language, f"{yoga_id}.{state}.name"),
        "description": text(YOGA_TEXT, language, f"{yoga_id}.{state}", **params),
    }
