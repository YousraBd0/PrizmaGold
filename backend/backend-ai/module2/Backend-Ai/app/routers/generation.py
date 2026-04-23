from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.image_service import generate_jewelry_image

router = APIRouter()

class PromptRequest(BaseModel):
    prompt: str

@router.post("/generate")
def generate(request: PromptRequest):
    if not request.prompt:
        raise HTTPException(status_code=400, detail="prompt is required")

    result = generate_jewelry_image(request.prompt)

    if "error" in result:
        if "does not appear to be about luxury jewelry" in result["error"]:
            raise HTTPException(status_code=400, detail=result["error"])
        raise HTTPException(status_code=500, detail=result["error"])

    return result