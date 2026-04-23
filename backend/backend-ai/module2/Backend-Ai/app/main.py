from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import analysis
from app.routers import generation

app = FastAPI(title="PrizmaGold AI Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analysis.router, prefix="/api", tags=["Analysis"])
app.include_router(generation.router, prefix="/api", tags=["Generation"])

@app.get("/")
def root():
    return {"message": "PrizmaGold AI Microservice is running"}