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

**Loanword rule (owner, 10 Nov 2026).** "If there is no clear and appropriate
Hindi word for an English word, keep the word in English for now rather than
making a meaningless Hindi word." Such a word is written in Devanagari
transliteration, the way the UI already writes करियर, रिपोर्ट, डैशबोर्ड, ऐप,
डाउनलोड and ईमेल. Only this allow-list stays in Latin letters: AI, KP, PDF,
D+number (D9, D10 …), AM, PM, EN, "Star Jyotish", URLs and email addresses.
Every other English word, acronyms included, is written in Devanagari
(एसएमएस, ओटीपी). Jyotish vocabulary (कुंडली, दशा, भाव, लग्न, ग्रह, नक्षत्र,
गोचर, फलादेश …) and everyday Hindi (खाता, साझा करें, संपर्क करें) stay Hindi.

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
| house ordinal | direct form, `house_ordinal`: 1ला, 2रा, 3रा, 4था, 6ठा, 5वाँ, 11वाँ. Oblique form, `house_ordinal_oblique`: 1ले, 2रे, 3रे, 4थे, 6ठे, 5वें, 11वें. English is 1st/2nd/3rd/Nth for both. | This is a grammar rule, not a style choice: before a postposition (को, में, के), Hindi uses the oblique form. `house_ordinal_oblique` is used for `patrika_why_house` ("आपके 1ले भाव को"), `insight_moon_do` and `insight_moon_transit_text` ("4थे भाव में"), and `insight_nugget` ("10वें भाव के स्वामी … 2रे भाव में"). `house_ordinal` (direct) is used for labels with no postposition, for example `spotlight_moon_subtitle` ("आपका 4था भाव"). Backend templates use `ordinal()` → `{n}वें`. That is the oblique form, which is right in most backend uses (भाव में, भाव के स्वामी). Keep it. A few templates use it in a parenthesised label with no postposition ("(6वें भाव, उच्च)"). Those are left as they are. The backend's 1वें, 2वें, 3वें, 4वें and 6वें differ from the frontend's 1ले, 2रे, 3रे, 4थे and 6ठे and are less usual than पहले/दूसरे/तीसरे/चौथे/छठे; that is owner to confirm (row below). Owner decision 1 and the fix round of 10 Nov 2026. | settled |
| Rajyoga paywall count | 20 (was 19) | Owner decision 2. Applies to `rajyogas_paywall_body` and `rajyogas_paywall_bullet_1` in en and hi. | settled |
| career scenario prompt | मुझे एक करियर निर्णय लेना है: {{text}}। … | Owner decision 3. Gender-neutral; replaces "मैं … विचार कर रहा हूँ". | settled |
| Insight, Insights (the product feature) | इनसाइट (feminine; plural इनसाइट्स) | Not अंतर्दृष्टि. The one exception is `rajyoga_ref_hamsa_c2` ("दार्शनिक अंतर्दृष्टि"), a human quality rather than the feature. Loanword rule. *(test)* | settled |
| page (web page), homepage | पेज (masculine), होमपेज | Not पृष्ठ or मुखपृष्ठ. Three keys are left for the owner (rows below): `home_edition_chip`, `home_closing_title`, `knowledge_breadcrumb_aria`. Loanword rule. *(test)* | settled |
| user | यूज़र (plural: यूज़र्स, colloquial; see the owner-to-confirm row) | Not उपयोगकर्ता. Loanword rule. *(test)* | settled |
| preview | प्रीव्यू | Not पूर्वावलोकन. Loanword rule. *(test)* | settled |
| Overview (career report section) | ओवरव्यू | Not अवलोकन; matches `landing_career_preview_subhead`. `career_jump_overview` uses सारांश (row below). Loanword rule. *(test)* | settled |
| CA, IT (career fields) | सीए, आईटी | Not लेखाकर्म or सूचना प्रौद्योगिकी (`rajyoga_ref_bhadra_b1`). Loanword rule. *(test)* | settled |
| SMS, OTP | एसएमएस, ओटीपी | Devanagari, not Latin. Loanword rule. *(test)* | settled |

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
| Roadmap | रोडमैप | — | A loanword, kept under the loanword rule. Used in `career_jump_roadmap`, `career_roadmap_title` and `career_preview_sec_roadmap`. | settled |
| backend ordinal for 1, 2, 3, 4 and 6 | `ordinal()`: 1वें, 2वें, 3वें, 4वें, 6वें | The frontend `house_ordinal_oblique` gives 1ले, 2रे, 3रे, 4थे, 6ठे; match it, or use पहले/दूसरे/तीसरे/चौथे/छठे | The rest of the backend oblique form is settled (see the house ordinal row above). | owner to confirm |
| Panchang yoga names | विष्कम्भ, अतिगण्ड, गण्ड (half-nasal) | keep | Elsewhere the UI uses the anusvara (कुंभ, चंद्र). The half-nasal form is the traditional panchang spelling. | owner to confirm |
| Masa names | चैत्र, वैशाख, ज्येष्ठ, आषाढ़, श्रावण, भाद्रपद, आश्विन, कार्तिक, मार्गशीर्ष, पौष, माघ, फाल्गुन; badge "{{masa}} मास" | keep | सावन and भादों are colloquial alternatives. | owner to confirm |
| fortune and career destiny are intertwined (`yoga_text.py` `dharma_karma.present`) | भाग्य और करियर का भाग्य एक-दूसरे से जुड़े हैं | भाग्य और कर्म (करियर) एक-दूसरे से जुड़े हैं | The current text repeats भाग्य. | owner to confirm |
| debilitation cancelled (`yoga_text.py` `neecha_bhanga.present`) | नीचता भंग हुई | नीच भंग हुआ | Matches the yoga name नीच भंग राजयोग. | owner to confirm |
| career alignment explanation (`career_analysis.py` `CAREER_ALIGNMENT_TEXT["hi"]`, Task 5) | underutilized: "आपका बताया गया पेशा किसी पारंपरिक करियर क्षेत्र से सीधे नहीं जुड़ता, लेकिन आपकी कुंडली का सबसे मज़बूत करियर संकेत (अमात्यकारक: {amk}) …"; strong: "… और {planet} ही आपकी कुंडली का अमात्यकारक है, यानी सबसे मज़बूत करियर संकेत …"; partial: "… आपकी {amk} ऊर्जा किस संभावना की ओर इशारा करती है।" | keep | A native reviewer should read all three for flow. | owner to confirm |
| generic horoscope text (`career_preview_destiny_body`) | सामान्य राशिफल | keep | राशिफल ("horoscope") is the natural word here. | owner to confirm |
| relocation (`career_concern_10`, `career_scenario_desc`) | स्थानांतरण | रिलोकेशन, or keep | स्थानांतरण is real Hindi (job transfer), but bookish for "relocation". Loanword rule. | owner to confirm |
| testimonial | प्रशंसापत्र (`testimonials_*`); प्रतिक्रियाएँ in `testimonials_aria` and `testimonials_read_all` | one word for both: अनुभव, रिव्यू or टेस्टिमोनियल | प्रशंसापत्र reads like a certificate of praise; the two forms are inconsistent. Loanword rule. | owner to confirm |
| page, in the newspaper image (`home_edition_chip`, `home_closing_title`) | पृष्ठ पलटता है | keep, or पन्ना पलटता है | "This page turns at sunrise" is a newspaper metaphor, where पृष्ठ / पन्ना is natural. Allow-listed in the test. | owner to confirm |
| Breadcrumb (`knowledge_breadcrumb_aria`, screen readers only) | पृष्ठ पथ | पेज पथ, or नेविगेशन पथ | A coinage either way; no everyday word exists. Allow-listed in the test. | owner to confirm |
| guide (`blog_*`, `learn_*`, `go_deeper_guide_*`, `home_*_guide`, `kp_guide_title`, `ask_persona_tagline`, `capsule_read_guide`) | मार्गदर्शिका (14 keys) | गाइड, or keep | Real Hindi but formal. `blog_seo_desc` and `blog_subhead` were fixed to the feminine plural (की … मार्गदर्शिकाएँ). If गाइड is chosen, treat it as feminine and change all 14 keys together. | owner to confirm |
| Disclaimer | अस्वीकरण | डिस्क्लेमर, or keep | The standard legal term, but rarely said. The footer already mixes प्राइवेसी पॉलिसी and रिफंड पॉलिसी with अस्वीकरण. | owner to confirm |
| Privacy Policy, Refund & Cancellation Policy | गोपनीयता नीति (`profile_privacy_link`, `about_p_more`) and प्राइवेसी पॉलिसी (footer, FAQ); रिफंड और रद्दीकरण नीति (`legal_refund_title`) and रिफंड व कैंसिलेशन पॉलिसी (`faq_page_a9`) | pick one form each | Both forms are understood; only the inconsistency needs a decision. | owner to confirm |
| Edit | संपादित करें (`profile_edit_heading`, `onboarding_review_edit`, `profile_astro_edit`) | बदलें (as in `home_hero_edit_profile`), or एडिट करें | Formal UI Hindi. | owner to confirm |
| Verify | सत्यापित करें (`login_verify`, `profile_verify_email`) | वेरिफ़ाई करें, or keep | Formal but widely seen in Indian apps. | owner to confirm |
| error | त्रुटि (`error_fallback_title`) | एरर, or keep | Formal; widely understood. | owner to confirm |
| Blocked (`panchang_blocked`, `panchang_blocked_search`) | अवरुद्ध | ब्लॉक है | Bookish. | owner to confirm |
| can't be undone (`profile_astro_delete_confirm`) | पूर्ववत नहीं किया जा सकता | वापस नहीं लिया जा सकता | Bookish. | owner to confirm |
| Time Zone (`profile_timezone`, `panchang_timezone`) | समय क्षेत्र | टाइम ज़ोन, or keep | | owner to confirm |
| Quick View, holistic view (`career_depth_quick_long`, `kundli_div_D27_governs`, `kundli_div_D45_governs`) | दृश्य ("संक्षिप्त दृश्य", "समग्र दृश्य") | झलक, नज़रिया | दृश्य means "scene" or "visible". "Constitutional" in D6/D27 (previously संवैधानिक, which means legal/constitution) is now जन्मजात. | owner to confirm |
| Journal entry (`home_journal_aria`) | डायरी प्रविष्टि | डायरी एंट्री | प्रविष्टि is formal. | owner to confirm |
| Timeline (`timeline_heading`, `home_coming_soon_transit-timeline`, `early_access_item_kundli`) | समयरेखा | टाइमलाइन | An established word, but bookish. | owner to confirm |
| Energetic capacity (`kundli_div_D27_governs`) | ऊर्जात्मक क्षमता | ऊर्जा-क्षमता | A semi-coinage. | owner to confirm |
| Users, plural (`testimonials_aria`) | यूज़र्स | यूज़रों (grammatical oblique plural) | यूज़र्स is the colloquial English plural, common in Indian web copy. | owner to confirm |
| Overview (`career_jump_overview`) | सारांश | ओवरव्यू (to match `career_preview_sec_overview`), or keep | सारांश is natural Hindi. | owner to confirm |
| paid plan (`profile_membership_body`, `early_access_faq_q2`) | सशुल्क प्लान and पेड प्लान | पेड प्लान | Inconsistent. | owner to confirm |
| Latin brand names and formats (`login_*` Google; `faq_page_a10` Anthropic Claude, Groq, OpenStreetMap; `profile_photo_hint` JPG, PNG) | Latin | keep Latin, or Devanagari (गूगल …) | Not on the Latin allow-list. Brand names are usually left in Latin. | owner to confirm |
| Western chart legend (`western_chart_legend`) | AC, DC, MC, IC | keep | The letters match the labels drawn on the chart. | owner to confirm |
| LLM language rules (`_READING_LANG_RULE`, `_CAREER_LANG_RULE`, `VALUES_LANGUAGE_RULE` in the backend) | "Write EVERY SINGLE WORD in Hindi … no English words … translate yoga names" | allow the Devanagari loanwords this rule permits (करियर, रिपोर्ट …) | The prompts push the model toward coined Hindi, against the loanword rule. Not changed: it alters model behaviour, not visible wording. | owner to confirm |
