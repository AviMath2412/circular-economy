"""
App entrypoint. Run with:  uvicorn app.main:app --reload --port 8000
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.routers import auth as auth_router

# Creates tables if they don't exist yet. For Phase 1 this is enough;
# init_db.py (below) is used separately to also load seed data.
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Circular Economy Recommendation Engine API",
    version="1.0.0",
)

# Allow the Vite dev server (default port 5173) to call this API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router)


@app.get("/")
def root():
    return {"status": "ok", "service": "circular-economy-recommendation-engine"}
