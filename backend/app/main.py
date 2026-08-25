"""
App entrypoint. Run with:  uvicorn app.main:app --reload --port 8000
"""
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.database import Base, engine
from app.routers import auth as auth_router
from app.routers import catalog as catalog_router
from app.routers import admin as admin_router
from app.routers import products as products_router
from app.routers import recommendations as recommendations_router

# Creates tables if they don't exist yet. For Phase 1 this is enough;
# init_db.py (below) is used separately to also load seed data.
Base.metadata.create_all(bind=engine)

# Ensure uploads directory exists
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads", "products")
os.makedirs(UPLOAD_DIR, exist_ok=True)

app = FastAPI(
    title="Circular Economy Recommendation Engine API",
    version="1.0.0",
)

# Mount static uploads
app.mount("/uploads", StaticFiles(directory=os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")), name="uploads")

# Allow Vite dev server and local clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router)
app.include_router(catalog_router.router)
app.include_router(admin_router.router)
app.include_router(products_router.router)
app.include_router(recommendations_router.router)

@app.get("/")
def root():
    return {"status": "ok", "service": "circular-economy-recommendation-engine"}
