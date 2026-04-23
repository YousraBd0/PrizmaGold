from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.gemini_service import analyze_jewelry_image

router = APIRouter()

class ImageRequest(BaseModel):
    image_url: str

@router.post("/analyze")
def analyze(request: ImageRequest):
    if not request.image_url:
        raise HTTPException(status_code=400, detail="image_url is required")
    
    result = analyze_jewelry_image(request.image_url)
    
    if "error" in result:
        if "not a jewelry image" in result["error"]:
            raise HTTPException(status_code=400, detail=result["error"])
        raise HTTPException(status_code=500, detail=result["error"])
    
    return result