from pydantic import BaseModel


class SyllabusOut(BaseModel):
    id: str
    subject: str
    filename: str
    status: str
    uploaded_at: str
