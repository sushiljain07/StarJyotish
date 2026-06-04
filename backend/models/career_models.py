from pydantic import BaseModel


class CareerSection(BaseModel):
    title: str
    content: str


class CareerReport(BaseModel):
    lagna_personality: CareerSection
    job_vs_business: CareerSection
    tenth_house_d1: CareerSection
    d10_analysis: CareerSection
    amatyakaraka: CareerSection
    career_fields: CareerSection
    yogas_combinations: CareerSection
    dasha_predictions: CareerSection
    remedies: CareerSection
    conclusion: CareerSection
