"""
Shared column mixins so every table gets a consistent UUID primary key and
created_at/updated_at pair without repeating the boilerplate in each model.

UUID primary keys (rather than auto-incrementing integers) are used
throughout because:
  - IDs are safe to expose in API responses and URLs without leaking
    row-count/growth-rate information about the business.
  - IDs can be generated client-side or in application code before the
    INSERT happens, which is convenient for the repository layer below.
  - There's never a merge-conflict risk if data ever needs to move between
    environments (e.g. importing seed data, or a future multi-region setup).
"""
import uuid
from datetime import datetime

from sqlalchemy import DateTime, func
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column


class UUIDPKMixin:
    """Adds a UUID primary key column named `id`, generated in Python
    (uuid4) so new objects have a usable .id before the INSERT flushes."""

    id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )


class TimestampMixin:
    """Adds created_at/updated_at columns, both maintained by Postgres
    itself (server_default / onupdate) so they're correct even for rows
    inserted or updated outside the ORM (raw SQL, migrations, etc.)."""

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
