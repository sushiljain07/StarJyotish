"""add current-location fields to birth_profiles; enforce one profile per user

Two changes, both part of the same product decision (a single astrology
profile per account, covering both birth data and "where you are right
now"):

1. Adds birth_profiles.current_lat / current_lon / current_location_label.
   Deliberately on BirthProfile, not User — this is "where the person this
   chart belongs to is right now," which is meaningful in the context of a
   profile, not the login account itself.

2. Data cleanup + a real constraint: for every user with more than one
   birth_profiles row, deletes all but one (the one already marked
   is_primary, or the earliest-created if none was), marks the survivor
   primary, then adds a UNIQUE constraint on birth_profiles.user_id so a
   second profile can never be created again — at the database level, not
   just because the frontend stopped offering the option.

Safe to run: Report/Booking/Purchase.birth_profile_id are all
ON DELETE SET NULL (see db/models/report.py etc.), so deleting profile
rows can't violate a foreign key — it only detaches historical records
from a profile that no longer exists, which is the explicit, intended
trade-off of this cleanup for any account that had saved more than one
profile.

Revision ID: 0009
Revises: 0008
Create Date: 2026-07-13 14:00:00.000000
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '0009'
down_revision: Union[str, None] = '0008'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('birth_profiles', sa.Column('current_lat', sa.Float(), nullable=True))
    op.add_column('birth_profiles', sa.Column('current_lon', sa.Float(), nullable=True))
    op.add_column('birth_profiles', sa.Column('current_location_label', sa.String(200), nullable=True))
    op.create_check_constraint(
        'current_lat_range', 'birth_profiles',
        'current_lat IS NULL OR (current_lat >= -90 AND current_lat <= 90)',
    )
    op.create_check_constraint(
        'current_lon_range', 'birth_profiles',
        'current_lon IS NULL OR (current_lon >= -180 AND current_lon <= 180)',
    )

    # Step 1: for each user, delete every birth_profiles row except the one
    # to keep (is_primary already true, wins; otherwise earliest created).
    # Must run BEFORE the unique constraint below, or the constraint can't
    # even be created while duplicates still exist.
    op.execute("""
        DELETE FROM birth_profiles
        WHERE id NOT IN (
            SELECT DISTINCT ON (user_id) id
            FROM birth_profiles
            ORDER BY user_id, is_primary DESC, created_at ASC
        )
    """)

    # Step 2: the single surviving row per user might not have been the
    # one marked primary (if none was) — make sure it is now.
    op.execute("UPDATE birth_profiles SET is_primary = true WHERE is_primary = false")

    # Step 3: the real enforcement — one profile per user, from here on,
    # at the database level.
    op.create_unique_constraint('uq_birth_profiles_user_id_single', 'birth_profiles', ['user_id'])


def downgrade() -> None:
    op.drop_constraint('uq_birth_profiles_user_id_single', 'birth_profiles', type_='unique')
    # The row deletions above are not reversible — only the schema
    # additions can be undone.
    op.drop_constraint('current_lon_range', 'birth_profiles', type_='check')
    op.drop_constraint('current_lat_range', 'birth_profiles', type_='check')
    op.drop_column('birth_profiles', 'current_location_label')
    op.drop_column('birth_profiles', 'current_lon')
    op.drop_column('birth_profiles', 'current_lat')
