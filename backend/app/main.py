from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database.connection import engine
from app.database.models import Base
from app.routes import chat, doubts, health, reports, syllabus, webhooks, users

# Auto-create all tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="DoubtMap API",
    version="1.0.0",
    description="AI-powered campus doubt resolution platform",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in settings.CORS_ORIGINS.split(",")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

PREFIX = "/api/v1"
app.include_router(health.router, prefix=PREFIX)
app.include_router(chat.router, prefix=PREFIX)
app.include_router(doubts.router, prefix=PREFIX)
app.include_router(reports.router, prefix=PREFIX)
app.include_router(syllabus.router, prefix=PREFIX)
app.include_router(webhooks.router, prefix=PREFIX)
app.include_router(users.router, prefix=PREFIX)
