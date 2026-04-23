# save_to_db.py
# Sauvegarde les résultats (trends) du pipeline dans PostgreSQL


import pandas as pd
import numpy as np
import psycopg2
import joblib
from scipy.sparse import load_npz
from datetime import datetime

DB_CONFIG = {
    "host"     : "localhost",
    "database" : "prizmagold",
    "user"     : "postgres",
    "password" : "yousra123",
    "port"     : 5432
}

TOP_N = 20

# ══════════════════════════════════════════════
# Catégorie PAR PRODUIT — basée sur le titre
# ══════════════════════════════════════════════
def get_jewelry_type(title: str) -> str:
    t = title.lower()
    if "earring" in t or "hoop" in t or "stud" in t:
        return "earrings"
    elif "bracelet" in t or "bangle" in t or "cuff" in t:
        return "bracelets"
    elif "necklace" in t or "chain" in t or "pendant" in t:
        return "necklaces"
    elif "ring" in t or "band" in t:
        return "rings"
    return "other"

def save_trends_to_db():
    # ── Chargement données ────────────────────────
    df           = pd.read_csv("data/gold_clustered.csv")
    txt_features = load_npz("data/features/text_features.npz")
    vectorizer   = joblib.load("data/features/tfidf_vectorizer.pkl")
    feature_names = vectorizer.get_feature_names_out()

    conn = psycopg2.connect(**DB_CONFIG)
    cur  = conn.cursor()

    # Numéro du run
    cur.execute("SELECT COALESCE(MAX(pipeline_run), 0) + 1 FROM jewelry_trends;")
    pipeline_run = cur.fetchone()[0]
    print(f"  Pipeline run #{pipeline_run}")

    # Vide la table
    cur.execute("TRUNCATE jewelry_trends;")
    print(f"  Table vidée — insertion fraîche")

    # ══════════════════════════════════════════════
    # 1. Mots-clés TF-IDF par cluster UNIQUEMENT
    #    (jewelry_type supprimé de cette étape)
    # ══════════════════════════════════════════════
    cluster_keywords = {}
    for cluster_id in sorted(df["cluster"].unique()):
        if cluster_id == -1:
            continue

        cluster_data = df[df["cluster"] == cluster_id]
        indices      = cluster_data.index.tolist()
        cluster_txt  = txt_features[indices]
        mean_tfidf   = np.asarray(cluster_txt.mean(axis=0)).flatten()
        top_indices  = mean_tfidf.argsort()[-5:][::-1]
        keywords     = [feature_names[i] for i in top_indices]

        cluster_keywords[int(cluster_id)] = keywords
        print(f"  Cluster {cluster_id} → keywords : {keywords[:3]}")

    # ══════════════════════════════════════════════
    # 2. Catégorie PAR PRODUIT — titre individuel
    # ══════════════════════════════════════════════
    df_valid = df[df["cluster"] != -1].copy()
    df_valid["jewelry_type"] = df_valid["title"].apply(get_jewelry_type)

    print("\n=== Distribution catégories par produit ===")
    print(df_valid["jewelry_type"].value_counts().to_string())

    # ══════════════════════════════════════════════
    # 3. Top 20 par catégorie — critère : trend_score
    # ══════════════════════════════════════════════
    top_products = (
        df_valid
        .sort_values("trend_score", ascending=False)
        .groupby("jewelry_type", group_keys=False)
        .head(TOP_N)
    )

    print(f"\n  Distribution top {TOP_N} par catégorie :")
    print(top_products["jewelry_type"].value_counts().to_string())
    print(f"  Total à insérer : {len(top_products)}")

    # ══════════════════════════════════════════════
    # 4. Insertion dans PostgreSQL
    # ══════════════════════════════════════════════
    inserted = 0
    skipped  = 0

    for _, row in top_products.iterrows():
        c_id  = int(row["cluster"])
        score = float(row.get("trend_score", 0))

        # keywords du cluster de ce produit
        keywords = cluster_keywords.get(c_id, [])

        # Nettoie chemins
        local_path = str(row.get("local_image_path", ""))
        local_path = None if local_path in ("", "nan", "None") \
                     else local_path

        img_url = str(row.get("image_url", ""))
        img_url = None if img_url in ("", "nan", "None") else img_url

        try:
            cur.execute("""
                INSERT INTO jewelry_trends (
                    trend_id, title, image_url, local_image_path,
                    cluster_name, cluster_id, jewelry_type,
                    trend_score, rating, review_count, price,
                    keywords, material, data_source,
                    detected_at, pipeline_run
                ) VALUES (
                    %s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s
                )
                ON CONFLICT (trend_id) DO UPDATE SET
                    trend_score  = EXCLUDED.trend_score,
                    detected_at  = EXCLUDED.detected_at,
                    pipeline_run = EXCLUDED.pipeline_run
            """, (
                str(row["id"]),
                str(row["title"]),
                img_url,
                local_path,
                str(row["cluster_name"]),
                c_id,
                row["jewelry_type"],   # ← catégorie individuelle
                round(score, 4),
                round(float(row.get("score", 0)), 2),
                int(float(row.get("review_count", 0))),
                round(float(row.get("price", 0)), 2),
                keywords,              # ← keywords du cluster
                "gold",
                "huggingface_clothing_jewelry",
                datetime.now(),
                pipeline_run
            ))
            inserted += 1
        except Exception as e:
            print(f"  ⚠️ Erreur produit {row.get('id')} : {e}")
            skipped += 1
            continue

    conn.commit()
    cur.close()
    conn.close()

    print(f"\n─── Rapport final ──────────────────────────────")
    print(f"  Produits insérés       : {inserted}")
    print(f"  Erreurs ignorées       : {skipped}")
    print(f"  Pipeline run           : #{pipeline_run}")
    print(f"\n✅ jewelry_trends peuplée — Top {TOP_N} par catégorie")

if __name__ == "__main__":
    save_trends_to_db()
