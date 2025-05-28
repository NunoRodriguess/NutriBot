from pydantic import BaseModel, Field
from typing import Any, Dict, List, Literal

class Message(BaseModel):
    role: Literal["user", "bot"]
    text: str


class UserModel(BaseModel):
    conversation: List[Message]
    personal_info: Dict[str, Any]
