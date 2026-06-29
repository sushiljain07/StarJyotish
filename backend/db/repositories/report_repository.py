import uuid
from typing import List, Optional

from sqlalchemy import select

from db.models.report import Report, ReportType
from db.repositories.base_repository import BaseRepository


class ReportRepository(BaseRepository[Report]):
    model = Report

    def list_for_user(
        self, user_id: uuid.UUID, *, report_type: Optional[ReportType] = None, limit: int = 50
    ) -> List[Report]:
        stmt = select(Report).where(Report.user_id == user_id)
        if report_type is not None:
            stmt = stmt.where(Report.report_type == report_type)
        stmt = stmt.order_by(Report.created_at.desc()).limit(limit)
        return list(self.db.scalars(stmt))

    def list_for_birth_profile(self, birth_profile_id: uuid.UUID) -> List[Report]:
        stmt = (
            select(Report)
            .where(Report.birth_profile_id == birth_profile_id)
            .order_by(Report.created_at.desc())
        )
        return list(self.db.scalars(stmt))

    def save_generated_report(
        self,
        *,
        user_id: Optional[uuid.UUID],
        birth_profile_id: Optional[uuid.UUID],
        report_type: ReportType,
        content: dict,
        language: str = "en",
        llm_provider: Optional[str] = None,
        is_paid: bool = False,
        question: Optional[str] = None,
    ) -> Report:
        """Single entry point used by every report-generating route's
        best-effort persistence hook (see routers/topic_reports.py,
        routers/career_report.py, routes/kundli.py). Always succeeds with a
        completed-status row — there's no async/queued generation path
        today, so by the time this is called the report content already
        exists in hand."""
        return self.create(
            user_id=user_id,
            birth_profile_id=birth_profile_id,
            report_type=report_type,
            content=content,
            language=language,
            llm_provider=llm_provider,
            is_paid=is_paid,
            question=question,
        )
