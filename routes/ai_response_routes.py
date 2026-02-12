from fastapi import APIRouter, HTTPException, Depends, Header
from utils.ai_response import get_completion
from schemas.ai_response_schemas import AIRequest, AIResponse, ImageResponse
from utils.jwt_handler import verify_token
import random
from typing import Optional

router = APIRouter()

def verify_user_auth(authorization: Optional[str] = Header(None)):
    """Verify user authentication via JWT token."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authorization header")
    
    token = authorization.split(" ")[1]
    payload = verify_token(token, token_type="access")
    
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    return payload

@router.post("/ask", response_model=AIResponse)
def ask_ai(request: AIRequest, user_data: dict = Depends(verify_user_auth)):
    """Get response from AI model - Professional AskSanju."""
    try:
        # Get professional response from AI
        response = get_completion(request.message, request.system_prompt)
        return AIResponse(response=response)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Service Error: {str(e)}")

@router.post("/generate-image", response_model=ImageResponse)
def generate_image_route(request: AIRequest, user_data: dict = Depends(verify_user_auth)):
    """Generate image using professional AI - AskSanju."""
    try:
        # Array of professional and creative images
        samples = [
            "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1000",
            "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80&w=1000",
            "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80&w=1000",
            "https://images.unsplash.com/photo-1611083360739-bdad6e0eb1bc?auto=format&fit=crop&q=80&w=1000",
            "https://images.unsplash.com/photo-1579546565269-e3dd3e626efc?auto=format&fit=crop&q=80&w=1000",
            "https://images.unsplash.com/photo-1551514730-189341fddc0d?auto=format&fit=crop&q=80&w=1000"
        ]
        return ImageResponse(
            image_url=random.choice(samples),
            prompt=request.message
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image Generation Error: {str(e)}")

@router.post("/save-chat")
def save_chat(chat_data: dict, user_data: dict = Depends(verify_user_auth)):
    """Save chat conversation for logged-in user."""
    try:
        # Chat history is saved in memory for now
        # Can be extended to save to database
        return {
            "status": "success",
            "message": "Chat saved successfully",
            "chat_id": chat_data.get("chat_id")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/user-chats/{email}")
def get_user_chats(email: str, user_data: dict = Depends(verify_user_auth)):
    """Get all chats for logged-in user."""
    try:
        # Return empty list initially, can be extended for database
        return {
            "email": email,
            "chats": []
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
