# init_db.py — version finale

import psycopg2
from psycopg2.errors import DuplicateDatabase

DB_CONFIG = {
    "host"     : "localhost",
    "database" : "prizmagold",
    "user"     : "postgres",
    "password" : "yousra123",
    "port"     : 5432
}

def create_database():
    conn = psycopg2.connect(
        host="localhost",
        user="postgres",
        password="yousra123",
        port=5432
    )
    conn.autocommit = True
    cur = conn.cursor()
    try:
        cur.execute("CREATE DATABASE prizmagold;")
        print("✅ Base prizmagold créée")
    except DuplicateDatabase:
        print("✅ Base prizmagold existait déjà")
    cur.close()
    conn.close()

CREATE_TABLE_SQL = """
DROP TABLE IF EXISTS jewelry_trends CASCADE;

CREATE TABLE jewelry_trends (

    -- Identifiant unique = ID source HuggingFace
    -- Evite les doublons si pipeline relancé
    trend_id        VARCHAR(255)    PRIMARY KEY,

    -- Informations produit
    title           TEXT            NOT NULL,
    image_url       TEXT,
    local_image_path TEXT,
    -- ↑ Chemin local pour servir via FastAPI /images/

    -- Classification ML
    cluster_name    VARCHAR(100)    NOT NULL,
    -- Ex: 'Chain & Pendant', 'Fine Earrings'
    cluster_id      INTEGER         DEFAULT -1,
    -- Tag de style — pas critère de sélection

    jewelry_type    VARCHAR(50)     NOT NULL,
    -- rings | necklaces | bracelets | earrings | mixed
    -- Déterminé par mots-clés dominants du cluster

    -- Scores
    trend_score     NUMERIC(5,4)    NOT NULL,
    -- Critère de sélection principal
    -- Top 20 par catégorie basé sur cette valeur

    rating          NUMERIC(3,2)    DEFAULT 0,
    -- Note moyenne du produit (0-5)

    review_count    INTEGER         DEFAULT 0,
    -- Nombre de reviews

    price           NUMERIC(10,2)   DEFAULT 0,
    -- Prix en USD

    -- Mots-clés TF-IDF du cluster
    keywords        TEXT[],
    -- Ex: {'gold', 'chain', 'necklace', '14k'}
    -- Extraits depuis features.py

    -- Métadonnées
    material        VARCHAR(50)     DEFAULT 'gold',
    data_source     VARCHAR(100)    DEFAULT 'huggingface_clothing_jewelry',
    detected_at     TIMESTAMPTZ     DEFAULT NOW(),
    pipeline_run    INTEGER         DEFAULT 1
    -- Numéro du run pipeline
    -- Permet de tracer l'historique des exécutions
);
"""

INDEXES_SQL = [
    "CREATE INDEX IF NOT EXISTS idx_trends_cluster  ON jewelry_trends(cluster_name);",
    "CREATE INDEX IF NOT EXISTS idx_trends_score    ON jewelry_trends(trend_score DESC);",
    "CREATE INDEX IF NOT EXISTS idx_trends_type     ON jewelry_trends(jewelry_type);",
    "CREATE INDEX IF NOT EXISTS idx_trends_cluster_id ON jewelry_trends(cluster_id);",
]

def init_db():
    conn = psycopg2.connect(**DB_CONFIG)
    cur  = conn.cursor()
    cur.execute(CREATE_TABLE_SQL)
    for idx in INDEXES_SQL:
        cur.execute(idx)
    conn.commit()
    cur.close()
    conn.close()
    print("✅ Table jewelry_trends créée — format produits trending")

if __name__ == "__main__":
    create_database()
    init_db()