# DoubtMap — Complete Project Master Plan

> AI-powered campus doubt resolution platform with Socratic teaching, professor analytics, and automated n8n workflows.

---

## TABLE OF CONTENTS

1. [What Is DoubtMap?](#1-what-is-doubtmap)
2. [Full Architecture Overview](#2-full-architecture-overview)
3. [How Everything Connects](#3-how-everything-connects)
4. [Tech Stack & Why](#4-tech-stack--why)
5. [Repository Structure](#5-repository-structure)
6. [Backend — Deep Dive](#6-backend--deep-dive)
7. [Frontend — Deep Dive](#7-frontend--deep-dive)
8. [n8n Workflows — Deep Dive](#8-n8n-workflows--deep-dive)
9. [Complete API Reference](#9-complete-api-reference)
10. [Database Schema](#10-database-schema)
11. [RAG Pipeline Explained](#11-rag-pipeline-explained)
12. [Request Lifecycle (Step by Step)](#12-request-lifecycle-step-by-step)
13. [Environment Variables](#13-environment-variables)
14. [Local Development Setup](#14-local-development-setup)
15. [Deployment Guide](#15-deployment-guide)
16. [Demo Script](#16-demo-script)
17. [Team Ownership Map](#17-team-ownership-map)

---

## 1. What Is DoubtMap?

DoubtMap is a **two-sided AI platform** for college campuses:

| User | What they get |
|------|--------------|
| **Student** | An AI tutor that answers doubts from their syllabus using Socratic method. Tracks progress, generates weekly reports. |
| **Professor** | A real-time dashboard showing which topics confuse students most (doubt heatmap). Gets alerted when AI can't answer confidently. |

### The Core Problem It Solves

```
Student has a doubt at 11 PM
  → Can't reach professor
  → WhatsApp groups are noisy
  → Generic ChatGPT doesn't know their syllabus
  → They give up

DoubtMap fixes this:
  → Student asks doubt
  → AI answers from THEIR syllabus
  → Socratic method — AI guides, doesn't just give answers
  → Professor sees confusion patterns BEFORE the exam
  → n8n automates reports, alerts, digests
```

### What Makes It Different From a Generic Chatbot

| Feature | Generic ChatGPT | DoubtMap |
|---------|----------------|----------|
| Knows your syllabus | No | Yes (RAG) |
| Teaching style | Direct answers | Socratic — guides you |
| Professor insight | None | Doubt heatmap, escalations |
| Progress tracking | None | Weekly AI-generated reports |
| Automation | None | n8n workflows |
| Campus-specific | No | Yes |

---

## 2. Full Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        STUDENT / PROFESSOR                          │
│                     (Browser — Any Device)                          │
└───────────────────────────┬─────────────────────────────────────────┘
                            │ HTTPS
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    VERCEL (Frontend)                                │
│                    Next.js 14 App                                   │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────────────┐ │
│  │  Student     │  │  Professor   │  │  Auth (Clerk)             │ │
│  │  Chat Page   │  │  Dashboard   │  │  Role: student/professor  │ │
│  │  Reports     │  │  Heatmap     │  │  JWT tokens               │ │
│  │  History     │  │  Escalations │  │                           │ │
│  └──────┬───────┘  └──────┬───────┘  └───────────────────────────┘ │
└─────────┼────────────────┼────────────────────────────────────────-─┘
          │ REST API calls  │  (axios, JSON)
          ▼                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    RENDER (Backend)                                 │
│                 FastAPI Python App                                  │
│                                                                     │
│  ┌────────────┐  ┌─────────────┐  ┌──────────────┐                 │
│  │   Routes   │  │  Services   │  │   Database   │                 │
│  │            │  │             │  │              │                 │
│  │ /chat/ask  │  │ RAG Service │  │  PostgreSQL  │                 │
│  │ /doubts/*  │  │ LLM Service │  │  (Render)    │                 │
│  │ /reports   │  │ Embed Svc   │  │              │                 │
│  │ /syllabus  │  │ Pinecone    │  │  Users       │                 │
│  │ /webhooks  │  │   Service   │  │  Doubts      │                 │
│  └──────┬─────┘  └──────┬──────┘  │  Reports     │                 │
│         │               │         │  Syllabi     │                 │
└─────────┼───────────────┼─────────┴──────────────┴─────────────────┘
          │               │
          ▼               ▼
┌──────────────┐  ┌────────────────────────────────────────────────┐
│  GROQ API    │  │             PINECONE (Vector DB)               │
│              │  │                                                │
│  Llama 3.3   │  │  Stores syllabus chunks as vector embeddings   │
│  70B model   │  │  Namespace: "syllabus"                        │
│  (free tier) │  │  Dimension: 384 (all-MiniLM-L6-v2)            │
└──────────────┘  └────────────────────────────────────────────────┘

          ┌──────────────────────────────────────────────┐
          │              N8N CLOUD                       │
          │          (Workflow Automation)               │
          │                                              │
          │  Workflow 1: Weekly Report Generator         │
          │  Workflow 2: Escalation Alert to Professor   │
          │  Workflow 3: Syllabus Upload Notification    │
          │  Workflow 4: Daily Doubt Digest              │
          │  Workflow 5: Welcome Email on Sign-up        │
          │                                              │
          │  n8n → calls Backend /webhooks/n8n/* routes │
          └──────────────────────────────────────────────┘
```

---

## 3. How Everything Connects

### Connection Map

```
Clerk Auth ──────────────────► Frontend (auth tokens)
                                     │
                                     │ user_id passed in every request
                                     ▼
Frontend ── REST API calls ────► Backend (FastAPI)
                                     │
                    ┌────────────────┼────────────────┐
                    ▼                ▼                 ▼
                 Groq API        Pinecone          PostgreSQL
                (LLM answers)  (RAG context)     (store doubts)
                    │
                    └──────────────► n8n (webhooks on schedule)
                                         │
                                         └──► Email to student/professor
```

### Data Flow for a Student Asking a Doubt

```
1. Student types question in chat UI (Frontend/Vercel)
2. Frontend sends POST /api/v1/chat/ask to Backend/Render
3. Backend embeds the question using HuggingFace all-MiniLM-L6-v2
4. Backend queries Pinecone for top-5 similar syllabus chunks
5. Backend builds prompt: [system prompt] + [syllabus context] + [question]
6. Backend calls Groq API → Llama 3.3 70B generates response
7. Backend calculates confidence score from Pinecone similarity scores
8. If confidence < 0.5 → mark doubt as "escalated = true"
9. Backend saves Doubt to PostgreSQL (message, response, topic, confidence)
10. Backend detects topic via a second fast LLM call (max 20 tokens)
11. Backend returns JSON response to Frontend
12. Frontend renders AI response with markdown + confidence badge
```

### Data Flow for n8n Weekly Report

```
1. n8n CRON fires every Sunday at 10 PM
2. n8n calls GET /api/v1/doubts/recent to get all unique student IDs
3. n8n loops: for each student_id, calls POST /api/v1/webhooks/n8n/generate-report
4. Backend fetches that student's last 7 days of doubts from PostgreSQL
5. Backend sends doubt summary to Groq → LLM generates JSON report
6. Backend saves Report to PostgreSQL
7. n8n sends email to student: "Your weekly report is ready!"
8. Student sees report in /student/reports page on frontend
```

---

## 4. Tech Stack & Why

| Technology | Used For | Why |
|-----------|---------|-----|
| **Next.js 14** | Frontend | App Router, SSR, easy Vercel deploy |
| **TypeScript** | Frontend language | Type safety, fewer bugs |
| **Tailwind CSS** | Styling | Fast, no CSS files |
| **shadcn/ui** | UI components | Pre-built, accessible, beautiful |
| **Clerk** | Auth | Student + professor roles, handles JWT, free tier |
| **FastAPI** | Backend | Async, auto Swagger docs, Python ecosystem |
| **SQLAlchemy** | ORM | Works with both SQLite (dev) and PostgreSQL (prod) |
| **PostgreSQL** | Main database | Render free tier, relational data |
| **LangChain** | RAG orchestration | Industry standard for LLM pipelines |
| **Groq** | LLM API | Llama 3.3 70B, free tier, ~200 tokens/sec (very fast) |
| **Pinecone** | Vector database | Free tier, managed, no infra needed |
| **HuggingFace all-MiniLM-L6-v2** | Embeddings | Free, ~80MB, runs on CPU, 384 dimensions |
| **PyPDF** | PDF text extraction | Parses syllabus PDFs |
| **n8n Cloud** | Workflow automation | Visual workflows, free tier, webhooks |
| **Vercel** | Frontend hosting | Free tier, auto-deploy from GitHub |
| **Render** | Backend hosting | Free tier, Docker support |

---

## 5. Repository Structure

```
DoubtMap/                              ← GitHub root
│
├── frontend/                          ← LAPTOP 1 ONLY
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx             ← Root layout with ClerkProvider
│   │   │   ├── page.tsx               ← Landing page
│   │   │   ├── sign-in/               ← Clerk auth pages
│   │   │   ├── sign-up/
│   │   │   ├── student/
│   │   │   │   ├── chat/page.tsx      ← Main student chat (HERO PAGE)
│   │   │   │   ├── reports/page.tsx   ← Weekly reports
│   │   │   │   └── history/page.tsx   ← Past doubts
│   │   │   └── professor/
│   │   │       ├── dashboard/page.tsx ← Doubt heatmap + analytics
│   │   │       ├── escalations/page.tsx← Unanswered doubts
│   │   │       └── syllabus/page.tsx  ← Upload PDFs
│   │   ├── components/
│   │   │   ├── chat/                  ← ChatWindow, MessageBubble, ChatInput
│   │   │   ├── dashboard/             ← DoubtHeatmap, RecentDoubts, StatsOverview
│   │   │   ├── reports/               ← ReportCard, WeakTopicsList, ProgressChart
│   │   │   └── layout/                ← Navbar, Sidebar
│   │   ├── lib/
│   │   │   ├── api.ts                 ← Axios instance (base URL from env)
│   │   │   ├── types.ts               ← Shared TypeScript interfaces
│   │   │   └── constants.ts
│   │   └── hooks/
│   │       ├── useChat.ts             ← Chat state management
│   │       └── useRole.ts             ← Get student/professor role from Clerk
│   ├── .env.local                     ← Clerk keys + backend URL
│   └── package.json
│
├── backend/                           ← LAPTOP 2 ONLY
│   ├── app/
│   │   ├── main.py                    ← FastAPI entry point + CORS + route registration
│   │   ├── config.py                  ← Env vars via pydantic-settings
│   │   ├── database/
│   │   │   ├── connection.py          ← SQLAlchemy engine (SQLite/PostgreSQL auto-detect)
│   │   │   └── models.py              ← User, Doubt, Report, Syllabus tables
│   │   ├── routes/
│   │   │   ├── health.py              ← GET /health
│   │   │   ├── chat.py                ← POST /chat/ask + GET /chat/history
│   │   │   ├── doubts.py              ← GET /doubts/heatmap, /recent, /escalated
│   │   │   ├── reports.py             ← GET /reports
│   │   │   ├── syllabus.py            ← POST /syllabus/upload, GET /syllabus/list
│   │   │   └── webhooks.py            ← POST /webhooks/n8n/* (n8n calls these)
│   │   ├── services/
│   │   │   ├── embedding_service.py   ← HuggingFace embeddings (lazy-loaded model)
│   │   │   ├── pinecone_service.py    ← Upsert + query Pinecone (lazy connection)
│   │   │   ├── rag_service.py         ← PDF→chunks→embed→Pinecone + context retrieval
│   │   │   ├── llm_service.py         ← Groq API calls + topic detection
│   │   │   └── report_service.py      ← Weekly report generation via LLM
│   │   ├── prompts/
│   │   │   ├── socratic.py            ← Socratic mode system prompt
│   │   │   ├── direct.py              ← Direct answer system prompt
│   │   │   └── report.py              ← JSON report generation prompt
│   │   └── schemas/
│   │       ├── chat.py                ← ChatRequest, ChatResponse
│   │       ├── doubt.py               ← DoubtOut, EscalatedDoubtOut
│   │       ├── report.py              ← ReportOut
│   │       └── syllabus.py            ← SyllabusOut
│   ├── Dockerfile                     ← For Render deploy
│   ├── render.yaml                    ← Render service + DB config
│   ├── requirements.txt               ← All Python deps (pinned versions)
│   ├── setup_pinecone.py              ← Run ONCE to create Pinecone index
│   └── .env.example                   ← Copy → .env and fill keys
│
├── n8n/                               ← LAPTOP 3 ONLY
│   ├── workflows/
│   │   ├── workflow1-weekly-report.json
│   │   ├── workflow2-escalation-alert.json
│   │   ├── workflow3-syllabus-notification.json
│   │   ├── workflow4-daily-digest.json
│   │   └── workflow5-welcome-email.json
│   └── docs/
│       └── n8n-setup-guide.md
│
├── docs/
│   ├── LAPTOP1-FRONTEND.md            ← Full frontend plan
│   ├── LAPTOP2-BACKEND.md             ← Full backend plan
│   └── LAPTOP3-N8N.md                 ← Full n8n + coordination plan
│
├── MASTER-PLAN.md                     ← This file
├── .gitignore
└── README.md
```

---

## 6. Backend — Deep Dive

### Entry Point: `app/main.py`

```
FastAPI app starts
  → Runs Base.metadata.create_all() → Creates all DB tables if they don't exist
  → Registers CORS middleware (whitelist: frontend URL)
  → Registers all routers under /api/v1 prefix
  → Ready to accept requests
```

### Config: `app/config.py`

Uses `pydantic-settings` to read `.env` file. Any missing required variable throws an error at startup. This prevents silent misconfiguration.

```
.env file ──► Settings class ──► settings object ──► imported everywhere
```

### Database: `app/database/`

- `models.py` — defines 4 tables using SQLAlchemy ORM:
  - `users` — synced from Clerk (clerk_id, email, name, role)
  - `doubts` — every question asked + AI response + metadata
  - `reports` — weekly AI-generated learning summaries
  - `syllabi` — uploaded PDFs + indexing status
- `connection.py` — creates engine, session factory, `get_db()` dependency
- Tables are auto-created on startup. No manual migration needed for hackathon.
- Works with both **SQLite** (local dev) and **PostgreSQL** (production on Render)

### Services: The Brain

#### `embedding_service.py`
```
Input:  text string (a question or a PDF chunk)
Output: list of 384 floats (vector representation)

Model: all-MiniLM-L6-v2 (HuggingFace, ~80MB, CPU-only)
Lazy-loaded on first call so server starts fast.
```

#### `pinecone_service.py`
```
upsert_vectors(vectors)  → stores chunk embeddings in Pinecone
query_vectors(embedding, subject, top_k)  → finds most similar chunks

Namespace: "syllabus"
Filter: can filter by subject (e.g., "Data Structures")
```

#### `rag_service.py`
```
retrieve_context(question, subject):
  1. embed question using embedding_service
  2. query_vectors in Pinecone
  3. return top-5 matching chunks with source labels

process_syllabus_pdf(file_bytes, subject, syllabus_id):
  1. Parse PDF pages using PyPDF
  2. Combine all pages into one text string
  3. Split into 500-word chunks with 50-word overlap
  4. Embed all chunks in batch
  5. Upsert to Pinecone with metadata (text, subject, source, syllabus_id)
  6. Return chunk count
```

#### `llm_service.py`
```
ask_llm(question, context, mode, chat_history):
  1. Build context string from RAG chunks
  2. Select system prompt (socratic or direct)
  3. Add last 6 chat history messages for memory
  4. Call Groq API: llama-3.3-70b-versatile
  5. Calculate confidence from avg Pinecone cosine similarity scores
  6. Return { response, confidence }

detect_topic(question, subject):
  Tiny LLM call (max 20 tokens) → returns "Binary Trees" style topic name
```

#### `report_service.py`
```
generate_weekly_report(user_id, db):
  1. Fetch last 7 days of doubts from PostgreSQL
  2. Build summary string of all doubts
  3. Call Groq with REPORT_SYSTEM_PROMPT → returns structured JSON
  4. Parse: { summary, weak_topics, strong_topics, improvement_score, suggestions }
  5. Save Report to PostgreSQL
  6. Return report_id
```

### Routes

| Route | Method | What it does |
|-------|--------|-------------|
| `/health` | GET | Health check — verify server is up |
| `/chat/ask` | POST | Core feature: RAG + LLM + save to DB |
| `/chat/history` | GET | Get student's past doubts |
| `/doubts/heatmap` | GET | Topic-wise doubt count + avg confidence |
| `/doubts/recent` | GET | Latest N doubts (for professor feed) |
| `/doubts/escalated` | GET | Unanswered low-confidence doubts |
| `/doubts/escalated/{id}/respond` | POST | Professor answers an escalated doubt |
| `/reports` | GET | Student's weekly reports list |
| `/syllabus/upload` | POST | Upload PDF → background indexing |
| `/syllabus/list` | GET | List all uploaded syllabi |
| `/webhooks/n8n/generate-report` | POST | n8n triggers this weekly |
| `/webhooks/n8n/get-escalated` | POST | n8n gets escalation data |

### Auto-Escalation Logic

```python
confidence = avg(pinecone_cosine_similarity_scores) * 1.2
if confidence < 0.5:
    doubt.escalated = True   # Professor gets notified via n8n
```

---

## 7. Frontend — Deep Dive

### Pages

#### Landing Page (`/`)
- Hero: "Your AI Study Buddy That Actually Teaches"
- Feature cards: Socratic Mode, Doubt Heatmap, Weekly Reports, Smart Escalation
- Two CTA buttons: Student sign-up, Professor sign-up

#### Student Chat (`/student/chat`) — THE HERO PAGE
- Mode toggle: **Socratic** (default) vs **Direct Answer**
- Subject dropdown (from syllabus list)
- Chat window with auto-scroll
- AI responses rendered as Markdown (code blocks, bold, bullets)
- Confidence badge on each AI response (green/yellow/red)
- Source chips: "Syllabus: Data Structures, Chunk 3"

#### Student Reports (`/student/reports`)
- List of weekly report cards
- Weak topics (red badges), strong topics (green badges)
- Improvement score (circular progress)
- AI-generated summary text
- Actionable suggestions list

#### Professor Dashboard (`/professor/dashboard`)
- 4 Stats cards: total doubts, active students, escalations, avg confidence
- **Doubt Heatmap** (recharts BarChart) — color-coded red=confused, green=confident
- Recent doubts table — sortable by confidence (lowest = most confused first)

#### Professor Escalations (`/professor/escalations`)
- Cards of unresolved low-confidence doubts
- "X students struggled with this"
- Text area for professor to type clarification
- Submit → stored in DB, accessible in future RAG queries

#### Syllabus Upload (`/professor/syllabus`)
- Drag-and-drop PDF upload
- Subject name input
- Status tracking: processing → indexed

### State Management

No Redux/Zustand — simple React hooks:
- `useChat.ts` — manages messages[], loading, calls `/chat/ask`
- `useRole.ts` — reads Clerk `publicMetadata.role` → routes to correct dashboard

### Auth Flow

```
Sign up → Clerk → Select role (student/professor) → stored in Clerk publicMetadata
Every request → Clerk JWT → frontend sends user ID in request body
Backend trusts the user_id (no backend auth needed for hackathon)
```

---

## 8. n8n Workflows — Deep Dive

### Workflow 1: Weekly Report Generator (MOST IMPORTANT)

```
TRIGGER: Cron — Every Sunday 10 PM

Step 1: GET /api/v1/doubts/recent?limit=1000
         ↓ get all doubts from week
Step 2: Code node — extract unique user_ids from doubts
         ↓ [user1, user2, user3, ...]
Step 3: Loop — for each user_id:
    POST /api/v1/webhooks/n8n/generate-report?user_id={id}
    Header: x-n8n-secret: {secret}
         ↓ backend generates + saves report
Step 4: Send email to student
    Subject: "Your Weekly DoubtMap Report is Ready!"
    Body: link to /student/reports
```

### Workflow 2: Escalation Alert

```
TRIGGER: Every 6 hours

Step 1: POST /api/v1/webhooks/n8n/get-escalated
         ↓ { escalated_count: 5, doubts: [...] }
Step 2: IF escalated_count > 0
Step 3: Format email with list of confused topics
Step 4: Send to professor email
    Subject: "DoubtMap Alert: Students struggling with 5 topics"
    Body: topic list + link to /professor/escalations
```

### Workflow 3: Syllabus Upload Notification

```
TRIGGER: Webhook from backend (POST /syllabus-uploaded)

Step 1: Receive { subject, filename, professor_name }
Step 2: Send email to all students
    Body: "New syllabus available — you can now ask about {subject}!"
```

### Workflow 4: Daily Doubt Digest

```
TRIGGER: Every day 8 PM

Step 1: GET /api/v1/doubts/heatmap
Step 2: Format top-5 confused topics into email
Step 3: Send to students:
    "Today's hot topics: Binary Trees (47), Graphs (38), DP (31)"
```

### Workflow 5: Welcome Email

```
TRIGGER: Clerk webhook → user.created event

Step 1: Receive { email, name, role }
Step 2: Send welcome email based on role
   Student: "You can now ask doubts from your syllabus!"
   Professor: "Upload your syllabus to get started!"
```

### n8n Security

Every n8n → Backend call includes:
```
Header: x-n8n-secret: {N8N_WEBHOOK_SECRET}
```
Backend `_verify_secret()` dependency rejects any request without this header with HTTP 401.

---

## 9. Complete API Reference

**Base URL (local):** `http://localhost:8000/api/v1`
**Base URL (production):** `https://doubtmap-api.onrender.com/api/v1`
**Interactive docs:** `{base_url_without_prefix}/docs`

---

### GET `/health`
**Purpose:** Check if server is running

**Response:**
```json
{ "status": "ok", "version": "1.0.0" }
```

---

### POST `/chat/ask`
**Purpose:** Student asks a doubt — triggers full RAG + LLM pipeline

**Request body:**
```json
{
  "user_id": "clerk_user_id",
  "message": "What is a binary search tree?",
  "subject": "Data Structures",
  "mode": "socratic"
}
```

**Response:**
```json
{
  "response": "Good question! Before I explain, tell me: do you know what a binary tree is?",
  "confidence": 0.82,
  "sources": ["Syllabus: Data Structures, Chunk 3", "Syllabus: Data Structures, Chunk 7"],
  "mode": "socratic",
  "doubt_id": "uuid",
  "topic_detected": "Binary Search Trees"
}
```

**Notes:**
- `confidence` range: 0.0 → 1.0. Below 0.5 = auto-escalated
- `mode`: `"socratic"` guides student with questions, `"direct"` gives full answer
- `subject` filters Pinecone search to the specific syllabus

---

### GET `/chat/history`
**Purpose:** Get a student's past doubts

**Query params:** `user_id`, `limit` (default 50)

**Response:**
```json
{
  "messages": [
    {
      "id": "uuid",
      "user_id": "clerk_id",
      "message": "What is a BST?",
      "response": "Before I explain...",
      "confidence": 0.82,
      "topic": "Binary Search Trees",
      "mode": "socratic",
      "sources": ["Syllabus: Data Structures, Chunk 3"],
      "created_at": "2026-03-17T10:30:00"
    }
  ]
}
```

---

### GET `/doubts/heatmap`
**Purpose:** Professor dashboard — which topics confuse students most

**Query params:** `subject` (optional filter)

**Response:**
```json
{
  "topics": [
    { "topic": "Binary Trees", "count": 47, "avg_confidence": 0.65 },
    { "topic": "Graph Traversal", "count": 38, "avg_confidence": 0.58 },
    { "topic": "Sorting", "count": 12, "avg_confidence": 0.91 }
  ]
}
```
Sorted by count descending. Low `avg_confidence` = students very confused.

---

### GET `/doubts/recent`
**Purpose:** Latest doubts feed for professor

**Query params:** `limit` (default 20)

**Response:**
```json
{
  "doubts": [
    {
      "id": "uuid",
      "student_name": "Anonymous",
      "topic": "Binary Trees",
      "message": "How does deletion work in BST?",
      "confidence": 0.55,
      "escalated": false,
      "created_at": "2026-03-17T10:30:00"
    }
  ]
}
```

---

### GET `/doubts/escalated`
**Purpose:** Doubts where AI wasn't confident — professor must respond

**Response:**
```json
{
  "doubts": [
    {
      "id": "uuid",
      "topic": "Deadlock Prevention",
      "message": "How is deadlock different from starvation?",
      "student_count": 5,
      "professor_response": null,
      "created_at": "2026-03-17T10:30:00"
    }
  ]
}
```
Grouped by topic. `student_count` shows how many students hit this same confusion.

---

### POST `/doubts/escalated/{doubt_id}/respond`
**Purpose:** Professor types a clarification for an escalated doubt

**Request body:**
```json
{
  "professor_id": "clerk_prof_id",
  "response": "Great question. The key difference is..."
}
```

**Response:** `{ "status": "ok" }`

---

### GET `/reports`
**Purpose:** Student's list of weekly learning reports

**Query params:** `user_id`

**Response:**
```json
{
  "reports": [
    {
      "id": "uuid",
      "week": "March 10 - March 17, 2026",
      "total_doubts": 23,
      "weak_topics": ["Binary Trees", "Dynamic Programming"],
      "strong_topics": ["Arrays", "Sorting"],
      "improvement_score": 72,
      "summary": "You showed great improvement in sorting this week...",
      "suggestions": ["Practice 3 BST problems", "Revisit Chapter 5"],
      "created_at": "2026-03-17T22:00:00"
    }
  ]
}
```

---

### POST `/syllabus/upload`
**Purpose:** Professor uploads a PDF → gets indexed into Pinecone

**Request:** `multipart/form-data`
- `file`: PDF file
- `subject`: `"Data Structures"`
- `professor_id`: Clerk user ID

**Response:**
```json
{
  "message": "Syllabus uploaded and indexing started",
  "syllabus_id": "uuid",
  "status": "processing"
}
```
Indexing runs in background. Check `/syllabus/list` for status update.

---

### GET `/syllabus/list`
**Response:**
```json
{
  "syllabi": [
    {
      "id": "uuid",
      "subject": "Data Structures",
      "filename": "ds_chapter1.pdf",
      "status": "indexed",
      "uploaded_at": "2026-03-17T10:00:00"
    }
  ]
}
```
`status` values: `processing` → `indexed` (or `failed`)

---

### POST `/webhooks/n8n/generate-report`
**Purpose:** n8n calls this to trigger weekly report for a student

**Required header:** `x-n8n-secret: {N8N_WEBHOOK_SECRET}`
**Query params:** `user_id`

**Response:** `{ "status": "ok", "report_id": "uuid" }` or `{ "status": "no_doubts" }`

---

### POST `/webhooks/n8n/get-escalated`
**Purpose:** n8n calls this to get escalated doubts for professor email

**Required header:** `x-n8n-secret: {N8N_WEBHOOK_SECRET}`

**Response:**
```json
{
  "escalated_count": 5,
  "doubts": [
    { "topic": "Deadlock", "message": "...", "confidence": 0.32 }
  ]
}
```

---

## 10. Database Schema

### Table: `users`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID PK | Internal ID |
| `clerk_id` | String UNIQUE | Clerk's user ID — used as FK everywhere |
| `email` | String | User email |
| `name` | String | Full name |
| `role` | String | `"student"` or `"professor"` |
| `created_at` | DateTime | Account creation time |

### Table: `doubts`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID PK | Doubt ID |
| `user_id` | String (clerk_id) | Which student asked |
| `message` | Text | The student's question |
| `response` | Text | AI's answer |
| `subject` | String | e.g., "Data Structures" |
| `topic_detected` | String | e.g., "Binary Trees" |
| `confidence` | Float | 0.0-1.0, from RAG similarity scores |
| `sources` | Text (JSON array) | Pinecone chunk sources |
| `mode` | String | `"socratic"` or `"direct"` |
| `escalated` | Boolean | True if confidence < 0.5 |
| `professor_response` | Text | Professor's manual answer |
| `created_at` | DateTime | When asked |

### Table: `reports`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID PK | Report ID |
| `user_id` | String (clerk_id) | Which student |
| `week_start` | DateTime | Start of week |
| `week_end` | DateTime | End of week |
| `total_doubts` | Integer | How many doubts that week |
| `weak_topics` | Text (JSON array) | Topics to improve |
| `strong_topics` | Text (JSON array) | Topics mastered |
| `improvement_score` | Integer | 0-100 |
| `summary` | Text | LLM-generated summary |
| `suggestions` | Text (JSON array) | Actionable study tips |
| `created_at` | DateTime | Report generation time |

### Table: `syllabi`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID PK | Syllabus ID (also used as Pinecone chunk prefix) |
| `subject` | String | e.g., "Data Structures" |
| `filename` | String | Original PDF filename |
| `professor_id` | String (clerk_id) | Who uploaded |
| `status` | String | `processing` / `indexed` / `failed` |
| `chunk_count` | Integer | How many chunks stored in Pinecone |
| `created_at` | DateTime | Upload time |

---

## 11. RAG Pipeline Explained

RAG = **Retrieval-Augmented Generation** — makes the AI answer from YOUR data, not general knowledge.

### Two Phases

#### Phase 1: Indexing (happens once when professor uploads PDF)

```
PDF File
  │
  ▼
PyPDF extracts text from all pages
  │
  ▼
Text is split into 500-word chunks with 50-word overlap
(overlap ensures no concept is cut mid-sentence)
  │
  ▼
Each chunk → HuggingFace all-MiniLM-L6-v2 → 384-dimensional vector
  │
  ▼
Vectors uploaded to Pinecone with metadata:
  {
    text: "original chunk text",
    subject: "Data Structures",
    source: "Syllabus: Data Structures, Chunk 7",
    syllabus_id: "uuid"
  }
```

#### Phase 2: Retrieval (happens on every student question)

```
Student question: "What is a BST?"
  │
  ▼
Embed question → 384-dimensional vector
  │
  ▼
Pinecone cosine similarity search (filter by subject)
  │
  ▼
Top 5 most similar chunks returned with similarity scores
  │
  ▼
Chunks injected into LLM prompt as context
  │
  ▼
Groq Llama 3.3 70B generates answer grounded in syllabus
  │
  ▼
Avg similarity score → confidence (0.0-1.0)
```

### Why This Approach Works

- HuggingFace model runs on CPU → no GPU cost → free
- Pinecone free tier handles thousands of chunks
- Filtering by `subject` ensures answer is from the right syllabus
- 50-word overlap prevents cutting concepts at chunk boundaries
- Similarity score as confidence is a reliable escalation signal

---

## 12. Request Lifecycle (Step by Step)

### Full lifecycle of a student asking a doubt

```
[Browser]
  Student types: "Explain quicksort recursion"
  Selects: Subject = "Algorithms", Mode = "Socratic"
  Clicks Send

[Frontend - Next.js]
  useChat hook fires
  Appends optimistic user message to UI immediately
  Sets loading = true
  Calls: POST /api/v1/chat/ask
  Body: { user_id: "clerk_xyz", message: "Explain quicksort...", subject: "Algorithms", mode: "socratic" }

[Network]
  HTTPS request to Render backend

[Backend - FastAPI]
  chat.py: ask_doubt() receives request

  Step 1 → rag_service.retrieve_context("Explain quicksort...", "Algorithms")
    embedding_service.get_embedding("Explain quicksort...")
    → [0.024, -0.156, ..., 0.089]  (384 floats)

    pinecone_service.query_vectors(embedding, "Algorithms", top_k=5)
    → 5 most similar syllabus chunks with scores [0.89, 0.84, 0.78, 0.71, 0.65]

    return [
      { text: "Quicksort uses divide and conquer...", source: "Algorithms, Chunk 12", score: 0.89 },
      { text: "The partition step selects a pivot...", source: "Algorithms, Chunk 13", score: 0.84 },
      ...
    ]

  Step 2 → llm_service.ask_llm(question, context, mode="socratic")
    Build prompt:
      [system: SOCRATIC_SYSTEM_PROMPT]
      [system: ## Syllabus Context: Quicksort uses divide... partition step...]
      [user: Explain quicksort recursion]

    Call Groq API → llama-3.3-70b-versatile
    → "Great question! Before I explain, let me ask: do you understand what 'divide and conquer' means in programming?"

    confidence = avg(0.89, 0.84, 0.78, 0.71, 0.65) * 1.2 = 0.91

  Step 3 → llm_service.detect_topic("Explain quicksort...", "Algorithms")
    Tiny Groq call → "Quicksort Recursion"

  Step 4 → confidence(0.91) >= 0.5 → escalated = False

  Step 5 → Save to PostgreSQL:
    doubts table: { user_id, message, response, subject, topic_detected, confidence, sources, mode, escalated }

  Step 6 → Return JSON response

[Frontend]
  Receives response JSON
  Appends AI MessageBubble with:
    - AI answer text (rendered as Markdown)
    - ConfidenceBadge showing 91%
    - Source chips: "Algorithms, Chunk 12", "Algorithms, Chunk 13"
  Sets loading = false
  Auto-scrolls to bottom
```

---

## 13. Environment Variables

### Backend `.env`

```env
# PostgreSQL (Render provides this automatically)
DATABASE_URL=postgresql://user:password@host:5432/doubtmap
# For local dev without PostgreSQL:
# DATABASE_URL=sqlite:///./doubtmap.db

# LLM — get free key at console.groq.com
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxx

# Vector DB — get free key at app.pinecone.io
PINECONE_API_KEY=pcsk_xxxxxxxxxxxxxxxxxxxx
PINECONE_INDEX_NAME=doubtmap-syllabus

# App
APP_ENV=development
CORS_ORIGINS=http://localhost:3000,https://doubtmap.vercel.app

# Share this value with Laptop 3 (n8n)
N8N_WEBHOOK_SECRET=make-this-a-strong-random-string
```

### Frontend `.env.local`

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/student/chat
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/student/chat

# Point to backend
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
# On deploy: https://doubtmap-api.onrender.com/api/v1
```

### n8n Cloud Variables

```
BACKEND_URL  = https://doubtmap-api.onrender.com
FRONTEND_URL = https://doubtmap.vercel.app
N8N_SECRET   = (same as N8N_WEBHOOK_SECRET in backend .env)
```

---

## 14. Local Development Setup

### Laptop 2 (Backend) — Run First

```bash
git clone https://github.com/Vishal-gsu/DoubtMap.git
cd DoubtMap/backend

# Create virtual environment
python -m venv venv
source venv/Scripts/activate      # Windows
# source venv/bin/activate         # Mac/Linux

# Install dependencies (~3-5 min, downloads HuggingFace model)
pip install -r requirements.txt

# Set up environment
cp .env.example .env
# Edit .env: fill GROQ_API_KEY, PINECONE_API_KEY
# For local: set DATABASE_URL=sqlite:///./doubtmap.db

# Create Pinecone index (ONE TIME ONLY)
python setup_pinecone.py

# Start server
uvicorn app.main:app --reload --port 8000
```

Server running at: http://localhost:8000
Swagger docs at: http://localhost:8000/docs

### Laptop 1 (Frontend) — After Backend is Running

```bash
cd DoubtMap/frontend
npm install
# Fill .env.local with Clerk keys
# Set NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
npm run dev
```

App running at: http://localhost:3000

### Laptop 3 (n8n)

1. Go to https://n8n.io → Cloud → Sign up
2. Create credentials: HTTP Header Auth (`x-n8n-secret: {secret}`)
3. Set environment variables: `BACKEND_URL`, `FRONTEND_URL`, `N8N_SECRET`
4. Build workflows (see `docs/LAPTOP3-N8N.md`)

---

## 15. Deployment Guide

### Step 1: Deploy Backend to Render

1. Go to https://render.com → New → Web Service
2. Connect GitHub repo → Set root directory: `backend`
3. Runtime: **Docker**
4. Add Environment Variables:
   - `GROQ_API_KEY` → your key
   - `PINECONE_API_KEY` → your key
   - `PINECONE_INDEX_NAME` → `doubtmap-syllabus`
   - `N8N_WEBHOOK_SECRET` → your secret
   - `CORS_ORIGINS` → `https://doubtmap.vercel.app`
5. Add PostgreSQL:
   - New → PostgreSQL → Free tier → Name: `doubtmap-db`
   - Render auto-sets `DATABASE_URL` from `render.yaml`
6. Deploy → wait ~5 min → get URL like `https://doubtmap-api.onrender.com`

**Note:** Free Render tier spins down after 15 min idle. Hit `/health` before demo to wake it up.

### Step 2: Deploy Frontend to Vercel

1. Go to https://vercel.com → Import → Select DoubtMap repo
2. Root directory: `frontend`
3. Add Environment Variables (all from `.env.local`)
4. Set `NEXT_PUBLIC_API_URL` = `https://doubtmap-api.onrender.com/api/v1`
5. Deploy → get URL like `https://doubtmap.vercel.app`

### Step 3: Update n8n Variables

In n8n Cloud → Settings → Variables:
- `BACKEND_URL` → `https://doubtmap-api.onrender.com`
- `FRONTEND_URL` → `https://doubtmap.vercel.app`

### Step 4: Update CORS on Backend

On Render → Environment Variables:
```
CORS_ORIGINS = https://doubtmap.vercel.app,http://localhost:3000
```

---

## 16. Demo Script

### 5-Minute Pitch Order

**[0:00 - 1:00] Problem Statement (Presenter speaks)**
> "It's 11 PM. Exam is tomorrow. A student has a doubt about deadlock prevention.
> WhatsApp groups are noisy. Professors aren't available. Generic AI doesn't know their syllabus.
> They give up. DoubtMap fixes all three problems — simultaneously."

**[1:00 - 2:30] Student Live Demo (Laptop 1 shows)**
1. Open DoubtMap landing page
2. Sign in as Student
3. Chat page → Subject: "Data Structures" → Mode: **Socratic ON**
4. Type: *"What is a binary search tree?"*
5. AI responds with a guiding question (not a direct answer)
6. Show: confidence badge, source references below response
7. Type a partial answer → AI guides further → eventually explains

**[2:30 - 3:30] Professor Live Demo (Laptop 1 shows professor account)**
1. Switch to professor account
2. Dashboard → Doubt Heatmap appears (with real data from previous demo)
3. *"Look — the AI detected Binary Search Trees had the most doubts.
    Avg confidence 65% — students are confused here."*
4. Escalations tab → *"These 3 doubts had confidence below 50% —
    AI flagged them. Professor can resolve now."*

**[3:30 - 4:30] n8n Demo (Laptop 3 shows n8n cloud)**
1. Open n8n dashboard → show 5 workflows visually
2. *"Every Sunday night, this workflow fires automatically —
    generates a personalized report for every student."*
3. Manually trigger weekly report workflow → show it executing
4. Go back to frontend → Student Reports page → new report appeared

**[4:30 - 5:00] Impact Close (Presenter)**
> "DoubtMap turns every doubt into data.
> Students learn better — Socratic method is proven more effective than direct answers.
> Professors see confusion BEFORE the exam, not after.
> n8n automates everything — reports, alerts, digests — zero manual work.
> This isn't a chatbot. It's a campus intelligence system."

---

## 17. Team Ownership Map

| Area | Owner | Files |
|------|-------|-------|
| Frontend UI | Laptop 1 | `frontend/**` |
| Auth (Clerk) | Laptop 1 | `frontend/src/middleware.ts`, Clerk dashboard |
| Backend API | Laptop 2 | `backend/app/routes/**` |
| RAG Pipeline | Laptop 2 | `backend/app/services/rag_service.py` |
| LLM Integration | Laptop 2 | `backend/app/services/llm_service.py` |
| Database | Laptop 2 | `backend/app/database/**` |
| n8n Workflows | Laptop 3 | `n8n/workflows/**`, n8n Cloud |
| Git Coordination | Laptop 3 | Manages merges to `main` |
| Render Deploy | Laptop 2 | `backend/render.yaml`, `Dockerfile` |
| Vercel Deploy | Laptop 1 | Vercel dashboard |
| Demo Presentation | All | See Section 16 |

### Git Rules
- **Laptop 1** works on branch `frontend`, only commits to `frontend/`
- **Laptop 2** works on branch `backend`, only commits to `backend/`
- **Laptop 3** manages repo, merges to `main`, exports `n8n/workflows/`
- Nobody touches another person's folder — **zero conflicts guaranteed**

### Shared Secrets Handoff

| Secret | Owned By | Share With |
|--------|----------|------------|
| `GROQ_API_KEY` | Laptop 2 | Laptop 2 only |
| `PINECONE_API_KEY` | Laptop 2 | Laptop 2 only |
| `N8N_WEBHOOK_SECRET` | Laptop 3 creates it | Laptop 2 (put in .env) |
| `CLERK_PUBLISHABLE_KEY` | Laptop 1 | Laptop 1 only |
| Backend Render URL | Laptop 2 shares after deploy | Laptop 1 + Laptop 3 |
| Frontend Vercel URL | Laptop 1 shares after deploy | Laptop 2 + Laptop 3 |
