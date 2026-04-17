from sqlalchemy import Column, String, Boolean, Date, DateTime, Float, Integer
from app.db.database import Base

class SLAContract(Base):
    __tablename__ = "sla_contracts"
    contract_id         = Column(String, primary_key=True, index=True)
    client_name         = Column(String)
    advisor_id          = Column(String, index=True)
    org_id              = Column(String, index=True)
    service_type        = Column(String)
    tier                = Column(String)
    start_date          = Column(Date)
    end_date            = Column(Date)
    response_time_hrs   = Column(Integer)
    resolution_time_hrs = Column(Integer)
    uptime_target       = Column(Float)
    penalty_clause      = Column(Float)
    status              = Column(String)

class SLATicket(Base):
    __tablename__ = "sla_tickets"
    ticket_id             = Column(String, primary_key=True, index=True)
    contract_id           = Column(String, index=True)
    raised_by             = Column(String)
    category              = Column(String)
    priority              = Column(String)
    created_at            = Column(DateTime)
    resolved_at           = Column(DateTime)
    actual_response_hrs   = Column(Float)
    actual_resolution_hrs = Column(Float)
    sla_met               = Column(Boolean)
    breach_reason         = Column(String)

class SLABenchmark(Base):
    __tablename__ = "sla_benchmarks"
    benchmark_id                = Column(String, primary_key=True, index=True)
    service_type                = Column(String)
    tier                        = Column(String)
    industry_avg_response_hrs   = Column(Float)
    industry_avg_resolution_hrs = Column(Float)
    industry_avg_uptime         = Column(Float)
    breach_rate                 = Column(Float)
    top_quartile_response_hrs   = Column(Float)
    source                      = Column(String)
    year                        = Column(Integer)
