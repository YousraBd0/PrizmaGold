# features.py
# Image feature extraction (ResNet-50) + Text feature extraction (TF-IDF)

import os
import numpy as np
import pandas as pd
from pathlib import Path

import torch
import torchvision.models as models
import torchvision.transforms as transforms
from PIL import Image

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import normalize
import joblib

# ──────────────────────────────────────────────────────────
# CONFIG
# ──────────────────────────────────────────────────────────
INPUT_CSV    = "data/gold_preprocessed.csv"
FEATURES_DIR = "data/features"
IMAGES_DIR   = "data/images/gold"

os.makedirs(FEATURES_DIR, exist_ok=True)

# ══════════════════════════════════════════════════════════
# 1. LOAD DATA
# ══════════════════════════════════════════════════════════
def load_data():
    print("─── Loading dataset ─────────────────────────────")
    df = pd.read_csv(INPUT_CSV)
    print(f"  Products loaded        : {len(df)}")
    print(f"  With local image       : {df['local_image_path'].notna().sum()}")
    print(f"  With text              : {(df['text_combined'] != '').sum()}")
    return df


# ══════════════════════════════════════════════════════════
# 2. IMAGE FEATURES — ResNet-50
# ══════════════════════════════════════════════════════════
def extract_image_features(df):
    print("\n─── Image Features (ResNet-50) ───────────────────")

    # Load pretrained model ResNet-50 without the final classification layer
    model = models.resnet50(weights=models.ResNet50_Weights.DEFAULT)
    model = torch.nn.Sequential(*list(model.children())[:-1]) #deleting the final layer
    model.eval()

    # Standard preprocessing expected by ResNet
    transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(
            mean=[0.485, 0.456, 0.406],
            std=[0.229, 0.224, 0.225]
        )
    ])

    features = []
    valid_indices = []
    errors = 0

    df_images = df[df["local_image_path"].notna()].copy()
    total = len(df_images)

    print(f"  Images to process      : {total}")

    for i, (idx, row) in enumerate(df_images.iterrows()):
        try:
            img = Image.open(row["local_image_path"]).convert("RGB")
            tensor = transform(img).unsqueeze(0)

            with torch.no_grad():
                output = model(tensor)

            vector = output.squeeze().numpy()  # shape (2048,)
            features.append(vector)
            valid_indices.append(idx)

            if (i + 1) % 50 == 0:
                print(f"  Progress               : {i+1}/{total}")

        except Exception:
            errors += 1
            continue

    features_matrix = np.array(features)
    features_matrix = normalize(features_matrix, norm="l2")

    print(f"  Features extracted     : {len(features)}/{total}")
    print(f"  Errors                 : {errors}")
    print(f"  Feature matrix shape   : {features_matrix.shape}")

    np.save(f"{FEATURES_DIR}/image_features.npy", features_matrix)
    np.save(f"{FEATURES_DIR}/image_indices.npy", np.array(valid_indices))

    print(f"  Saved                  : {FEATURES_DIR}/image_features.npy")

    return features_matrix, valid_indices


# ══════════════════════════════════════════════════════════
# 3. TEXT FEATURES — TF-IDF
# ══════════════════════════════════════════════════════════
#TF-IDF mesure :
#Importance d’un mot dans un produit par rapport à tout le dataset.
def extract_text_features(df):
    print("\n─── Text Features (TF-IDF) ───────────────────────")

    texts = df["text_combined"].fillna("").tolist()

    vectorizer = TfidfVectorizer(
        max_features=500, #Vecteur de 500 dimensions
        ngram_range=(1, 2),
        min_df=2,
        sublinear_tf=True
    )

    tfidf_matrix = vectorizer.fit_transform(texts)

    feature_names = vectorizer.get_feature_names_out()

    print(f"  Products processed     : {len(texts)}")
    print(f"  Vocabulary size        : {len(feature_names)} terms")
    print(f"  Matrix shape           : {tfidf_matrix.shape}")
    print(f"  Top 15 terms           : {list(feature_names[:15])}")

    from scipy.sparse import save_npz
    save_npz(f"{FEATURES_DIR}/text_features.npz", tfidf_matrix)
    joblib.dump(vectorizer, f"{FEATURES_DIR}/tfidf_vectorizer.pkl")

    print(f"  Saved                  : {FEATURES_DIR}/text_features.npz")
    print(f"  Vectorizer saved       : {FEATURES_DIR}/tfidf_vectorizer.pkl")

    return tfidf_matrix, vectorizer


# ══════════════════════════════════════════════════════════
# 4. POPULARITY FEATURES
# ══════════════════════════════════════════════════════════
def extract_popularity_features(df):
    print("\n─── Popularity Features ───────────────────────────")

    pop_features = df[["score", "review_count",
                       "price", "trend_score"]].copy()

    for col in pop_features.columns:
        min_val = pop_features[col].min()
        max_val = pop_features[col].max()

        if max_val != min_val:
            pop_features[col] = (pop_features[col] - min_val) / (max_val - min_val)
        else:
            pop_features[col] = 0

    pop_matrix = pop_features.values

    print(f"  Matrix shape           : {pop_matrix.shape}")
    print(f"  Average trend score    : {df['trend_score'].mean():.4f}")

    np.save(f"{FEATURES_DIR}/popularity_features.npy", pop_matrix)

    print(f"  Saved                  : {FEATURES_DIR}/popularity_features.npy")

    return pop_matrix


# ══════════════════════════════════════════════════════════
# 5. FINAL REPORT
# ══════════════════════════════════════════════════════════
def print_report(df, image_features, text_features, popularity_features):
    print("\n─── Phase 3 Report ───────────────────────────────")
    print(f"  Total products         : {len(df)}")
    print(f"  Image features         : {image_features.shape}")
    print(f"    → Each image = {image_features.shape[1]} values")
    print(f"  Text features          : {text_features.shape}")
    print(f"    → Each product = {text_features.shape[1]} weighted terms")
    print(f"  Popularity features    : {popularity_features.shape}")
    print(f"    → score · reviews · price · trend")
    print(f"\n  Generated files in {FEATURES_DIR}/")
    print(f"    image_features.npy") # for clustering
    print(f"    text_features.npz") #for clustering
    print(f"    popularity_features.npy") #for ranking
    print(f"    tfidf_vectorizer.pkl") # for new products


# ══════════════════════════════════════════════════════════
# MAIN
# ══════════════════════════════════════════════════════════
if __name__ == "__main__":
    print("🚀 Phase 3 — Feature Extraction\n")

    df = load_data()
    image_features, valid_indices = extract_image_features(df)
    text_features, vectorizer = extract_text_features(df)
    popularity_features = extract_popularity_features(df)

    print_report(df, image_features, text_features, popularity_features)

    print("\n🎯 Phase 3 completed — Ready for Phase 4 (Clustering)")