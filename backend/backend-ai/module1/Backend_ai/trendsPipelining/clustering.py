# clustering.py
# K-Means clustering on image + text features

import os
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import joblib

from sklearn.decomposition import PCA
from sklearn.cluster import KMeans
from sklearn.preprocessing import normalize
from scipy.sparse import load_npz

# ──────────────────────────────────────────────────────────
# CONFIG
# ──────────────────────────────────────────────────────────
INPUT_CSV    = "data/gold_preprocessed.csv"
FEATURES_DIR = "data/features"
OUTPUT_CSV   = "data/gold_clustered.csv"
PLOTS_DIR    = "data/plots"
os.makedirs(PLOTS_DIR, exist_ok=True)

N_COMPONENTS_PCA = 50
K_MIN, K_MAX     = 2, 10


# ══════════════════════════════════════════════════════════
# 1. LOAD FEATURES
# ══════════════════════════════════════════════════════════
def load_features():
    print("─── Loading features ─────────────────────────────")

    df           = pd.read_csv(INPUT_CSV)
    img_features = np.load(f"{FEATURES_DIR}/image_features.npy")
    img_indices  = np.load(f"{FEATURES_DIR}/image_indices.npy")
    txt_features = load_npz(f"{FEATURES_DIR}/text_features.npz")
    pop_features = np.load(f"{FEATURES_DIR}/popularity_features.npy")
    vectorizer   = joblib.load(f"{FEATURES_DIR}/tfidf_vectorizer.pkl")

    print(f"  Total products         : {len(df)}")
    print(f"  Image features         : {img_features.shape}")
    print(f"  Text features          : {txt_features.shape}")
    print(f"  Popularity features    : {pop_features.shape}")

    return df, img_features, img_indices, txt_features, pop_features, vectorizer


# ══════════════════════════════════════════════════════════
# 2. PCA REDUCTION #K-Means fonctionne mal dans des espaces très haute dimension.
# ══════════════════════════════════════════════════════════
def apply_pca(img_features):
    print("\n─── PCA Reduction ─────────────────────────────────")

    pca = PCA(n_components=N_COMPONENTS_PCA, random_state=42)
    img_reduced = pca.fit_transform(img_features)

    variance_kept = pca.explained_variance_ratio_.sum() * 100

    print(f"  Before PCA             : {img_features.shape[1]} dimensions")
    print(f"  After PCA              : {img_reduced.shape[1]} dimensions")
    print(f"  Information retained   : {variance_kept:.1f}%")

    joblib.dump(pca, f"{FEATURES_DIR}/pca_model.pkl")

    return img_reduced, pca


# ══════════════════════════════════════════════════════════
# 3. ELBOW METHOD — find best K
# ══════════════════════════════════════════════════════════
def find_best_k(features):
    print("\n─── Elbow Method ─────────────────────────────────")

    inertias = []
    k_values = range(K_MIN, K_MAX + 1)

    for k in k_values:
        kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
        kmeans.fit(features)
        inertias.append(kmeans.inertia_)
        print(f"  K={k} → inertia : {kmeans.inertia_:.0f}")

    plt.figure(figsize=(8, 4))
    plt.plot(k_values, inertias, "bo-", linewidth=2, markersize=8)
    plt.xlabel("Number of Clusters (K)")
    plt.ylabel("Inertia")
    plt.title("Elbow Method — Optimal K Selection")
    plt.grid(True, alpha=0.3)
    plt.savefig(f"{PLOTS_DIR}/elbow_curve.png", dpi=100, bbox_inches="tight")
    plt.close()
    print(f"\n  Plot saved             : {PLOTS_DIR}/elbow_curve.png")

    diffs = [inertias[i] - inertias[i+1] for i in range(len(inertias)-1)]
    best_k = k_values[diffs.index(max(diffs)) + 1]
    print(f"  Detected optimal K     : {best_k}")

    return best_k, inertias


# ══════════════════════════════════════════════════════════
# 4. K-MEANS CLUSTERING
# ══════════════════════════════════════════════════════════
def apply_kmeans(features, k):
    print(f"\n─── K-Means (K={k}) ───────────────────────────────")

    kmeans = KMeans(
        n_clusters=k,
        random_state=42,
        n_init=10,
        max_iter=300
    )

    labels = kmeans.fit_predict(features)

    unique, counts = np.unique(labels, return_counts=True)
    print("  Cluster distribution  :")
    for cluster, count in zip(unique, counts):
        bar = "█" * (count // 5)
        print(f"    Cluster {cluster} : {count:3d} products  {bar}")

    joblib.dump(kmeans, f"{FEATURES_DIR}/kmeans_model.pkl")

    return labels, kmeans


# ══════════════════════════════════════════════════════════
# 5. AUTOMATIC CLUSTER NAMING
# ══════════════════════════════════════════════════════════
def name_clusters(df, labels, img_indices, txt_features, vectorizer, k):
    print("\n─── Cluster Naming ───────────────────────────────")

    feature_names = vectorizer.get_feature_names_out()
    cluster_names = {}

    df_img = df.iloc[img_indices].copy()
    df_img["cluster"] = labels

    # Mapping professionnel basé sur les mots clés dominants
    STYLE_MAPPING = {
        frozenset(["necklace", "chain", "pendant"]) : "Chain & Pendant",
        frozenset(["ring", "band", "solitaire"])    : "Classic Rings",
        frozenset(["earring", "hoop", "stud"])      : "Fine Earrings",
        frozenset(["bracelet", "bangle", "cuff"])   : "Gold Bracelets",
        frozenset(["diamond", "gemstone", "stone"]) : "Diamond Fine Jewelry",
    }

    for cluster_id in range(k):
        cluster_mask  = df_img["cluster"] == cluster_id
        cluster_items = df_img[cluster_mask]

        if len(cluster_items) == 0:
            cluster_names[cluster_id] = f"Gold Collection {cluster_id + 1}"
            continue

        original_indices = cluster_items.index.tolist()
        cluster_txt  = txt_features[original_indices]
        mean_tfidf   = np.asarray(cluster_txt.mean(axis=0)).flatten()
        top_indices  = mean_tfidf.argsort()[-10:][::-1]
        top_words    = set([feature_names[i] for i in top_indices])

        # --- GÉNÉRATION DYNAMIQUE DU NOM ---
        # On prend les 3 meilleurs mots-clés du cluster
        top3 = [feature_names[i].title() for i in top_indices if feature_names[i].isalpha()][:3]
        
        # On cherche si on a une catégorie majeure (Priorité aux plus spécifiques)
        major_cat = "Jewelry"
        for cat in ["Earring", "Necklace", "Bracelet", "Pendant", "Ring", "Chain"]:
            if cat.lower() in top_words:
                major_cat = cat + "s"
                break
        
        # On construit une phrase descriptive
        # Exemple : "Gold Diamond & Solitaire Rings"
        other_keywords = [w for w in top3 if w.lower() not in major_cat.lower()][:2]
        
        if other_keywords:
            best_name = f"{' & '.join(other_keywords)} {major_cat}"
        else:
            best_name = f"Fine {major_cat} Collection"

        # --- UNICITÉ INTELLIGENTE ---
        # Si le nom existe déjà, on cherche un mot-clé "différenciateur"
        if best_name in cluster_names.values():
            # On cherche dans les mots suivants (index 3 à 10) un mot qui n'est pas dans le top3
            potential_diffs = [feature_names[i].title() for i in top_indices if feature_names[i].title() not in top3]
            for diff in potential_diffs:
                new_name = f"{diff} {best_name}"
                if new_name not in cluster_names.values():
                    best_name = new_name
                    break
            
            # Si toujours pas unique, on ajoute un suffixe (dernier recours)
            counter = 1
            base_name = best_name
            while best_name in cluster_names.values():
                best_name = f"{base_name} ({chr(64 + counter)})"
                counter += 1

        cluster_names[cluster_id] = best_name
        print(f"  Cluster {cluster_id} ({len(cluster_items):3d} items) "
              f"→ {best_name}")

    return cluster_names, df_img

# ══════════════════════════════════════════════════════════
# 6. TREND BY CLUSTER
# ══════════════════════════════════════════════════════════
def analyze_trends(df_img, cluster_names, k):
    print("\n─── Trend Analysis by Cluster ─────────────────────")

    trend_analysis = []

    for cluster_id in range(k):
        cluster_data = df_img[df_img["cluster"] == cluster_id]

        if len(cluster_data) == 0:
            continue

        avg_trend = cluster_data["trend_score"].mean()
        avg_price = cluster_data["price"].mean()
        avg_score = cluster_data["score"].mean()
        count     = len(cluster_data)
        name      = cluster_names[cluster_id]

        trend_analysis.append({
            "cluster_id"   : cluster_id,
            "cluster_name" : name,
            "nb_products"  : count,
            "avg_trend"    : round(avg_trend, 4),
            "avg_price"    : round(avg_price, 2),
            "avg_score"    : round(avg_score, 2)
        })

        status = "🔥 Rising" if avg_trend > 0.4 else \
                 "📈 Stable" if avg_trend > 0.25 else "📉 Low"

        print(f"  Cluster {cluster_id} | {status}")
        print(f"    Name    : {name}")
        print(f"    Trend   : {avg_trend:.4f} | Price: ${avg_price:.0f}"
              f" | Rating: {avg_score:.1f}/5")

    df_trend = pd.DataFrame(trend_analysis)

    plt.figure(figsize=(10, 5))
    bars = plt.bar(
        df_trend["cluster_id"],
        df_trend["avg_trend"],
        color=["#E8A020" if t > 0.4 else
               "#4A90D9" if t > 0.25 else
               "#95A5A6" for t in df_trend["avg_trend"]],
        edgecolor="white"
    )

    plt.xlabel("Cluster ID")
    plt.ylabel("Average Trend Score")
    plt.title("Trend Score by Gold Jewelry Cluster")
    plt.xticks(df_trend["cluster_id"])
    plt.grid(True, alpha=0.3, axis="y")

    for bar, val in zip(bars, df_trend["avg_trend"]):
        plt.text(bar.get_x() + bar.get_width()/2,
                 bar.get_height() + 0.005,
                 f"{val:.3f}", ha="center", fontsize=9)

    plt.savefig(f"{PLOTS_DIR}/trend_by_cluster.png",
                dpi=100, bbox_inches="tight")
    plt.close()

    print(f"\n  Plot saved             : {PLOTS_DIR}/trend_by_cluster.png")

    return df_trend


# ══════════════════════════════════════════════════════════
# 7. EXPORT
# ══════════════════════════════════════════════════════════
def export(df, df_img, cluster_names):

    df["cluster"]      = -1
    df["cluster_name"] = "no_image"

    for idx, row in df_img.iterrows():
        if idx in df.index:
            df.at[idx, "cluster"]      = row["cluster"]
            df.at[idx, "cluster_name"] = cluster_names[row["cluster"]]

    df.to_csv(OUTPUT_CSV, index=False, encoding="utf-8-sig")

    print("\n─── Final Report ─────────────────────────────────")
    print(f"  Products with cluster  : "
          f"{(df['cluster'] >= 0).sum()}")
    print(f"  Products without image : "
          f"{(df['cluster'] == -1).sum()}")
    print(f"\n✅ Export completed : {OUTPUT_CSV}")


# ══════════════════════════════════════════════════════════
# MAIN
# ══════════════════════════════════════════════════════════
if __name__ == "__main__":
    print("🚀 Phase 4 — Clustering & Trend Detection\n")

    df, img_feat, img_idx, txt_feat, pop_feat, vectorizer = \
        load_features()

    img_reduced, pca = apply_pca(img_feat)

    best_k, inertias = find_best_k(img_reduced)

    labels, kmeans = apply_kmeans(img_reduced, best_k)

    cluster_names, df_img = name_clusters(
        df, labels, img_idx, txt_feat, vectorizer, best_k
    )

    df_trend = analyze_trends(df_img, cluster_names, best_k)

    export(df, df_img, cluster_names)

    print("\n🎯 Phase 4 completed — Ready for Phase 5 (Dashboard)")