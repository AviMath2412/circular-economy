"""
Catalog (master data) read endpoints. Any authenticated user can read
these — they're needed to populate the Category/Material dropdowns on
the product form. Writing to them is admin-only (see routers/admin.py).
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Category, Material, User
from app.schemas import CategoryOut, MaterialOut
from app.auth import get_current_user

router = APIRouter(prefix="/api", tags=["catalog"])


@router.get("/categories", response_model=list[CategoryOut])
def list_categories(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Category).order_by(Category.name).all()


@router.get("/materials", response_model=list[MaterialOut])
def list_materials(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Material).order_by(Material.name).all()
