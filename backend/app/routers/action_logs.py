"""
Action completion tracking endpoints.

POST /api/recommendations/{action_id}/complete  — mark a circular action as done.
GET  /api/actions/history                       — paginated log of all completed actions.
DELETE /api/actions/{log_id}                    — undo / remove a log entry.
"""
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models import ActionLog, CircularAction, Product, User
from app.schemas import ActionLogCreate, ActionLogOut
from app.auth import get_current_user

router = APIRouter(tags=["action-logs"])


# ---------------------------------------------------------------------------
# Mark a circular action as completed
# ---------------------------------------------------------------------------

@router.post(
    "/api/recommendations/{action_id}/complete",
    response_model=ActionLogOut,
    status_code=201,
)
def complete_action(
    action_id: int,
    payload: ActionLogCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Log that the user has acted on a circular recommendation."""
    action = (
        db.query(CircularAction)
        .options(joinedload(CircularAction.product))
        .filter(CircularAction.id == action_id)
        .first()
    )
    if not action:
        raise HTTPException(status_code=404, detail="Circular action not found")

    product = action.product
    if product.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    log = ActionLog(
        user_id=current_user.id,
        product_id=product.id,
        action_type=action.action_type,
        completed_at=datetime.utcnow(),
        notes=payload.notes,
    )
    db.add(log)
    db.commit()
    db.refresh(log)

    return ActionLogOut(
        id=log.id,
        user_id=log.user_id,
        product_id=log.product_id,
        product_name=product.name,
        action_type=log.action_type,
        completed_at=log.completed_at,
        notes=log.notes,
    )


# ---------------------------------------------------------------------------
# History: all completed actions for the current user
# ---------------------------------------------------------------------------

@router.get("/api/actions/history", response_model=list[ActionLogOut])
def get_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return all logged (completed) circular actions for the authenticated user."""
    rows = (
        db.query(ActionLog)
        .options(joinedload(ActionLog.product))
        .filter(ActionLog.user_id == current_user.id)
        .order_by(ActionLog.completed_at.desc())
        .all()
    )
    return [
        ActionLogOut(
            id=r.id,
            user_id=r.user_id,
            product_id=r.product_id,
            product_name=r.product.name,
            action_type=r.action_type,
            completed_at=r.completed_at,
            notes=r.notes,
        )
        for r in rows
    ]


# ---------------------------------------------------------------------------
# Undo: delete a single log entry
# ---------------------------------------------------------------------------

@router.delete("/api/actions/{log_id}", status_code=200)
def delete_log(
    log_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Remove a completion log entry (undo)."""
    log = db.query(ActionLog).filter(ActionLog.id == log_id).first()
    if not log:
        raise HTTPException(status_code=404, detail="Log entry not found")
    if log.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    db.delete(log)
    db.commit()
    return {"success": True, "message": "Action log removed"}

