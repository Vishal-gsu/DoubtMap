from pydantic import BaseModel


class ChatRequest(BaseModel):
    user_id: str
    message: str
    subject: str | None = None
    mode: str = "socratic"  # "socratic" | "direct"


class ChatResponse(BaseModel):
    response: str
    confidence: float
    sources: list[str]
    mode: str
    doubt_id: str
    topic_detected: str
