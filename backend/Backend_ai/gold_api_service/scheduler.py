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
        print(f"✅ Gold price saved: ${saved['price_usd']}")
        # Lancer la prédiction Pro juste après la récupération du prix
        print("Lancement de la prédiction Prophet...")
        run_pro_system()
    except Exception as e:
        print(f"❌ Scheduler failed: {e}")

def start_scheduler():
    scheduler = BackgroundScheduler()
    scheduler.add_job(collect_daily_price, "cron", hour=9, minute=0)
    scheduler.start()
    return scheduler