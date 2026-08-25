"""
Image-based Condition Assessment Service.

Uses OpenCV heuristics to evaluate product photos:
- Laplacian variance for sharpness / blur detection
- Mean & standard deviation for brightness and contrast
- Canny edge density to estimate visible surface wear, scratches, or damage
"""
import cv2
import numpy as np


def analyze_image_condition(image_bytes: bytes) -> dict:
    """
    Analyzes raw image bytes and returns an estimated condition score (1-10)
    along with explainable heuristic confidence notes.
    """
    # Convert bytes to numpy array for OpenCV decoding
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if img is None:
        return {
            "estimated_score": 7,
            "confidence_notes": "Unable to decode image file. Defaulted to moderate condition (7/10).",
            "breakdown": {
                "sharpness": 0.0,
                "brightness": 0.0,
                "contrast": 0.0,
                "edge_density": 0.0,
            },
        }

    # Convert to Grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    total_pixels = gray.shape[0] * gray.shape[1]

    # 1. Blur Detection (Laplacian Variance)
    laplacian_var = float(cv2.Laplacian(gray, cv2.CV_64F).var())
    is_blurry = laplacian_var < 50.0

    # 2. Brightness & Contrast
    brightness = float(np.mean(gray))
    contrast = float(gray.std())

    # 3. Edge Density (Canny Edge Detection for surface scratches / wear)
    edges = cv2.Canny(gray, threshold1=100, threshold2=200)
    edge_pixels = np.sum(edges > 0)
    edge_density = float(edge_pixels / total_pixels) if total_pixels > 0 else 0.0

    # 4. Heuristic Condition Scoring (1-10)
    base_score = 8.0

    # Edge density heuristics:
    # High edge density indicates surface roughness, scratches, or wear
    if edge_density > 0.12:
        base_score -= 3.5
    elif edge_density > 0.07:
        base_score -= 2.0
    elif edge_density > 0.04:
        base_score -= 1.0
    elif edge_density < 0.015:
        base_score += 1.0  # Smooth, like-new surface

    # Contrast & lighting adjustments
    if contrast < 25.0:
        base_score -= 0.5

    # Blur penalty
    if is_blurry:
        base_score -= 0.5

    # Clamp score to integer in range 1..10
    estimated_score = max(1, min(10, int(round(base_score))))

    # Construct explainable confidence notes
    notes_parts = []
    if is_blurry:
        notes_parts.append(f"Image has slight motion blur (sharpness: {laplacian_var:.1f}).")
    else:
        notes_parts.append(f"Clear image quality (sharpness: {laplacian_var:.1f}).")

    if edge_density > 0.08:
        notes_parts.append(f"High edge texture ({edge_density * 100:.1f}%) suggests visible surface wear or scratches.")
    elif edge_density > 0.035:
        notes_parts.append(f"Moderate edge density ({edge_density * 100:.1f}%) indicates normal cosmetic wear.")
    else:
        notes_parts.append(f"Low edge density ({edge_density * 100:.1f}%) indicates clean, smooth surface.")

    if brightness < 40:
        notes_parts.append("Low lighting condition detected.")
    elif brightness > 220:
        notes_parts.append("High glare/exposure detected.")

    confidence_notes = " ".join(notes_parts)

    return {
        "estimated_score": estimated_score,
        "confidence_notes": confidence_notes,
        "breakdown": {
            "sharpness": round(laplacian_var, 2),
            "brightness": round(brightness, 2),
            "contrast": round(contrast, 2),
            "edge_density": round(edge_density, 4),
        },
    }
