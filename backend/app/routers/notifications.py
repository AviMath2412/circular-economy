"""
Notifications Router (Sprint 4 / US17)

Provides real-time circular notifications, action reminders, and sustainability impact milestones.
"""
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Notification, Product, User
from app.schemas import NotificationOut
from app.auth import get_current_user

router = APIRouter(prefix="/api/notifications", tags=["notifications"])


@router.get("", response_model=list[NotificationOut])
def get_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    List user notifications. If the user has none yet, generate context-aware
    circular reminders based on their products.
    """
    notifications = (
        db.query(Notification)
        .filter(Notification.user_id == current_user.id)
        .order_by(Notification.created_at.desc())
        .limit(20)
        .all()
    )

    if not notifications:
        # Check user products to generate smart initial notifications
        products = db.query(Product).filter(Product.user_id == current_user.id).all()
        new_notifications = []

        # Welcome notification
        new_notifications.append(
            Notification(
                user_id=current_user.id,
                title="Welcome to Circular Economy Engine! 🌱",
                message="Start registering products and running OpenCV condition assessments to discover the best circular pathways.",
                notification_type="welcome",
                link="/products",
            )
        )

        for p in products[:2]:
            if p.condition_score <= 4:
                new_notifications.append(
                    Notification(
                        user_id=current_user.id,
                        title=f"Repair Advisory: {p.name}",
                        message=f"{p.name} condition is {p.condition_score}/10. High circular recovery score available if repaired.",
                        notification_type="reminder",
                        link=f"/products/{p.id}",
                    )
                )
            elif p.condition_score >= 8:
                new_notifications.append(
                    Notification(
                        user_id=current_user.id,
                        title=f"Optimal Resell/Reuse Fit: {p.name}",
                        message=f"{p.name} is in prime condition ({p.condition_score}/10). Resell or reuse saves maximum virgin carbon.",
                        notification_type="recommendation",
                        link=f"/products/{p.id}",
                    )
                )

        db.add_all(new_notifications)
        db.commit()
        for n in new_notifications:
            db.refresh(n)
        notifications = new_notifications

    return [
        NotificationOut(
            id=n.id,
            user_id=n.user_id,
            title=n.title,
            message=n.message,
            notification_type=n.notification_type,
            is_read=n.is_read,
            link=n.link,
            created_at=n.created_at,
        )
        for n in notifications
    ]


@router.post("/{notification_id}/read")
def mark_notification_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Mark an individual notification as read."""
    n = db.query(Notification).filter(Notification.id == notification_id).first()
    if not n or n.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Notification not found")

    n.is_read = True
    db.commit()
    return {"success": True, "message": "Notification marked as read"}


@router.post("/read-all")
def mark_all_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Mark all user notifications as read."""
    db.query(Notification).filter(Notification.user_id == current_user.id, Notification.is_read == False).update({"is_read": True})
    db.commit()
    return {"success": True, "message": "All notifications marked as read"}

