from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.database import get_db
from app.models.sla import SLAContract, SLATicket
from app.schemas.schemas import TicketOut
from app.core.security import get_current_user
from app.models.user import User

router = APIRouter()

def get_allowed_contract_ids(db, user):
    if user.role == "Platform Admin":
        return None  # None means no filter
    if user.role == "Advisor":
        rows = db.query(SLAContract.contract_id).filter(SLAContract.advisor_id == user.user_id).all()
    else:
        rows = db.query(SLAContract.contract_id).filter(SLAContract.org_id == user.org_id).all()
    return [r[0] for r in rows]

@router.get("", response_model=List[TicketOut])
def get_tickets(
    priority: Optional[str] = Query(None),
    sla_met: Optional[bool] = Query(None),
    category: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    q = db.query(SLATicket)
    allowed = get_allowed_contract_ids(db, current_user)
    if allowed is not None:
        q = q.filter(SLATicket.contract_id.in_(allowed))
    if priority:            q = q.filter(SLATicket.priority == priority)
    if sla_met is not None: q = q.filter(SLATicket.sla_met == sla_met)
    if category:            q = q.filter(SLATicket.category == category)
    return q.order_by(SLATicket.created_at.desc()).limit(100).all()
