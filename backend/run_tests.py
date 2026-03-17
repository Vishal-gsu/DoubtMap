# coding: utf-8
"""
Full backend test -- uses FastAPI TestClient, no running server needed.
Run with: venv/Scripts/python run_tests.py
"""
import sys, os
sys.stdout.reconfigure(encoding='utf-8')
sys.path.insert(0, os.path.dirname(__file__))

from dotenv import load_dotenv
load_dotenv()

# Use a fresh test DB so we don't fight locks on the main doubtmap.db
os.environ["DATABASE_URL"] = "sqlite:///./test_run.db"

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)
results = []

def check(name, resp, expected_status=200, check_keys=None):
    ok = resp.status_code == expected_status
    data = None
    try:
        data = resp.json()
    except Exception:
        pass
    if ok and check_keys:
        for k in check_keys:
            if k not in (data or {}):
                ok = False
                break
    status = "PASS" if ok else "FAIL"
    results.append((name, ok))
    print(f"  [{status}]  {name}  [HTTP {resp.status_code}]")
    if not ok and data:
        print(f"         {str(data)[:200]}")
    return data

# --- 1. HEALTH ---------------------------------------------------------------
print("\n--- 1. HEALTH ---")
r = client.get("/api/v1/health")
check("GET /health", r, 200, ["status"])

# --- 2. SYLLABUS -------------------------------------------------------------
print("\n--- 2. SYLLABUS ---")
r = client.get("/api/v1/syllabus/list")
check("GET /syllabus/list", r, 200, ["syllabi"])

import io
pdf_bytes = b"""%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj
3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>/Contents 4 0 R>>endobj
4 0 obj<</Length 44>>stream
BT /F1 12 Tf 100 700 Td (Binary Search Tree notes) Tj ET
endstream
endobj
xref
0 5
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000274 00000 n
trailer<</Size 5/Root 1 0 R>>
startxref
369
%%EOF"""

r = client.post(
    "/api/v1/syllabus/upload",
    data={"subject": "Data Structures", "professor_id": "prof-001"},
    files={"file": ("test.pdf", io.BytesIO(pdf_bytes), "application/pdf")},
)
upload_data = check("POST /syllabus/upload", r, 200, ["syllabus_id", "status"])
syllabus_id = upload_data.get("syllabus_id") if upload_data else None

# --- 3. CHAT -----------------------------------------------------------------
print("\n--- 3. CHAT ---")
r = client.post("/api/v1/chat/ask", json={
    "user_id": "student-test-001",
    "message": "What is a binary search tree?",
    "subject": "Data Structures",
    "mode": "direct",
})
chat_data = check("POST /chat/ask", r, 200, ["response", "confidence", "doubt_id"])
doubt_id = chat_data.get("doubt_id") if chat_data else None
if chat_data:
    print(f"         response   : {str(chat_data.get('response',''))[:100]}...")
    print(f"         confidence : {chat_data.get('confidence')}")
    print(f"         escalated  : {chat_data.get('confidence', 1) < 0.5}")

r = client.get("/api/v1/chat/history?user_id=student-test-001&limit=5")
check("GET /chat/history", r, 200, ["messages"])

# --- 4. DOUBTS ---------------------------------------------------------------
print("\n--- 4. DOUBTS ---")
r = client.get("/api/v1/doubts/heatmap")
check("GET /doubts/heatmap", r, 200, ["topics"])

r = client.get("/api/v1/doubts/recent")
check("GET /doubts/recent", r, 200, ["doubts"])

r = client.get("/api/v1/doubts/escalated")
check("GET /doubts/escalated", r, 200, ["doubts"])

if doubt_id:
    r = client.post(f"/api/v1/doubts/escalated/{doubt_id}/respond", json={
        "professor_id": "prof-001",
        "response": "A BST is a node-based binary tree where left < root < right.",
    })
    check("POST /doubts/escalated/{id}/respond", r, 200)

# --- 5. REPORTS --------------------------------------------------------------
print("\n--- 5. REPORTS ---")
r = client.get("/api/v1/reports?user_id=student-test-001")
check("GET /reports?user_id=...", r, 200, ["reports"])

# --- 6. WEBHOOKS -------------------------------------------------------------
print("\n--- 6. WEBHOOKS ---")
from app.config import settings
secret = settings.N8N_WEBHOOK_SECRET

r = client.post(
    "/api/v1/webhooks/n8n/generate-report?user_id=student-test-001",
    headers={"x-n8n-secret": secret},
)
check("POST /webhooks/n8n/generate-report", r, 200)

r = client.post(
    "/api/v1/webhooks/n8n/get-escalated",
    headers={"x-n8n-secret": secret},
)
check("POST /webhooks/n8n/get-escalated", r, 200, ["doubts"])

r = client.post("/api/v1/webhooks/n8n/get-escalated")  # no secret -> 401
check("POST /webhooks (no secret -> 401)", r, 401)

# --- SUMMARY -----------------------------------------------------------------
print("\n" + "=" * 54)
passed = sum(1 for _, ok in results if ok)
total  = len(results)
print(f"  Result: {passed}/{total} tests passed")
for name, ok in results:
    mark = "OK" if ok else "X "
    print(f"  [{mark}]  {name}")
print("=" * 54)
