import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'database'))
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'forcasting'))

import gold_price_forcast
df = gold_price_forcast.fetch_gold_data(730)
df = gold_price_forcast.add_indicators(df)
print("Last 3 rows after indicators:")
print(df[['ds', 'y']].tail(3))
model, forecast = gold_price_forcast.run_prophet(df)
print("Forecast last 5 rows:")
print(forecast[['ds', 'yhat']].tail(5))

signal_info = gold_price_forcast.generate_signals(df, forecast)
print("Signal Info:", signal_info)
