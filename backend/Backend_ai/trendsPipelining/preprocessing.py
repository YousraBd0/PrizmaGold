# preprocessing.py
# Lit les 13 fichiers HuggingFace, filtre gold, prétraite, exporte


import os
import json
import cv2
import nltk
import requests
import numpy as np
import pandas as pd
from pathlib import Path
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from nltk.tokenize import word_tokenize
from concurrent.futures import ThreadPoolExecutor, as_completed
from PIL import Image

# ──────────────────────────────────────────────────────────
# CONFIG
# ──────────────────────────────────────────────────────────
HF_DIR     = "data/raw/Clothing_Shoes_and_Jewelry_Summarize"
OUTPUT_CSV = "data/gold_preprocessed.csv"
IMAGES_DIR = "data/images/gold"

IMG_SIZE    = 512
MAX_IMAGES  = 200
MAX_WORKERS = 8
MAX_FILES   = 3      # mettre None pour full dataset

# Patterns
GOLD_PATTERN    = r"(10k|14k|18k|21k|22k|24k|10kt|14kt|18kt|karat|yellow gold|white gold|rose gold|solid gold)"
JEWELRY_PATTERN = r"(ring|necklace|bracelet|earring|pendant|chain|bangle|jewelry)"
EXCLUDE_PATTERN = r"(shoe|sandal|dress|belt|glasses|eyewear|shirt|pant)"

# ──────────────────────────────────────────────────────────
# 1. LOAD + FILTER (DATA COLLECTION)
# ──────────────────────────────────────────────────────────
def load_and_filter():

    # Load JSON files
    files = sorted(Path(HF_DIR).glob("*.json*"))
    if MAX_FILES is not None:
        files = files[:MAX_FILES]

    print(f"⏳ Reading {len(files)} files...")

    # Store all products in a list
    all_records = []

    # For each file:
    # - Open the file
    # - Try to load it as standard JSON
    # - If the file is in JSONL format (one JSON object per line),
    #   read it line by line
    for filepath in files:
        print(f"   → {filepath.name}")
        with open(filepath, "r", encoding="utf-8") as f:
            try:
                data = json.load(f)
                if isinstance(data, list):
                    all_records.extend(data)
                else:
                    all_records.append(data)
            except json.JSONDecodeError:
                f.seek(0)
                for line in f:
                    if line.strip():
                        all_records.append(json.loads(line))

    # Convert raw data into a structured tabular format (Pandas DataFrame)
    df = pd.DataFrame(all_records)
    print(f"✅ Total loaded products: {len(df)}")

    # Ensure the 'title' column exists
    if "title" not in df.columns:
        raise ValueError("Column 'title' not found")

    # Convert text columns to string format
    df["title"] = df["title"].astype(str)
    df["description"] = df["description"].astype(str) \
                        if "description" in df.columns else ""

    # Create a new column combining title + description
    # This improves filtering accuracy
    df["text_full"] = df["title"] + " " + df["description"]

    # Detect gold-related materials
    mask_gold = df["text_full"].str.contains(
        GOLD_PATTERN, case=False, regex=True, na=False
    )

    # Detect jewelry product types
    mask_jewelry = df["text_full"].str.contains(
        JEWELRY_PATTERN, case=False, regex=True, na=False
    )

    # Exclude non-jewelry products
    mask_exclude = df["text_full"].str.contains(
        EXCLUDE_PATTERN, case=False, regex=True, na=False
    )

    # Apply final filtering:
    # Keep only products that:
    # - Contain gold-related keywords
    # - Contain jewelry-related keywords
    # - Do NOT contain excluded terms
    df_filtered = df[mask_gold & mask_jewelry & ~mask_exclude] \
                    .copy().reset_index(drop=True)

    print(f"✅ Gold jewelry products: {len(df_filtered)}")

    return df_filtered

# ──────────────────────────────────────────────────────────
# 2. CLEAN
# ──────────────────────────────────────────────────────────
def clean_data(df):
    print("\n─── Nettoyage ──────────────────────────────────────")
# Removes duplicated products based on their title to avoid redundancy and biased analysis.
    df = df.drop_duplicates(subset=["title"]).reset_index(drop=True)
# Handling Missing Text
# Ensures the description column exists
    if "description" not in df.columns:
# Replaces missing values with empty strings
        df["description"] = ""
    else:
  # Converts text fields to string format
        df["description"] = df["description"].fillna("").astype(str)
# Converting Numeric Fields:
# Invalid or missing values are replaced with 0.
# rating_number → converted to review_count
    if "rating_number" in df.columns:
        df["review_count"] = pd.to_numeric(
            df["rating_number"], errors="coerce").fillna(0)
    else:
        df["review_count"] = 0
# price → converted to numeric format
    df["price"] = pd.to_numeric(df["price"], errors="coerce").fillna(0)
# average_rating → converted to score
    if "average_rating" in df.columns:
        df["score"] = pd.to_numeric(
            df["average_rating"], errors="coerce").fillna(0)
    else:
        df["score"] = 0

# Image URL Standardization
    df["image_url"] = df["images"] if "images" in df.columns else None
# Generates an ID if missing
    if "id" not in df.columns:
        df["id"] = df.index.astype(str)
# Adds a "source" column (huggingface)
    df["source"] = "huggingface"

    print(f"  Lignes restantes      : {len(df)}")
    print(f"  Score manquant        : {df['score'].eq(0).sum()}")
    print(f"  Avec image URL        : {df['image_url'].notna().sum()}")
    print(f"  Prix moyen            : ${df['price'].mean():.2f}")

    return df

# ──────────────────────────────────────────────────────────
# 3. TEXT PREPROCESSING
# ──────────────────────────────────────────────────────────
def preprocess_text(df):
    print("\n─── Prétraitement texte ────────────────────────────")

    nltk.download("punkt",     quiet=True)
    nltk.download("stopwords", quiet=True)
    nltk.download("wordnet",   quiet=True)

    stop_words = set(stopwords.words("english"))
    lemmatizer = WordNetLemmatizer()
# Tokenization: Breaks text into individual words using NLTK.
# Lowercasing:Ensures uniform text representation.
# Stopword Removal:Removes common English words such (the,and,is,in)
# Lemmatization:Transforms words to their base form(necklaces → necklace)
    def clean_text(text):
        if not isinstance(text, str):
            return ""
        tokens = word_tokenize(text.lower())
        tokens = [t for t in tokens if t.isalpha()]
        tokens = [t for t in tokens if t not in stop_words]
        tokens = [lemmatizer.lemmatize(t) for t in tokens]
        return " ".join(tokens)

    df["title_clean"]   = df["title"].apply(clean_text)
    df["text_combined"] = df["text_full"].apply(clean_text)

    print(f"  Exemple avant         : {df['title'].iloc[0][:60]}")
    print(f"  Exemple après         : {df['title_clean'].iloc[0][:60]}")

    return df

# ──────────────────────────────────────────────────────────
# 4. DOWNLOAD IMAGES
# ──────────────────────────────────────────────────────────
def download_images(df):
    os.makedirs(IMAGES_DIR, exist_ok=True)

    # ── Tracking file for already downloaded URLs ──
    TRACKING_FILE = os.path.join(IMAGES_DIR, "downloaded_urls.json")

    if os.path.exists(TRACKING_FILE):
        with open(TRACKING_FILE, "r") as f:
            url_to_path = json.load(f)  # {url: local_path}
    else:
        # This prevents re-downloading images when the script runs again.
        url_to_path = {}

    # ── Find the last existing image number ──
    existing_files = [
        f for f in os.listdir(IMAGES_DIR)
        if f.startswith("gold_") and f.endswith(".jpg")
    ]

    if existing_files:
        last_num = max([
            int(f.replace("gold_", "").replace(".jpg", ""))
            for f in existing_files
            if f.replace("gold_", "").replace(".jpg", "").isdigit()
        ])
    else:
        last_num = 0

    print(f"\n─── Image Download ───────────────────────────────")
    print(f"  Known URLs            : {len(url_to_path)}")
    print(f"  Existing images       : {len(existing_files)}")
    print(f"  Next image number     : gold_{last_num + 1}.jpg")

    # ── Filter URLs that are already downloaded ──
    df_img = df[df["image_url"].notna()].copy()
    df_new = df_img[~df_img["image_url"].isin(url_to_path.keys())]
    df_new = df_new.head(MAX_IMAGES)

    print(f"  New URLs              : {len(df_new)}")
    skipped = len(df_img) - len(df_new)
    print(f"  Skipped URLs          : {skipped}")

    def download(counter, url):
        try:
            if not isinstance(url, str) or not url.startswith("http"):
                return None

            filename = f"gold_{counter}.jpg"
            filepath = os.path.join(IMAGES_DIR, filename)

            if os.path.exists(filepath):
                return filepath

            r = requests.get(
                url,
                timeout=10,
                headers={"User-Agent": "Mozilla/5.0"}
            )

            if r.status_code == 200:
                with open(filepath, "wb") as f:
                    f.write(r.content)
                return filepath

            return None
        except:
            return None

    # ── Download only new images ──
    new_results = {}

    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        futures = {
            executor.submit(
                download,
                last_num + idx + 1,
                row["image_url"]
            ): (orig_idx, row["image_url"])
            for idx, (orig_idx, row) in enumerate(df_new.iterrows())
        }

        for future in as_completed(futures):
            orig_idx, url = futures[future]
            local_path = future.result()
            new_results[orig_idx] = local_path

            # Save in tracking dictionary
            if local_path:
                url_to_path[url] = local_path

    # ── Save tracking file ──
    with open(TRACKING_FILE, "w") as f:
        json.dump(url_to_path, f)

    # ── Map local paths (new + existing) ──
    def get_local_path(url):
        if pd.isna(url):
            return None
        return url_to_path.get(url, None)

    df["local_image_path"] = df["image_url"].apply(get_local_path)

    downloaded = sum(1 for v in new_results.values() if v)

    print(f"  Downloaded images     : {downloaded}")
    print(f"  Total in folder       : {len(existing_files) + downloaded}")

    return df
# ──────────────────────────────────────────────────────────
# 5. RESIZE IMAGES
# ──────────────────────────────────────────────────────────
def resize_images(df):
    print("\n─── Resize images to 224×224 ───────────────────────")
    success, failure = 0, 0

    for path in df["local_image_path"].dropna():
        try:
            img = cv2.imread(path)
            if img is not None:
                img = cv2.resize(img, (IMG_SIZE, IMG_SIZE),Image.LANCZOS)
                cv2.imwrite(path, img)
                success += 1
            else:
                failure += 1
        except:
            failure += 1

    print(f"  Successfully resized  : {success}")
    print(f"  Failed                : {failure}")
    return df

# ──────────────────────────────────────────────────────────
# 6. TREND SCORE
# ──────────────────────────────────────────────────────────
def compute_trend_score(df):
    print("\n─── Calcul Trend Score ─────────────────────────────")
# Normalization + attribute contruction
# Each variable is scaled between 0 and 1
# Rating score,Review count,Price
    def normalize(s):
        mn, mx = s.min(), s.max()
        return (s - mn) / (mx - mn) if mx != mn else pd.Series([0] * len(s))

    rating_norm = normalize(df["score"].fillna(0))
    review_norm = normalize(df["review_count"].fillna(0))
    price_norm  = normalize(df["price"].fillna(0))

    df["trend_score"] = (
        0.5 * rating_norm + # 50%
        0.3 * review_norm + # 30%
        0.2 * price_norm  # 20%
    ).round(4)
# Mean trend score
    print(f"  mean Score            : {df['trend_score'].mean():.4f}")
# Maximum score
    print(f"  max Score             : {df['trend_score'].max():.4f}")
 # Top 5 trending products
    print(f"\n  Top 5 products :")
    top5 = df.nlargest(5, "trend_score")[["title", "trend_score"]]
    print(top5.to_string(index=False))

    return df

# ──────────────────────────────────────────────────────────
# 7. EXPORT
# ──────────────────────────────────────────────────────────
def export(df):
    os.makedirs("data", exist_ok=True)

    cols = [
        "id", "title", "title_clean", "text_combined",
        "score", "review_count", "price", "trend_score",
        "image_url", "local_image_path", "source"
    ]

    cols = [c for c in cols if c in df.columns]
    df[cols].to_csv(OUTPUT_CSV, index=False, encoding="utf-8-sig")

    print(f"\n─── Final Report ───────────────────────────────────")
    print(f"  Final gold products    : {len(df)}")
    print(f"  With trend_score       : {df['trend_score'].notna().sum()}")
    print(f"  With local image       : {df['local_image_path'].notna().sum()}")
    print(f"  Cleaned text available : {(df['text_combined'] != '').sum()}")
    print(f"\n✅ Export completed: {OUTPUT_CSV}")
# ──────────────────────────────────────────────────────────
# MAIN
# ──────────────────────────────────────────────────────────
if __name__ == "__main__":
    print("🚀 Phase 2 — Preprocessing\n")

    df = load_and_filter()
    df = clean_data(df)
    df = preprocess_text(df)
    df = download_images(df)
    df = resize_images(df)
    df = compute_trend_score(df)
    export(df)

    print("\n🎯 Phase 2 completed — ready for Phase 3")