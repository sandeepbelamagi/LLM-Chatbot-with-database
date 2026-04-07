import psycopg2
import random
from faker import Faker
from datetime import timedelta
from ulid import ULID

fake = Faker()

# ── Update these with your pgAdmin credentials ──
conn = psycopg2.connect(
    dbname="sla_platform",
    user="postgres",
    password="root",  # ← change this
    host="localhost",
    port="5432"
)
cur = conn.cursor()

def new_id():
    return str(ULID())

# ── Reference Data ──────────────────────────────
roles        = ["Subscriber", "Advisor", "Admin", "Platform Admin"]
service_types = ["IT Support", "Cloud", "Network", "Security"]
tiers        = ["Gold", "Silver", "Bronze"]
org_ids      = [new_id() for _ in range(5)]

# ── Insert Users ────────────────────────────────
print("Inserting users...")
user_ids = []
for _ in range(50):
    uid = new_id()
    user_ids.append(uid)
    cur.execute(
        "INSERT INTO users VALUES (%s,%s,%s,%s,%s,%s)",
        (
            uid,
            fake.name(),
            fake.email(),
            random.choice(roles),
            random.choice(org_ids),
            random.choice([True, False])
        )
    )

# ── Insert SLA Contracts ────────────────────────
print("Inserting contracts...")
contract_ids = []
for _ in range(100):
    cid = new_id()
    contract_ids.append(cid)
    start = fake.date_between(start_date="-3y", end_date="-1y")
    end   = start + timedelta(days=random.randint(180, 730))
    cur.execute(
        "INSERT INTO sla_contracts VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)",
        (
            cid,
            fake.company(),
            random.choice(user_ids),
            random.choice(org_ids),
            random.choice(service_types),
            random.choice(tiers),
            start,
            end,
            random.randint(1, 24),
            random.randint(4, 72),
            round(random.uniform(95.0, 99.9), 1),
            round(random.uniform(1000, 50000), 2),
            random.choice(["Active", "Expired", "Breached"])
        )
    )

# ── Insert SLA Tickets ──────────────────────────
print("Inserting tickets...")
breach_reasons = ["Delayed Response", "Resource Unavailable", "Escalation Needed", "None"]
for _ in range(200):
    created  = fake.date_time_between(start_date="-2y", end_date="now")
    resolved = created + timedelta(hours=random.randint(1, 80))
    actual_response   = round(random.uniform(1, 30), 1)
    actual_resolution = round(random.uniform(2, 80), 1)
    sla_met = random.choice([True, False])
    cur.execute(
        "INSERT INTO sla_tickets VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)",
        (
            new_id(),
            random.choice(contract_ids),
            random.choice(user_ids),
            random.choice(["Incident", "Change", "Request"]),
            random.choice(["P1", "P2", "P3", "P4"]),
            created,
            resolved,
            actual_response,
            actual_resolution,
            sla_met,
            "None" if sla_met else random.choice(breach_reasons)
        )
    )

# ── Insert SLA Benchmarks ───────────────────────
print("Inserting benchmarks...")
sources = ["Gartner", "HDI", "ITIL", "Forrester"]
for stype in service_types:
    for tier in tiers:
        for year in [2022, 2023, 2024]:
            cur.execute(
                "INSERT INTO sla_benchmarks VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)",
                (
                    new_id(),
                    stype,
                    tier,
                    round(random.uniform(1, 24), 1),
                    round(random.uniform(4, 72), 1),
                    round(random.uniform(95.0, 99.9), 1),
                    round(random.uniform(1, 20), 1),
                    round(random.uniform(0.5, 8), 1),
                    random.choice(sources),
                    year
                )
            )

conn.commit()
cur.close()
conn.close()
print("✅ Done! All data loaded into PostgreSQL successfully.")