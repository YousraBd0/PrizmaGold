import sys
sys.path.insert(0, 'database')
from metal_price_repository import get_connection

conn = get_connection()
cur = conn.cursor()
cur.execute("DELETE FROM metal_prices WHERE source_api = 'yfinance_bootstrap'")
conn.commit()
cur.close()
conn.close()
print('Deleted existing bootstrap data')