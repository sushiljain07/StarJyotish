"""add users.email_verified_at and sessions.revoked_reason

Revision ID: 0011
Revises: 0010
Create Date: 2026-11-03

Until now PATCH /account/me let a user set any email without proving they
own it, and Google / email-OTP sign-in linked to whichever account held
that email — so claiming someone's address captured their later sign-ins.
Sign-in now only links to a *verified* email. Backfill treats emails as
verified only where the account came from a flow that proved ownership:
Google sign-in (google_sub set) or email-OTP signup (no phone number).
Emails typed onto phone-login accounts stay unverified.

sessions.revoked_reason lets /auth/refresh tell a token spent by normal
rotation (eligible for the concurrent-refresh grace window) apart from one
ended by logout or reuse detection (never eligible).
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = '0011'
down_revision: Union[str, None] = '0010'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('users', sa.Column('email_verified_at', sa.DateTime(timezone=True), nullable=True))
    op.execute(
        "UPDATE users SET email_verified_at = created_at "
        "WHERE email IS NOT NULL AND (google_sub IS NOT NULL OR phone_number IS NULL)"
    )


    op.add_column('sessions', sa.Column('revoked_reason', sa.String(length=16), nullable=True))


def downgrade() -> None:
    op.drop_column('sessions', 'revoked_reason')
    op.drop_column('users', 'email_verified_at')
