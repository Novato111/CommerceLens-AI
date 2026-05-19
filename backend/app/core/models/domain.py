from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Float,
    ForeignKey,
    DateTime,
)
from sqlalchemy.orm import relationship
from pgvector.sqlalchemy import Vector
from datetime import datetime

from app.core.database import Base


class Product(Base):
    __tablename__ = "products"

    # Product ID (SKU or UUID)
    id = Column(String, primary_key=True, index=True)

    name = Column(String, nullable=False)
    category = Column(String, index=True)
    price = Column(Float)
    description = Column(Text)
    specifications = Column(Text)

    # Gemini embedding vector
    embedding = Column(Vector(768))

    # Relationship with reviews
    reviews = relationship(
        "Review",
        back_populates="product",
        cascade="all, delete-orphan",
    )


class Review(Base):
    __tablename__ = "reviews"

    id = Column(String, primary_key=True, index=True)

    product_id = Column(
        String,
        ForeignKey("products.id"),
        index=True,
    )

    rating = Column(Integer)
    review_text = Column(Text)

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
    )

    # Review embedding vector
    embedding = Column(Vector(768))

    # Relationship back to product
    product = relationship(
        "Product",
        back_populates="reviews",
    )