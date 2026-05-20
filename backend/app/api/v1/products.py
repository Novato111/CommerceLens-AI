from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.request_response import (
    ProductCreate,
    SearchQuery,
)
from app.services.search import (
    ingest_product,
    semantic_search,
)

router = APIRouter()


@router.post("/ingest")
async def ingest_new_product(
    product: ProductCreate,
    db: AsyncSession = Depends(get_db),
):
    """
    Ingest product and generate embeddings.
    """

    return await ingest_product(
        db,
        product,
    )


@router.post("/search")
async def search_products(
    query: SearchQuery,
    db: AsyncSession = Depends(get_db),
):
    """
    Perform semantic vector search.
    """

    results = await semantic_search(
        db,
        query.query,
        query.limit,
    )

    # Format response
    return [
        {
            "id": p.id,
            "name": p.name,
            "price": p.price,
            "description": p.description,
        }
        for p in results
    ]

from fastapi import HTTPException
from app.services.search import get_product_by_id
from app.services.ai import generate_product_comparison

@router.get("/compare")
async def compare_products(id_a: str, id_b: str, db: AsyncSession = Depends(get_db)):
    """
    Takes two product IDs, fetches them from the DB, and generates an AI comparison.
    """
    product_a = await get_product_by_id(db, id_a)
    product_b = await get_product_by_id(db, id_b)

    if not product_a or not product_b:
        raise HTTPException(status_code=404, detail="One or both products not found")

    comparison = await generate_product_comparison(product_a, product_b)
    
    return {
        "product_a": {"id": product_a.id, "name": product_a.name, "price": product_a.price},
        "product_b": {"id": product_b.id, "name": product_b.name, "price": product_b.price},
        "ai_analysis": comparison
    }

from app.services.ai import analyze_product_reviews

@router.get("/{product_id}/insights")
async def get_product_insights(product_id: str, db: AsyncSession = Depends(get_db)):
    """
    Fetches a product, grabs its reviews, and runs AI sentiment analysis.
    """
    product = await get_product_by_id(db, product_id)
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    insights = await analyze_product_reviews(product, product.reviews)
    
    return {
        "product_name": product.name,
        "review_count": len(product.reviews),
        "insights": insights
    }
