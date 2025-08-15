import os, datetime
from typing import List, Dict, Any, Optional
from google.cloud import firestore

TIME_FIELD_DEFAULT = "timestamp"

def _to_iso_z(dt: datetime.datetime) -> str:
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=datetime.timezone.utc)
    return dt.astimezone(datetime.timezone.utc).isoformat()

def ts_to_dt(ts) -> datetime.datetime:
    if hasattr(ts, "to_datetime"):
        return ts.to_datetime()
    if isinstance(ts, (int, float)):
        return datetime.datetime.fromtimestamp(ts, tz=datetime.timezone.utc)
    if isinstance(ts, str):
        return datetime.datetime.fromisoformat(ts.replace("Z", "+00:00"))
    return ts

def get_db():
    project_id = os.getenv("FIRESTORE_PROJECT_ID")
    if not project_id:
        raise RuntimeError("FIRESTORE_PROJECT_ID is not set in env.")
    # GOOGLE_APPLICATION_CREDENTIALS must point to your service-account.json
    return firestore.Client(project=project_id)

def fetch_recent(
    collection: str,
    user_id: Optional[str] = None,
    lookback_minutes: int = 240,
    limit: int = 500,
    time_field: str = TIME_FIELD_DEFAULT,
) -> List[Dict[str, Any]]:
    """Fetch recent docs ordered by timestamp desc."""
    db = get_db()
    col = db.collection(collection)

    q = col
    if user_id:
        # If you store userId in docs
        q = q.where("user_id", "==", user_id)

    now = datetime.datetime.now(datetime.timezone.utc)
    since = now - datetime.timedelta(minutes=lookback_minutes)
    q = q.where(time_field, ">=", since).order_by(time_field, direction=firestore.Query.DESCENDING).limit(limit)

    docs = [d.to_dict() | {"_id": d.id} for d in q.stream()]
    # normalize timestamps
    for d in docs:
        if time_field in d:
            d[time_field] = _to_iso_z(ts_to_dt(d[time_field]))
    return docs
