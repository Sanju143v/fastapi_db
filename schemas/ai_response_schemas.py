from pydantic import BaseModel

class AIRequest(BaseModel):
    message: str
    system_prompt: str = "You are a helpful assistant."

class AIResponse(BaseModel):
    response: str

class ImageResponse(BaseModel):
    image_url: str
    prompt: str