from fastapi import APIRouter, HTTPException
from utils.ai_response import get_completion
from schemas.ai_response_schemas import AIRequest, AIResponse, ImageResponse
import random

router = APIRouter()


@router.post("/ask", response_model=AIResponse)
def ask_ai(request: AIRequest):
    """Get response from AI model."""
    try:
        response = get_completion(request.message, request.system_prompt)
        return AIResponse(response=response)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate-image", response_model=ImageResponse)
def generate_image_route(request: AIRequest):
    """Simulate image generation."""
    try:
        # Array of creative sample images for the professional AskSanju demo
        samples = [
            "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1000",
            "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80&w=1000",
            "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80&w=1000",
            "https://images.unsplash.com/photo-1611083360739-bdad6e0eb1bc?auto=format&fit=crop&q=80&w=1000"
        ]
        return ImageResponse(
            image_url=random.choice(samples),
            prompt=request.message
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))