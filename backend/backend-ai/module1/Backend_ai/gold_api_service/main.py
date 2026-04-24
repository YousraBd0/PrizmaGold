from fastapi import FastAPI
from config import add_cors
from controller import router
from scheduler import start_scheduler

app = FastAPI(title="PrizmaGold API")

add_cors(app)
app.include_router(router)
scheduler = start_scheduler()

@app.on_event("shutdown")
def shutdown_scheduler():
    scheduler.shutdown()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8002, reload=True)