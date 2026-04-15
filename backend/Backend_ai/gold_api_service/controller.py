import os
import sys

# Chemin absolu vers database/
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(BASE_DIR, 'database'))

from fastapi import APIRouter, HTTPException
from metal_price_repository import find_top10_by_recorded_at_desc
from service import fetch_and_save

router = APIRouter(prefix="/api/prices")

@router.post("/save")
def save_price():
    try:
        saved = fetch_and_save()
        return saved
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"GoldAPI error: {str(e)}")

@router.get("/latest")
def get_latest():
    return find_top10_by_recorded_at_desc()