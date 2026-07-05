from pydantic import BaseModel, ConfigDict, Field
from typing import Optional


class _Flexible(BaseModel):
    model_config = ConfigDict(extra="ignore")


class PlanetData(_Flexible):
    name: str
    sign: str
    sign_index: int        # 0–11
    degree: float          # degrees within sign (0–30)
    house: int             # 1–12
    nakshatra: str
    nakshatra_pada: int    # 1–4
    nakshatra_lord: str = ""
    nakshatra_degree: float = 0.0
    retrograde: bool


class HouseData(_Flexible):
    number: int
    sign: str
    sign_index: int


class AscendantData(_Flexible):
    sign: str
    sign_index: int
    degree: float
    nakshatra: str


class MahadashaEntry(_Flexible):
    planet: str
    start: str   # "YYYY-MM-DD"
    end: str
    years: float


class AntardashaEntry(_Flexible):
    planet: str
    start: str
    end: str


class PratyantarEntry(_Flexible):
    planet: str
    start: str
    end: str


class SookshmaEntry(_Flexible):
    planet: str
    start: str
    end: str


class DashaData(_Flexible):
    current_mahadasha: MahadashaEntry
    current_antardasha: Optional[AntardashaEntry]
    current_pratyantar: Optional[PratyantarEntry] = None
    current_sookshma: Optional[SookshmaEntry] = None
    antardashas: list[AntardashaEntry]
    pratyantars: list[PratyantarEntry] = []
    sookshmas: list[SookshmaEntry] = []
    full_sequence: list[MahadashaEntry]


class ChartResponse(_Flexible):
    ascendant: AscendantData
    planets: list[PlanetData]
    houses: list[HouseData]
    navamsa_ascendant: AscendantData
    navamsa_planets: list[PlanetData]
    dasha: DashaData


class ReadingRequest(_Flexible):
    date: str       # "YYYY-MM-DD"
    time: str       # "HH:MM" (24-hr)
    place: str = Field(max_length=200)
    language: str   # "en" or "hi"
    topic: Optional[str] = None  # 'career' | 'relationship' | 'health' | 'finance' —
                                  # set when the user arrived via a landing-page topic
                                  # card; see services/ai.py build_prediction_prompt().
    save_for_phone: Optional[str] = Field(default=None, max_length=20)  # see models/birth_data.py


class ReadingSection(_Flexible):
    title: str
    icon: str
    content: str


class ReadingResponse(_Flexible):
    sections: list[ReadingSection]
    active_yogas: list[dict] = []
    prediction_text: Optional[str] = None
    prediction_sections: Optional[dict] = None
    teasers: Optional[dict] = None
    llm_provider: str = ""


class AskRequest(_Flexible):
    date: str       # "YYYY-MM-DD"
    time: str       # "HH:MM" (24-hr)
    place: str = Field(max_length=200)
    question: str = Field(max_length=500)
    language: str = "en"
    save_for_phone: Optional[str] = Field(default=None, max_length=20)  # see models/birth_data.py
    # Returned by the previous /kundli/ask response and echoed back here so
    # the backend can look up this conversation's prior Q&A — see
    # services/ask_sessions.py. None on the first question of a session.
    session_id: Optional[str] = Field(default=None, max_length=64)


class AskResponse(_Flexible):
    answer: str
    llm_provider: str = ""
    # Always present, even on the first question — the frontend stores this
    # and sends it back as session_id on every subsequent question in the
    # same conversation.
    session_id: str = ""
