import json
from datetime import datetime, timedelta

from groq import Groq
from sqlalchemy.orm import Session

from app.config import settings
from app.database.models import Doubt, Report
from app.prompts.report import REPORT_SYSTEM_PROMPT


def generate_weekly_report(user_id: str, db: Session) -> dict:
    """
    Pull the last 7 days of doubts for user_id,
    send to LLM for analysis, save Report to DB.
    Returns report dict or status dict.
    """
    week_end = datetime.utcnow()
    week_start = week_end - timedelta(days=7)

    doubts = (
        db.query(Doubt)
        .filter(
            Doubt.user_id == user_id,
            Doubt.created_at >= week_start,
            Doubt.created_at <= week_end,
        )
        .all()
    )

    if not doubts:
        return {"status": "no_doubts", "message": "No doubts this week"}

    doubt_summary = "\n".join(
        f"- Topic: {d.topic_detected}, Question: {d.message[:100]}, Confidence: {d.confidence:.2f}"
        for d in doubts
    )

    client = Groq(api_key=settings.GROQ_API_KEY)
    completion = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": REPORT_SYSTEM_PROMPT},
            {
                "role": "user",
                "content": f"Student had {len(doubts)} doubts this week:\n{doubt_summary}",
            },
        ],
        temperature=0.3,
        max_tokens=1024,
    )

    report_data = json.loads(completion.choices[0].message.content)

    report = Report(
        user_id=user_id,
        week_start=week_start,
        week_end=week_end,
        total_doubts=len(doubts),
        weak_topics=json.dumps(report_data.get("weak_topics", [])),
        strong_topics=json.dumps(report_data.get("strong_topics", [])),
        improvement_score=report_data.get("improvement_score", 0),
        summary=report_data.get("summary", ""),
        suggestions=json.dumps(report_data.get("suggestions", [])),
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    return {"status": "ok", "report_id": str(report.id)}
