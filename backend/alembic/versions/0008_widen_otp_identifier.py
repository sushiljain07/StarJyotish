"""widen otp_codes.phone_number to support email addresses

The original String(20) was sized for phone numbers only (E.164 max is 15
digits + '+' = 16 chars). Now that the OTP flow accepts email addresses
(RFC 5321 max = 254 chars), the column needs to be wider.

Revision ID: 0008
Revises: 0007
Create Date: 2026-07-03 12:00:00.000000
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '0008'
down_revision: Union[str, None] = '0007'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column(
        'otp_codes',
        'phone_number',
        existing_type=sa.String(20),
        type_=sa.String(254),
        existing_nullable=False,
    )


def downgrade() -> None:
    op.alter_column(
        'otp_codes',
        'phone_number',
        existing_type=sa.String(254),
        type_=sa.String(20),
        existing_nullable=False,
    )
