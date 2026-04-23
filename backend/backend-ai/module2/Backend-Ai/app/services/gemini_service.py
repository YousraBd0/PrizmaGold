import requests
import json
import re
from io import BytesIO
from dotenv import load_dotenv
import os

load_dotenv()

# List of keywords that indicate a jewelry-related URL
JEWELRY_KEYWORDS = ["diamond", "ring", "necklace", "bracelet", "earring", 
                    "jewelry", "jewel", "gold", "silver", "gem", "pendant"]

def validate_jewelry_image(image_url: str) -> dict:
    url_lower = image_url.lower()
    
    is_jewelry = any(keyword in url_lower for keyword in JEWELRY_KEYWORDS)
    
    if is_jewelry:
        return {"is_jewelry": True, "confidence": "high", "reason": "URL contains jewelry-related keywords"}
    else:
        return {"is_jewelry": False, "confidence": "high", "reason": "Image does not appear to be a jewelry piece"}

def analyze_jewelry_image(image_url: str) -> dict:
    try:
        # Validate first
        validation = validate_jewelry_image(image_url)

        if not validation.get("is_jewelry", False):
            return {
                "error": f"Image rejected — not a jewelry image. Reason: {validation.get('reason')}"
            }

        # Mock analysis response
        return {
            "gemstone_type": "diamond",
            "gemstone_cut": "round",
            "setting_style": "prong",
            "metal_color": "white gold",
            "complexity": "medium",
            "estimated_stones": 1,
            "jewelry_type": "ring",
            "design_notes": "A classic solitaire diamond ring with a round cut stone set in white gold."
        }

    except Exception as e:
        return {"error": str(e)}