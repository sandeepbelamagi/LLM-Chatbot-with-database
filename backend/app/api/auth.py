from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.user import User
from app.schemas.schemas import LoginRequest, RegisterRequest, TokenResponse
from app.core.security import verify_password, create_access_token, hash_password, get_current_user
import ulid

router = APIRouter()

@router.post("/login", response_model=TokenResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user or not verify_password(req.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token({"sub": user.user_id, "role": user.role, "org_id": user.org_id})
    return TokenResponse(access_token=token, user_id=user.user_id, name=user.name, role=user.role, org_id=user.org_id)

@router.post("/register", response_model=TokenResponse)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == req.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        user_id=str(ulid.new()),
        name=req.name,
        email=req.email,
        password=hash_password(req.password),
        role="Subscriber",
        org_id=str(ulid.new()),
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_access_token({"sub": user.user_id, "role": user.role, "org_id": user.org_id})
    return TokenResponse(access_token=token, user_id=user.user_id, name=user.name, role=user.role, org_id=user.org_id)

@router.get("/me")
def me(current_user: User = Depends(get_current_user)):
    return {"user_id": current_user.user_id, "name": current_user.name,
            "email": current_user.email, "role": current_user.role, "org_id": current_user.org_id}
