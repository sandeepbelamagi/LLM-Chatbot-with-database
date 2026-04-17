from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, chat, contracts, tickets, benchmarks
from app.db.database import engine, Base
import app.models.user
import app.models.sla

Base.metadata.create_all(bind=engine)

app = FastAPI(title="SLA Platform API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router,       prefix="/api/auth",       tags=["Auth"])
app.include_router(chat.router,       prefix="/api/chat",       tags=["Chat"])
app.include_router(contracts.router,  prefix="/api/contracts",  tags=["Contracts"])
app.include_router(tickets.router,    prefix="/api/tickets",    tags=["Tickets"])
app.include_router(benchmarks.router, prefix="/api/benchmarks", tags=["Benchmarks"])

@app.get("/")
def root():
    return {"status": "SLA Platform running"}
