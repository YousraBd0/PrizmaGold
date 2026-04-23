"""
fix_gap_april21.py
==================
1. Remplit le trou du 21 avril depuis yFinance
2. Vérifie que le 22 avril (aujourd'hui) est bien présent (GoldAPI)
3. Relance Prophet pour générer des prédictions à partir d'aujourd'hui

Exécuter UNE FOIS depuis la racine du projet :
    python fix_gap_april21.py
"""

import os
import sys
from datetime import datetime, date, timedelta

# ── Chemins ──────────────────────────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(BASE_DIR, "database"))
sys.path.insert(0, os.path.join(BASE_DIR, "forcasting"))

from dotenv import load_dotenv
load_dotenv()

import psycopg2
import psycopg2.extras
import yfinance as yf

DB_CONFIG = {
    "host":     os.getenv("DB_HOST", "localhost"),
    "database": os.getenv("DB_NAME", "prizmagold"),
    "user":     os.getenv("DB_USER", "postgres"),
    "password": os.getenv("DB_PASS", "yousra123"),
    "port":     int(os.getenv("DB_PORT", 5432)),
    "options":  "-c client_encoding=UTF8",
}


def get_conn():
    return psycopg2.connect(**DB_CONFIG)


# ── 1. Vérifier quelles dates manquent ───────────────────────────────────────
def get_existing_dates() -> set:
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("""
        SELECT DISTINCT DATE(recorded_at)
        FROM metal_prices
        WHERE metal_type = 'XAU'
        ORDER BY 1;
    """)
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return {r[0] for r in rows}


# ── 2. Insérer un prix manquant ───────────────────────────────────────────────
def insert_price(conn, target_date: date, price_usd: float, source: str = "yfinance_gap_fill"):
    price_eur = round(price_usd * 0.924, 4)   # taux EUR/USD ~1.082 au 21 avr 2026
    cur = conn.cursor()
    recorded_at = datetime.combine(target_date, datetime.min.time().replace(hour=9))
    cur.execute("""
        INSERT INTO metal_prices
            (metal_type, price_usd, price_eur, source_api, raw_response,
             is_daily_snapshot, recorded_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (metal_type, recorded_at) DO UPDATE
            SET price_usd = EXCLUDED.price_usd,
                price_eur = EXCLUDED.price_eur,
                source_api = EXCLUDED.source_api;
    """, (
        "XAU",
        price_usd,
        price_eur,
        source,
        psycopg2.extras.Json({"date": str(target_date), "close": price_usd, "source": source}),
        True,
        recorded_at,
    ))
    conn.commit()
    cur.close()
    print(f"  ✅ Inséré : {target_date}  →  ${price_usd:,.2f}  (source: {source})")


# ── 3. Récupérer depuis yFinance ──────────────────────────────────────────────
def fetch_from_yfinance(target_date: date) -> float | None:
    # yFinance nécessite end = target_date + 1 pour inclure target_date
    start = target_date
    end   = target_date + timedelta(days=1)

    print(f"  📡 Fetching yFinance GC=F for {target_date} …")
    df = yf.download("GC=F", start=str(start), end=str(end), progress=False)

    if df.empty:
        print(f"  ⚠️  yFinance retourne vide pour {target_date} (week-end ou férié ?)")
        return None

    close_col = df["Close"]
    price = float(close_col.iloc[0]) if hasattr(close_col.iloc[0], "__float__") else float(close_col.iloc[0].iloc[0])
    print(f"  📊 yFinance Close pour {target_date} : ${price:,.2f}")
    return price


# ── 4. Main ───────────────────────────────────────────────────────────────────
def main():
    print("\n══════════════════════════════════════════")
    print("  PriZma Gold – Gap Filler & Forecast Reset")
    print("══════════════════════════════════════════\n")

    existing = get_existing_dates()
    print(f"Dates actuelles en DB : {sorted(existing)[-10:]}")  # 10 dernières

    today = date.today()  # 22 avr 2026

    # Dates à vérifier : du 17 avril à aujourd'hui
    check_from = date(2026, 4, 13)
    missing = []
    d = check_from
    while d <= today:
        if d.weekday() < 5 and d not in existing:   # Lundi-Vendredi seulement
            missing.append(d)
        d += timedelta(days=1)

    if not missing:
        print("✅ Aucune date manquante détectée entre le 13 avr et aujourd'hui.")
    else:
        print(f"\n🔍 Dates manquantes détectées : {missing}\n")
        conn = get_conn()

        for target_date in missing:
            print(f"\n── Traitement de {target_date} ──")

            if target_date == today:
                # Pour aujourd'hui : on essaie GoldAPI d'abord, sinon yFinance
                print("  📅 C'est aujourd'hui — on utilise le prix déjà en DB ou GoldAPI.")
                # Si on arrive ici c'est qu'il manque — on remplit avec yFinance
                price = fetch_from_yfinance(target_date)
                if price:
                    insert_price(conn, target_date, price, source="yfinance_gap_fill_today")
                else:
                    # Dernier recours : copier le dernier prix connu
                    cur = conn.cursor()
                    cur.execute("""
                        SELECT price_usd FROM metal_prices
                        WHERE metal_type = 'XAU'
                        ORDER BY recorded_at DESC LIMIT 1;
                    """)
                    row = cur.fetchone()
                    cur.close()
                    if row:
                        insert_price(conn, target_date, float(row[0]), source="carry-forward")
            else:
                price = fetch_from_yfinance(target_date)
                if price:
                    insert_price(conn, target_date, price, source="yfinance_gap_fill")
                else:
                    # Week-end / férié → on propage le dernier prix connu
                    cur = conn.cursor()
                    cur.execute("""
                        SELECT price_usd FROM metal_prices
                        WHERE metal_type = 'XAU' AND DATE(recorded_at) < %s
                        ORDER BY recorded_at DESC LIMIT 1;
                    """, (target_date,))
                    row = cur.fetchone()
                    cur.close()
                    if row:
                        insert_price(conn, target_date, float(row[0]), source="carry-forward-weekend")

        conn.close()

    # ── 5. Afficher l'état final ──────────────────────────────────────────────
    print("\n── État final des 10 derniers jours ──")
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("""
        SELECT DATE(recorded_at), price_usd, source_api
        FROM metal_prices
        WHERE metal_type = 'XAU'
        ORDER BY recorded_at DESC
        LIMIT 10;
    """)
    rows = cur.fetchall()
    cur.close()
    conn.close()
    for r in rows:
        print(f"  {r[0]}  →  ${float(r[1]):>10,.2f}   [{r[2]}]")

    # ── 6. Relancer Prophet ───────────────────────────────────────────────────
    print("\n🚀 Relance de Prophet pour générer des prédictions à partir d'aujourd'hui …")
    try:
        from gold_price_forcast import run_pro_system
        run_pro_system()
        print("✅ Prophet terminé. Nouvelles prédictions enregistrées en DB.")
    except Exception as e:
        print(f"❌ Erreur Prophet : {e}")
        print("   → Lance manuellement : python forcasting/gold_price_forcast.py")

    print("\n══════════════════════════════════════════")
    print("  Done! Rafraîchis le frontend pour voir les nouvelles données.")
    print("══════════════════════════════════════════\n")


if __name__ == "__main__":
    main()