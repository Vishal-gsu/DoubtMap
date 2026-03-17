from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.database.models import User
from app.services.n8n_service import notify_new_user

router = APIRouter(prefix="/users", tags=["users"])


class RegisterRequest(BaseModel):
    clerk_id: str
    name: str
    email: str
    role: str = "student"  # "student" | "professor"


@router.post("/register")
async def register_user(body: RegisterRequest, db: Session = Depends(get_db)):
    """
    Called by frontend after Clerk sign-up to persist user in DB
    and trigger n8n Workflow 5 (welcome email).
    """
    # Upsert: register only if not already in DB
    existing = db.query(User).filter(User.clerk_id == body.clerk_id).first()
    if existing:
        return {"status": "exists", "user_id": existing.clerk_id}

    user = User(
        clerk_id=body.clerk_id,
        name=body.name,
        email=body.email,
        role=body.role,
    )
    db.add(user)
    db.commit()

    # Notify n8n Workflow 5 — sends welcome email via n8n
    notify_new_user(body.clerk_id, body.name, body.email, body.role)

    return {"status": "created", "user_id": body.clerk_id}


@router.get("/me")
async def get_user(clerk_id: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.clerk_id == clerk_id).first()
    if not user:
        return {"found": False}
    return {
        "found": True,
        "clerk_id": user.clerk_id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
    }
