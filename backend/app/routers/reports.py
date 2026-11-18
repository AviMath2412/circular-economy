"""
Reports and Analytics Export Router (Sprint 4 / US18)

Provides analytical aggregates and downloadable CSV sustainability reports
summarizing recommendation trends and environmental impact estimates.
"""
import io
import csv
import json
from datetime import datetime
from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models import Product, CircularAction, ActionLog, Category, Material, User
from app.auth import get_current_user

router = APIRouter(prefix="/api/reports", tags=["reports"])


@router.get("/summary")
def get_report_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get aggregated sustainability metrics and circular distribution
    for the user's registered portfolio.
    """
    query = db.query(Product).options(
        joinedload(Product.category),
        joinedload(Product.material),
        joinedload(Product.circular_actions),
    )
    if current_user.role != "admin":
        query = query.filter(Product.user_id == current_user.id)

    products = query.all()
    total_products = len(products)
    if total_products == 0:
        return {
            "total_products": 0,
            "avg_condition": 0,
            "total_co2_kg": 0,
            "total_landfill_diverted_kg": 0,
            "pathway_breakdown": {},
            "condition_distribution": {"1-3 (Critical)": 0, "4-6 (Fair)": 0, "7-10 (Good/Prime)": 0},
            "completed_actions_count": 0,
        }

    total_condition = sum(p.condition_score for p in products)
    avg_condition = round(total_condition / total_products, 1)

    total_co2 = 0.0
    total_landfill = 0.0
    pathway_counts = {}
    condition_dist = {"1-3 (Critical)": 0, "4-6 (Fair)": 0, "7-10 (Good/Prime)": 0}

    for p in products:
        # Condition bucket
        if p.condition_score <= 3:
            condition_dist["1-3 (Critical)"] += 1
        elif p.condition_score <= 6:
            condition_dist["4-6 (Fair)"] += 1
        else:
            condition_dist["7-10 (Good/Prime)"] += 1

        # Find recommended circular action
        top_action = next((a for a in p.circular_actions if a.is_recommended), None)
        if not top_action and p.circular_actions:
            top_action = p.circular_actions[0]

        if top_action:
            action_type = top_action.action_type
            pathway_counts[action_type] = pathway_counts.get(action_type, 0) + 1
            if top_action.environmental_impact:
                try:
                    impact = json.loads(top_action.environmental_impact)
                    total_co2 += impact.get("estimated_co2_savings_kg", 0)
                    total_landfill += impact.get("estimated_landfill_diverted_kg", 0)
                except Exception:
                    pass

    # Completed actions
    completed_logs_count = db.query(ActionLog).filter(ActionLog.user_id == current_user.id).count()

    return {
        "total_products": total_products,
        "avg_condition": avg_condition,
        "total_co2_kg": round(total_co2, 1),
        "total_landfill_diverted_kg": round(total_landfill, 1),
        "pathway_breakdown": pathway_counts,
        "condition_distribution": condition_dist,
        "completed_actions_count": completed_logs_count,
    }


@router.get("/export")
def export_csv_report(
    category_id: int | None = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Export detailed CSV report containing all assets, OpenCV condition scores,
    recommended circular pathways, and calculated avoided carbon/landfill impact.
    """
    query = db.query(Product).options(
        joinedload(Product.category),
        joinedload(Product.material),
        joinedload(Product.circular_actions),
    )
    if current_user.role != "admin":
        query = query.filter(Product.user_id == current_user.id)

    if category_id:
        query = query.filter(Product.category_id == category_id)

    products = query.order_by(Product.created_at.desc()).all()

    output = io.StringIO()
    writer = csv.writer(output)

    # Header
    writer.writerow([
        "Product ID",
        "Product Name",
        "Category",
        "Material",
        "Age (Years)",
        "Condition Score (1-10)",
        "Condition Description",
        "Top Circular Action",
        "Recommendation Score (0-100)",
        "Est. CO2 Avoided (kg)",
        "Est. Landfill Diverted (kg)",
        "Registered Date",
    ])

    for p in products:
        top_action = next((a for a in p.circular_actions if a.is_recommended), None)
        action_name = top_action.action_type if top_action else "N/A"
        rec_score = top_action.recommendation_score if top_action else 0
        co2_val = 0
        landfill_val = 0

        if top_action and top_action.environmental_impact:
            try:
                imp = json.loads(top_action.environmental_impact)
                co2_val = imp.get("estimated_co2_savings_kg", 0)
                landfill_val = imp.get("estimated_landfill_diverted_kg", 0)
            except Exception:
                pass

        writer.writerow([
            p.id,
            p.name,
            p.category.name if p.category else "Uncategorized",
            p.material.name if p.material else "Mixed/Unknown",
            p.age_years,
            p.condition_score,
            p.condition_description or "",
            action_name.capitalize(),
            rec_score,
            co2_val,
            landfill_val,
            p.created_at.strftime("%Y-%m-%d %H:%M") if p.created_at else "",
        ])

    csv_data = output.getvalue()
    filename = f"circular_economy_report_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.csv"

    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )

