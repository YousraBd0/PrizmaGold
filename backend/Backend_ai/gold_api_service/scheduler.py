from apscheduler.schedulers.background import BackgroundScheduler
from service import fetch_and_save

def collect_daily_price():
    try:
        saved = fetch_and_save()
        print(f"✅ Gold price saved: ${saved['price_usd']}")
    except Exception as e:
        print(f"❌ Scheduler failed: {e}")

def start_scheduler():
    scheduler = BackgroundScheduler()
    scheduler.add_job(collect_daily_price, "cron", hour=9, minute=0)
    scheduler.start()
    return scheduler