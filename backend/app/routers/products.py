"""
Product management: CRUD, scoped so a user only ever sees/edits their
own products (admins can still access anything via /api/admin routes
later if needed — kept out of scope for Phase 2 to match the spec).
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models import Product, Category, Material, User
from app.schemas import (
    ProductCreate, ProductUpdate, ProductOut,
    ConditionAssessmentInput, ConditionAssessmentOutput,
)
from app.auth import get_current_user
from app.services.condition_assessment import assess_condition

router = APIRouter(prefix="/api/products", tags=["products"])


def _to_product_out(product: Product) -> ProductOut:
    return ProductOut(
        id=product.id,
        name=product.name,
        category_id=product.category_id,
        category_name=product.category.name,
        material_id=product.material_id,
        material_name=product.material.name if product.material else None,
        age_years=product.age_years,
        condition_score=product.condition_score,
        condition_description=product.condition_description,
        created_at=product.created_at,
    )


def _get_owned_product(product_id: int, db: Session, current_user: User) -> Product:
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


@router.post("/assess-condition", response_model=ConditionAssessmentOutput)
def assess_condition_endpoint(
    payload: ConditionAssessmentInput,
    current_user: User = Depends(get_current_user),
):
    """
    Run the condition questionnaire and get back a condition_score (1-10)
    to use when creating/updating a product. Does not touch the database.
    """
    return assess_condition(payload)


@router.post("", response_model=dict, status_code=201)
def create_product(
    payload: ProductCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not db.query(Category).filter(Category.id == payload.category_id).first():
        raise HTTPException(status_code=400, detail="Invalid category_id")
    if payload.material_id is not None and not db.query(Material).filter(Material.id == payload.material_id).first():
        raise HTTPException(status_code=400, detail="Invalid material_id")

    product = Product(user_id=current_user.id, **payload.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)

    return {"success": True, "product_id": product.id, "message": "Product added successfully"}


@router.get("", response_model=list[ProductOut])
def list_products(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Product).options(joinedload(Product.category), joinedload(Product.material))
    if current_user.role != "admin":
        query = query.filter(Product.user_id == current_user.id)

    return [_to_product_out(p) for p in query.order_by(Product.created_at.desc()).all()]


@router.get("/{product_id}", response_model=ProductOut)
def get_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    product = _get_owned_product(product_id, db, current_user)
    return _to_product_out(product)


@router.put("/{product_id}")
def update_product(
    product_id: int,
    payload: ProductUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    product = _get_owned_product(product_id, db, current_user)

    updates = payload.model_dump(exclude_unset=True)
    if "category_id" in updates and not db.query(Category).filter(Category.id == updates["category_id"]).first():
        raise HTTPException(status_code=400, detail="Invalid category_id")
    if "material_id" in updates and updates["material_id"] is not None and not db.query(Material).filter(Material.id == updates["material_id"]).first():
        raise HTTPException(status_code=400, detail="Invalid material_id")

    for field, value in updates.items():
        setattr(product, field, value)

    db.commit()
    return {"success": True, "message": "Product updated successfully"}


@router.delete("/{product_id}")
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    product = _get_owned_product(product_id, db, current_user)
    db.delete(product)
    db.commit()
    return {"success": True, "message": "Product deleted successfully"}
