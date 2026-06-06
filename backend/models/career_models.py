from typing import List, Optional
from pydantic import BaseModel


class CareerSection(BaseModel):
    title: str
    content: str


class CareerOption(BaseModel):
    rank: int
    title: str
    field: str
    reason: str
    key_planets: List[str] = []
    favorable_dasha: str = ""
    effort_required: str = "medium"
    timeline: str = ""


class CareerReport(BaseModel):
    # ── Original 11 narrative sections ────────────────────────────────────────
    lagna_personality: CareerSection
    job_vs_business: CareerSection
    tenth_house_d1: CareerSection
    d10_analysis: CareerSection
    amatyakaraka: CareerSection
    career_fields: CareerSection
    student_streams: CareerSection
    yogas_combinations: CareerSection
    dasha_predictions: CareerSection
    remedies: CareerSection
    conclusion: CareerSection

    # ── New structured sections ────────────────────────────────────────────────
    career_options: Optional[List[CareerOption]] = None   # 5 ranked career paths
    single_best_career: Optional[CareerSection] = None    # The single best recommendation
    transit_impact: Optional[CareerSection] = None        # Current transit effects on career
