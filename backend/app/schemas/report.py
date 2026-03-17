from pydantic import BaseModel


class ReportOut(BaseModel):
    id: str
    week: str
    total_doubts: int
    weak_topics: list[str]
    strong_topics: list[str]
    improvement_score: int
    summary: str | None
    suggestions: list[str]
    created_at: str
