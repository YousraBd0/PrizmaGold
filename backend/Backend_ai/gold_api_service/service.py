import os
import sys
import requests
from dotenv import load_dotenv

# ── Chemin absolu vers database/ ─────────────────────
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(BASE_DIR, 'database'))

from metal_price_repository import save_metal_price

load_dotenv()

GOLD_API_KEY = os.getenv("GOLD_API_KEY")
GOLD_API_URL = "https://www.goldapi.io/api/XAU/USD"

import subprocess
from datetime import timedelta, date as dt_date, datetime
from metal_price_repository import find_top10_by_recorded_at_desc

def fetch_and_save() -> dict:
    data = fetch_live_only()
    today_price = data.get("price")
    
    # --- AUTO-FILL GAPS ---
    # On vérifie la date du dernier enregistrement
    last_records = find_top10_by_recorded_at_desc()
    if last_records:
        last_date = last_records[0]["recorded_at"].date()
        today_date = dt_date.today()
        
        # S'il y a un trou de plus d'un jour (ex: on est lundi, dernier = vendredi)
        delta = (today_date - last_date).days
        if delta > 1:
            print(f"🕵️ Gap detected: {delta-1} days missing. Filling with last price...")
            last_price_usd = float(last_records[0]["price_usd"])
            last_price_eur = float(last_records[0]["price_eur"])
            
            for i in range(1, delta):
                gap_date = last_date + timedelta(days=i)
                save_metal_price(
                    metal_type        = "XAU",
                    price_usd         = last_price_usd,
                    price_eur         = last_price_eur,
                    source_api        = "system-fill",
                    is_daily_snapshot = True,
                    recorded_at       = datetime.combine(gap_date, datetime.min.time())
                )
    
    # On enregistre le prix d'aujourd'hui normalement
    saved = save_metal_price(
        metal_type        = "XAU",
        price_usd         = today_price,
        price_eur         = data.get("price_gram_24k"),
        source_api        = "goldapi.io",
        raw_response      = data,
        is_daily_snapshot = True
    )

    # Déclencher la mise à jour de l'IA (Prophet) en arrière-plan
    try:
        script_path = os.path.join(BASE_DIR, 'forcasting', 'gold_price_forcast.py')
        # On utilise sys.executable pour s'assurer d'utiliser le bon Python
        subprocess.Popen([sys.executable, script_path], cwd=BASE_DIR)
        print("🚀 Prophet forecast triggered in background")
    except Exception as e:
        print(f"⚠️ Failed to trigger Prophet: {e}")

    return saved

def fetch_live_only() -> dict:
    if not GOLD_API_KEY or GOLD_API_KEY == "ta_clé_goldapi_ici":
        import random
        price_usd = round(2118.00 + random.uniform(-10, 10), 2)
        price_eur = round(1950.00 + random.uniform(-5, 5), 2)
        return {"mocked": True, "price": price_usd, "price_gram_24k": price_eur}
    else:
        headers = {
            "x-access-token": GOLD_API_KEY,
            "Content-Type"  : "application/json"
        }
        response = requests.get(GOLD_API_URL, headers=headers, timeout=10)
        response.raise_for_status()
        return response.json()