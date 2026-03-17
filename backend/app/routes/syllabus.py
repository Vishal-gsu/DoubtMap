from fastapi import APIRouter, BackgroundTasks, Depends, File, Form, UploadFile
from sqlalchemy.orm import Session

from app.database.connection import SessionLocal, get_db
from app.database.models import Syllabus
from app.services.rag_service import process_syllabus_pdf

router = APIRouter(prefix="/syllabus", tags=["syllabus"])


def _index_syllabus_background(file_bytes: bytes, subject: str, syllabus_id: str):
    """
    Runs in background — creates its own DB session
    so the request session is not shared across threads.
    """
    db = SessionLocal()
    try:
        chunk_count = process_syllabus_pdf(file_bytes, subject, syllabus_id)
        syllabus = db.query(Syllabus).filter(Syllabus.id == syllabus_id).first()
        if syllabus:
            syllabus.status = "indexed"
            syllabus.chunk_count = chunk_count
            db.commit()
    except Exception as exc:
        syllabus = db.query(Syllabus).filter(Syllabus.id == syllabus_id).first()
        if syllabus:
            syllabus.status = "failed"
            db.commit()
        print(f"[syllabus indexing error] {exc}")
    finally:
        db.close()


@router.post("/upload")
async def upload_syllabus(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    subject: str = Form(...),
    professor_id: str = Form(...),
    db: Session = Depends(get_db),
):
    syllabus = Syllabus(
        subject=subject,
        filename=file.filename,
        professor_id=professor_id,
        status="processing",
    )
    db.add(syllabus)
    db.commit()
    db.refresh(syllabus)

    file_bytes = await file.read()

    # Process embedding in background — non-blocking
    background_tasks.add_task(
        _index_syllabus_background,
        file_bytes,
        subject,
        str(syllabus.id),
    )

    return {
        "message": "Syllabus uploaded and indexing started",
        "syllabus_id": str(syllabus.id),
        "status": "processing",
    }


@router.get("/list")
async def list_syllabi(db: Session = Depends(get_db)):
    syllabi = db.query(Syllabus).order_by(Syllabus.created_at.desc()).all()
    return {
        "syllabi": [
            {
                "id": str(s.id),
                "subject": s.subject,
                "filename": s.filename,
                "status": s.status,
                "uploaded_at": s.created_at.isoformat(),
            }
            for s in syllabi
        ]
    }
