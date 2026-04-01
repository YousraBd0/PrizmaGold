# init_db.py — version finale + metal_prices table (matched to Java model)

import psycopg2
from psycopg2.errors import DuplicateDatabase

DB_CONFIG = {
    "host"     : "localhost",
    "database" : "prizmagold",
    "user"     : "postgres",
    "password" : "1234",
    "port"     : 5432,
    "options"  : "-c client_encoding=UTF8"
}

def create_database():
    conn = psycopg2.connect(
        host="localhost",
        user="postgres",
        password="1234",
        port=5432,
        options="-c client_encoding=UTF8"
    )
    conn.autocommit = True
    cur = conn.cursor()
    try:
        cur.execute("CREATE DATABASE prizmagold;")
        print("OK Base prizmagold creee")
    except DuplicateDatabase:
        print("OK Base prizmagold existait deja")
    cur.close()
    conn.close()

CREATE_JEWELRY_TRENDS_SQL = """
DROP TABLE IF EXISTS jewelry_trends CASCADE;

CREATE TABLE jewelry_trends (

    trend_id        VARCHAR(255)    PRIMARY KEY,

    title           TEXT            NOT NULL,
    image_url       TEXT,
    local_image_path TEXT,

    cluster_name    VARCHAR(100)    NOT NULL,
    cluster_id      INTEGER         DEFAULT -1,

    jewelry_type    VARCHAR(50)     NOT NULL,

    trend_score     NUMERIC(5,4)    NOT NULL,
    rating          NUMERIC(3,2)    DEFAULT 0,
    review_count    INTEGER         DEFAULT 0,
    price           NUMERIC(10,2)   DEFAULT 0,

    keywords        TEXT[],

    material        VARCHAR(50)     DEFAULT 'gold',
    data_source     VARCHAR(100)    DEFAULT 'huggingface_clothing_jewelry',
    detected_at     TIMESTAMPTZ     DEFAULT NOW(),
    pipeline_run    INTEGER         DEFAULT 1
);
"""

# Matches exactly the Java MetalPrice entity:
# price_id       → @Id @GeneratedValue BIGSERIAL
# metal_type     → @Column metalType
# price_usd      → @Column priceUsd
# price_eur      → @Column priceEur
# source_api     → @Column sourceApi
# recorded_at    → @Column recordedAt
# is_daily_snapshot → @Column isDailySnapshot
# raw_response   → @JdbcTypeCode(JSON) JSONB
CREATE_METAL_PRICES_SQL = """
DROP TABLE IF EXISTS metal_prices CASCADE;

CREATE TABLE metal_prices (

    price_id            BIGSERIAL       PRIMARY KEY,

    metal_type          VARCHAR(20)     NOT NULL,

    price_usd           NUMERIC(12,4)   NOT NULL,

    price_eur           NUMERIC(12,4),

    source_api          VARCHAR(100)    NOT NULL,

    recorded_at         TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    is_daily_snapshot   BOOLEAN         NOT NULL DEFAULT TRUE,

    raw_response        JSONB
);
"""

INDEXES_SQL = [
    # jewelry_trends indexes
    "CREATE INDEX IF NOT EXISTS idx_trends_cluster    ON jewelry_trends(cluster_name);",
    "CREATE INDEX IF NOT EXISTS idx_trends_score      ON jewelry_trends(trend_score DESC);",
    "CREATE INDEX IF NOT EXISTS idx_trends_type       ON jewelry_trends(jewelry_type);",
    "CREATE INDEX IF NOT EXISTS idx_trends_cluster_id ON jewelry_trends(cluster_id);",

    # metal_prices indexes
    "CREATE INDEX IF NOT EXISTS idx_prices_metal      ON metal_prices(metal_type);",
    "CREATE INDEX IF NOT EXISTS idx_prices_recorded   ON metal_prices(recorded_at DESC);",
    "CREATE INDEX IF NOT EXISTS idx_prices_metal_time ON metal_prices(metal_type, recorded_at DESC);",
]

def init_db():
    conn = psycopg2.connect(**DB_CONFIG)
    cur  = conn.cursor()

    print("  Creating table: jewelry_trends...")
    cur.execute(CREATE_JEWELRY_TRENDS_SQL)

    print("  Creating table: metal_prices...")
    cur.execute(CREATE_METAL_PRICES_SQL)

    print("  Creating indexes...")
    for idx in INDEXES_SQL:
        cur.execute(idx)

    conn.commit()
    cur.close()
    conn.close()
    print("OK Tables jewelry_trends + metal_prices creees avec succes")

if __name__ == "__main__":
    create_database()
    init_db()