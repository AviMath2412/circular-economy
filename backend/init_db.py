"""
Run once to set up the database with tables + seed data:

    python init_db.py

Safe to re-run: it checks for existing rows before inserting.
"""
from app.database import Base, engine, SessionLocal
from app.models import Category, Material, User, SustainableAlternative
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

SUSTAINABLE_ALTERNATIVES = [
    # category_name, name, brand, description, circular_feature, co2_red, lifespan_mult, price_tier, resource_url
    (
        "Electronics",
        "Framework Modular Laptop 13",
        "Framework",
        "Fully upgradeable and modular laptop designed with hot-swappable ports, individually replaceable mainboards, and battery swap capability.",
        "Modular Architecture & 10/10 Repairability",
        68,
        2.5,
        "Premium",
        "https://frame.work",
    ),
    (
        "Electronics",
        "Fairphone 5 5G",
        "Fairphone",
        "Ethically sourced modular smartphone with 10/10 iFixit score, modular spare parts, and guaranteed 8-year software and security support.",
        "Fairtrade Gold & 100% Recycled Plastics",
        55,
        2.0,
        "Moderate",
        "https://www.fairphone.com",
    ),
    (
        "Furniture",
        "Remanufactured Aeron Task Chair",
        "Herman Miller Certified",
        "Precision remanufactured ergonomic office chair utilizing 100% recycled aluminum chassis and closed-loop refurbishment guarantee.",
        "Circular Take-Back & Closed-Loop Remanufacture",
        65,
        2.0,
        "Moderate",
        "https://www.hermanmiller.com",
    ),
    (
        "Furniture",
        "Floyd Modular Flat-Pack Desk",
        "Floyd Home",
        "Easily disassembleable FSC-certified solid birch wood table system with reusable steel clamp legs engineered for relocation.",
        "Designed for Disassembly & Relocation",
        50,
        2.2,
        "Budget",
        "https://floydhome.com",
    ),
    (
        "Clothing",
        "Worn Wear Recycled Synchilla Fleece",
        "Patagonia",
        "Manufactured with 100% post-consumer recycled plastic soda bottles with unlimited free lifetime repairs through the Worn Wear program.",
        "100% Recycled Fiber & Lifetime Free Repairs",
        72,
        2.5,
        "Moderate",
        "https://wornwear.patagonia.com",
    ),
    (
        "Clothing",
        "Regenerative Organic Hemp Overshirt",
        "Outerknown",
        "Crafted entirely from chemical-free organic hemp and regenerative cotton; 100% biodegradable buttons and compostable lifecycle.",
        "Biodegradable Materials & Zero Microplastics",
        60,
        1.8,
        "Budget",
        "https://www.outerknown.com",
    ),
    (
        "Appliances",
        "Bosch EcoSilence Series 6 Washer",
        "Bosch Home",
        "Equipped with EcoSilence drive motor backed by guaranteed 15-year spare parts availability and modular sub-assembly design.",
        "Guaranteed 15-Year Spare Parts Availability",
        45,
        1.8,
        "Moderate",
        "https://www.bosch-home.com",
    ),
    (
        "Appliances",
        "Dualit Classic 4-Slice Toaster",
        "Dualit",
        "Hand-assembled commercial grade appliance with fully replaceable ProHeat elements, built to last a lifetime rather than end up in a landfill.",
        "100% User-Replaceable Heating Elements",
        70,
        3.0,
        "Moderate",
        "https://www.dualit.com",
    ),
    (
        "Books",
        "Library Lending & Verified Pre-Loved Book Collective",
        "BetterWorldBooks",
        "Circulation-first reading model: every purchase funds literacy grants and diverts books directly from local waste processing facilities.",
        "Closed-Loop Community Book Re-circulation",
        90,
        4.0,
        "Budget",
        "https://www.betterworldbooks.com",
    ),
    (
        "Toys",
        "100% Recycled Milk Jug Construction Set",
        "Green Toys",
        "Manufactured in closed-loop facilities from recycled food-grade HDPE milk jugs; free from BPA, phthalates, and external paint coatings.",
        "100% Post-Consumer Food-Grade HDPE",
        75,
        2.0,
        "Budget",
        "https://www.greentoys.com",
    ),
    (
        "Sports Equipment",
        "Manduka eKO Natural Rubber Yoga Mat",
        "Manduka",
        "Constructed from sustainably harvested non-Amazon natural tree rubber with zero toxic blowing agents or PVC chemicals.",
        "Biodegradable Natural Tree Rubber",
        58,
        1.7,
        "Budget",
        "https://www.manduka.com",
    ),
    (
        "Tools",
        "Makita LXT Universal Brushless Cordless System",
        "Makita",
        "Star Protection Computer Controls and universal 18V battery platform shared across 325+ modular workshop tools.",
        "Shared Interchangeable Battery Platform",
        62,
        2.2,
        "Moderate",
        "https://www.makitatools.com",
    ),
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

        if db.query(SustainableAlternative).count() == 0:
            print("Seeding sustainable alternatives...")
            cat_map = {c.name: c.id for c in db.query(Category).all()}
            for cat_name, name, brand, desc, feature, co2_red, life_mult, tier, url in SUSTAINABLE_ALTERNATIVES:
                cat_id = cat_map.get(cat_name)
                if cat_id:
                    db.add(SustainableAlternative(
                        category_id=cat_id,
                        name=name,
                        brand=brand,
                        description=desc,
                        circular_feature=feature,
                        co2_reduction_pct=co2_red,
                        lifespan_multiplier=life_mult,
                        price_tier=tier,
                        resource_url=url,
                    ))

        db.commit()
        print("Done.")
    finally:
        db.close()


if __name__ == "__main__":
    run()
