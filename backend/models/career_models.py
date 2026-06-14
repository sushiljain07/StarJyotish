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
    # ── New v2 sections (primary report flow) ─────────────────────────────────
    career_destiny_brief: Optional[CareerSection] = None
    natural_strengths: Optional[CareerSection] = None
    best_career_path: Optional[CareerSection] = None
    job_vs_business_verdict: Optional[CareerSection] = None
    career_rajyogas: Optional[CareerSection] = None
    peak_career_window: Optional[CareerSection] = None
    current_phase: Optional[CareerSection] = None
    academic_path: Optional[CareerSection] = None
    gemstone_recommendation: Optional[CareerSection] = None
    empowering_remedies: Optional[CareerSection] = None
    closing_blessing: Optional[CareerSection] = None

    # ── Legacy sections (Optional for backward compatibility) ──────────────────
    lagna_personality: Optional[CareerSection] = None
    job_vs_business: Optional[CareerSection] = None
    tenth_house_d1: Optional[CareerSection] = None
    d10_analysis: Optional[CareerSection] = None
    amatyakaraka: Optional[CareerSection] = None
    career_fields: Optional[CareerSection] = None
    student_streams: Optional[CareerSection] = None
    yogas_combinations: Optional[CareerSection] = None
    dasha_predictions: Optional[CareerSection] = None
    remedies: Optional[CareerSection] = None
    conclusion: Optional[CareerSection] = None

    # ── Structured data ────────────────────────────────────────────────────────
    career_options: Optional[List[CareerOption]] = None
    single_best_career: Optional[CareerSection] = None
    transit_impact: Optional[CareerSection] = None
