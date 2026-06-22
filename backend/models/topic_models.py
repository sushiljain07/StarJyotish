from typing import Dict, List, Optional
from pydantic import BaseModel


class TopicSection(BaseModel):
    title: str
    content: str


class TopicHighlight(BaseModel):
    """
    Generalizes career_models.CareerOption for topics that have a small,
    ranked list of concrete items (e.g. wealth's income-source ideas).
    Not every topic uses this — relationship analysis, for instance, has no
    natural equivalent of "ranked alternative careers", so its reports leave
    `highlights` empty rather than forcing content into this shape.
    """
    rank: int
    title: str
    category: str = ""
    reason: str = ""
    key_planets: List[str] = []
    favorable_dasha: str = ""
    effort_required: str = "medium"
    timeline: str = ""


class TopicReport(BaseModel):
    llm_provider: str = ""
    sections: Dict[str, TopicSection] = {}
    highlights: Optional[List[TopicHighlight]] = None
