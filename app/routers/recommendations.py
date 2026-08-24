"""
Recommendation endpoints. Generating recommendations runs the scoring
algorithm in app/services/recommendation_engine.py and persists the
result as CircularAction rows (replacing any previous run for that
product, so /recommendations/{id} always reflects the latest scoring).
"""
import json

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models import Product, CircularAction, User
from app.schemas import RecommendationResponse, CircularActionOut
from app.auth import get_current_user
from app.services.recommendation_engine import score_product

router = APIRouter(prefix="/api/recommendations", tags=["recommendations"])


def _get_owned_product_with_relations(product_id: int, db: Session, current_user: User) -> Product:
    product = (
        db.query(Product)
        .options(joinedload(Product.category), joinedload(Product.material))
        .filter(Product.id == product_id)
        .first()
    )
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if product.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to access this product")
    return product


def _persist_scores(product: Product, db: Session) -> list[CircularAction]:
    # Replace any prior recommendation run for this product so results
    # never go stale.
    db.query(CircularAction).filter(CircularAction.product_id == product.id).delete()

    scores = score_product(product)
    rows = [
        CircularAction(
            product_id=product.id,
            action_type=s.action_type,
            recommendation_score=s.recommendation_score,
            is_recommended=s.is_recommended,
            environmental_impact=json.dumps(s.environmental_impact),
        )
        for s in scores
    ]
    db.add_all(rows)
    db.commit()
    for row in rows:
        db.refresh(row)
    return sorted(rows, key=lambda r: r.recommendation_score, reverse=True)


def _to_response(product: Product, rows: list[CircularAction]) -> RecommendationResponse:
    return RecommendationResponse(
        product_id=product.id,
        product_name=product.name,
        top_recommendation=next(r.action_type for r in rows if r.is_recommended),
        actions=[
            CircularActionOut(
                id=r.id,
                product_id=r.product_id,
                action_type=r.action_type,
                recommendation_score=r.recommendation_score,
                is_recommended=r.is_recommended,
                environmental_impact=json.loads(r.environmental_impact),
                created_at=r.created_at,
            )
            for r in rows
        ],
    )


@router.post("/generate/{product_id}", response_model=RecommendationResponse)
def generate_recommendations(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    product = _get_owned_product_with_relations(product_id, db, current_user)
    rows = _persist_scores(product, db)
    return _to_response(product, rows)


@router.get("/{product_id}", response_model=RecommendationResponse)
def get_recommendations(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    product = _get_owned_product_with_relations(product_id, db, current_user)
    rows = (
        db.query(CircularAction)
        .filter(CircularAction.product_id == product_id)
        .order_by(CircularAction.recommendation_score.desc())
        .all()
    )
    if not rows:
        # Nothing generated yet for this product — generate on first read
        # rather than forcing the client to call POST /generate first.
        rows = _persist_scores(product, db)
    return _to_response(product, rows)
    