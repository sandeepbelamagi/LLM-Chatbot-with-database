from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import date, datetime

class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    name: str
    role: str
    org_id: str

class UserOut(BaseModel):
    user_id: str
    name: str
    email: str
    role: str
    org_id: str
    is_active: bool
    class Config: from_attributes = True

class ContractOut(BaseModel):
    contract_id: str
    client_name: str
    advisor_id: str
    org_id: str
    service_type: str
    tier: str
    start_date: Optional[date]
    end_date: Optional[date]
    response_time_hrs: int
    resolution_time_hrs: int
    uptime_target: float
    penalty_clause: float
    status: str
    class Config: from_attributes = True

class TicketOut(BaseModel):
    ticket_id: str
    contract_id: str
    raised_by: str
    category: str
    priority: str
    created_at: Optional[datetime]
    resolved_at: Optional[datetime]
    actual_response_hrs: float
    actual_resolution_hrs: float
    sla_met: bool
    breach_reason: str
    class Config: from_attributes = True

class BenchmarkOut(BaseModel):
    benchmark_id: str
    service_type: str
    tier: str
    industry_avg_response_hrs: float
    industry_avg_resolution_hrs: float
    industry_avg_uptime: float
    breach_rate: float
    top_quartile_response_hrs: float
    source: str
    year: int
    class Config: from_attributes = True

class ChatRequest(BaseModel):
    question: str

class SummaryStats(BaseModel):
    label: str
    value: str
    highlight: Optional[str] = None  # "good" | "bad" | "neutral"

class ChatResponse(BaseModel):
    answer: str
    sql: str
    data: List[Any]
    columns: List[str]
    message_type: str = "data"       # "greeting" | "general" | "data"
    summary_stats: List[SummaryStats] = []
    has_comparison: bool = False
