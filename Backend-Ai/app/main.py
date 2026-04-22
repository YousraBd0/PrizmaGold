from fastapi import FastAPI
from app.routers import analysis
from app.routers import generation

app = FastAPI(title="PrizmaGold AI Service", version="1.0.0")

app.include_router(analysis.router, prefix="/api", tags=["Analysis"])
app.include_router(generation.router, prefix="/api", tags=["Generation"])

@app.get("/")
def root():
    return {"message": "PrizmaGold AI Microservice is running"}