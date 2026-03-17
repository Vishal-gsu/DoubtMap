# API Integration & Team Coordination

This document defines the integration points between n8n, backend, and frontend for the DoubtMap project.

---

## Overview

```
Frontend (Laptop 1) ←→ Backend (Laptop 2) ←→ n8n (Laptop 3)
                           ↓
                    External Services
                    (Clerk, Groq, Pinecone, PostgreSQL)
```

---

## 1. Backend APIs That n8n Calls

These endpoints must be implemented by **Laptop 2 (Backend)** for n8n workflows to function.

### 1.1 Get Recent Doubts (for Weekly Reports)

**Used by**: Workflow 1 (Weekly Report Generator)

```http
GET {{BACKEND_URL}}/api/v1/doubts/recent?limit=1000
Headers:
  x-n8n-secret: {{N8N_WEBHOOK_SECRET}}
```

**Response:**
```json
{
  "doubts": [
    {
      "id": "doubt_abc123",
      "user_id": "user_xyz789",
      "user_email": "student@example.com",
      "user_name": "John Doe",
      "topic": "Binary Search Trees",
      "message": "How do I implement BST insertion?",
      "confidence": 0.85,
      "created_at": "2026-03-15T10:30:00Z"
    }
  ]
}
```

**Notes:**
- Must return doubts from last 7 days
- Must include `user_id`, `user_email`, `user_name` for email sending
- Must be authenticated with `x-n8n-secret` header

---

### 1.2 Get Escalated Doubts (for Escalation Alerts)

**Used by**: Workflow 2 (Doubt Escalation Alert)

```http
POST {{BACKEND_URL}}/api/v1/webhooks/n8n/get-escalated
Headers:
  x-n8n-secret: {{N8N_WEBHOOK_SECRET}}
  Content-Type: application/json
```

**Response:**
```json
{
  "escalated_count": 3,
  "doubts": [
    {
      "id": "doubt_xyz",
      "user_id": "user_abc",
      "user_name": "Jane Smith",
      "topic": "Dynamic Programming",
      "message": "Explain memoization",
      "doubt_text": "Explain memoization",
      "confidence": 0.55,
      "created_at": "2026-03-17T08:00:00Z"
    }
  ]
}
```

**Notes:**
- Return doubts with confidence < 0.7
- Last 6 hours only
- Include topic extraction if available

---

### 1.3 Generate Report (for Weekly Reports)

**Used by**: Workflow 1 (Weekly Report Generator)

```http
POST {{BACKEND_URL}}/api/v1/webhooks/n8n/generate-report?user_id={{user_id}}
Headers:
  x-n8n-secret: {{N8N_WEBHOOK_SECRET}}
  Content-Type: application/json
```

**Response:**
```json
{
  "status": "success",
  "report_id": "report_abc123",
  "user_id": "user_xyz789",
  "message": "Report generated successfully"
}
```

**Notes:**
- This endpoint should:
  1. Fetch all doubts for the user from last 7 days
  2. Call Groq LLM to generate personalized report
  3. Save report to database
  4. Return success status
- n8n will send email notification after this completes

---

### 1.4 Get Heatmap Data (for Daily Digest)

**Used by**: Workflow 4 (Daily Doubt Digest)

```http
GET {{BACKEND_URL}}/api/v1/doubts/heatmap
Headers:
  x-n8n-secret: {{N8N_WEBHOOK_SECRET}}
```

**Response:**
```json
{
  "topics": [
    {
      "topic": "Binary Search Trees",
      "count": 47,
      "avg_confidence": 0.72,
      "confidence": 0.72
    },
    {
      "topic": "Dynamic Programming",
      "count": 38,
      "avg_confidence": 0.58,
      "confidence": 0.58
    }
  ]
}
```

**Notes:**
- Return top 10-20 topics by volume
- Include both `avg_confidence` and `confidence` (same value, for compatibility)
- Sort by `count` descending

---

## 2. n8n Webhook URLs That Backend Calls

These webhook URLs must be called by **Laptop 2 (Backend)** when certain events happen.

### 2.1 Syllabus Upload Notification

**When to call**: After syllabus upload succeeds and is indexed to Pinecone

**URL**: `https://your-instance.app.n8n.cloud/webhook/syllabus-uploaded`

**Method**: POST

**Headers:**
```http
Content-Type: application/json
x-n8n-secret: {{N8N_WEBHOOK_SECRET}}
```

**Body:**
```json
{
  "subject": "Data Structures",
  "filename": "ds_syllabus.pdf",
  "professor_name": "Dr. Smith"
}
```

**Backend Implementation Example:**
```python
import requests
import os

def notify_syllabus_upload(subject: str, filename: str, professor_name: str):
    n8n_url = os.getenv("N8N_SYLLABUS_WEBHOOK_URL")
    secret = os.getenv("N8N_WEBHOOK_SECRET")

    payload = {
        "subject": subject,
        "filename": filename,
        "professor_name": professor_name
    }

    headers = {
        "Content-Type": "application/json",
        "x-n8n-secret": secret
    }

    try:
        response = requests.post(n8n_url, json=payload, headers=headers, timeout=10)
        response.raise_for_status()
        return True
    except Exception as e:
        print(f"Failed to notify n8n: {e}")
        return False
```

---

### 2.2 New User Webhook (Optional - Clerk handles this)

**When to call**: This is actually called by Clerk directly, not backend

**URL**: `https://your-instance.app.n8n.cloud/webhook/new-user`

**Method**: POST

**Setup**: Configure in Clerk Dashboard → Webhooks

---

## 3. Clerk Integration (for Laptop 1)

### 3.1 Webhook Configuration

**Location**: Clerk Dashboard → Webhooks → Add Endpoint

**URL**: `https://your-instance.app.n8n.cloud/webhook/new-user`

**Events to Subscribe**:
- `user.created`

**Webhook Signing Secret**: Save this and verify signatures in n8n (advanced)

---

## 4. Environment Variables

### 4.1 Backend .env (Laptop 2)

```env
# n8n Integration
N8N_WEBHOOK_SECRET=EXAMPLE_N8N_WEBHOOK_SECRET_HEX
N8N_SYLLABUS_WEBHOOK_URL=https://your-instance.app.n8n.cloud/webhook/syllabus-uploaded

# Other backend env vars...
DATABASE_URL=postgresql://...
GROQ_API_KEY=gsk_...
PINECONE_API_KEY=...
```

---

### 4.2 n8n Cloud Environment Variables

Set in n8n Cloud → Settings → Variables:

| Variable | Development | Production |
|----------|-------------|------------|
| `BACKEND_URL` | `http://localhost:8000` | `https://doubtmap-api.onrender.com` |
| `FRONTEND_URL` | `http://localhost:3000` | `https://doubtmap.vercel.app` |
| `N8N_SECRET` | Same as `N8N_WEBHOOK_SECRET` | Same as `N8N_WEBHOOK_SECRET` |

---

## 5. Authentication & Security

### 5.1 Webhook Authentication

All backend ↔ n8n communication uses **Header-based authentication**:

**Header Name**: `x-n8n-secret`
**Header Value**: Shared secret (same value in both backend and n8n)

**How to generate secret:**
```bash
openssl rand -hex 32
# Example: EXAMPLE_N8N_WEBHOOK_SECRET_HEX
```

**Backend verification (Python):**
```python
from fastapi import Header, HTTPException
import os

async def verify_n8n_secret(x_n8n_secret: str = Header(...)):
    expected_secret = os.getenv("N8N_WEBHOOK_SECRET")
    if x_n8n_secret != expected_secret:
        raise HTTPException(status_code=401, detail="Invalid webhook secret")
    return True
```

---

## 6. Testing Integration

### 6.1 Test n8n → Backend

```bash
# Test from n8n workflow (Execute Workflow button)
# OR manually with curl:

curl -X GET http://localhost:8000/api/v1/doubts/recent?limit=10 \
  -H "x-n8n-secret: YOUR_SECRET_HERE"
```

### 6.2 Test Backend → n8n

```bash
# Test syllabus webhook
curl -X POST https://your-instance.app.n8n.cloud/webhook/syllabus-uploaded \
  -H "Content-Type: application/json" \
  -H "x-n8n-secret: YOUR_SECRET_HERE" \
  -d '{
    "subject": "Test Subject",
    "filename": "test.pdf",
    "professor_name": "Dr. Test"
  }'
```

### 6.3 Test End-to-End

1. **Student asks a doubt** → Frontend → Backend → DB
2. **Wait for scheduled trigger** (or execute manually in n8n)
3. **n8n calls backend** → Backend generates report
4. **n8n sends email** → Check inbox
5. **Student views report** → Frontend → Backend → DB

---

## 7. Error Handling

### 7.1 n8n Workflow Errors

**If backend API fails:**
- n8n execution will show red node
- Check n8n Executions tab for error details
- Backend logs should show the request

**Common errors:**
- 401 Unauthorized → Check `x-n8n-secret` matches
- 404 Not Found → Check backend endpoint exists
- 500 Server Error → Check backend logs
- Network timeout → Check backend URL is correct

### 7.2 Backend Webhook Call Errors

**If n8n webhook fails:**
- Backend should log the error but not block main flow
- Syllabus upload should still succeed even if notification fails

**Error handling pattern:**
```python
try:
    notify_n8n(payload)
except Exception as e:
    logger.warning(f"n8n notification failed: {e}")
    # Continue anyway - don't block main operation
```

---

## 8. Data Flow Diagrams

### 8.1 Weekly Report Generation

```
Sunday 10 PM
     ↓
  (n8n cron trigger)
     ↓
  GET /api/v1/doubts/recent ──→ Backend returns all recent doubts
     ↓
  Extract unique user IDs
     ↓
  [Loop for each student]
     ↓
  POST /api/v1/webhooks/n8n/generate-report?user_id=xxx ──→ Backend generates report
     ↓
  Send email to student
     ↓
  Student receives email ──→ Clicks link ──→ Frontend /student/reports
     ↓
  Frontend fetches report from backend
```

### 8.2 Syllabus Upload Notification

```
Professor uploads PDF in frontend
     ↓
  POST /api/v1/syllabus/upload ──→ Backend receives file
     ↓
  Backend processes PDF ──→ Extracts text ──→ Indexes to Pinecone
     ↓
  Backend calls n8n webhook:
  POST https://n8n.app/webhook/syllabus-uploaded
     ↓
  n8n receives webhook ──→ Sends email to students
```

### 8.3 Escalation Alert

```
Every 6 hours
     ↓
  (n8n interval trigger)
     ↓
  POST /api/v1/webhooks/n8n/get-escalated ──→ Backend queries doubts with confidence < 0.7
     ↓
  IF escalated_count > 0
     ↓
  Format email with topic list
     ↓
  Send email to professor
     ↓
  Professor receives email ──→ Clicks link ──→ Frontend /professor/escalations
     ↓
  Professor responds ──→ Backend updates knowledge base
```

---

## 9. Coordination Checklist

### For Laptop 2 (Backend)

- [ ] Implement `GET /api/v1/doubts/recent?limit=1000`
- [ ] Implement `POST /api/v1/webhooks/n8n/get-escalated`
- [ ] Implement `POST /api/v1/webhooks/n8n/generate-report?user_id=xxx`
- [ ] Implement `GET /api/v1/doubts/heatmap`
- [ ] Add `x-n8n-secret` header verification to all webhook endpoints
- [ ] Call n8n webhook after syllabus upload
- [ ] Add `N8N_WEBHOOK_SECRET` to `.env`
- [ ] Add `N8N_SYLLABUS_WEBHOOK_URL` to `.env`
- [ ] Test all endpoints with curl before integration

### For Laptop 3 (n8n - You)

- [ ] Set up n8n Cloud account
- [ ] Create `n8n-backend-auth` credential with `x-n8n-secret`
- [ ] Import all 5 workflows
- [ ] Set environment variables: `BACKEND_URL`, `FRONTEND_URL`, `N8N_SECRET`
- [ ] Share webhook URLs with Laptop 2
- [ ] Share `N8N_WEBHOOK_SECRET` with Laptop 2
- [ ] Test workflows manually before activating
- [ ] Activate Workflow 1 and 2 (critical)
- [ ] Export workflows to Git

### For Laptop 1 (Frontend)

- [ ] Configure Clerk webhook for new users (URL from Laptop 3)
- [ ] Create `/student/reports` page to display reports
- [ ] Create `/professor/escalations` page for escalated doubts
- [ ] Create `/professor/dashboard` page with heatmap

---

## 10. Quick Reference - Contact Points

| What | Who | How |
|------|-----|-----|
| n8n webhook URLs | Laptop 3 | Share in team chat after setup |
| Backend API URLs | Laptop 2 | Share after Render deployment |
| `N8N_WEBHOOK_SECRET` | Laptop 3 generates, shares with Laptop 2 | Share securely (not in Git) |
| Groq API key | Laptop 2 | Share with Laptop 3 if needed for LLM nodes |
| Student/Professor emails (demo) | Everyone | Hardcode for hackathon, or use test emails |

---

## 11. Demo Day Coordination

### Before Demo

1. **Laptop 3** → Update n8n env vars to production URLs
2. **Laptop 2** → Update `.env` to production n8n webhook URLs
3. **Everyone** → Test end-to-end flow at least once
4. **Laptop 3** → Trigger Workflow 1 manually to generate sample reports

### During Demo

1. **Laptop 3** → Show n8n dashboard with workflows
2. **Laptop 3** → Manually trigger Weekly Report workflow (Execute Workflow button)
3. **Laptop 3** → Show execution logs (green nodes = success)
4. **Laptop 1** → Show that report appeared in frontend
5. **Laptop 3** → Explain how escalation alerts work (don't need to wait 6 hours)

---

**Last Updated**: March 2026 (Hackathon Build)
**Maintained by**: Laptop 3 (n8n + Integration Lead)
