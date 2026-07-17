from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker

from ..config import settings

# Один async engine на сервис; сессии создаются через async_session_maker в Depends.
async_engine = create_async_engine(settings.DATABASE_URL, echo=True)
async_session_maker = async_sessionmaker(async_engine, expire_on_commit= False, class_=AsyncSession)

class Base(DeclarativeBase):
    pass
