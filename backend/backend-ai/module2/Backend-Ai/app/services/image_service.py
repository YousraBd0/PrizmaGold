import requests

JEWELRY_KEYWORDS = [
    "ring", "necklace", "bracelet", "earring", "brooch", "pendant",
    "diamond", "ruby", "emerald", "sapphire", "gemstone", "gem",
    "gold", "silver", "platinum", "rose gold", "white gold",
    "jewelry", "jewel", "luxury", "solitaire", "pave", "prong",
    "chain", "bangle", "choker", "tiara", "crown"
]

def validate_jewelry_prompt(prompt: str) -> dict:
    prompt_lower = prompt.lower()
    matched = [kw for kw in JEWELRY_KEYWORDS if kw in prompt_lower]

    if len(matched) == 0:
        return {
            "is_valid": False,
            "reason": "Prompt does not appear to be about luxury jewelry."
        }

    return {
        "is_valid": True,
        "reason": f"Valid jewelry prompt. Matched keywords: {', '.join(matched)}"
    }


def generate_jewelry_image(prompt: str) -> dict:
    validation = validate_jewelry_prompt(prompt)

    if not validation["is_valid"]:
        return {"error": validation["reason"]}

    enhanced_prompt = f"3D render, luxury jewelry, {prompt}, photorealistic, elegant, ultra high quality, white background, professional studio lighting, 8k, ray tracing, highly detailed"

    # Try Pollinations first
    try:
        encoded_prompt = requests.utils.quote(enhanced_prompt)
        image_url = f"https://image.pollinations.ai/prompt/{encoded_prompt}?width=1024&height=1024&nologo=true&model=flux&seed={hash(prompt) % 9999}"

        # Test if Pollinations is reachable
        test = requests.get(image_url, timeout=10)
        if test.status_code == 200:
            return {
                "image_url": image_url,
                "prompt_used": enhanced_prompt,
                "original_prompt": prompt
            }
    except Exception:
        pass

    # Fallback — use Lexica (real jewelry images)
    try:
        search_url = f"https://lexica.art/api/v1/search?q={requests.utils.quote(prompt)}"
        res = requests.get(search_url, timeout=10)
        if res.status_code == 200:
            images = res.json().get("images", [])
            if images:
                return {
                    "image_url": images[0]["src"],
                    "prompt_used": enhanced_prompt,
                    "original_prompt": prompt
                }
    except Exception:
        pass

    # Last fallback
    return {
        "image_url": f"https://picsum.photos/seed/{hash(prompt) % 9999}/1024/1024",
        "prompt_used": enhanced_prompt,
        "original_prompt": prompt
    }