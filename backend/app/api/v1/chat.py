import json
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.schemas.request_response import ChatRequest
from app.services.search import semantic_search
from app.services.ai import client, generate_rag_prompt
from app.core.config import settings

router = APIRouter()

@router.post("/stream")
async def stream_chat(request: ChatRequest, db: AsyncSession = Depends(get_db)):
    
    # 1. Get products from database
    context_products = await semantic_search(db, request.prompt, limit=2)
    
    if not context_products:
        context_text = "No specific products were found matching your query."
    else:
        context_text = "\n".join([f"{p.name} (${p.price}): {p.description}" for p in context_products])
    
    # 2. Build AI prompt
    final_prompt = generate_rag_prompt(request.prompt, context_text)
    
    try:
        response_stream = await client.aio.models.generate_content_stream(
            model=settings.MAIN_MODEL,
            contents=final_prompt,
           
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    # 3. Stream data to Next.js
    async def sse_generator():
        # Send UI data for product cards first
        if context_products:
            ui_product_data = [
                {
                    "id": p.id,
                    "name": p.name,
                    "price": float(p.price) if p.price else None,
                    "description": p.description[:120] + "..."
                }
                for p in context_products
            ]
            yield f"event: products\ndata: {json.dumps(ui_product_data)}\n\n"

        # Stream conversational text
        async for chunk in response_stream:
            yield f"event: message\ndata: {chunk.text}\n\n"

    return StreamingResponse(sse_generator(), media_type="text/event-stream")