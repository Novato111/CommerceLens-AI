from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1 import products, chat, evaluation

app = FastAPI(title="Commerce AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router, prefix="/api/v1/chat", tags=["Chat"])
app.include_router(products.router, prefix="/api/v1/products", tags=["Products"])
app.include_router(evaluation.router, prefix="/api/v1/evaluation", tags=["Evaluation"])