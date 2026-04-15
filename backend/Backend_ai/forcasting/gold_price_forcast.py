# gold_price_forecast_pro.py — Gold Trading System (Prophet + RSI + MACD + Price Action)
# Usage: pip install prophet pandas numpy matplotlib yfinance pandas_ta
# python gold_price_forecast_pro.py

import os
import warnings
import pandas as pd
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
from prophet import Prophet
import yfinance as yf
import pandas_ta as ta   # Pour RSI, MACD, EMA

warnings.filterwarnings("ignore")

# ========================= CONFIG =========================
OUTPUT_DIR = "data/forecasts"
FORECAST_DAYS = 2 #2 jours pour prédiction de l
HISTORY_DAYS = 730          # 2 ans pour bons indicateurs techniques
GOLD_TICKER = "GC=F"

os.makedirs(OUTPUT_DIR, exist_ok=True)

# Couleurs (comme ton dashboard)
GOLD_COLOR = "#D4AF37"
ACCENT_COLOR = "#C0392B"
BG_COLOR = "#0F1117"
TEXT_COLOR = "#F5F5F5"
GRID_COLOR = "#2A2A3A"
GREEN = "#2ECC71"
RED = "#E74C3C"

# ========================= FETCH REAL DATA =========================
def fetch_gold_data(days: int = HISTORY_DAYS):
    print("─── Récupération des prix réels de l’or ───")
    end = pd.Timestamp.today()
    start = end - pd.Timedelta(days=days + 60)
    
    df = yf.download(GOLD_TICKER, start=start, end=end, progress=False)
    df = df[['Open', 'High', 'Low', 'Close']].reset_index()
    df.columns = ['ds', 'Open', 'High', 'Low', 'y']  # y = Close pour Prophet
    df["ds"] = pd.to_datetime(df["ds"]).dt.tz_localize(None)
    
    print(f"✅ {len(df)} jours chargés | Dernier prix : ${df['y'].iloc[-1]:.2f}")
    return df

# ========================= ADD TECHNICAL INDICATORS =========================
def add_indicators(df: pd.DataFrame) -> pd.DataFrame:
    print("─── Calcul des indicateurs techniques (RSI, MACD, EMA) ───")
    
    # RSI
    df['RSI'] = ta.rsi(df['y'], length=14)
    
    # MACD
    macd = ta.macd(df['y'], fast=12, slow=26, signal=9)
    df['MACD'] = macd['MACD_12_26_9']
    df['MACD_signal'] = macd['MACDs_12_26_9']
    df['MACD_hist'] = macd['MACDh_12_26_9']
    
    # EMAs
    df['EMA50'] = ta.ema(df['y'], length=50)
    df['EMA200'] = ta.ema(df['y'], length=200)
    
    return df

# ========================= PROPHET FORECAST =========================
def run_prophet(df: pd.DataFrame):
    print("─── Entraînement Prophet (tendance globale) ───")
    ts = df[['ds', 'y']].copy()
    
    model = Prophet(
        changepoint_prior_scale=0.05,
        seasonality_prior_scale=10,
        yearly_seasonality=True,
        weekly_seasonality=True,
        interval_width=0.95
    )
    model.fit(ts)
    
    future = model.make_future_dataframe(periods=FORECAST_DAYS)
    forecast = model.predict(future)
    forecast = forecast.merge(ts, on='ds', how='left')
    
    return model, forecast

# ========================= SIGNAL ENGINE =========================
def generate_signals(df: pd.DataFrame, forecast: pd.DataFrame):
    print("─── Génération des signaux BUY/SELL ───")
    
    last_row = df.iloc[-1]
    current_price = last_row['y']
    
    # Prophet trend
    future_fc = forecast[forecast['y'].isna()]
    prophet_trend = "UP" if future_fc['yhat'].iloc[-1] > current_price else "DOWN"
    prophet_change = (future_fc['yhat'].mean() - current_price) / current_price * 100
    
    # Technical conditions
    rsi = last_row['RSI']
    macd_cross_up = last_row['MACD'] > last_row['MACD_signal'] and df['MACD'].iloc[-2] <= df['MACD_signal'].iloc[-2]
    macd_cross_down = last_row['MACD'] < last_row['MACD_signal'] and df['MACD'].iloc[-2] >= df['MACD_signal'].iloc[-2]
    
    above_ema50 = current_price > last_row['EMA50']
    above_ema200 = current_price > last_row['EMA200']
    
    # Simple Breakout (prix > max des 10 derniers highs)
    recent_high = df['High'].iloc[-20:-1].max()
    breakout = current_price > recent_high * 1.005  # 0.5% au-dessus
    
    # Simple Double Top detection (basique : deux pics proches dans les 30 derniers jours)
    recent = df.iloc[-40:]
    peaks = recent[recent['High'] == recent['High'].rolling(5, center=True).max()]
    if len(peaks) >= 2:
        p1 = peaks.iloc[-2]['High']
        p2 = peaks.iloc[-1]['High']
        double_top = abs(p1 - p2) / p1 < 0.015 and p2 < current_price * 0.99  # deux tops proches + prix en baisse
    else:
        double_top = False
    
    # === COMBINE SIGNALS ===
    score = 0
    reasons = []
    
    if prophet_trend == "UP":
        score += 2
        reasons.append("Prophet : tendance haussière")
    else:
        score -= 2
        reasons.append("Prophet : tendance baissière")
    
    if rsi < 35:
        score += 2
        reasons.append("RSI oversold (<35)")
    elif rsi > 65:
        score -= 2
        reasons.append("RSI overbought (>65)")
    
    if macd_cross_up:
        score += 2
        reasons.append("MACD Golden Cross")
    elif macd_cross_down:
        score -= 2
        reasons.append("MACD Death Cross")
    
    if above_ema50 and above_ema200:
        score += 1
        reasons.append("Prix au-dessus des EMAs")
    elif not above_ema200:
        score -= 1
        reasons.append("Prix sous EMA200")
    
    if breakout:
        score += 3
        reasons.append("Breakout haussier détecté")
    if double_top:
        score -= 3
        reasons.append("Double Top baissier détecté")
    
    # Final Signal
    if score >= 6:
        signal = "STRONG BUY"
        color = GREEN
    elif score >= 3:
        signal = "BUY"
        color = GREEN
    elif score <= -6:
        signal = "STRONG SELL"
        color = RED
    elif score <= -3:
        signal = "SELL"
        color = RED
    else:
        signal = "NEUTRAL / HOLD"
        color = "#F1C40F"
    
    print(f"\n{'='*70}")
    print(f"PRIX ACTUEL          : ${current_price:,.2f}")
    print(f"PRÉVISION PROPHET    : {prophet_change:+.1f}% sur 90 jours ({prophet_trend})")
    print(f"SIGNAL FINAL         : {signal}")
    print(f"Score technique      : {score}")
    print(f"Raisons principales  : {', '.join(reasons[:4])}")
    print(f"{'='*70}")
    
    return {
        "signal": signal,
        "score": score,
        "current_price": current_price,
        "prophet_change": prophet_change,
        "reasons": reasons
    }

# ========================= PLOTTING (avec indicateurs) =========================
def plot_with_indicators(df: pd.DataFrame, forecast: pd.DataFrame, signal_info):
    output_path = f"{OUTPUT_DIR}/gold_pro_forecast.png"
    
    fig, axs = plt.subplots(3, 1, figsize=(15, 10), height_ratios=[3, 1, 1], sharex=True)
    fig.patch.set_facecolor(BG_COLOR)
    
    # Price + Forecast
    ax1 = axs[0]
    hist = forecast[forecast['y'].notna()]
    future = forecast[forecast['y'].isna()]
    
    ax1.plot(hist['ds'], hist['y'], color=GOLD_COLOR, linewidth=2, label="Prix réel")
    ax1.plot(future['ds'], future['yhat'], color=ACCENT_COLOR, linewidth=2.5, label="Forecast Prophet")
    ax1.fill_between(future['ds'], future['yhat_lower'], future['yhat_upper'], color=ACCENT_COLOR, alpha=0.25)
    
    ax1.set_title(f"PrizmaGold Pro — Gold Forecast + BUY/SELL Signal ({signal_info['signal']})", color=TEXT_COLOR, fontsize=14, pad=20)
    ax1.set_ylabel("Prix Or (USD)", color=TEXT_COLOR)
    ax1.legend(facecolor="#1A1A2E", labelcolor=TEXT_COLOR)
    
    # RSI
    ax2 = axs[1]
    ax2.plot(df['ds'], df['RSI'], color="#9B59B6", label="RSI (14)")
    ax2.axhline(70, color=RED, linestyle="--", alpha=0.7)
    ax2.axhline(30, color=GREEN, linestyle="--", alpha=0.7)
    ax2.set_ylabel("RSI", color=TEXT_COLOR)
    ax2.legend()
    
    # MACD
    ax3 = axs[2]
    ax3.plot(df['ds'], df['MACD'], color="#3498DB", label="MACD")
    ax3.plot(df['ds'], df['MACD_signal'], color="#E67E22", label="Signal")
    ax3.bar(df['ds'], df['MACD_hist'], color=[GREEN if x > 0 else RED for x in df['MACD_hist']], alpha=0.6, width=1)
    ax3.axhline(0, color=GRID_COLOR, linewidth=0.8)
    ax3.set_ylabel("MACD", color=TEXT_COLOR)
    ax3.legend()
    
    for ax in axs:
        ax.set_facecolor(BG_COLOR)
        ax.tick_params(colors=TEXT_COLOR)
        ax.grid(True, color=GRID_COLOR, alpha=0.5)
    
    plt.tight_layout()
    plt.savefig(output_path, dpi=150, bbox_inches="tight", facecolor=BG_COLOR)
    plt.close()
    print(f"📊 Graphique complet sauvegardé → {output_path}")

# ========================= MAIN =========================
def run_pro_system():
    print("🚀 PrizmaGold Pro — AI Trading System (Gold)\n")
    
    df = fetch_gold_data()
    df = add_indicators(df)
    
    model, forecast = run_prophet(df)
    
    signal_info = generate_signals(df, forecast)
    
    plot_with_indicators(df, forecast, signal_info)
    
    # Export CSV
    forecast.to_csv(f"{OUTPUT_DIR}/forecast_gold_pro.csv", index=False)
    
    print("\n✅ Système terminé !")
    print(f"   Signal généré : **{signal_info['signal']}**")
    print(f"   Fichiers dans → {OUTPUT_DIR}/")

if __name__ == "__main__":
    run_pro_system()