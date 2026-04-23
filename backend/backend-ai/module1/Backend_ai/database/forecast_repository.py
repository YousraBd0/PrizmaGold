# database/forecast_repository.py

import psycopg2
import psycopg2.extras
from datetime import datetime, date

DB_CONFIG = {
    "host"     : "localhost",
    "database" : "prizmagold",
    "user"     : "postgres",
    "password" : "yousra123",
    "port"     : 5432,
    "options"  : "-c client_encoding=UTF8"
}

def get_connection():
    return psycopg2.connect(**DB_CONFIG)

def save_forecast(metal_type: str, forecast_date: date, yhat: float, yhat_lower: float, yhat_upper: float, training_end_date: date) -> int:
    conn = get_connection()
    cur  = conn.cursor()
    cur.execute("""
        INSERT INTO forecasts
            (metal_type, forecast_date, generated_at, yhat, yhat_lower, yhat_upper, training_end_date)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        RETURNING forecast_id;
    """, (
        metal_type,
        forecast_date,
        datetime.utcnow(),
        yhat,
        yhat_lower,
        yhat_upper,
        training_end_date
    ))
    forecast_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()
    return forecast_id

def save_advisory_log(forecast_id: int, metal_type: str, recommendation: str, change_pct: float, volatility_ratio: float, current_price: float, predicted_price: float, reasoning: str, confidence: float) -> int:
    conn = get_connection()
    cur  = conn.cursor()
    cur.execute("""
        INSERT INTO advisory_logs
            (user_id, forecast_id, metal_type, recommendation, change_pct, volatility_ratio, current_price, predicted_price, reasoning, confidence, generated_at)
        VALUES (NULL, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        RETURNING advisory_id;
    """, (
        forecast_id,
        metal_type,
        recommendation,
        change_pct,
        volatility_ratio,
        current_price,
        predicted_price,
        reasoning,
        confidence,
        datetime.utcnow()
    ))
    advisory_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()
    return advisory_id

def get_latest_advisory_with_accuracy(metal_type: str):
    conn = get_connection()
    cur  = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    
    # 1. Fetch latest advisory log
    cur.execute("""
        SELECT advisory_id, forecast_id, metal_type, recommendation, change_pct, volatility_ratio, current_price, predicted_price, reasoning, confidence, generated_at
        FROM advisory_logs
        WHERE metal_type = %s
        ORDER BY generated_at DESC
        LIMIT 1;
    """, (metal_type,))
    latest_advisory = cur.fetchone()
    
    if not latest_advisory:
        cur.close()
        conn.close()
        return None
    
    # 2. Fetch the past 5 days of forecasts and correlate with actual prices
    cur.execute("""
        SELECT DISTINCT ON (f.forecast_date)
            f.forecast_date, 
            f.yhat as ai_price, 
            mp.price_usd as actual_price
        FROM forecasts f
        LEFT JOIN (
            SELECT DATE(recorded_at) as rec_date, AVG(price_usd) as price_usd
            FROM metal_prices
            WHERE metal_type = %s
            GROUP BY DATE(recorded_at)
        ) mp ON f.forecast_date = mp.rec_date
        WHERE f.metal_type = %s
        ORDER BY f.forecast_date DESC, f.generated_at DESC
        LIMIT 5;
    """, (metal_type, metal_type))
    
    forecast_data_rows = cur.fetchall()
    
    cur.close()
    conn.close()
    
    forecast_data = []
    # Sort chronologically
    for row in reversed(forecast_data_rows):
        # We handle None for actual if it's in the future
        actual = float(row['actual_price']) if row['actual_price'] is not None else None
        
        forecast_data.append({
            "day": row['forecast_date'].strftime("%a"), # e.g. 'Mon', 'Tue'
            "ai": float(row['ai_price']),
            "actual": actual
        })

    return {
        "generated_at": latest_advisory["generated_at"],
        "signal": latest_advisory["recommendation"],
        "score": float(latest_advisory["confidence"]) if latest_advisory["confidence"] else 75.0,
        "current_price": float(latest_advisory["current_price"]),
        "target_price": float(latest_advisory["predicted_price"]),
        "prophet_change": float(latest_advisory["change_pct"]),
        "reasons": latest_advisory["reasoning"].split(" | ") if latest_advisory["reasoning"] else [],
        "forecastData": forecast_data
    }
