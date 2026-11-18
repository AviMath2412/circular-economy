"""
Authentication endpoints.

Note on /logout: JWTs are stateless, so "logout" here is a client-side
action (delete the stored token). The endpoint exists for API symmetry
and as a place to add token-blacklisting later if needed.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.schemas import (
    UserRegister, UserLogin, UserOut, TokenResponse,
    ForgotPasswordRequest, ResetPasswordRequest,
)
from app.auth import hash_password, verify_password, create_access_token, decode_access_token, get_current_user
from app.config import settings
from jose import jwt
from datetime import datetime, timedelta

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(payload: UserRegister, db: Session = Depends(get_db)):
    clean_username = payload.username.strip()
    clean_email = payload.email.strip().lower()

    if db.query(User).filter(User.username == clean_username).first():
        raise HTTPException(status_code=400, detail="Username already taken")
    if db.query(User).filter(User.email == clean_email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        username=clean_username,
        email=clean_email,
        password_hash=hash_password(payload.password),
        role="user",
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(user_id=user.id, role=user.role)
    return TokenResponse(token=token, user=UserOut.model_validate(user))


@router.post("/login", response_model=TokenResponse)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    login_id = payload.username.strip()
    # Support signing in with either username or email
    user = (
        db.query(User)
        .filter((User.username == login_id) | (User.email == login_id.lower()))
        .first()
    )
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid username or password")

    token = create_access_token(user_id=user.id, role=user.role)
    return TokenResponse(token=token, user=UserOut.model_validate(user))


@router.post("/forgot-password")
def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """Generate a password reset token for the specified email."""
    email = payload.email.strip().lower()
    user = db.query(User).filter(User.email == email).first()
    if not user:
        # Avoid user enumeration in production, but provide simulated token for prototype
        return {"success": True, "message": "If this email is registered, a reset token has been generated."}

    expire = datetime.utcnow() + timedelta(hours=1)
    reset_token = jwt.encode(
        {"sub": str(user.id), "action": "reset_password", "exp": expire},
        settings.jwt_secret_key,
        algorithm=settings.jwt_algorithm,
    )
    return {
        "success": True,
        "message": "Reset token generated successfully. In production this is sent via email.",
        "reset_token": reset_token,
    }


@router.post("/reset-password")
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    """Reset user password using a valid reset token."""
    try:
        data = jwt.decode(payload.token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
        if data.get("action") != "reset_password":
            raise HTTPException(status_code=400, detail="Invalid token type")
        user_id = int(data.get("sub"))
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.password_hash = hash_password(payload.new_password)
    db.commit()
    return {"success": True, "message": "Password has been successfully updated. You may now log in."}


@router.post("/logout")
def logout():
    return {"success": True, "message": "Logged out successfully"}


@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    return current_user
