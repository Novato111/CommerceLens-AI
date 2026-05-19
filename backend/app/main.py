from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.api.v1 import products, chat, evaluation
from app.core.database import init_db
from app.api.v1 import products, chat

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Create tables and vector extension
    print("Initializing database...")
    try:
        await init_db()
        print("Database initialized successfully.")
    except Exception as e:
        print(f"Database initialization failed: {e}")
    yield

app = FastAPI(
    title="Commerce Intelligence Platform API",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes explicitly
app.include_router(products.router, prefix="/api/v1/products", tags=["Products"])
app.include_router(chat.router, prefix="/api/v1/chat", tags=["Chat"])
app.include_router(evaluation.router, prefix="/api/v1/evaluation", tags=["Evaluation"])
@app.get("/health")
async def health_check():
    return {"status": "healthy", "database": "connected"}