import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PROJECT_NAME: str = "Commerce AI Intelligence Platform"
    VERSION: str = "1.0.0"

    # AI Configuration
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY")
    EMBED_MODEL: str = os.getenv("EMBED_MODEL", "gemini-embedding-001")
    MAIN_MODEL: str = os.getenv("MAIN_MODEL", "gemini-2.0-flash")
    
    # Database Configuration
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "postgresql+asyncpg://postgres:postgres@db:5432/commerce"
    )

settings = Settings()
config = settings  # Alias to prevent import errors across files