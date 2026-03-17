from pydantic import BaseModel


class DoubtOut(BaseModel):
    id: str
    user_id: str
    message: str
    response: str
    confidence: float
    topic: str | None
    mode: str
    sources: list[str]
    escalated: bool
    created_at: str


class EscalatedDoubtOut(BaseModel):
    id: str
    topic: str
    message: str
    student_count: int
    professor_response: str | None
    created_at: str


class ProfessorRespondRequest(BaseModel):
    professor_id: str
    response: str
