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

import sys
# Chemin absolu vers database/
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(BASE_DIR, 'database'))

from forecast_repository import save_forecast, save_advisory_log

warnings.filterwarnings("ignore")

# ========================= CONFIG =========================
OUTPUT_DIR = "data/forecasts"
FORECAST_DAYS = 2 #2 jours pour prédiction de l
HISTORY_DAYS = 365          # 1 year for now
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

# ========================= FETCH DATA FROM DB ONLY =========================
def fetch_gold_data_from_db(days: int = HISTORY_DAYS):
    print("─── Récupération des prix depuis la Base de Données ───")
    from metal_price_repository import find_by_metal_type_daily_snapshot

    prices = find_by_metal_type_daily_snapshot("XAU")

    if not prices:
        print("❌ Aucune donnée dans la DB. Lancez d'abord le bootstrap avec yFinance.")
        return pd.DataFrame()

    # Convert to DataFrame
    df = pd.DataFrame(prices)
    print(f"Raw data from DB: {len(df)} records")
    print(f"Sample record: {df.iloc[0] if len(df) > 0 else 'No data'}")
    
    df['ds'] = pd.to_datetime(df['recorded_at']).dt.tz_localize(None).dt.date
    df['y'] = df['price_usd']
    df['Open'] = df['y']  # Approximation
    df['High'] = df['y']  # Approximation
    df['Low'] = df['y']   # Approximation

    print(f"After conversion: {len(df)} records")
    print(f"Date range: {df['ds'].min()} to {df['ds'].max()}")
    
    # Clean data: remove NaN values and duplicates
    df = df.dropna(subset=['y', 'ds'])
    df = df[df['y'] > 0]  # Remove invalid prices
    df = df.sort_values('ds').drop_duplicates(subset=['ds'], keep='last')
    
    print(f"After cleaning: {len(df)} records")
    
    # Sort and get last N days
    df = df.tail(days).reset_index(drop=True)
    df['ds'] = pd.to_datetime(df['ds'])  # Convert back to datetime for Prophet

    print(f"Final dataset: {len(df)} records")

    print(f"✅ {len(df)} jours chargés depuis DB | Dernier prix : ${df['y'].iloc[-1]:.2f}")
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
    
    # Ensure we have enough data
    if len(df) < 30:
        raise ValueError("Not enough data for Prophet training. Need at least 30 days.")
    
    ts = df[['ds', 'y']].copy()
    
    # Final data validation
    ts = ts.dropna()
    if ts.empty:
        raise ValueError("No valid data after cleaning.")
    
    print(f"Training Prophet with {len(ts)} data points...")
    
    model = Prophet(
        changepoint_prior_scale=0.05,
        seasonality_prior_scale=10,
        yearly_seasonality=True,
        weekly_seasonality=True,
        interval_width=0.95
    )
    
    try:
        model.fit(ts)
    except Exception as e:
        print(f"Prophet fitting failed: {e}")
        # Try with simpler model
        print("Trying with simpler Prophet configuration...")
        model = Prophet(
            changepoint_prior_scale=0.1,
            seasonality_prior_scale=1,
            yearly_seasonality=False,
            weekly_seasonality=False,
            interval_width=0.95
        )
        model.fit(ts)
    
    future = model.make_future_dataframe(periods=FORECAST_DAYS)
    forecast = model.predict(future)
    forecast = forecast.merge(ts, on='ds', how='left')
    
    return model, forecast

# ========================= AI CONFIDENCE CALCULATION =========================
def calculate_ai_confidence(df: pd.DataFrame, forecast: pd.DataFrame, model):
    """
    Calculate AI confidence based on:
    - Prophet model error (MAE/RMSE)
    - Data stability (price volatility)
    - Trend consistency (how well Prophet fits recent trend)
    """
    try:
        # 1. Prophet Model Error (MAE/RMSE on historical data)
        hist_forecast = forecast[forecast['y'].notna()].copy()
        hist_forecast['y'] = hist_forecast['y'].astype(float)
        if len(hist_forecast) > 30:  # Need enough data
            mae = abs(hist_forecast['y'] - hist_forecast['yhat']).mean()
            rmse = ((hist_forecast['y'] - hist_forecast['yhat']) ** 2).mean() ** 0.5
            mean_price = hist_forecast['y'].mean()
            error_ratio = (mae / mean_price) * 100  # Error as percentage of price
            prophet_accuracy = max(0, 100 - error_ratio * 2)  # Scale to 0-100
        else:
            prophet_accuracy = 70  # Default if not enough data

        # 2. Data Stability (lower volatility = higher confidence)
        recent_prices = df['y'].tail(30).astype(float)
        if len(recent_prices) > 1:
            volatility = recent_prices.std() / recent_prices.mean() * 100
            stability_score = max(0, 100 - volatility * 10)  # Lower volatility = higher score
        else:
            stability_score = 80

        # 3. Trend Consistency (how well Prophet captures recent trend)
        recent_actual = df['y'].tail(10).astype(float).values
        recent_predicted = hist_forecast['yhat'].tail(10).values
        if len(recent_actual) == len(recent_predicted):
            trend_correlation = np.corrcoef(recent_actual, recent_predicted)[0, 1]
            trend_consistency = (trend_correlation + 1) * 50  # Convert -1,1 to 0,100
        else:
            trend_consistency = 75

        # Weighted average
        confidence = (prophet_accuracy * 0.5 + stability_score * 0.3 + trend_consistency * 0.2)
        confidence = round(min(100, max(0, confidence)), 1)

        print(f"🤖 AI Confidence: {confidence}%")
        print(f"   Prophet Accuracy: {prophet_accuracy:.1f}%")
        print(f"   Data Stability: {stability_score:.1f}%")
        print(f"   Trend Consistency: {trend_consistency:.1f}%")

        return confidence

    except Exception as e:
        print(f"⚠️ Error calculating confidence: {e}")
        return 75.0  # Default confidence

# ========================= SIGNAL ENGINE =========================
def generate_signals(df: pd.DataFrame, forecast: pd.DataFrame, model):
    print("─── Génération des signaux BUY/SELL ───")
    
    last_row = df.iloc[-1]
    current_price = float(last_row['y'])
    
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
    recent_high = float(df['High'].iloc[-20:-1].max())
    breakout = current_price > recent_high * 1.005  # 0.5% au-dessus
    
    # Simple Double Top detection (basique : deux pics proches dans les 30 derniers jours)
    recent = df.iloc[-40:]
    peaks = recent[recent['High'] == recent['High'].rolling(5, center=True).max()]
    if len(peaks) >= 2:
        p1 = float(peaks.iloc[-2]['High'])
        p2 = float(peaks.iloc[-1]['High'])
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
    
    # Calculate AI confidence
    confidence = calculate_ai_confidence(df, forecast, model)
    
    print(f"\n{'='*70}")
    print(f"PRIX ACTUEL          : ${current_price:,.2f}")
    print(f"PRÉVISION PROPHET    : {prophet_change:+.1f}% sur 2 jours ({prophet_trend})")
    print(f"SIGNAL FINAL         : {signal}")
    print(f"Score technique      : {score}")
    print(f"AI CONFIDENCE        : {confidence}%")
    print(f"Raisons principales  : {', '.join(reasons[:4])}")
    print(f"{'='*70}")
    
    return {
        "signal": signal,
        "score": score,
        "current_price": current_price,
        "prophet_change": prophet_change,
        "confidence": confidence,
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
    
    df = fetch_gold_data_from_db()
    if df.empty:
        print("❌ No historical data found. Please run bootstrap first.")
        return
        
    df = add_indicators(df)
    
    model, forecast = run_prophet(df)
    
    signal_info = generate_signals(df, forecast, model)
    
    plot_with_indicators(df, forecast, signal_info)
    
    # Export CSV
    forecast.to_csv(f"{OUTPUT_DIR}/forecast_gold_pro.csv", index=False)
    
    # Save to Database
    print("\n─── Sauvegarde en Base de Données ───")
    training_end_date = df['ds'].iloc[-1].date()
    
    # Save future forecasts
    future_fc = forecast[forecast['y'].isna()]
    last_forecast_id = None
    for _, row in future_fc.iterrows():
        f_id = save_forecast(
            metal_type="XAU",
            forecast_date=row['ds'].date(),
            yhat=float(row['yhat']),
            yhat_lower=float(row['yhat_lower']),
            yhat_upper=float(row['yhat_upper']),
            training_end_date=training_end_date
        )
        if last_forecast_id is None:
            last_forecast_id = f_id

    # Compute volatility ratio safely
    volatility = 0.0
    if future_fc['yhat'].iloc[-1] != 0:
        volatility = float((future_fc['yhat_upper'].iloc[-1] - future_fc['yhat_lower'].iloc[-1]) / future_fc['yhat'].iloc[-1])

    if last_forecast_id:
        save_advisory_log(
            forecast_id=last_forecast_id,
            metal_type="XAU",
            recommendation=signal_info['signal'],
            change_pct=float(signal_info['prophet_change']),
            volatility_ratio=volatility,
            current_price=float(signal_info['current_price']),
            predicted_price=float(future_fc['yhat'].iloc[-1]),
            reasoning=" | ".join(signal_info['reasons'])
        )
    
    print("\n✅ Système terminé et sauvegardé en BD !")
    print(f"   Signal généré : **{signal_info['signal']}**")
    print(f"   Fichiers dans → {OUTPUT_DIR}/")

if __name__ == "__main__":
    run_pro_system()