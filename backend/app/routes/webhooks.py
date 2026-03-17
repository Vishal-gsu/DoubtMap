from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.orm import Session

from app.config import settings
from app.database.connection import get_db
from app.database.models import Doubt
from app.services.report_service import generate_weekly_report

router = APIRouter(prefix="/webhooks/n8n", tags=["webhooks"])


def _verify_secret(x_n8n_secret: str = Header(None)):
    if x_n8n_secret != settings.N8N_WEBHOOK_SECRET:
        raise HTTPException(status_code=401, detail="Unauthorized")


@router.post("/generate-report")
async def webhook_generate_report(
    user_id: str,
    db: Session = Depends(get_db),
    _: None = Depends(_verify_secret),
):
    """n8n calls this every Sunday to generate a student's weekly report."""
    result = generate_weekly_report(user_id=user_id, db=db)
    return result


@router.post("/get-escalated")
async def webhook_get_escalated(
    db: Session = Depends(get_db),
    _: None = Depends(_verify_secret),
):
    """n8n calls this to get unresolved escalated doubts for professor alerting."""
    doubts = (
        db.query(Doubt)
        .filter(Doubt.escalated == True, Doubt.professor_response.is_(None))
        .all()
    )

    return {
        "escalated_count": len(doubts),
        "doubts": [
            {
                "topic": d.topic_detected,
                "message": d.message,
                "confidence": d.confidence,
            }
            for d in doubts
        ],
    }
