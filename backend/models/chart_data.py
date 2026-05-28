from pydantic import BaseModel, ConfigDict
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


class DashaData(_Flexible):
    current_mahadasha: MahadashaEntry
    current_antardasha: Optional[AntardashaEntry]
    antardashas: list[AntardashaEntry]   # sub-periods of current MD
    full_sequence: list[MahadashaEntry]  # all 9 MDs from birth


class ChartResponse(_Flexible):
    ascendant: AscendantData
    planets: list[PlanetData]
    houses: list[HouseData]
    navamsa_ascendant: AscendantData
    navamsa_planets: list[PlanetData]
    dasha: DashaData
