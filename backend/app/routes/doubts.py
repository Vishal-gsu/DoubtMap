from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.database.models import Doubt
from app.schemas.doubt import ProfessorRespondRequest

router = APIRouter(prefix="/doubts", tags=["doubts"])


@router.get("/heatmap")
async def get_heatmap(subject: str | None = None, db: Session = Depends(get_db)):
    query = db.query(
        Doubt.topic_detected,
        func.count(Doubt.id).label("count"),
        func.avg(Doubt.confidence).label("avg_confidence"),
    )
    if subject:
        query = query.filter(Doubt.subject == subject)

    results = (
        query.group_by(Doubt.topic_detected)
        .order_by(func.count(Doubt.id).desc())
        .all()
    )

    return {
        "topics": [
            {
                "topic": r.topic_detected or "Unknown",
                "count": r.count,
                "avg_confidence": round(float(r.avg_confidence or 0), 2),
            }
            for r in results
        ]
    }


@router.get("/recent")
async def get_recent_doubts(limit: int = 20, db: Session = Depends(get_db)):
    doubts = (
        db.query(Doubt).order_by(Doubt.created_at.desc()).limit(limit).all()
    )
    return {
        "doubts": [
            {
                "id": str(d.id),
                "student_name": "Anonymous",
                "topic": d.topic_detected,
                "message": d.message,
                "confidence": d.confidence,
                "escalated": d.escalated,
                "created_at": d.created_at.isoformat(),
            }
            for d in doubts
        ]
    }


@router.get("/escalated")
async def get_escalated_doubts(db: Session = Depends(get_db)):
    doubts = (
        db.query(Doubt)
        .filter(Doubt.escalated == True, Doubt.professor_response.is_(None))
        .order_by(Doubt.created_at.desc())
        .all()
    )

    # Group by topic — show one representative doubt per topic with count
    topic_groups: dict = {}
    for d in doubts:
        topic = d.topic_detected or "Unknown"
        if topic not in topic_groups:
            topic_groups[topic] = {
                "id": str(d.id),
                "topic": topic,
                "message": d.message,
                "student_count": 0,
                "professor_response": None,
                "created_at": d.created_at.isoformat(),
            }
        topic_groups[topic]["student_count"] += 1

    return {"doubts": list(topic_groups.values())}


@router.post("/escalated/{doubt_id}/respond")
async def respond_to_escalation(
    doubt_id: str,
    body: ProfessorRespondRequest,
    db: Session = Depends(get_db),
):
    doubt = db.query(Doubt).filter(Doubt.id == doubt_id).first()
    if doubt:
        doubt.professor_response = body.response
        db.commit()
    return {"status": "ok"}
