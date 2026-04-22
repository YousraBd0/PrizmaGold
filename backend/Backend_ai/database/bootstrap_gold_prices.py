# bootstrap_gold_prices.py
# Phase 1: Bootstrapping - Fill DB with historical gold prices from yFinance (ONE TIME)

import os
import sys
import pandas as pd
import yfinance as yf
import psycopg2
import psycopg2.extras
from datetime import datetime, timedelta, date as dt_date

# Chemin absolu vers database/
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(BASE_DIR, 'database'))

from metal_price_repository import save_metal_price, find_by_metal_type_daily_snapshot

def bootstrap_historical_prices():
    """
    Fetch 2 years of historical gold prices from yFinance and save to DB.
    This should be run ONLY ONCE during initial setup.
    """
    print("Bootstrapping historical gold prices from yFinance...")

    # Check if we already have historical data
    existing_prices = find_by_metal_type_daily_snapshot("XAU")
    if len(existing_prices) > 365:  # If we have more than a year of data
        print(f"DB already contains {len(existing_prices)} historical prices. Skipping bootstrap.")
        return

    # Fetch 2 years of data
    # --- MODIF : On s'arrête à AUJOURD'HUI pour que yFinance inclue HIER ---
    end_date = dt_date.today()
    start_date = end_date - timedelta(days=365)
    
    print(f"Bootstrapping historical gold prices from yFinance...")
    print(f"Fetching data from {start_date} to {end_date} (excluding today a)...")
    
    # Try different tickers if GC=F doesn't work
    tickers = ["GC=F", "Gold", "GLD"]
    gold = None
    
    for t in tickers:
        try:
            print(f"Trying ticker: {t}")
            gold = yf.download(t, start=start_date, end=end_date)
            if not gold.empty:
                print(f"Success with ticker: {t}")
                break
        except Exception:
            continue
            
    if gold is None or gold.empty:
        print("❌ Could not fetch any gold data from yFinance.")
        return

    # --- CONNEXION BD ---
    from dotenv import load_dotenv
    load_dotenv()
    conn = psycopg2.connect(
        host=os.getenv("DB_HOST", "localhost"),
        database=os.getenv("DB_NAME", "prizmagold"),
        user=os.getenv("DB_USER", "postgres"),
        password=os.getenv("DB_PASS", "yousra123")
    )
    conn.autocommit = True
    cur = conn.cursor()

    # Convert to daily prices (use Close as price)
    prices_saved = 0
    for date, row in gold.iterrows():
        try:
            # Ensure we get a scalar value from the Close column
            close_value = row['Close']
            if hasattr(close_value, 'iloc'):
                price_usd = float(close_value.iloc[0])
            else:
                price_usd = float(close_value)
            
            # Approximate EUR conversion (rough estimate, you might want to use actual rates)
            price_eur = price_usd * 0.85  # Rough EUR conversion

            cur.execute("""
                INSERT INTO metal_prices (metal_type, price_usd, price_eur, source_api, raw_response, is_daily_snapshot, recorded_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (metal_type, recorded_at) DO NOTHING
            """, (
                "XAU",
                price_usd,
                price_eur,
                "yfinance_bootstrap",
                psycopg2.extras.Json({"date": date.strftime("%Y-%m-%d"), "close": price_usd}),
                True,
                date
            ))
            prices_saved += 1

        except Exception as e:
            print(f"Error saving price for {date}: {e}")
            print(f"Close value type: {type(row['Close'])}, value: {row['Close']}")

    conn.commit()
    cur.close()
    conn.close()
    print(f"Bootstrapping complete! Saved {prices_saved} historical prices to DB.")
    print("Now switch to production mode: only GoldAPI for daily updates.")

if __name__ == "__main__":
    bootstrap_historical_prices()