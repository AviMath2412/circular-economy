"""
Run once to set up the database with tables + seed data:

    python init_db.py

Safe to re-run: it checks for existing rows before inserting.
"""
from app.database import Base, engine, SessionLocal
from app.models import Category, Material, User
from app.auth import hash_password

CATEGORIES = [
    ("Electronics", "Electronic devices and gadgets", 5),
    ("Furniture", "Home and office furniture", 15),
    ("Clothing", "Apparel and textiles", 3),
    ("Appliances", "Home and kitchen appliances", 10),
    ("Books", "Books and publications", 20),
    ("Toys", "Toys and games", 5),
    ("Sports Equipment", "Sports and fitness gear", 7),
    ("Tools", "Hand tools and power tools", 12),
]

MATERIALS = [
    # name, recyclability_score, repairability_score, environmental_impact_factor
    ("Plastic", 7, 3, 0.8),
    ("Metal", 9, 6, 0.6),
    ("Wood", 5, 8, 0.3),
    ("Glass", 8, 2, 0.5),
    ("Fabric", 6, 7, 0.4),
    ("Paper", 8, 1, 0.2),
    ("Rubber", 4, 2, 0.7),
    ("Composite", 3, 4, 0.9),
]


def run():
    print("Creating tables...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        if db.query(Category).count() == 0:
            print("Seeding categories...")
            for name, desc, lifespan in CATEGORIES:
                db.add(Category(name=name, description=desc, typical_lifespan_years=lifespan))

        if db.query(Material).count() == 0:
            print("Seeding materials...")
            for name, recy, repa, impact in MATERIALS:
                db.add(Material(
                    name=name,
                    recyclability_score=recy,
                    repairability_score=repa,
                    environmental_impact_factor=impact,
                ))

        if db.query(User).filter(User.username == "admin").first() is None:
            print("Creating admin user (username: admin, password: admin123)...")
            db.add(User(
                username="admin",
                email="admin@innovatex.com",
                password_hash=hash_password("admin123"),  # CHANGE before any real deployment
                role="admin",
            ))

        db.commit()
        print("Done.")
    finally:
        db.close()


if __name__ == "__main__":
    run()
