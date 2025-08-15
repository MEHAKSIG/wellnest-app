from pydantic import BaseModel, conint, confloat
from typing import List, Literal, Optional, Dict

class RecentQuery(BaseModel):
    user_id: Optional[str] = None
    lookback_minutes: conint(ge=5, le=1440) = 240
    limit: conint(ge=1, le=1000) = 500
    unit: Literal["mg/dL", "mmol/L"] = "mg/dL"

class SequenceResponse(BaseModel):
    window: int
    count: int
    sequences: List[Dict]

class ISSReq(BaseModel):
    glucose: List[confloat(gt=0)]
    insulin_units: List[confloat(ge=0)]
    unit: Literal["mg/dL", "mmol/L"] = "mg/dL"

class ISSResp(BaseModel):
    iss: float
    components: Dict
    notes: str = "Heuristic only."

class ISFReq(BaseModel):
    method: Literal["1800_rule","100_rule"] = "1800_rule"
    total_daily_dose: confloat(gt=0)
