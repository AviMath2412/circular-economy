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
