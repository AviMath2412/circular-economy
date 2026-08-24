"""
Pydantic schemas define the shape of request/response JSON.
Keeping these separate from the SQLAlchemy models (app/models.py) is
deliberate: the DB model can have fields (like password_hash) that
should never be returned to a client.
"""
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field


class UserRegister(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(min_length=6)


class UserLogin(BaseModel):
    username: str
    password: str


class UserOut(BaseModel):
    id: int
    username: str
    email: str
    role: str
    created_at: datetime

    class Config:
        from_attributes = True  # lets this read straight from an ORM object


class TokenResponse(BaseModel):
    success: bool = True
    token: str
    user: UserOut


# ---------------------------------------------------------------------------
# Categories & Materials (master/reference data)
# ---------------------------------------------------------------------------

class CategoryOut(BaseModel):
    id: int
    name: str
    description: str | None = None
    typical_lifespan_years: int | None = None

    class Config:
        from_attributes = True


class CategoryCreate(BaseModel):
    name: str = Field(min_length=1, max_length=50)
    description: str | None = None
    typical_lifespan_years: int = Field(gt=0)


class MaterialOut(BaseModel):
    id: int
    name: str
    recyclability_score: int
    repairability_score: int
    environmental_impact_factor: float

    class Config:
        from_attributes = True


class MaterialCreate(BaseModel):
    name: str = Field(min_length=1, max_length=50)
    recyclability_score: int = Field(ge=1, le=10)
    repairability_score: int = Field(ge=1, le=10)
    environmental_impact_factor: float = Field(ge=0, le=1)


# ---------------------------------------------------------------------------
# Products
# ---------------------------------------------------------------------------

class ProductCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    category_id: int
    material_id: int | None = None
    age_years: int = Field(ge=0)
    condition_score: int = Field(ge=1, le=10)
    condition_description: str | None = None


class ProductUpdate(BaseModel):
    # All optional: PUT here behaves as a partial update (only supplied
    # fields are changed). Keeps the frontend from having to resend the
    # whole object just to tweak one field.
    name: str | None = Field(default=None, min_length=1, max_length=100)
    category_id: int | None = None
    material_id: int | None = None
    age_years: int | None = Field(default=None, ge=0)
    condition_score: int | None = Field(default=None, ge=1, le=10)
    condition_description: str | None = None


class ProductOut(BaseModel):
    id: int
    name: str
    category_id: int
    category_name: str
    material_id: int | None = None
    material_name: str | None = None
    age_years: int
    condition_score: int
    condition_description: str | None = None
    created_at: datetime

    class Config:
        from_attributes = True


# ---------------------------------------------------------------------------
# Condition Assessment
# ---------------------------------------------------------------------------

class ConditionAssessmentInput(BaseModel):
    """
    A short questionnaire instead of asking the user to just 'pick a number'.
    Each sub-score is 1-10 (1 = worst, 10 = best/like-new).
    """
    functionality_score: int = Field(ge=1, le=10, description="Does it still work as intended?")
    physical_damage_score: int = Field(ge=1, le=10, description="Cracks, dents, structural wear")
    cosmetic_score: int = Field(ge=1, le=10, description="Scratches, discoloration, appearance")
    has_original_parts: bool = Field(default=True, description="No missing/replaced components")


class ConditionAssessmentOutput(BaseModel):
    condition_score: int
    breakdown: dict
    summary: str
# ---------------------------------------------------------------------------
# Recommendations
# ---------------------------------------------------------------------------

class CircularActionOut(BaseModel):
    id: int
    product_id: int
    action_type: str
    recommendation_score: float
    is_recommended: bool
    environmental_impact: dict
    created_at: datetime

    class Config:
        from_attributes = True


class RecommendationResponse(BaseModel):
    product_id: int
    product_name: str
    top_recommendation: str
    actions: list[CircularActionOut]