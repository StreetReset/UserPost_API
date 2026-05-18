"""Add hashed password to users

Revision ID: b7c9d2e4f6a1
Revises: a3f2d9b7c1e4
Create Date: 2026-05-14 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "b7c9d2e4f6a1"
down_revision: Union[str, Sequence[str], None] = "a3f2d9b7c1e4"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column("users", sa.Column("hashed_password", sa.String(length=255), nullable=True))
    op.execute("UPDATE users SET hashed_password = 'password_migration_required' WHERE hashed_password IS NULL")
    op.alter_column("users", "hashed_password", existing_type=sa.String(length=255), nullable=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column("users", "hashed_password")
