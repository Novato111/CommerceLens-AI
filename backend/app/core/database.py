from sqlalchemy.ext.asyncio import (
    create_async_engine,
    async_sessionmaker,
    AsyncSession,
)
from sqlalchemy.orm import declarative_base
from sqlalchemy import text

from app.core.config import settings


# Create async engine
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
)

# Create session factory
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

# Base model class
Base = declarative_base()


async def init_db():
    """
    Initialize database and ensure pgvector extension exists.
    """
    async with engine.begin() as conn:
        # Enable pgvector extension
        await conn.execute(
            text("CREATE EXTENSION IF NOT EXISTS vector;")
        )

        # Auto-create tables for local development
        # In production, use Alembic migrations instead
        await conn.run_sync(Base.metadata.create_all)


async def get_db():
    """
    FastAPI dependency to provide a database session.
    """
    async with AsyncSessionLocal() as session:
        yield session