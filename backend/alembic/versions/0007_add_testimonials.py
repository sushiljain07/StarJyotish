"""add testimonials table

Revision ID: 0007
Revises: 0006
Create Date: 2026-07-03 10:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = '0007'
down_revision: Union[str, None] = '0006'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'testimonials',
        sa.Column('id', sa.dialects.postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', sa.dialects.postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('display_name', sa.String(80), nullable=False),
        sa.Column('location', sa.String(80), nullable=True),
        sa.Column('text', sa.Text, nullable=False),
        sa.Column('detail', sa.String(120), nullable=True),
        sa.Column('status', sa.String(20), nullable=False, server_default='pending'),
        sa.Column('admin_notes', sa.Text, nullable=True),
        sa.Column('is_featured', sa.Boolean, nullable=False, server_default='false'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False,
                  server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False,
                  server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_testimonials_user_id', 'testimonials', ['user_id'])
    op.create_index('ix_testimonials_status', 'testimonials', ['status'])
    op.create_index('ix_testimonials_is_featured', 'testimonials', ['is_featured'])

    # Seed the 4 default testimonials so the landing page isn't empty
    # before any real submissions arrive. Marked status='featured' so they
    # appear on the landing page immediately. Admin can approve/reject/replace
    # these with real ones from the Testimonials tab.
    op.execute("""
        INSERT INTO testimonials (id, display_name, location, text, detail, status, is_featured)
        VALUES
        (gen_random_uuid(), 'Priya Mehta', 'Bengaluru',
         'I''ve consulted astrologers for years but never understood the reasoning. Seeing the actual chart and having the AI explain each placement changed everything. The career report nailed a tension I''ve been feeling for months.',
         'Career report + full Kundli', 'featured', true),
        (gen_random_uuid(), 'Rahul Sharma', 'Delhi',
         'The Dasha timeline finally made sense to me. I knew I was in a Jupiter period but Star Jyotish showed me exactly how it was interacting with my natal chart. The Ask feature let me go deeper than any static report could.',
         'Dasha analysis + Ask the Chart', 'featured', true),
        (gen_random_uuid(), 'Kavitha Nair', 'Kochi',
         'I was skeptical about AI and astrology together. But the reading was specific — it mentioned my Moon-Saturn square without me asking and connected it directly to patterns in my relationships.',
         'Relationship report', 'featured', true),
        (gen_random_uuid(), 'Arjun Bose', 'Kolkata',
         'The Navamsa chart reading for my marriage question was impressively detailed. It picked up on the Venus placement and explained why it matters in D9 — in plain language, not jargon.',
         'Navamsa + Relationship report', 'featured', true)
    """)


def downgrade() -> None:
    op.drop_index('ix_testimonials_is_featured', 'testimonials')
    op.drop_index('ix_testimonials_status', 'testimonials')
    op.drop_index('ix_testimonials_user_id', 'testimonials')
    op.drop_table('testimonials')
