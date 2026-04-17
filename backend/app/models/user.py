from sqlalchemy import Column, String, Boolean
from app.db.database import Base

class User(Base):
    __tablename__ = "users"
    user_id   = Column(String, primary_key=True, index=True)
    name      = Column(String)
    email     = Column(String, unique=True, index=True)
    password  = Column(String)
    role      = Column(String)  # Subscriber | Advisor | Admin | Platform Admin
    org_id    = Column(String)
    is_active = Column(Boolean, default=True)
