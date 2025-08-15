from statistics import pstdev
from typing import List, Tuple

def convert_to_mgdl(values: List[float], unit: str) -> List[float]:
    """Convert mmol/L series to mg/dL if needed."""
    return [v * 18.0 for v in values] if unit == "mmol/L" else values

def isf_1800_rule(tdd: float) -> float:
    """mg/dL drop per unit insulin (Rule of 1800)."""
    return 1800.0 / tdd

def isf_100_rule(tdd: float) -> float:
    """mmol/L drop per unit insulin (Rule of 100)."""
    return 100.0 / tdd

def compute_iss(glucose_mgdl: List[float], insulin_units: List[float]) -> Tuple[float, dict]:
    """
    Heuristic Insulin Sensitivity Score in [0,100].
    Higher means more sensitive (for trend-tracking only).
    """
    n = max(len(glucose_mgdl), 1)
    mean_g = sum(glucose_mgdl) / n
    gv = pstdev(glucose_mgdl) if n > 1 else 0.0
    iu = sum(insulin_units) if insulin_units else 0.0

    gv_norm = min(1.0, gv / 50.0)                # STD 50+ mg/dL → fully penalized
    iu_norm = min(1.0, iu / 50.0)                # 50U/day → fully penalized (tunable)
    mean_term = max(0.0, min(1.0, (180 - abs(mean_g - 100)) / 180))

    raw = (0.5 * mean_term) + 0.25 * (1 - gv_norm) + 0.25 * (1 - iu_norm)
    iss = round(100 * raw, 1)

    components = {
        "mean_glucose": round(mean_g, 1),
        "glucose_variability_std": round(gv, 1),
        "insulin_units_total": round(iu, 2),
        "mean_term": round(mean_term, 3),
        "gv_norm": round(gv_norm, 3),
        "iu_norm": round(iu_norm, 3),
    }
    return iss, components
