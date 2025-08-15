import os
from fastapi import FastAPI, Query
from dotenv import load_dotenv

from .firestore_client import fetch_recent
from .transform import build_master_rows, build_sequence
from .iss_isf import compute_iss, convert_to_mgdl, isf_1800_rule, isf_100_rule
from .models import RecentQuery, SequenceResponse, ISSReq, ISSResp, ISFReq

load_dotenv()

app = FastAPI(title="WellNest FastAPI (Firestore → Features)")

@app.get("/health")
def health():
    return {"ok": True, "project": os.getenv("FIRESTORE_PROJECT_ID")}

@app.post("/recent")
def recent(q: RecentQuery):
    cgm = fetch_recent("CGM_logs", q.user_id, q.lookback_minutes, q.limit)
    activity = fetch_recent("Activity_logs", q.user_id, q.lookback_minutes, q.limit)
    insulin = fetch_recent("Insulin_logs", q.user_id, q.lookback_minutes, q.limit)
    rows = build_master_rows(cgm, activity, insulin, unit=q.unit)
    return {"count": len(rows), "rows": rows}

@app.post("/sequence", response_model=SequenceResponse)
def sequence(q: RecentQuery, window: int = Query(6, ge=3, le=24)):
    cgm = fetch_recent("CGM_logs", q.user_id, q.lookback_minutes, q.limit)
    activity = fetch_recent("Activity_logs", q.user_id, q.lookback_minutes, q.limit)
    insulin = fetch_recent("Insulin_logs", q.user_id, q.lookback_minutes, q.limit)
    rows = build_master_rows(cgm, activity, insulin, unit=q.unit)
    seqs = build_sequence(rows, window=window)
    return {"window": window, "count": len(seqs), "sequences": seqs}

@app.post("/iss", response_model=ISSResp)
def iss(req: ISSReq):
    g = convert_to_mgdl(req.glucose, req.unit)
    iss_val, comps = compute_iss(g, req.insulin_units)
    return {"iss": iss_val, "components": comps}

@app.post("/isf")
def isf(req: ISFReq):
    if req.method == "1800_rule":
        return {"isf": round(isf_1800_rule(req.total_daily_dose), 2), "unit": "mg/dL per U"}
    return {"isf": round(isf_100_rule(req.total_daily_dose), 3), "unit": "mmol/L per U"}

@app.post("/dashboard-snapshot")
def dashboard_snapshot(q: RecentQuery):
    cgm = fetch_recent("CGM_logs", q.user_id, q.lookback_minutes, q.limit)
    activity = fetch_recent("Activity_logs", q.user_id, q.lookback_minutes, q.limit)
    insulin = fetch_recent("Insulin_logs", q.user_id, q.lookback_minutes, q.limit)
    rows = build_master_rows(cgm, activity, insulin, unit=q.unit)

    last = rows[-1] if rows else {}
    glucose_series = [r["glucose_mgdl"] for r in rows][-24:]
    insulin_series = [r["bolus_units"] for r in rows][-24:]

    iss_val, comps = compute_iss(glucose_series, insulin_series)

    return {
        "latest": last,
        "iss": {"value": iss_val, "components": comps},
        "series": {
            "timestamps": [r["timestamp"] for r in rows][-24:],
            "glucose_mgdl": glucose_series,
            "steps": [r["steps"] for r in rows][-24:],
            "heart_rate": [r["heart_rate"] for r in rows][-24:],
            "bolus_units": insulin_series,
            "carbs_g": [r["carbs_g"] for r in rows][-24:],
        },
    }
