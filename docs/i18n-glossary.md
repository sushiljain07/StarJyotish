# i18n glossary

One section per language. Each row says which word the UI uses for an English
term, so the same idea reads the same way on every page and in the backend
templates.

- **settled**: the form is in use. The rows marked *(test)* are enforced by
  `frontend/src/i18n/parity.test.js` (`hi glossary`) and
  `backend/tests/test_hindi_glossary.py`.
- **owner decision**: a row the owner settled on 10 Nov 2026 (the former
  "owner to confirm" list). None are open today.

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
| house ordinal | Houses 1–6 are words. Direct, `house_ordinal_n1`…`n6`: पहला, दूसरा, तीसरा, चौथा, पाँचवाँ, छठा. Oblique (before को, में, के), `house_ordinal_oblique_n1`…`n6`: पहले, दूसरे, तीसरे, चौथे, पाँचवें, छठे. 7 and above stay digits: 7वाँ / 7वें, 10वें, 12वें. English is 1st/2nd/3rd/Nth. | Owner decision, 10 Nov 2026: words for 1–6 everywhere, in the UI and the backend. The frontend calls `houseOrdinal(t, n, { oblique })` in `utils/format.js`; the backend `ordinal(n, "hi")` returns the oblique word for 1–6 and `{n}वें` above. Literal strings follow the same rule ("12वें, पहले या दूसरे भाव में", "छठे/8वें/12वें भाव"). *(test)* | settled |
| Rajyoga paywall count | 20 (was 19) | Owner decision 2. Applies to `rajyogas_paywall_body` and `rajyogas_paywall_bullet_1` in en and hi. | settled |
| career scenario prompt | मुझे एक करियर निर्णय लेना है: {{text}}। … | Owner decision 3. Gender-neutral; replaces "मैं … विचार कर रहा हूँ". | settled |
| Insight, Insights (the product feature) | इनसाइट (feminine; plural इनसाइट्स) | Not अंतर्दृष्टि. The one exception is `rajyoga_ref_hamsa_c2` ("दार्शनिक अंतर्दृष्टि"), a human quality rather than the feature. Loanword rule. *(test)* | settled |
| page (web page), homepage | पेज (masculine), होमपेज | Not पृष्ठ or मुखपृष्ठ anywhere. The newspaper image uses पन्ना and the breadcrumb is पेज पथ (owner decisions below). Loanword rule. *(test)* | settled |
| user | यूज़र (plural: यूज़र्स, colloquial; owner decision) | Not उपयोगकर्ता. Loanword rule. *(test)* | settled |
| preview | प्रीव्यू | Not पूर्वावलोकन. Loanword rule. *(test)* | settled |
| Overview (career report section) | ओवरव्यू | Not अवलोकन; matches `landing_career_preview_subhead`. `career_jump_overview` uses सारांश (row below). Loanword rule. *(test)* | settled |
| CA, IT (career fields) | सीए, आईटी | Not लेखाकर्म or सूचना प्रौद्योगिकी (`rajyoga_ref_bhadra_b1`). Loanword rule. *(test)* | settled |
| SMS, OTP | एसएमएस, ओटीपी | Devanagari, not Latin. Loanword rule. *(test)* | settled |

### Owner decisions (10 Nov 2026)

These were the "owner to confirm" rows. The owner settled all of them on 10 Nov 2026.

**Kept as shipped:**
- वक्री (retrograde, `*`; व in the planet table) and अस्त (combust, `^`);
- उच्च, नीच, वर्गोत्तम, स्व / स्वराशि;
- the short forms in `planet_abbr`, `sign_abbr` and `nak_abbr`;
- the Sarvatobhadra vowels and letters;
- अमात्यकारक;
- तालमेल (career alignment), with अप्रयुक्त क्षमता;
- सामान्य राशिफल;
- the half-nasal panchang yoga names (विष्कम्भ);
- the masa names and the "{{masa}} मास" badge;
- AC/DC/MC/IC on the Western chart;
- the Hindi career-alignment text in `career_analysis.py`;
- त्रुटि, यूज़र्स, सारांश (`career_jump_overview`);
- brand names and formats in Latin script (Google, Anthropic Claude, Groq, OpenStreetMap, JPG, PNG).

**Changed:**

| English | Hindi now | Was | Status |
|---|---|---|---|
| Sarvatobhadra Jupiter corner | गुरु | बृह (गुरु) | owner decision *(test)* |
| Dharma-Karma yoga (`yoga_text.py`, `rajyoga_ref_dharma_karma_meaning`) | भाग्य और कर्म (करियर) एक-दूसरे से / आपस में जुड़े हैं | भाग्य और करियर का भाग्य … | owner decision |
| debilitation cancelled (`neecha_bhanga.present`) | नीच भंग हुआ | नीचता भंग हुई | owner decision *(test)* |
| relocation | रिलोकेशन | स्थानांतरण | owner decision *(test)* |
| testimonial | अनुभव, in every `testimonials_*` key (aria: यूज़र्स के अनुभव) | प्रशंसापत्र / प्रतिक्रियाएँ | owner decision *(test)* |
| page, in the newspaper image | पन्ना पलटता है | पृष्ठ पलटता है | owner decision *(test)* |
| breadcrumb (screen readers) | पेज पथ | पृष्ठ पथ | owner decision *(test)* |
| guide | गाइड (feminine; the plural is also गाइड), in all 14 keys | मार्गदर्शिका(एँ) | owner decision *(test)* |
| Disclaimer | डिस्क्लेमर | अस्वीकरण | owner decision *(test)* |
| Privacy Policy; Refund & Cancellation Policy | प्राइवेसी पॉलिसी; रिफंड व कैंसिलेशन पॉलिसी | गोपनीयता नीति; रिफंड और रद्दीकरण नीति | owner decision *(test)* |
| Edit | बदलें | संपादित करें | owner decision *(test)* |
| Verify, Verified | वेरिफ़ाई करें, वेरिफ़ाइड, वेरिफ़ाई नहीं हुआ | सत्यापित … | owner decision *(test)* |
| Blocked | ब्लॉक है | अवरुद्ध | owner decision *(test)* |
| can't be undone | इसे वापस नहीं लिया जा सकता | पूर्ववत नहीं किया जा सकता | owner decision *(test)* |
| Time Zone | टाइम ज़ोन | समय क्षेत्र | owner decision *(test)* |
| Quick view; holistic view | संक्षिप्त झलक; नक्षत्र-स्तरीय झलक; समग्र नज़रिया | दृश्य | owner decision |
| Journal entry | डायरी एंट्री | डायरी प्रविष्टि | owner decision *(test)* |
| Timeline | टाइमलाइन | समयरेखा | owner decision *(test)* |
| Energetic capacity | ऊर्जा-क्षमता | ऊर्जात्मक क्षमता | owner decision *(test)* |
| paid plan | पेड प्लान | सशुल्क प्लान | owner decision *(test)* |
| LLM language rules (`_READING_LANG_RULE`, `_CAREER_LANG_RULE`, `VALUES_LANGUAGE_RULE`) | One shared clause, `HINDI_WORDING_RULE` in `services/i18n.py`. It allows everyday loanwords in Devanagari, keeps Jyotish terms and yoga names in Hindi, and allows no Latin script. | "EVERY SINGLE WORD in Hindi … no English words" | owner decision *(test: `test_hindi_llm_rules_allow_devanagari_loanwords`)* |
