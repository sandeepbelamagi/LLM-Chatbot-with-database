# SLA Insight Platform

A role-based SLA (Service Level Agreement) consulting platform with an LLM-powered chatbot that lets users query, analyze, and compare SLA data using natural language.

---

## Overview

SLA Insight is a full-stack web application built for consulting organizations that manage service level agreements. It combines role-based access control (RBAC) with a conversational AI assistant that translates natural language questions into SQL queries — so users can chat with their data without writing a single line of SQL.

### Core Features

- **Role-Based Access Control** — Four roles (Subscriber, Advisor, Admin, Platform Admin), each seeing only their permitted data
- **LLM Chat Interface** — Ask questions in plain English, get answers backed by live database queries
- **Auto Summary Stats** — Every query response shows stat cards (SLA Met Rate, breach counts, averages)
- **Benchmark Comparison** — Compare your SLA performance against industry averages (Gartner, ITIL, HDI)
- **Greeting & General Chat** — The bot understands greetings and help questions, not just data queries
- **Colour-Coded Data Tables** — Results rendered with smart badges, highlights, and comparison legends

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, React Router |
| Backend | FastAPI (Python) |
| Database | PostgreSQL |
| ORM | SQLAlchemy + Alembic |
| Auth | JWT (python-jose) + bcrypt |
| LLM | Euri AI API (claude-sonnet-4-6) |
| HTTP Client | Axios (frontend), Requests (backend) |

---

## Project Structure

```
sla-platform/
├── backend/
│   ├── main.py                        # FastAPI app entry point
│   ├── requirements.txt
│   ├── .env                           # Environment variables
│   └── app/
│       ├── api/
│       │   ├── auth.py                # Login & Register endpoints
│       │   ├── chat.py                # LLM Text-to-SQL chat endpoint
│       │   ├── contracts.py           # Role-scoped SLA contracts
│       │   ├── tickets.py             # Role-scoped SLA tickets
│       │   └── benchmarks.py          # Industry benchmark data
│       ├── core/
│       │   ├── config.py              # App settings & env vars
│       │   └── security.py            # JWT creation & verification
│       ├── db/
│       │   └── database.py            # SQLAlchemy engine & session
│       ├── models/
│       │   ├── user.py                # User model
│       │   └── sla.py                 # SLAContract, SLATicket, SLABenchmark models
│       └── schemas/
│           └── schemas.py             # Pydantic request/response schemas
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── package.json
    └── src/
        ├── App.jsx                    # Router & auth guards
        ├── main.jsx                   # React entry point
        ├── pages/
        │   ├── LoginPage.jsx          # Sign in & Register
        │   └── ChatPage.jsx           # Main chat interface
        ├── components/
        │   ├── chat/
        │   │   ├── ChatMessage.jsx    # Message bubble renderer
        │   │   ├── ChatInput.jsx      # Text input with send button
        │   │   └── TypingIndicator.jsx# Animated loading dots
        │   ├── layout/
        │   │   └── Sidebar.jsx        # Role badge, suggestions, user info
        │   └── table/
        │       └── ResultTable.jsx    # Data table with stat cards
        ├── hooks/
        │   └── useAuth.jsx            # Auth context & provider
        └── services/
            └── api.js                 # Axios instance with JWT interceptor
```

---

## Database Schema

### `users`
| Column | Type | Description |
|---|---|---|
| user_id | TEXT (ULID) | Primary key |
| name | TEXT | Full name |
| email | TEXT | Unique login email |
| password | TEXT | Hashed with sha256_crypt |
| role | TEXT | Subscriber / Advisor / Admin / Platform Admin |
| org_id | TEXT | Organization identifier |
| is_active | BOOLEAN | Account status |

### `sla_contracts`
| Column | Type | Description |
|---|---|---|
| contract_id | TEXT (ULID) | Primary key |
| client_name | TEXT | Client organization |
| advisor_id | TEXT | Assigned advisor |
| org_id | TEXT | Organization |
| service_type | TEXT | IT Support / Cloud / Network / Security |
| tier | TEXT | Gold / Silver / Bronze |
| start_date | DATE | Contract start |
| end_date | DATE | Contract end |
| response_time_hrs | INT | SLA response target |
| resolution_time_hrs | INT | SLA resolution target |
| uptime_target | FLOAT | Uptime % target |
| penalty_clause | FLOAT | Financial penalty amount |
| status | TEXT | Active / Expired / Breached |

### `sla_tickets`
| Column | Type | Description |
|---|---|---|
| ticket_id | TEXT (ULID) | Primary key |
| contract_id | TEXT | Linked contract |
| raised_by | TEXT | User who raised it |
| category | TEXT | Incident / Change / Request |
| priority | TEXT | P1 / P2 / P3 / P4 |
| created_at | TIMESTAMP | Ticket creation time |
| resolved_at | TIMESTAMP | Resolution time |
| actual_response_hrs | FLOAT | Actual response taken |
| actual_resolution_hrs | FLOAT | Actual resolution taken |
| sla_met | BOOLEAN | Whether SLA was met |
| breach_reason | TEXT | Reason if SLA breached |

### `sla_benchmarks`
| Column | Type | Description |
|---|---|---|
| benchmark_id | TEXT (ULID) | Primary key |
| service_type | TEXT | IT Support / Cloud / Network / Security |
| tier | TEXT | Gold / Silver / Bronze |
| industry_avg_response_hrs | FLOAT | Industry average response |
| industry_avg_resolution_hrs | FLOAT | Industry average resolution |
| industry_avg_uptime | FLOAT | Industry average uptime % |
| breach_rate | FLOAT | Industry breach rate % |
| top_quartile_response_hrs | FLOAT | Top 25% response time |
| source | TEXT | Gartner / HDI / ITIL / Forrester |
| year | INT | Benchmark year |

---

## Role Access Matrix

| Feature | Subscriber | Advisor | Admin | Platform Admin |
|---|---|---|---|---|
| Own org contracts | ✅ | ❌ | ✅ | ✅ |
| Assigned contracts | ❌ | ✅ | ✅ | ✅ |
| All org tickets | ✅ | ❌ | ✅ | ✅ |
| Assigned tickets | ❌ | ✅ | ✅ | ✅ |
| Benchmark data | ✅ | ✅ | ✅ | ✅ |
| All tenants data | ❌ | ❌ | ❌ | ✅ |
| User management | ❌ | ❌ | ✅ | ✅ |

---

## How the LLM Chat Works

```
User types a question
        ↓
Backend detects message type:
  ├── Greeting  → LLM generates warm welcome with role info
  ├── General   → LLM explains features and access
  └── Data      → continues below
        ↓
LLM converts question → SQL query (with role-based WHERE filter injected)
        ↓
FastAPI runs SQL on PostgreSQL
        ↓
Backend computes summary stats from results
        ↓
LLM summarizes results into a human-readable answer
        ↓
Frontend renders: answer text + stat cards + colour-coded table
```

---

## Setup & Installation

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL 14+

### 1. Clone and set up the database

```sql
-- In pgAdmin or psql
CREATE DATABASE sla_platform;
```

Run the data generation script:
```bash
cd backend
pip install -r requirements.txt
python generate_data.py
```

### 2. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Mac/Linux
# venv\Scripts\activate         # Windows

pip install -r requirements.txt
```

Create `.env` file:
```
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost/sla_platform
SECRET_KEY=your-random-secret-key
EURI_API_KEY=your-euri-api-key
EURI_API_URL=https://api.euron.one/api/v1/euri/chat/completions
EURI_MODEL=claude-sonnet-4-6
```

Start the backend:
```bash
uvicorn main:app --reload
```

Backend runs at: `http://localhost:8000`  
API docs at: `http://localhost:8000/docs`

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | No | Create account |
| POST | `/api/auth/login` | No | Login, get JWT token |
| GET | `/api/auth/me` | Yes | Get current user |
| POST | `/api/chat` | Yes | Send chat message |
| GET | `/api/contracts` | Yes | List contracts (role-scoped) |
| GET | `/api/tickets` | Yes | List tickets (role-scoped) |
| GET | `/api/benchmarks` | Yes | List benchmark data |

### Chat Request
```json
POST /api/chat
{
  "question": "Show my active contracts"
}
```

### Chat Response
```json
{
  "answer": "You have 5 active contracts. 3 are Gold tier IT Support...",
  "sql": "SELECT * FROM sla_contracts c WHERE c.org_id = '...' AND c.status = 'Active';",
  "data": [...],
  "columns": ["contract_id", "client_name", "tier", "status"],
  "message_type": "data",
  "summary_stats": [
    { "label": "Total Records", "value": "5", "highlight": "neutral" },
    { "label": "Active", "value": "5", "highlight": "good" }
  ],
  "has_comparison": false
}
```

---

## Example Chat Questions

```
# Greetings
"Hello"
"Hi, who are you?"

# General
"What can you do?"
"What data can I access?"

# Contracts
"Show my active contracts"
"Which contracts expire this year?"
"Show all Gold tier contracts"

# Tickets
"How many SLA breaches this month?"
"Show all P1 tickets"
"Which tickets are unresolved?"

# Comparisons
"Compare my response time vs industry average"
"How does my uptime compare to benchmarks?"
"Am I above or below industry standard for IT Support?"
```

---

## Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `SECRET_KEY` | JWT signing secret |
| `EURI_API_KEY` | Euri AI API key |
| `EURI_API_URL` | Euri API endpoint URL |
| `EURI_MODEL` | Model name (e.g. claude-sonnet-4-6) |

---

## Key Design Decisions

**Why Text-to-SQL instead of RAG?**  
The data is structured and lives in a relational database. Text-to-SQL gives precise, real-time answers directly from the source. RAG is better suited for unstructured document search.

**Why ULID instead of UUID?**  
ULIDs are time-sortable, meaning records are naturally ordered by creation time. This makes queries and debugging easier without needing a separate `created_at` index for ordering.

**Why role filtering in the API layer, not just the database?**  
Defense in depth — role filters are applied both in SQLAlchemy queries and injected into the LLM SQL prompt. Even if the LLM generates a query without a filter, the API layer enforces it.

**Why sha256_crypt instead of bcrypt?**  
Python 3.13 introduced a breaking change with bcrypt's 72-byte password limit via passlib. sha256_crypt has no such limit and works reliably across Python versions.

---

## License

MIT License — free to use, modify, and distribute.
