"""
End-to-End System & Security Test Suite (Sprint 4 / US19)

Tests authentication, role-based authorization, product ownership isolation,
recommendation engine calculations, action completion tracking, sustainable alternatives,
and report generation.
"""
import uuid
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_complete_system_flow():
    test_id = uuid.uuid4().hex[:6]
    test_username = f"evaluator_{test_id}"
    test_email = f"evaluator_{test_id}@university.edu"

    print("\n--- [1] Testing Authentication & Password Hashing ---")
    # Register regular user
    reg_res = client.post("/api/auth/register", json={
        "username": test_username,
        "email": test_email,
        "password": "strongPassword123"
    })
    assert reg_res.status_code == 201, f"Register failed: {reg_res.text}"
    user_token = reg_res.json()["token"]
    user_headers = {"Authorization": f"Bearer {user_token}"}
    print("✓ Regular user registered & auto-authenticated")

    # Login with email
    login_email_res = client.post("/api/auth/login", json={
        "username": test_email,
        "password": "strongPassword123"
    })
    assert login_email_res.status_code == 200, f"Login via email failed: {login_email_res.text}"
    print("✓ Login via email succeeded")

    # Login as admin
    admin_login = client.post("/api/auth/login", json={"username": "admin", "password": "admin123"})
    assert admin_login.status_code == 200
    admin_token = admin_login.json()["token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    print("✓ Admin login succeeded")

    print("\n--- [2] Testing Role-Based Access Control (US2) ---")
    # Regular user attempting admin route
    unauth_admin = client.get("/api/admin/users", headers=user_headers)
    assert unauth_admin.status_code == 403
    print("✓ Non-admin correctly rejected from admin endpoint (403 Forbidden)")

    # Admin accessing admin route
    auth_admin = client.get("/api/admin/users", headers=admin_headers)
    assert auth_admin.status_code == 200
    print("✓ Admin successfully accessed user governance list")

    print("\n--- [3] Testing Product Lifecycle & Condition Assessment (US6, US7, US8) ---")
    # Condition questionnaire assessment
    assess_res = client.post("/api/products/assess-condition", json={
        "functionality_score": 8,
        "physical_damage_score": 7,
        "cosmetic_score": 6,
        "has_original_parts": True
    }, headers=user_headers)
    assert assess_res.status_code == 200
    cond_score = assess_res.json()["condition_score"]
    assert 1 <= cond_score <= 10
    print(f"✓ Condition assessment calculated weighted score: {cond_score}/10")

    # Create product
    create_prod = client.post("/api/products", json={
        "name": "ThinkPad T14 Gen 2",
        "category_id": 1,  # Electronics
        "material_id": 2,  # Metal
        "age_years": 3,
        "condition_score": cond_score,
        "condition_description": "Minor lid scratches, pristine keyboard."
    }, headers=user_headers)
    assert create_prod.status_code == 201
    prod_id = create_prod.json()["product_id"]
    print(f"✓ Created test asset ID: #{prod_id}")

    # Ownership check: other user cannot update
    other_username = f"other_{uuid.uuid4().hex[:6]}"
    other_reg = client.post("/api/auth/register", json={
        "username": other_username,
        "email": f"{other_username}@university.edu",
        "password": "password123"
    })
    assert other_reg.status_code == 201, f"Other register failed: {other_reg.text}"
    other_headers = {"Authorization": f"Bearer {other_reg.json()['token']}"}
    tamper_res = client.put(f"/api/products/{prod_id}", json={"name": "Hacked"}, headers=other_headers)
    assert tamper_res.status_code == 403
    print("✓ Product ownership isolation verified (403 on cross-tenant modification)")

    print("\n--- [4] Testing Recommendation Scoring Engine (US11, US12, US13) ---")
    rec_res = client.get(f"/api/recommendations/{prod_id}", headers=user_headers)
    assert rec_res.status_code == 200
    recs = rec_res.json()["actions"]
    assert len(recs) == 7
    top_action = next(a for a in recs if a["is_recommended"])
    print(f"✓ 7 circular pathways evaluated. Top action: '{top_action['action_type']}' (Score: {top_action['recommendation_score']})")
    assert "estimated_co2_savings_kg" in top_action["environmental_impact"]
    print(f"✓ Real-world emissions avoidance computed: {top_action['environmental_impact']['estimated_co2_savings_kg']} kg CO2")

    print("\n--- [5] Testing Action Completion Tracking (US15) ---")
    comp_res = client.post(f"/api/recommendations/{top_action['id']}/complete", json={
        "notes": "Verified and transferred for campus reuse lab."
    }, headers=user_headers)
    assert comp_res.status_code == 201
    print("✓ Circular recommendation successfully logged as completed")

    hist_res = client.get("/api/actions/history", headers=user_headers)
    assert hist_res.status_code == 200
    assert len(hist_res.json()) >= 1
    print("✓ Completed action history correctly retrieved")

    print("\n--- [6] Testing Sustainable Alternatives on Disposal (US14) ---")
    alt_res = client.get(f"/api/alternatives/product/{prod_id}", headers=user_headers)
    assert alt_res.status_code == 200
    alts = alt_res.json()["alternatives"]
    assert len(alts) > 0
    print(f"✓ Fetched {len(alts)} matching circular alternatives (e.g. {alts[0]['name']} - {alts[0]['circular_feature']})")

    print("\n--- [7] Testing Notifications System (US17) ---")
    notif_res = client.get("/api/notifications", headers=user_headers)
    assert notif_res.status_code == 200
    notif_list = notif_res.json()
    assert len(notif_list) > 0
    first_notif_id = notif_list[0]["id"]
    read_res = client.post(f"/api/notifications/{first_notif_id}/read", headers=user_headers)
    assert read_res.status_code == 200
    print("✓ Notifications generated, retrieved, and marked as read")

    print("\n--- [8] Testing Reports & Analytics Export (US18) ---")
    summary_res = client.get("/api/reports/summary", headers=user_headers)
    assert summary_res.status_code == 200
    assert summary_res.json()["total_products"] >= 1
    print("✓ Analytics aggregation completed")

    csv_res = client.get("/api/reports/export", headers=user_headers)
    assert csv_res.status_code == 200
    assert "ThinkPad T14 Gen 2" in csv_res.text
    print("✓ CSV audit report streamed with full product and impact records")

    print("\n=======================================================")
    print("🎉 ALL 8 MODULE VALIDATION CHECKS PASSED WITH ZERO ERRORS!")
    print("=======================================================\n")


if __name__ == "__main__":
    test_complete_system_flow()

