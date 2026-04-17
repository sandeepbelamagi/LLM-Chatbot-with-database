from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.db.database import get_db, engine
from app.schemas.schemas import ChatRequest, ChatResponse, SummaryStats
from app.core.security import get_current_user
from app.models.user import User
from app.core.config import settings
import requests
import json
import re

router = APIRouter()

DB_SCHEMA = """
Tables in PostgreSQL database:

1. users(user_id TEXT, name TEXT, email TEXT, role TEXT, org_id TEXT, is_active BOOLEAN)

2. sla_contracts(contract_id TEXT, client_name TEXT, advisor_id TEXT, org_id TEXT,
   service_type TEXT, tier TEXT, start_date DATE, end_date DATE,
   response_time_hrs INT, resolution_time_hrs INT, uptime_target FLOAT,
   penalty_clause FLOAT, status TEXT)
   status values: 'Active', 'Expired', 'Breached'
   tier values: 'Gold', 'Silver', 'Bronze'
   service_type values: 'IT Support', 'Cloud', 'Network', 'Security'

3. sla_tickets(ticket_id TEXT, contract_id TEXT, raised_by TEXT, category TEXT,
   priority TEXT, created_at TIMESTAMP, resolved_at TIMESTAMP,
   actual_response_hrs FLOAT, actual_resolution_hrs FLOAT,
   sla_met BOOLEAN, breach_reason TEXT)
   priority values: 'P1', 'P2', 'P3', 'P4'
   category values: 'Incident', 'Change', 'Request'

4. sla_benchmarks(benchmark_id TEXT, service_type TEXT, tier TEXT,
   industry_avg_response_hrs FLOAT, industry_avg_resolution_hrs FLOAT,
   industry_avg_uptime FLOAT, breach_rate FLOAT,
   top_quartile_response_hrs FLOAT, source TEXT, year INT)
"""

ROLE_FILTER = {
    "Subscriber":     "c.org_id = '{org_id}'",
    "Advisor":        "c.advisor_id = '{user_id}'",
    "Admin":          "c.org_id = '{org_id}'",
    "Platform Admin": None,
}

ROLE_ACCESS = {
    "Subscriber":     "your own organization's SLA contracts, tickets, and benchmark comparisons",
    "Advisor":        "SLA contracts and tickets assigned to you, and benchmark comparisons for your clients",
    "Admin":          "all contracts, tickets, users, and benchmarks within your organization",
    "Platform Admin": "everything across all organizations and tenants on the platform",
}

GREETING_KEYWORDS = ["hi", "hello", "hey", "good morning", "good afternoon", "good evening", "howdy", "greetings"]
GENERAL_KEYWORDS  = ["what can you", "what do you", "help me", "who are you", "what is sla",
                     "explain", "how does", "what does", "tell me about", "access", "permission",
                     "what can i", "can you help", "capabilities", "features"]

def get_filter(role, user_id, org_id):
    tpl = ROLE_FILTER.get(role)
    if not tpl:
        return ""
    return tpl.format(user_id=user_id, org_id=org_id)

def clean_sql(raw: str) -> str:
    raw = re.sub(r"```sql|```", "", raw).strip()
    if ";" in raw:
        raw = raw.split(";")[0].strip()
    return raw + ";"

def call_euri(prompt: str, max_tokens: int = 600) -> str:
    headers = {
        "Authorization": f"Bearer {settings.EURI_API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "model":       settings.EURI_MODEL,
        "messages":    [{"role": "user", "content": prompt}],
        "temperature": 0.3,
        "max_tokens":  max_tokens,
    }
    res = requests.post(settings.EURI_API_URL, headers=headers, json=payload)
    res.raise_for_status()
    return res.json()["choices"][0]["message"]["content"].strip()

def is_greeting(text: str) -> bool:
    t = text.lower().strip()
    return any(t.startswith(k) or t == k for k in GREETING_KEYWORDS)

def is_general(text: str) -> bool:
    t = text.lower()
    return any(k in t for k in GENERAL_KEYWORDS)

def detect_comparison(columns: list) -> bool:
    col_str = " ".join(columns).lower()
    return any(k in col_str for k in ["industry", "benchmark", "avg", "average", "compare"])

def compute_summary_stats(columns: list, rows: list, has_comparison: bool) -> list:
    if not rows:
        return []

    stats = []
    col_lower = {c.lower(): c for c in columns}

    # Total rows
    stats.append(SummaryStats(label="Total Records", value=str(len(rows)), highlight="neutral"))

    # SLA Met rate
    if "sla_met" in col_lower:
        col = col_lower["sla_met"]
        met  = sum(1 for r in rows if r.get(col) in [True, "true", "True", 1])
        rate = round((met / len(rows)) * 100)
        stats.append(SummaryStats(
            label="SLA Met Rate",
            value=f"{rate}%",
            highlight="good" if rate >= 80 else "bad"
        ))

    # Status breakdown
    if "status" in col_lower:
        col     = col_lower["status"]
        active  = sum(1 for r in rows if str(r.get(col, "")).lower() == "active")
        breached= sum(1 for r in rows if str(r.get(col, "")).lower() == "breached")
        if active:
            stats.append(SummaryStats(label="Active",   value=str(active),  highlight="good"))
        if breached:
            stats.append(SummaryStats(label="Breached", value=str(breached), highlight="bad"))

    # Avg response time
    for key in ["actual_response_hrs", "response_time_hrs"]:
        if key in col_lower:
            col  = col_lower[key]
            vals = [float(r[col]) for r in rows if r.get(col) is not None]
            if vals:
                avg = round(sum(vals) / len(vals), 1)
                stats.append(SummaryStats(label="Avg Response (hrs)", value=str(avg), highlight="neutral"))
            break

    # Benchmark comparison delta
    if has_comparison:
        my_col  = col_lower.get("response_time_hrs") or col_lower.get("actual_response_hrs")
        ind_col = col_lower.get("industry_avg_response_hrs")
        if my_col and ind_col:
            my_vals  = [float(r[my_col])  for r in rows if r.get(my_col)  is not None]
            ind_vals = [float(r[ind_col]) for r in rows if r.get(ind_col) is not None]
            if my_vals and ind_vals:
                my_avg  = round(sum(my_vals)  / len(my_vals),  1)
                ind_avg = round(sum(ind_vals) / len(ind_vals), 1)
                diff    = round(((my_avg - ind_avg) / ind_avg) * 100, 1)
                stats.append(SummaryStats(
                    label="vs Industry Avg",
                    value=f"{'+' if diff > 0 else ''}{diff}%",
                    highlight="good" if diff < 0 else "bad"
                ))

    return stats[:5]


@router.post("", response_model=ChatResponse)
def chat(
    req: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    question    = req.question.strip()
    role        = current_user.role
    name        = current_user.name or "there"
    access_desc = ROLE_ACCESS.get(role, "your permitted data")

    # ── Greeting ─────────────────────────────────────────────────────────────
    if is_greeting(question):
        prompt = f"""You are a friendly SLA platform assistant. The user's name is {name} and their role is {role}.
Greet them warmly by name. In 2-3 short sentences:
1. Welcome them and mention their role
2. Tell them they can access: {access_desc}
3. Suggest 2 example questions they can ask

Be warm, concise, and professional."""
        answer = call_euri(prompt, max_tokens=200)
        return ChatResponse(
            answer=answer, sql="", data=[], columns=[],
            message_type="greeting", summary_stats=[]
        )

    # ── General / Help ────────────────────────────────────────────────────────
    if is_general(question):
        prompt = f"""You are an SLA platform assistant. The user {name} has the role: {role}.
Their data access: {access_desc}.

Platform features:
- Natural language chat with SLA data
- Filter and browse contracts and tickets by status, tier, priority
- Compare SLA performance vs industry benchmarks
- View breach history and ticket summaries

Answer their question helpfully in 3-4 sentences. Be specific about what their {role} role can and cannot access.

User question: {question}"""
        answer = call_euri(prompt, max_tokens=250)
        return ChatResponse(
            answer=answer, sql="", data=[], columns=[],
            message_type="general", summary_stats=[]
        )

    # ── Data Query ────────────────────────────────────────────────────────────
    role_filter = get_filter(role, current_user.user_id, current_user.org_id)
    filter_note = (
        f"IMPORTANT: Always apply WHERE {role_filter} when querying sla_contracts (alias as c)."
        if role_filter
        else "No row filter — user is Platform Admin and sees all data."
    )

    sql_prompt = f"""You are a PostgreSQL expert. Convert the user question into a valid SQL SELECT query.

Schema:
{DB_SCHEMA}

User role: {role}
{filter_note}

Rules:
- Return ONLY the raw SQL query — no explanation, no markdown, no backticks
- Always alias sla_contracts as c
- For comparison questions JOIN sla_contracts c with sla_benchmarks b ON c.service_type = b.service_type AND c.tier = b.tier
- Use LIMIT 50
- Only SELECT statements

User question: {question}
"""

    try:
        sql_query = clean_sql(call_euri(sql_prompt, max_tokens=600))
    except Exception as e:
        return ChatResponse(
            answer=f"I couldn't generate a query for that: {str(e)}",
            sql="", data=[], columns=[], message_type="data", summary_stats=[]
        )

    try:
        with engine.connect() as conn:
            result  = conn.execute(text(sql_query))
            columns = list(result.keys())
            rows    = [dict(zip(columns, row)) for row in result.fetchall()]
    except Exception as e:
        return ChatResponse(
            answer=f"Query ran but failed: {str(e)}",
            sql=sql_query, data=[], columns=[], message_type="data", summary_stats=[]
        )

    has_comparison = detect_comparison(columns)
    summary_stats  = compute_summary_stats(columns, rows, has_comparison)

    answer_prompt = f"""You are a helpful SLA analyst assistant. The user {name} ({role}) asked: "{question}"

The query returned {len(rows)} rows. Here is a sample:
{json.dumps(rows[:8], default=str)}

Write a response following these rules:
- First sentence: direct answer with the key number or finding
- If 0 rows: say clearly no data was found and suggest a reason
- If comparison data exists: explicitly state if performance is ABOVE or BELOW industry average with the actual numbers
- Highlight any critical issues (breaches, P1 tickets, expired contracts)
- Keep it to 2-4 sentences, plain language, no column name jargon
- End with one short actionable recommendation if relevant
"""

    try:
        answer = call_euri(answer_prompt, max_tokens=350)
    except Exception as e:
        answer = f"Found {len(rows)} record(s). Unable to summarize: {str(e)}"

    return ChatResponse(
        answer=answer,
        sql=sql_query,
        data=rows,
        columns=columns,
        message_type="data",
        summary_stats=summary_stats,
        has_comparison=has_comparison,
    )
