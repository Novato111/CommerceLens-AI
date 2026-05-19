from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.domain import Product, Review
from app.schemas.request_response import ProductCreate
from app.services.ai import generate_embedding


async def ingest_product(
    db: AsyncSession,
    product_data: ProductCreate,
):
    """
    Ingest a product and generate embeddings.
    """

    # Combine product text
    combined_text = (
        f"{product_data.name}. "
        f"{product_data.description}. "
        f"{product_data.specifications}"
    )

    # Generate embedding
    product_emb = await generate_embedding(
        combined_text
    )

    # Create product
    db_product = Product(
        id=product_data.id,
        name=product_data.name,
        category=product_data.category,
        price=product_data.price,
        description=product_data.description,
        specifications=product_data.specifications,
        embedding=product_emb,
    )

    db.add(db_product)

    # Process reviews
    for rev in product_data.reviews:

        rev_emb = await generate_embedding(
            rev.review_text
        )

        db_review = Review(
            id=rev.id,
            product_id=product_data.id,
            rating=rev.rating,
            review_text=rev.review_text,
            embedding=rev_emb,
        )

        db.add(db_review)

    await db.commit()

    return {
        "status": "success",
        "product_id": product_data.id,
    }


async def semantic_search(
    db: AsyncSession,
    query: str,
    limit: int = 5,
):
    """
    Perform semantic vector similarity search.
    """

    # Embed search query
    query_emb = await generate_embedding(query)

    # Vector similarity search
    stmt = (
        select(Product)
        .order_by(
            Product.embedding.cosine_distance(
                query_emb
            )
        )
        .limit(limit)
    )

    result = await db.execute(stmt)

    products = result.scalars().all()

    return products
async def get_product_by_id(db: AsyncSession, product_id: str):
    """Fetches a single product by its exact ID."""
    stmt = select(Product).where(Product.id == product_id)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()