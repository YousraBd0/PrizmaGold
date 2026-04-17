# database/metal_price_repository.py

import psycopg2
import psycopg2.extras
from datetime import datetime

DB_CONFIG = {
    "host"     : "localhost",
    "database" : "prizmagold",
    "user"     : "postgres",
    "password" : "yousra123",
    "port"     : 5432,
    "options"  : "-c client_encoding=UTF8"
}

def get_connection():
    return psycopg2.connect(**DB_CONFIG)

# ── findTop10ByOrderByRecordedAtDesc ──────────────────────────
def find_top10_by_recorded_at_desc():
    conn = get_connection()
    cur  = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("""
        SELECT price_id, metal_type, price_usd, price_eur,
               source_api, recorded_at, is_daily_snapshot
        FROM metal_prices
        ORDER BY recorded_at DESC
        LIMIT 10;
    """)
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return [dict(r) for r in rows]

# ── findByMetalTypeAndIsDailySnapshotTrue ─────────────────────
def find_by_metal_type_daily_snapshot(metal_type: str):
    conn = get_connection()
    cur  = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("""
        SELECT price_id, metal_type, price_usd, price_eur,
               source_api, recorded_at, is_daily_snapshot
        FROM metal_prices
        WHERE metal_type = %s
          AND is_daily_snapshot = TRUE
        ORDER BY recorded_at DESC;
    """, (metal_type,))
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return [dict(r) for r in rows]

# ── save (INSERT) ─────────────────────────────────────────────
def save_metal_price(metal_type: str, price_usd: float,
                     price_eur: float, source_api: str,
                     raw_response: dict = None,
                     is_daily_snapshot: bool = True,
                     recorded_at: datetime = None) -> dict:
    conn = get_connection()
    cur  = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    
    # Use provided recorded_at or default to now
    record_time = recorded_at if recorded_at is not None else datetime.utcnow()
    
    cur.execute("""
        INSERT INTO metal_prices
            (metal_type, price_usd, price_eur, source_api,
             recorded_at, is_daily_snapshot, raw_response)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        RETURNING *;
    """, (
        metal_type,
        price_usd,
        price_eur,
        source_api,
        record_time,
        is_daily_snapshot,
        psycopg2.extras.Json(raw_response) if raw_response else None
    ))
    row = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()
    return dict(row)