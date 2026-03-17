"""
Calls n8n webhook URLs to notify workflows of backend events.
All calls are fire-and-forget — failures are logged but never crash the request.
"""
import httpx
from app.config import settings


def _post(url: str, payload: dict) -> None:
    try:
        r = httpx.post(url, json=payload, timeout=10)
        print(f"[n8n] POST {url} → {r.status_code}")
    except Exception as e:
        print(f"[n8n] Failed to call {url}: {e}")


def notify_syllabus_uploaded(subject: str, filename: str, chunk_count: int, professor_id: str) -> None:
    """Workflow 3 — triggered after a syllabus PDF is fully indexed."""
    _post(settings.N8N_SYLLABUS_WEBHOOK, {
        "subject": subject,
        "filename": filename,
        "chunk_count": chunk_count,
        "professor_id": professor_id,
        "status": "indexed",
    })


def notify_new_user(user_id: str, name: str, email: str, role: str) -> None:
    """Workflow 5 — triggered when a new user registers."""
    _post(settings.N8N_NEW_USER_WEBHOOK, {
        "user_id": user_id,
        "name": name,
        "email": email,
        "role": role,
    })
