import math, datetime
from typing import List, Dict, Any

def _to_dt(tiso: str) -> datetime.datetime:
    return datetime.datetime.fromisoformat(tiso.replace("Z", "+00:00"))

def circadian_features(dt_iso: str) -> Dict[str, float]:
    dt = _to_dt(dt_iso)
    hod = dt.hour + dt.minute / 60.0
    angle = 2 * math.pi * hod / 24.0
    return {"circadian_sin": math.sin(angle), "circadian_cos": math.cos(angle)}

def _minute_key(tiso: str) -> int:
    dt = _to_dt(tiso).replace(second=0, microsecond=0, tzinfo=datetime.timezone.utc)
    return int(dt.timestamp())

def build_master_rows(
    cgm: List[Dict[str, Any]],
    activity: List[Dict[str, Any]],
    insulin: List[Dict[str, Any]],
    unit: str = "mg/dL",
) -> List[Dict[str, Any]]:
    """
    Merge by nearest minute.
    Expected fields:
      CGM_logs:       {timestamp, glucose}
      Activity_logs:  {timestamp, steps, heart_rate}
      Insulin_logs:   {timestamp, bolus_units, basal_units, carbs_g}
    """
    act_map: Dict[int, Dict[str, Any]] = {}
    for a in activity:
        if "timestamp" not in a:
            continue
        act_map[_minute_key(a["timestamp"])] = a

    ins_map: Dict[int, Dict[str, Any]] = {}
    for i in insulin:
        if "timestamp" not in i:
            continue
        ins_map[_minute_key(i["timestamp"])] = i

    rows: List[Dict[str, Any]] = []
    for gdoc in cgm:
        if "timestamp" not in gdoc or "glucose" not in gdoc:
            continue

        glucose_mgdl = gdoc["glucose"] * (18.0 if unit == "mmol/L" else 1.0)
        tiso = gdoc["timestamp"]
        key = _minute_key(tiso)

        ad = act_map.get(key, {})
        idoc = ins_map.get(key, {})

        row = {
            "timestamp": tiso,
            "glucose_mgdl": glucose_mgdl,
            "steps": ad.get("steps", 0),
            "heart_rate": ad.get("heart_rate", 0),
            "bolus_units": idoc.get("bolus_units", 0.0),
            "basal_units": idoc.get("basal_units", 0.0),
            "carbs_g": idoc.get("carbs_g", 0.0),
        }
        row.update(circadian_features(tiso))
        carbs = row["carbs_g"] or 0.0
        row["glucose_carb_ratio"] = round(glucose_mgdl / (carbs if carbs > 0 else 1.0), 3)
        rows.append(row)

    rows.sort(key=lambda r: r["timestamp"])
    return rows

def build_sequence(rows: List[Dict[str, Any]], window: int = 6) -> List[Dict[str, Any]]:
    """
    Sliding windows of the last `window` timesteps for selected features.
    """
    seqs: List[Dict[str, Any]] = []
    feats = ["glucose_mgdl", "carbs_g", "bolus_units", "glucose_carb_ratio", "circadian_sin", "circadian_cos"]
    for i in range(len(rows)):
        if i + 1 < window:
            continue
        slice_rows = rows[i + 1 - window : i + 1]
        seq = {"end_timestamp": rows[i]["timestamp"]}
        for f in feats:
            seq[f] = [r[f] for r in slice_rows]
        seqs.append(seq)
    return seqs
