import pandas as pd
import yfinance as yf

end = pd.Timestamp.today()
start = end - pd.Timedelta(days=5 + 60)

df = yf.download("GC=F", start=start, end=end, progress=False)

# Look at multiindex
print("Raw df columns:")
print(df.columns)

df = df[['Open', 'High', 'Low', 'Close']].reset_index()
print("After selecting columns and reset_index:")
print(df.columns)

df.columns = ['ds', 'Open', 'High', 'Low', 'y']
df["ds"] = pd.to_datetime(df["ds"]).dt.tz_localize(None)

print(df.tail())

print("\nAdding DB row...")
# Mock DB recorded at today 9:17
rec_date = pd.Timestamp("2026-04-17 00:00:00")
price = 2114.07
new_row = pd.DataFrame([{
    'ds': rec_date,
    'Open': float(price),
    'High': float(price),
    'Low': float(price),
    'y': float(price)
}])

df = pd.concat([df, new_row], ignore_index=True)

df['ds_date'] = df['ds'].dt.date
print("\nBefore drop dups ds_date:")
print(df[['ds', 'y', 'ds_date']].tail(5))

df = df.drop_duplicates(subset=['ds_date'], keep='last').drop(columns=['ds_date'])

df = df.sort_values(by='ds').reset_index(drop=True)
print("\nAfter sort and drop:")
print(df.tail(5))
