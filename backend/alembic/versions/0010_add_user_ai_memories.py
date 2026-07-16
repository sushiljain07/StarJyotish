"""add user_ai_memories

Revision ID: 0010
Revises: 0009
Create Date: 2026-07-16

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '0010'
down_revision: Union[str, None] = '0009'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table('user_ai_memories',
    sa.Column('user_id', sa.UUID(), nullable=False),
    sa.Column('summary', sa.Text(), nullable=False),
    sa.Column('exchange_count', sa.Integer(), server_default='0', nullable=False),
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], name=op.f('fk_user_ai_memories_user_id_users'), ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id', name=op.f('pk_user_ai_memories')),
    sa.UniqueConstraint('user_id', name=op.f('uq_user_ai_memories_user_id'))
    )


def downgrade() -> None:
    op.drop_table('user_ai_memories')
