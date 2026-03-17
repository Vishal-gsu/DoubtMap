from sqlalchemy import Column, String, Integer, Float, Text, DateTime, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship, declarative_base
from datetime import datetime
import uuid

Base = declarative_base()


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    clerk_id = Column(String, unique=True, nullable=False, index=True)
    email = Column(String, nullable=False)
    name = Column(String, nullable=False)
    role = Column(String, nullable=False, default="student")  # "student" | "professor"
    created_at = Column(DateTime, default=datetime.utcnow)


class Doubt(Base):
    __tablename__ = "doubts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(String, nullable=False, index=True)       # clerk_id
    message = Column(Text, nullable=False)                      # student's question
    response = Column(Text, nullable=False)                     # AI's answer
    subject = Column(String, nullable=True)                     # e.g., "Data Structures"
    topic_detected = Column(String, nullable=True)              # e.g., "Binary Trees"
    confidence = Column(Float, nullable=False, default=0.0)     # 0.0 to 1.0
    sources = Column(Text, nullable=True)                       # JSON array of source refs
    mode = Column(String, default="socratic")                   # "socratic" | "direct"
    escalated = Column(Boolean, default=False)                  # True if confidence < 0.5
    professor_response = Column(Text, nullable=True)            # Professor's manual answer
    created_at = Column(DateTime, default=datetime.utcnow)


class Report(Base):
    __tablename__ = "reports"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(String, nullable=False, index=True)       # clerk_id
    week_start = Column(DateTime, nullable=False)
    week_end = Column(DateTime, nullable=False)
    total_doubts = Column(Integer, default=0)
    weak_topics = Column(Text, nullable=True)                   # JSON array
    strong_topics = Column(Text, nullable=True)                 # JSON array
    improvement_score = Column(Integer, default=0)              # 0-100
    summary = Column(Text, nullable=True)                       # LLM-generated summary
    suggestions = Column(Text, nullable=True)                   # JSON array
    created_at = Column(DateTime, default=datetime.utcnow)


class Syllabus(Base):
    __tablename__ = "syllabi"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    subject = Column(String, nullable=False)
    filename = Column(String, nullable=False)
    professor_id = Column(String, nullable=False)               # clerk_id
    status = Column(String, default="processing")               # processing | indexed | failed
    chunk_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
