"""
Recommendation Engine — Phase 3.

Implements the weighted multi-criteria scoring algorithm described in the
README:
    Condition Score          — 30%
    Material Properties      — 25%
    Age vs. Lifespan          — 20%
    Environmental Impact     — 25%

For each of the 7 circular action types (reuse, repair, refurbish, resell,
recycle, recover, dispose) we compute a 0-1 "fit" for each of the four
factors, then combine them with the weights above into a single
0-100 recommendation_score. The action with the highest score is marked
is_recommended.

NOTE ON THE HEURISTICS: the four *weights* come directly from the spec.
The per-action "fit curves" below (which condition/age ranges suit which
action) and the CO2/landfill estimates are our own reasonable heuristics —
not scientifically validated LCA data. They're isolated in this file
specifically so the team can swap in real data or tune the curves later
without touching the router or persistence logic.
"""
import json
from dataclasses import dataclass

from app.models import Product

CONDITION_WEIGHT = 0.30
MATERIAL_WEIGHT = 0.25
AGE_WEIGHT = 0.20
ENV_WEIGHT = 0.25

ACTION_TYPES = ["reuse", "repair", "refurbish", "resell", "recycle", "recover", "dispose"]

# Fallback values used when a product has no material assigned.
DEFAULT_RECYCLABILITY = 5
DEFAULT_REPAIRABILITY = 5
DEFAULT_ENV_IMPACT_FACTOR = 0.5

# Rough illustrative baseline savings per action, in kg — scaled by the
# material's environmental_impact_factor at scoring time. Placeholder
# until the team has real per-category/material LCA figures.
BASE_CO2_SAVINGS_KG = {
    "reuse": 40, "repair": 32, "refurbish": 26, "resell": 30,
    "recycle": 12, "recover": 6, "dispose": 0,
}
BASE_LANDFILL_DIVERTED_KG = {
    "reuse": 8, "repair": 8, "refurbish": 8, "resell": 8,
    "recycle": 6, "recover": 4, "dispose": 0,
}


def _trapezoid(x: float, a: float, b: float, c: float, d: float | None) -> float:
    """
    Trapezoidal membership function -> 0-1 "fit" score.
    Ramps up from a->b, plateaus at 1 from b->c, ramps down from c->d.
    d=None means the plateau extends indefinitely past c (no down-ramp) —
    used for actions that only get MORE suitable as a value increases
    (e.g. recycle as age-vs-lifespan ratio grows).
    """
    if x <= a:
        return 0.0
    if x < b:
        return (x - a) / (b - a) if b > a else 1.0
    if x <= c:
        return 1.0
    if d is None:
        return 1.0
    if x < d:
        return 1.0 - (x - c) / (d - c) if d > c else 0.0
    return 0.0


# (a, b, c, d) breakpoints per action, for condition_score (1-10) and for
# age_ratio = age_years / typical_lifespan_years.
CONDITION_CURVES = {
    "resell":    (6, 8, 10, None),
    "reuse":     (4, 6, 10, None),
    "repair":    (2, 4, 6, 8),
    "refurbish": (1, 3, 5, 7),
    "recycle":   (1, 1, 3, 5),
    "recover":   (1, 1, 2, 4),
    "dispose":   (1, 1, 1, 3),
}
AGE_RATIO_CURVES = {
    "resell":    (0, 0, 0.3, 0.6),
    "reuse":     (0, 0, 0.5, 0.9),
    "repair":    (0.1, 0.3, 0.7, 1.0),
    "refurbish": (0.4, 0.6, 1.0, 1.4),
    "recycle":   (0.6, 1.0, 1.0, None),
    "recover":   (0.8, 1.2, 1.2, None),
    "dispose":   (1.0, 1.5, 1.5, None),
}


def _material_fit(action: str, recyclability: int, repairability: int) -> float:
    """Which material sub-metric matters depends on the action's process."""
    if action in ("repair", "refurbish"):
        return repairability / 10
    if action in ("recycle", "recover"):
        return recyclability / 10
    if action == "dispose":
        # Dispose is more "acceptable" when the material had little
        # recycling value left anyway.
        return (10 - recyclability) / 10
    # reuse / resell: durability proxy, not the primary driver for these.
    return (recyclability + repairability) / 20


def _env_fit(action: str, env_impact_factor: float) -> float:
    """
    env_impact_factor (0-1) = how environmentally costly this material is
    to source/produce new. Keeping a high-impact material in circulation
    (reuse/repair/refurbish/resell) has the biggest payoff; recycling
    captures some value; disposal is penalized more heavily the more
    impactful the material was.
    """
    if action in ("reuse", "repair", "refurbish", "resell"):
        return env_impact_factor
    if action in ("recycle", "recover"):
        return env_impact_factor * 0.7
    return 1.0 - env_impact_factor  # dispose


@dataclass
class ActionScore:
    action_type: str
    recommendation_score: float
    is_recommended: bool
    environmental_impact: dict


def score_product(product: Product) -> list[ActionScore]:
    """
    Compute a recommendation_score (0-100) for every action type for the
    given product, and flag the top-scoring action(s) as recommended.
    `product` must have `.category` and `.material` relationships loaded
    (or loadable) since typical_lifespan_years and material scores are
    read off of them.
    """
    condition_score = product.condition_score  # 1-10

    if product.material is not None:
        recyclability = product.material.recyclability_score
        repairability = product.material.repairability_score
        env_impact_factor = product.material.environmental_impact_factor
    else:
        recyclability = DEFAULT_RECYCLABILITY
        repairability = DEFAULT_REPAIRABILITY
        env_impact_factor = DEFAULT_ENV_IMPACT_FACTOR

    lifespan = product.category.typical_lifespan_years if product.category and product.category.typical_lifespan_years else 10
    age_ratio = product.age_years / max(lifespan, 1)

    results = []
    for action in ACTION_TYPES:
        condition_fit = _trapezoid(condition_score, *CONDITION_CURVES[action])
        age_fit = _trapezoid(age_ratio, *AGE_RATIO_CURVES[action])
        material_fit = _material_fit(action, recyclability, repairability)
        env_fit = _env_fit(action, env_impact_factor)

        raw = (
            CONDITION_WEIGHT * condition_fit
            + MATERIAL_WEIGHT * material_fit
            + AGE_WEIGHT * age_fit
            + ENV_WEIGHT * env_fit
        )
        score = round(raw * 100, 1)

        impact = {
            "estimated_co2_savings_kg": round(BASE_CO2_SAVINGS_KG[action] * env_impact_factor, 1),
            "estimated_landfill_diverted_kg": round(BASE_LANDFILL_DIVERTED_KG[action] * (1 if action != "dispose" else 0), 1),
            "note": "Heuristic estimate scaled by material environmental_impact_factor — not LCA-verified.",
        }

        results.append(ActionScore(
            action_type=action,
            recommendation_score=score,
            is_recommended=False,
            environmental_impact=impact,
        ))

    top_score = max(r.recommendation_score for r in results)
    for r in results:
        if r.recommendation_score == top_score:
            r.is_recommended = True

    return sorted(results, key=lambda r: r.recommendation_score, reverse=True)


def to_environmental_impact_json(impact: dict) -> str:
    """CircularAction.environmental_impact is stored as a JSON string."""
    return json.dumps(impact)