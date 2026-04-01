# main.py — FastAPI server pour PrizmaGold Market Intel
# d:\python\python.exe -m uvicorn trendsPipelining.main:app --reload --port 8000
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import pandas as pd
import os

app = FastAPI(title="PrizmaGold API")

# ── CORS → autorise le frontend React ──────────────────
app.add_middleware(
    CORSMiddleware,
   allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Sert les images statiquement ───────────────────────
app.mount("/images", StaticFiles(directory="data/images/gold"),
          name="images")

# ── Chargement du CSV ──────────────────────────────────
CSV_PATH = "data/gold_clustered.csv"

def load_df():
    df = pd.read_csv(CSV_PATH)
    df["trend_score"]  = df["trend_score"].fillna(0)
    df["price"]        = df["price"].fillna(0)
    df["score"]        = df["score"].fillna(0)
    df["cluster_name"] = df["cluster_name"].fillna("unknown")
    return df

def row_to_product(row, idx):
    """Convertit une ligne CSV en dict produit pour le frontend."""

    # Construit l'URL de l'image locale
    image_url = None
    if pd.notna(row.get("local_image_path")) and \
       row["local_image_path"] != "nan":
        filename = os.path.basename(str(row["local_image_path"]))
        image_url = f"/images/{filename}"
    # Fallback sur image_url distante si pas d'image locale
    if not image_url and pd.notna(row.get("image_url")):
        image_url = row["image_url"]


    # Détermine la catégorie depuis le titre
    title = str(row.get("title", "")).lower()
    if "ring" in title:
        category = "rings"
    elif "necklace" in title or "chain" in title or "pendant" in title:
        category = "necklaces"
    elif "bracelet" in title or "bangle" in title:
        category = "bracelets"
    elif "earring" in title:
        category = "earrings"
    else:
        category = "other"

    return {
        "id"           : str(row.get("id", idx)),
        "title"        : str(row.get("title", "")),
        "price"        : float(row.get("price", 0)),
        "score"        : float(row.get("score", 0)),
        "trend_score"  : round(float(row.get("trend_score", 0)), 4),
        "cluster"      : int(row.get("cluster", -1)),
        "cluster_name" : str(row.get("cluster_name", "")),
        "category"     : category,
        "image_url"    : image_url,
        "interests"    : int(float(row.get("review_count", 0)))
    }

# ══════════════════════════════════════════════════════
# ENDPOINT 1 — Preview pour le Dashboard principal
# Retourne le Top 2 produits les plus trending
# ══════════════════════════════════════════════════════
@app.get("/trends/preview")
def get_trends_preview():
    df      = load_df()
    df_img  = df[df["local_image_path"].notna() &
                 (df["local_image_path"] != "nan")]
    top2    = df_img.nlargest(2, "trend_score")

    products = [row_to_product(row, i)
                for i, (_, row) in enumerate(top2.iterrows())]

    return {
        "status"   : "success",
        "products" : products
    }

# ══════════════════════════════════════════════════════
# ENDPOINT 2 — Tous les produits avec filtres
# Utilisé par la page "Trending Now" complète
# ══════════════════════════════════════════════════════
@app.get("/trends/all")
def get_all_trends(
    category  : str   = Query(default="all"),
    min_score : float = Query(default=0.0),
    max_price : float = Query(default=99999),
    limit     : int   = Query(default=20),
    sort_by   : str   = Query(default="trend_score")
):
    df = load_df()

    # Filtre catégorie
    if category != "all":
        mask = df["title"].str.lower().str.contains(
            category.rstrip("s"),   # "rings" → "ring"
            na=False
        )
        df = df[mask]

    # Filtre score minimum
    df = df[df["trend_score"] >= min_score]

    # Filtre prix maximum
    df = df[df["price"] <= max_price]

    # Tri
    if sort_by in df.columns:
        df = df.sort_values(sort_by, ascending=False)

    # Limite + produits avec image en priorité
    df_img    = df[df["local_image_path"].notna() &
                   (df["local_image_path"] != "nan")]
    df_no_img = df[df["local_image_path"].isna() |
                   (df["local_image_path"] == "nan")]
    df = pd.concat([df_img, df_no_img]).head(limit)

    products = [row_to_product(row, i)
                for i, (_, row) in enumerate(df.iterrows())]

    return {
        "status"   : "success",
        "total"    : len(products),
        "products" : products
    }

# ══════════════════════════════════════════════════════
# ENDPOINT 3 — Catégories disponibles
# Pour les boutons filtres : All · Rings · Necklaces...
# ══════════════════════════════════════════════════════
@app.get("/trends/categories")
def get_categories():
    df = load_df()

    categories = []
    mapping = {
        "all"       : ("All",       "all"),
        "ring"      : ("Rings",     "rings"),
        "necklace"  : ("Necklaces", "necklaces"),
        "bracelet"  : ("Bracelets", "bracelets"),
        "earring"   : ("Earrings",  "earrings"),
    }

    for keyword, (label, value) in mapping.items():
        if keyword == "all":
            count = len(df)
        else:
            count = df["title"].str.lower()\
                               .str.contains(keyword, na=False).sum()
        if count > 0 or keyword == "all":
            categories.append({
                "label" : label,
                "value" : value,
                "count" : int(count)
            })

    return {
        "status"     : "success",
        "categories" : categories
    }

# ══════════════════════════════════════════════════════
# ENDPOINT 4 — Stats globales pour le dashboard
# ══════════════════════════════════════════════════════
@app.get("/trends/stats")
def get_stats():
    df = load_df()
    return {
        "status"          : "success",
        "total_products"  : len(df),
        "avg_trend_score" : round(float(df["trend_score"].mean()), 4),
        "avg_price"       : round(float(df["price"].mean()), 2),
        "top_cluster"     : str(df.nlargest(1, "trend_score")
                                  ["cluster_name"].iloc[0]),
        "clusters"        : int(df["cluster"].nunique())
    }
    

@app.get("/trends/clusters")
def get_clusters():
    df = load_df()
    df["trend_score"] = pd.to_numeric(
        df["trend_score"], errors="coerce").fillna(0)

    # Calcule les seuils directement ici
    p33 = float(df["trend_score"].quantile(0.33))
    p66 = float(df["trend_score"].quantile(0.66))

    clusters = []
    for cluster_id in sorted(df["cluster"].unique()):
        if cluster_id == -1:
            continue
        cluster_data = df[df["cluster"] == cluster_id]
        avg_trend    = float(cluster_data["trend_score"].mean())
        count        = len(cluster_data)
        name         = str(cluster_data["cluster_name"].iloc[0])

        if avg_trend >= p66:
            status = "rising"
        elif avg_trend >= p33:
            status = "stable"
        else:
            status = "emerging"

        clusters.append({
            "cluster_id"   : int(cluster_id),
            "cluster_name" : name,
            "avg_trend"    : round(avg_trend, 4),
            "count"        : count,
            "status"       : status
        })

    clusters.sort(key=lambda x: x["avg_trend"], reverse=True)
    return {"status": "success", "clusters": clusters}

if __name__ == "__main__":
    import uvicorn
    import sys, os
    sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    uvicorn.run("trendsPipelining.main:app", host="0.0.0.0", port=8000, reload=True)