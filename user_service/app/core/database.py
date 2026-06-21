import os
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker

load_dotenv(Path(__file__).resolve().parents[1] / ".env")

# Один async engine на сервис; сессии создаются через async_session_maker в Depends.
async_engine = create_async_engine(os.getenv("DATABASE_URL"), echo = True)
async_session_maker = async_sessionmaker(async_engine, expire_on_commit= False, class_=AsyncSession)

class Base(DeclarativeBase):
    pass
