"""add newsletter_subscribers

Revision ID: 0012
Revises: 0011
Create Date: 2026-11-03

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = '0012'
down_revision: Union[str, None] = '0011'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table('newsletter_subscribers',
    sa.Column('email', sa.String(length=320), nullable=False),
    sa.Column('unsubscribed_at', sa.DateTime(timezone=True), nullable=True),
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.PrimaryKeyConstraint('id', name=op.f('pk_newsletter_subscribers')),
    sa.UniqueConstraint('email', name=op.f('uq_newsletter_subscribers_email'))
    )


def downgrade() -> None:
    op.drop_table('newsletter_subscribers')
