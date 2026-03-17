import json

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.database.models import Report

router = APIRouter(prefix="/reports", tags=["reports"])


@router.get("")
async def get_reports(user_id: str, db: Session = Depends(get_db)):
    reports = (
        db.query(Report)
        .filter(Report.user_id == user_id)
        .order_by(Report.created_at.desc())
        .all()
    )

    return {
        "reports": [
            {
                "id": str(r.id),
                "week": (
                    f"{r.week_start.strftime('%B %d')} - "
                    f"{r.week_end.strftime('%B %d, %Y')}"
                ),
                "total_doubts": r.total_doubts,
                "weak_topics": json.loads(r.weak_topics) if r.weak_topics else [],
                "strong_topics": json.loads(r.strong_topics) if r.strong_topics else [],
                "improvement_score": r.improvement_score,
                "summary": r.summary,
                "suggestions": json.loads(r.suggestions) if r.suggestions else [],
                "created_at": r.created_at.isoformat(),
            }
            for r in reports
        ]
    }
