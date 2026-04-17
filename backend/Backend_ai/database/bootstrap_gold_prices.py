# bootstrap_gold_prices.py
# Phase 1: Bootstrapping - Fill DB with historical gold prices from yFinance (ONE TIME)

import os
import sys
import pandas as pd
import yfinance as yf
from datetime import datetime, timedelta

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
    end_date = datetime.now()
    start_date = end_date - timedelta(days=365)  # 1 year instead of 2
    
    print(f"Fetching data from {start_date.date()} to {end_date.date()}...")
    
    # Try different tickers if GC=F doesn't work
    tickers = ["GC=F", "Gold", "GLD"]
    gold = None
    
    for ticker in tickers:
        try:
            print(f"Trying ticker: {ticker}")
            gold = yf.download(ticker, start=start_date, end=end_date, progress=False)
            if not gold.empty:
                print(f"Success with ticker: {ticker}")
                break
        except Exception as e:
            print(f"Failed with {ticker}: {e}")
            continue
    
    if gold is None or gold.empty:
        print("No data received from yFinance with any ticker")
        return

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

            save_metal_price(
                metal_type="XAU",
                price_usd=price_usd,
                price_eur=price_eur,
                source_api="yfinance_bootstrap",
                raw_response={"date": date.strftime("%Y-%m-%d"), "close": price_usd},
                is_daily_snapshot=True,
                recorded_at=date  # Set the historical date as recorded_at
            )
            prices_saved += 1

        except Exception as e:
            print(f"Error saving price for {date}: {e}")
            print(f"Close value type: {type(row['Close'])}, value: {row['Close']}")

    print(f"Bootstrapping complete! Saved {prices_saved} historical prices to DB.")
    print("Now switch to production mode: only GoldAPI for daily updates.")

if __name__ == "__main__":
    bootstrap_historical_prices()