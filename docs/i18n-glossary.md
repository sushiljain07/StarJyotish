# i18n glossary

One section per language. Each row says which word the UI uses for an English
term, so the same idea reads the same way on every page and in the backend
templates.

- **settled**: the form is in use. The rows marked *(test)* are enforced by
  `frontend/src/i18n/parity.test.js` (`hi glossary`) and
  `backend/tests/test_hindi_glossary.py`.
- **owner to confirm**: the "Current" column is what ships today. "Proposed"
  is a suggestion only; nothing changes until the owner confirms the row.

## हिन्दी (hi)

### Settled

| English | Hindi | Note | Status |
|---|---|---|---|
| chart, birth chart | कुंडली, जन्म कुंडली | Never चार्ट. *(test)* | settled |
| divisional chart (in general) | वर्ग कुंडली (plural: वर्ग कुंडलियाँ) | For example, `faq_page_a6` and `early_access_item_kundli`. | settled |
| a named divisional chart | D10 चार्ट, नवांश चार्ट | This is the only place चार्ट is allowed. The keys are listed in `CHART_ALLOWED` in the test: `testimonial_4_text`, `home_this_week_subtext`, `report_career_note`, `report_finance_note`, `report_relationship_note`, `report_health_note`. *(test)* | settled |
| Lagna chart | लग्न कुंडली | Used in `home_chart_lagna_label`. | settled |
| Moon | चंद्र | Not चंद्रमा. This matches the backend `PLANET_NAMES`. *(test)* | settled |
| Jupiter | गुरु | Not बृहस्पति. This matches the backend `PLANET_NAMES`. *(test)* | settled |
| Sun, Mars, Mercury, Venus, Saturn, Rahu, Ketu | सूर्य, मंगल, बुध, शुक्र, शनि, राहु, केतु | The same forms as the backend `PLANET_NAMES`. | settled |
| Raj Yoga | राजयोग (plural: राजयोगों) | One word, including in compounds: केंद्र-त्रिकोण राजयोग, नीच भंग राजयोग, विपरीत राजयोग. Owner decision, 10 Nov 2026. *(test)* | settled |
| Try again | पुनः प्रयास करें | Not फिर से प्रयास or फिर कोशिश. *(test)* | settled |
| Occurs {{rarity}} (`patrika_rarity`) | {{rarity}} होता है | The key has no caller today. The backend `_rarity_label` returns English phrases only, so a Hindi rarity label is still needed before this key is used. *(test)* | settled |
| Sarvatobhadra Saturn corner | शनि | Was "शनि (शनि)", which repeated the word. *(test)* | settled |
| {{house}} house in the patrika "Why" line | `house_ordinal` with `ordinal: true`: 1st/2nd/3rd, 1ला/2रा/4था | Owner decision 1. See the ordinals row below. | settled |
| Rajyoga paywall count | 20 (was 19) | Owner decision 2. Applies to `rajyogas_paywall_body` and `rajyogas_paywall_bullet_1` in en and hi. | settled |
| career scenario prompt | मुझे एक करियर निर्णय लेना है: {{text}}। … | Owner decision 3. Gender-neutral; replaces "मैं … विचार कर रहा हूँ". | settled |

### Owner to confirm

| English | Current | Proposed | Note | Status |
|---|---|---|---|---|
| Retrograde (legend) | * वक्री; the planet table uses व | keep | Standard term. | owner to confirm |
| Combust (legend) | ^ अस्त | keep | अस्त also means "set" in `panchang_sunset_short` and `panchang_moonset_short`. The context tells them apart. | owner to confirm |
| Exalted | उच्च | keep | | owner to confirm |
| Debilitated | नीच | keep | | owner to confirm |
| Vargottama | वर्गोत्तम | keep | | owner to confirm |
| Own sign | स्व (short), स्वराशि | keep | | owner to confirm |
| Planet short forms (`planet_abbr`) | सू च मं बु गु शु श रा के, ल (Lagna), अरु वरु यम | keep | श (Saturn) and सू (Sun) are told apart by the vowel sign only. | owner to confirm |
| Sign short forms (`sign_abbr`) | वृष, मिथु, वृश्चि; the rest are full names | keep | मिथु and वृश्चि are truncations, not traditional abbreviations. Full names are the alternative if they fit. | owner to confirm |
| Nakshatra short forms (`nak_abbr`) | रोहि, मृग, पुनर्, आश्ले, पू.फा., उ.फा., पू.षा., उ.षा., पू.भा., उ.भा., … | keep | The dotted forms follow panchang usage. | owner to confirm |
| Sarvatobhadra corners | रवि (सूर्य), सोम (चंद्र), बृह (गुरु), शनि | बृह (गुरु) → गुरु | बृह is a truncation of बृहस्पति. Saturn is already a single word. | owner to confirm |
| Sarvatobhadra vowels and letters | अ,आ,इ,ई,उ,ऊ,ए,ऐ,ओ,औ,अं,अः,क,ख,ग,घ,ङ,च,छ,ज,झ | keep | Native letters; the English UI shows a transliteration. | owner to confirm |
| Amatyakaraka | अमात्यकारक | keep | Glossed once as "अमात्यकारक (करियर का मुख्य कारक ग्रह)" in `career_evidence_amatyakaraka`. | owner to confirm |
| Alignment (career) | तालमेल: मज़बूत तालमेल, आंशिक तालमेल; अप्रयुक्त क्षमता | keep | The alternative is सामंजस्य, which is more formal. | owner to confirm |
| Roadmap | रोडमैप | keep, or करियर योजना | A loan word. It is used in `career_jump_roadmap`, `career_roadmap_title` and `career_preview_sec_roadmap`. | owner to confirm |
| House ordinals | frontend `house_ordinal`: 1ला, 2रा, 3रा, 4था, 6ठा, 5वाँ (direct form); backend `ordinal()`: `{n}वें` (oblique form) | keep both | Hindi uses the oblique form before a postposition, so "{n}वें भाव में" in the backend templates is correct. The frontend direct form suits labels. The patrika "Why" line now renders "आपके 1ला भाव को" (owner decision 1), where the oblique "1ले"/"पहले" would be grammatical. An oblique variant of `house_ordinal` would fix this. The backend "2वें/3वें" is also unusual; दूसरे/तीसरे are the usual forms. | owner to confirm |
| Panchang yoga names | विष्कम्भ, अतिगण्ड, गण्ड (half-nasal) | keep | Elsewhere the UI uses the anusvara (कुंभ, चंद्र). The half-nasal form is the traditional panchang spelling. | owner to confirm |
| Masa names | चैत्र, वैशाख, ज्येष्ठ, आषाढ़, श्रावण, भाद्रपद, आश्विन, कार्तिक, मार्गशीर्ष, पौष, माघ, फाल्गुन; badge "{{masa}} मास" | keep | सावन and भादों are colloquial alternatives. | owner to confirm |
| fortune and career destiny are intertwined (`yoga_text.py` `dharma_karma.present`) | भाग्य और करियर का भाग्य एक-दूसरे से जुड़े हैं | भाग्य और कर्म (करियर) एक-दूसरे से जुड़े हैं | The current text repeats भाग्य. | owner to confirm |
| debilitation cancelled (`yoga_text.py` `neecha_bhanga.present`) | नीचता भंग हुई | नीच भंग हुआ | Matches the yoga name नीच भंग राजयोग. | owner to confirm |
| career alignment explanation (`career_analysis.py` `CAREER_ALIGNMENT_TEXT["hi"]`, Task 5) | underutilized: "आपका बताया गया पेशा किसी पारंपरिक करियर क्षेत्र से सीधे नहीं जुड़ता, लेकिन आपकी कुंडली का सबसे मज़बूत करियर संकेत (अमात्यकारक: {amk}) …"; strong: "… और {planet} ही आपकी कुंडली का अमात्यकारक है, यानी सबसे मज़बूत करियर संकेत …"; partial: "… आपकी {amk} ऊर्जा किस संभावना की ओर इशारा करती है।" | keep | A native reviewer should read all three for flow. | owner to confirm |
| generic horoscope text (`career_preview_destiny_body`) | सामान्य राशिफल | keep | राशिफल ("horoscope") is the natural word here. | owner to confirm |
