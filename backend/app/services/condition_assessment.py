"""
Condition Assessment module.

Turns a short questionnaire into the single condition_score (1-10) that
Product.condition_score expects. Weights reflect that whether something
still WORKS matters most for deciding reuse/repair/recycle, with physical
damage next, and pure cosmetics mattering least.
"""
from app.schemas import ConditionAssessmentInput, ConditionAssessmentOutput

WEIGHTS = {
    "functionality": 0.5,
    "physical_damage": 0.3,
    "cosmetic": 0.2,
}

MISSING_PARTS_PENALTY = 1  # points subtracted from the final score


def assess_condition(payload: ConditionAssessmentInput) -> ConditionAssessmentOutput:
    weighted = (
        payload.functionality_score * WEIGHTS["functionality"]
        + payload.physical_damage_score * WEIGHTS["physical_damage"]
        + payload.cosmetic_score * WEIGHTS["cosmetic"]
    )

    if not payload.has_original_parts:
        weighted -= MISSING_PARTS_PENALTY

    # Clamp to the 1-10 range Product.condition_score expects
    final_score = max(1, min(10, round(weighted)))

    if final_score >= 8:
        summary = "Excellent condition — strong candidate for reuse or resale."
    elif final_score >= 6:
        summary = "Good condition with minor wear — reuse or light repair likely fits well."
    elif final_score >= 4:
        summary = "Moderate wear — repair or refurbishment is probably the best path."
    else:
        summary = "Poor condition — recycling or material recovery is likely the best fit."

    return ConditionAssessmentOutput(
        condition_score=final_score,
        breakdown={
            "functionality_score": payload.functionality_score,
            "physical_damage_score": payload.physical_damage_score,
            "cosmetic_score": payload.cosmetic_score,
            "has_original_parts": payload.has_original_parts,
            "weighted_raw": round(weighted, 2),
        },
        summary=summary,
    )
