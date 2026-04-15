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

def fetch_and_save() -> dict:
    headers = {
        "x-access-token": GOLD_API_KEY,
        "Content-Type"  : "application/json"
    }

    response = requests.get(GOLD_API_URL, headers=headers, timeout=10)
    response.raise_for_status()

    data      = response.json()
    price_usd = data.get("price")
    price_eur = data.get("price_gram_24k")  # adapte si ta réponse API est différente

    saved = save_metal_price(
        metal_type        = "XAU",
        price_usd         = price_usd,
        price_eur         = price_eur,
        source_api        = "goldapi.io",
        raw_response      = data,
        is_daily_snapshot = True
    )

    return saved