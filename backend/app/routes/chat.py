import json

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.database.models import Doubt
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.llm_service import ask_llm, detect_topic
from app.services.rag_service import retrieve_context

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("/ask", response_model=ChatResponse)
async def ask_doubt(req: ChatRequest, db: Session = Depends(get_db)):
    # 1. Retrieve syllabus context via RAG
    context = retrieve_context(req.message, req.subject)

    # 2. Call Groq LLM
    result = ask_llm(question=req.message, context=context, mode=req.mode)

    # 3. Detect topic (short LLM call)
    topic = detect_topic(req.message, req.subject) if req.subject else "General"

    # 4. Auto-escalate if confidence is low
    should_escalate = result["confidence"] < 0.5

    # 5. Persist to DB
    doubt = Doubt(
        user_id=req.user_id,
        message=req.message,
        response=result["response"],
        subject=req.subject,
        topic_detected=topic,
        confidence=result["confidence"],
        sources=json.dumps([c["source"] for c in context]),
        mode=req.mode,
        escalated=should_escalate,
    )
    db.add(doubt)
    db.commit()
    db.refresh(doubt)

    return ChatResponse(
        response=result["response"],
        confidence=result["confidence"],
        sources=[c["source"] for c in context],
        mode=req.mode,
        doubt_id=str(doubt.id),
        topic_detected=topic,
    )


@router.get("/history")
async def get_chat_history(
    user_id: str, limit: int = 50, db: Session = Depends(get_db)
):
    doubts = (
        db.query(Doubt)
        .filter(Doubt.user_id == user_id)
        .order_by(Doubt.created_at.desc())
        .limit(limit)
        .all()
    )

    return {
        "messages": [
            {
                "id": str(d.id),
                "user_id": d.user_id,
                "message": d.message,
                "response": d.response,
                "confidence": d.confidence,
                "topic": d.topic_detected,
                "mode": d.mode,
                "sources": json.loads(d.sources) if d.sources else [],
                "created_at": d.created_at.isoformat(),
            }
            for d in doubts
        ]
    }
