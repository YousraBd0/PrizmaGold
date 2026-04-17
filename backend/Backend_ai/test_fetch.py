import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'database'))
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'forcasting'))

import gold_price_forcast
df = gold_price_forcast.fetch_gold_data(5)
print(df.tail())
