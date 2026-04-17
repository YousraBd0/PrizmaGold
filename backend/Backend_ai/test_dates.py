import pandas as pd
import yfinance as yf

df = yf.download("GC=F", period="5d", progress=False)
df = df[['Open', 'High', 'Low', 'Close']].reset_index()
df.columns = ['ds', 'Open', 'High', 'Low', 'y']
print("Raw yf ds:")
print(df['ds'].head(2))
df["ds"] = pd.to_datetime(df["ds"]).dt.tz_localize(None)
print("After tz_localize(None):")
print(df['ds'].head(2))

rec_date = pd.Timestamp("2026-04-17 00:00:00")
new_row = pd.DataFrame([{'ds': rec_date, 'y': 2114.07}])
df = pd.concat([df, new_row], ignore_index=True)

df['ds_date'] = df['ds'].dt.date
print("Merged ds dates:")
print(df[['ds', 'ds_date', 'y']].tail())

df = df.drop_duplicates(subset=['ds_date'], keep='last').drop(columns=['ds_date'])
df = df.sort_values(by='ds').reset_index(drop=True)
print("After drop_dup and sort:")
print(df[['ds', 'y']].tail())
