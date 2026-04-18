import sys
import os
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(BASE_DIR, 'forcasting'))

from apscheduler.schedulers.background import BackgroundScheduler
from service import fetch_and_save
from gold_price_forcast import run_pro_system

def collect_daily_price():
    try:
        saved = fetch_and_save()
        print(f"✅ Daily Gold price saved: ${saved['price_usd']}")
    except Exception as e:
        print(f"❌ Daily price fetch failed: {e}")

def run_forecast_job():
    try:
        print("🚀 Lancement de la prédiction Prophet (Job tous les 2 jours)...")
        run_pro_system()
        print("✅ Prédiction terminée.")
    except Exception as e:
        print(f"❌ Forecast job failed: {e}")

def start_scheduler():
    scheduler = BackgroundScheduler()
    
    # 1. Sauvegarde du prix tous les jours à 9h00
    scheduler.add_job(collect_daily_price, "cron", hour=9, minute=0)
    
    # 2. Lancement des prévisions TOUS LES JOURS à 9h05
    # (Exécution quotidienne pour une meilleure précision)
    scheduler.add_job(run_forecast_job, "cron", hour=9, minute=5)
    
    scheduler.start()
    return scheduler