from pydantic import BaseModel, Field
from typing import Optional

class MessageRequest(BaseModel):
    id: str = Field(..., description="Message ID")
    prompt: str = Field(..., description="User message/prompt")
    username: str = Field(..., description="Username")
    conversation_id: str = Field(..., description="Conversation ID")