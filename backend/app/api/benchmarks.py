from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.database import get_db
from app.models.sla import SLABenchmark
from app.schemas.schemas import BenchmarkOut
from app.core.security import get_current_user

router = APIRouter()

@router.get("", response_model=List[BenchmarkOut])
def get_benchmarks(
    service_type: Optional[str] = Query(None),
    tier: Optional[str] = Query(None),
    year: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    q = db.query(SLABenchmark)
    if service_type: q = q.filter(SLABenchmark.service_type == service_type)
    if tier:         q = q.filter(SLABenchmark.tier == tier)
    if year:         q = q.filter(SLABenchmark.year == year)
    return q.all()
