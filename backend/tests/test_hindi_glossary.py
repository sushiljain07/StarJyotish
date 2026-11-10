"""Backend Hindi templates follow the settled rows of docs/i18n-glossary.md."""
import re

import pytest

from services.career_analysis import CAREER_ALIGNMENT_TEXT
from services.yoga_text import PLANET_NAMES, YOGA_TEXT

# Same banned forms as the frontend check in frontend/src/i18n/parity.test.js.
BANNED = re.compile(r"राज योग|चंद्रमा|बृहस्पति|फिर से प्रयास|फिर कोशिश|चार्ट")

TABLES = {
    "YOGA_TEXT": YOGA_TEXT["hi"],
    "CAREER_ALIGNMENT_TEXT": CAREER_ALIGNMENT_TEXT["hi"],
    "PLANET_NAMES": PLANET_NAMES["hi"],
}


@pytest.mark.parametrize("table", sorted(TABLES))
def test_hindi_table_uses_settled_terms(table):
    bad = sorted(k for k, v in TABLES[table].items() if BANNED.search(v))
    assert bad == []
