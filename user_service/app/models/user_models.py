from datetime import datetime, date
import enum
from sqlalchemy import String, CheckConstraint, Date, DateTime, Enum, text
from sqlalchemy.orm import Mapped, mapped_column

from ..core.database import Base

class Role(enum.Enum):
    USER = "user"
    ADMIN = "admin"

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)

    username: Mapped[str] = mapped_column(String(30), nullable=False, unique=True, index=True)
    email: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)

    birth_date: Mapped[date] = mapped_column(Date, nullable=False)
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False, index=True)

    role : Mapped[str] = mapped_column(Enum(Role), default=Role.USER, nullable=False)
    is_active: Mapped[bool] = mapped_column(default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=text("TIMEZONE('utc', now())"))

    __table_args__ = (
        CheckConstraint("birth_date <= CURRENT_DATE", name="check_birth_date_past"),
        CheckConstraint("username ~ '^[a-z0-9_]{3,30}$'", name="check_username_format"),
    )
