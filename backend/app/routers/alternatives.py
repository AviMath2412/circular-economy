"""
Sustainable Alternatives Router (Sprint 3 / US14)

Provides access to curated circular-designed products and services
to encourage responsible consumption when products are marked for disposal or replacement.
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models import SustainableAlternative, Product, Category, User
from app.schemas import SustainableAlternativeOut
from app.auth import get_current_user

router = APIRouter(prefix="/api/alternatives", tags=["alternatives"])


def _to_alternative_out(alt: SustainableAlternative) -> SustainableAlternativeOut:
    return SustainableAlternativeOut(
        id=alt.id,
        category_id=alt.category_id,
        category_name=alt.category.name if alt.category else None,
        name=alt.name,
        brand=alt.brand,
        description=alt.description,
        circular_feature=alt.circular_feature,
        co2_reduction_pct=alt.co2_reduction_pct,
        lifespan_multiplier=alt.lifespan_multiplier,
        price_tier=alt.price_tier,
        resource_url=alt.resource_url,
    )


@router.get("", response_model=list[SustainableAlternativeOut])
def list_alternatives(
    category_id: int | None = Query(None, description="Filter by category ID"),
    price_tier: str | None = Query(None, description="Filter by price tier (Budget, Moderate, Premium)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Fetch circular-designed sustainable alternative products.
    Allows filtering by category and price tier.
    """
    query = db.query(SustainableAlternative).options(joinedload(SustainableAlternative.category))
    if category_id:
        query = query.filter(SustainableAlternative.category_id == category_id)
    if price_tier:
        query = query.filter(SustainableAlternative.price_tier == price_tier)

    results = query.order_by(SustainableAlternative.co2_reduction_pct.desc()).all()
    return [_to_alternative_out(a) for a in results]


@router.get("/product/{product_id}", response_model=dict)
def get_alternatives_for_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Fetch matching sustainable alternative products for a specific user product,
    calculating estimated avoided emissions if chosen instead of virgin replacement.
    """
    product = db.query(Product).options(joinedload(Product.category)).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if product.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    alternatives = (
        db.query(SustainableAlternative)
        .options(joinedload(SustainableAlternative.category))
        .filter(SustainableAlternative.category_id == product.category_id)
        .order_by(SustainableAlternative.co2_reduction_pct.desc())
        .all()
    )

    # If no direct match in category, fallback to all alternatives
    if not alternatives:
        alternatives = (
            db.query(SustainableAlternative)
            .options(joinedload(SustainableAlternative.category))
            .order_by(SustainableAlternative.co2_reduction_pct.desc())
            .limit(4)
            .all()
        )

    return {
        "product_id": product.id,
        "product_name": product.name,
        "category_name": product.category.name,
        "alternatives": [_to_alternative_out(a) for a in alternatives],
    }

