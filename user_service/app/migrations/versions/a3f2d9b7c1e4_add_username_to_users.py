"""Add username to users

Revision ID: a3f2d9b7c1e4
Revises: df33a114ef87
Create Date: 2026-05-10 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "a3f2d9b7c1e4"
down_revision: Union[str, Sequence[str], None] = "df33a114ef87"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column("users", sa.Column("username", sa.String(length=30), nullable=True))
    op.execute("UPDATE users SET username = 'user_' || id WHERE username IS NULL")
    op.alter_column("users", "username", existing_type=sa.String(length=30), nullable=False)
    op.create_check_constraint(
        "check_username_format",
        "users",
        "username ~ '^[a-z0-9_]{3,30}$'",
    )
    op.create_unique_constraint("uq_users_username", "users", ["username"])
    op.create_index(op.f("ix_users_username"), "users", ["username"], unique=False)
    op.alter_column(
        "users",
        "first_name",
        existing_type=sa.String(length=255),
        type_=sa.String(length=100),
        existing_nullable=False,
    )
    op.alter_column(
        "users",
        "last_name",
        existing_type=sa.String(length=255),
        type_=sa.String(length=100),
        existing_nullable=False,
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.alter_column(
        "users",
        "last_name",
        existing_type=sa.String(length=100),
        type_=sa.String(length=255),
        existing_nullable=False,
    )
    op.alter_column(
        "users",
        "first_name",
        existing_type=sa.String(length=100),
        type_=sa.String(length=255),
        existing_nullable=False,
    )
    op.drop_index(op.f("ix_users_username"), table_name="users")
    op.drop_constraint("uq_users_username", "users", type_="unique")
    op.drop_constraint("check_username_format", "users", type_="check")
    op.drop_column("users", "username")
