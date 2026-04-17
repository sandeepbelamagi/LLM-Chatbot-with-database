from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.database import get_db
from app.models.sla import SLAContract
from app.schemas.schemas import ContractOut
from app.core.security import get_current_user
from app.models.user import User

router = APIRouter()

def scope(q, user):
    if user.role in ("Subscriber", "Admin"):
        return q.filter(SLAContract.org_id == user.org_id)
    if user.role == "Advisor":
        return q.filter(SLAContract.advisor_id == user.user_id)
    return q  # Platform Admin sees all

@router.get("", response_model=List[ContractOut])
def get_contracts(
    status: Optional[str] = Query(None),
    tier: Optional[str] = Query(None),
    service_type: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    q = scope(db.query(SLAContract), current_user)
    if status:        q = q.filter(SLAContract.status == status)
    if tier:          q = q.filter(SLAContract.tier == tier)
    if service_type:  q = q.filter(SLAContract.service_type == service_type)
    return q.limit(100).all()
