"""
SQLAlchemy ORM models.

These map 1:1 onto the schema in the project spec (users, categories,
materials, products, circular_actions, action_logs).
"""
from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, Text, ForeignKey, DateTime
)
from sqlalchemy.orm import relationship
from app.database import Base
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(100), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), default="user")  # "user" or "admin"
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)

    products = relationship("Product", back_populates="owner", cascade="all, delete-orphan")
    action_logs = relationship("ActionLog", back_populates="user", cascade="all, delete-orphan")


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    typical_lifespan_years = Column(Integer, nullable=True)

    products = relationship("Product", back_populates="category")


class Material(Base):
    __tablename__ = "materials"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)
    recyclability_score = Column(Integer, nullable=False)     # 1-10
    repairability_score = Column(Integer, nullable=False)     # 1-10
    environmental_impact_factor = Column(Float, nullable=False)  # 0-1

    products = relationship("Product", back_populates="material")


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(100), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    material_id = Column(Integer, ForeignKey("materials.id"), nullable=True)
    age_years = Column(Integer, nullable=False, default=0)
    condition_score = Column(Integer, nullable=False)  # 1-10
    condition_description = Column(Text, nullable=True)
    image_path = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="products")
    category = relationship("Category", back_populates="products")
    material = relationship("Material", back_populates="products")
    circular_actions = relationship("CircularAction", back_populates="product", cascade="all, delete-orphan")
    action_logs = relationship("ActionLog", back_populates="product", cascade="all, delete-orphan")


class CircularAction(Base):
    __tablename__ = "circular_actions"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    action_type = Column(String(20), nullable=False)  # reuse/repair/refurbish/...
    recommendation_score = Column(Float, nullable=False)
    is_recommended = Column(Boolean, default=False)
    environmental_impact = Column(Text, nullable=True)  # JSON-encoded string
    created_at = Column(DateTime, default=datetime.utcnow)

    product = relationship("Product", back_populates="circular_actions")


class ActionLog(Base):
    __tablename__ = "action_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    action_type = Column(String(20), nullable=False)
    completed_at = Column(DateTime, default=datetime.utcnow)
    notes = Column(Text, nullable=True)

    user = relationship("User", back_populates="action_logs")
    product = relationship("Product", back_populates="action_logs")
