"""add user role

Revision ID: 8ab06b9c021a
Revises: b7c9d2e4f6a1
Create Date: 2026-05-19 14:03:45.788152

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '8ab06b9c021a'
down_revision: Union[str, Sequence[str], None] = 'b7c9d2e4f6a1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    role_enum = sa.Enum('USER', 'ADMIN', name='role')
    role_enum.create(op.get_bind(), checkfirst=True)

    op.add_column(
        'users',
        sa.Column(
            'role',
            role_enum,
            nullable=False,
            server_default='USER',
        ),
    )
    op.alter_column('users', 'role', server_default=None)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('users', 'role')

    role_enum = sa.Enum('USER', 'ADMIN', name='role')
    role_enum.drop(op.get_bind(), checkfirst=True)
