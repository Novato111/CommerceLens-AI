from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse

from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from app.core.database import get_db
from app.services.search import semantic_search
from app.services.ai import stream_rag_response


router = APIRouter()


class ChatRequest(BaseModel):
    query: str


@router.post("/stream")
async def chat_stream(
    request: ChatRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    End-to-end RAG pipeline.

    Steps:
    1. Embed query
    2. Retrieve relevant products
    3. Stream Gemini response
    """

    # Retrieve context products
    products = await semantic_search(
        db,
        request.query,
        limit=3,
    )

    # Stream response
    return StreamingResponse(
        stream_rag_response(
            request.query,
            products,
        ),
        media_type="text/event-stream",
    )