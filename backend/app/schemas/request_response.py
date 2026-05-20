from pydantic import BaseModel
from typing import List, Optional


class ReviewCreate(BaseModel):
    id: str
    rating: int
    review_text: str


class ProductCreate(BaseModel):
    id: str
    name: str
    category: str
    price: float
    description: str
    specifications: str

    reviews: Optional[List[ReviewCreate]] = []


class SearchQuery(BaseModel):
    query: str
    limit: int = 5

    
from pydantic import BaseModel

class ChatRequest(BaseModel):
    prompt: str