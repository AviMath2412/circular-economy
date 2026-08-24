"""
Admin-only write access to master data (categories, materials).
Regular users can read this data (see routers/catalog.py) but only
admins can add new categories/materials.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Category, Material, User
from app.schemas import CategoryCreate, CategoryOut, MaterialCreate, MaterialOut
from app.auth import require_admin

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.post("/categories", response_model=CategoryOut, status_code=201)
def create_category(
    payload: CategoryCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    if db.query(Category).filter(Category.name == payload.name).first():
        raise HTTPException(status_code=400, detail="Category already exists")

    category = Category(**payload.model_dump())
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


@router.post("/materials", response_model=MaterialOut, status_code=201)
def create_material(
    payload: MaterialCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    if db.query(Material).filter(Material.name == payload.name).first():
        raise HTTPException(status_code=400, detail="Material already exists")

    material = Material(**payload.model_dump())
    db.add(material)
    db.commit()
    db.refresh(material)
    return material


@router.get("/users")
def list_users(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    users = db.query(User).all()
    return {
        "users": [
            {
                "id": u.id,
                "username": u.username,
                "email": u.email,
                "role": u.role,
                "created_at": u.created_at,
            }
            for u in users
        ]
    }
