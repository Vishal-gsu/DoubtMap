# DoubtMap - AI-Powered Campus Doubt Resolution Platform

> An intelligent study companion that uses Socratic teaching to help students learn, while giving professors real-time analytics on knowledge gaps.

## Live Demo

| Service | URL |
|---------|-----|
| Frontend | [doubt-map.vercel.app](https://doubt-map.vercel.app) |
| Backend API | [doubtmap.onrender.com](https://doubtmap.onrender.com/api/v1/health) |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, TypeScript, Tailwind CSS, shadcn/ui |
| Auth | Clerk |
| Backend | FastAPI, SQLAlchemy |
| LLM | Groq (Llama 3.3 70B) |
| Embeddings | Sentence-Transformers (all-MiniLM-L6-v2) |
| Vector DB | Pinecone |
| Database | SQLite (dev) / PostgreSQL (prod) |
| Workflows | n8n Cloud |
| Deploy | Vercel (frontend) + Render (backend) |

## Features

### Student
- **Socratic Chat** — AI asks guiding questions instead of giving direct answers, building deeper understanding
- **Direct Mode** — Get straightforward explanations when you need them
- **Chat History** — Review past doubts and AI responses
- **Progress Reports** — Weekly AI-generated reports on weak topics and improvement areas

### Professor
- **Dashboard** — Doubt heatmap showing which topics students struggle with most
- **Escalation Queue** — Low-confidence AI responses are auto-escalated for professor review
- **Syllabus Upload** — Upload PDF syllabi to enhance AI responses with course-specific context (RAG)

### Automation (n8n)
- **Workflow 3** — Notifies professors when a syllabus is indexed
- **Workflow 5** — Sends welcome emails when new users register

## Architecture

```
Student/Professor (Browser)
        │
        ▼
   Next.js Frontend (Vercel)
   ├── Clerk Auth
   ├── Chat UI
   └── Professor Dashboard
        │
        ▼ REST API
   FastAPI Backend (Render)
   ├── /chat/ask          → Groq LLM + Pinecone RAG
   ├── /syllabus/upload    → PDF → Embeddings → Pinecone
   ├── /doubts/*           → Heatmap, Escalations
   ├── /reports            → AI-generated reports
   ├── /users/*            → Registration + Clerk sync
   └── /webhooks/n8n/*     → n8n integration
        │
        ├──▶ Groq API (LLM)
        ├──▶ Pinecone (Vector Search)
        ├──▶ SQLite/PostgreSQL (Structured Data)
        └──▶ n8n Cloud (Workflow Automation)
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/health` | Health check |
| POST | `/api/v1/chat/ask` | Send a doubt, get AI response |
| GET | `/api/v1/chat/history` | User's chat history |
| GET | `/api/v1/reports` | AI-generated progress reports |
| GET | `/api/v1/doubts/heatmap` | Topic frequency heatmap |
| GET | `/api/v1/doubts/recent` | Recent doubts across all users |
| GET | `/api/v1/doubts/escalated` | Low-confidence escalated doubts |
| POST | `/api/v1/doubts/escalated/{id}/respond` | Professor responds to escalation |
| POST | `/api/v1/syllabus/upload` | Upload + index a syllabus PDF |
| GET | `/api/v1/syllabus/list` | List uploaded syllabi |
| POST | `/api/v1/users/register` | Register new user |
| GET | `/api/v1/users/me` | Get user profile |
| POST | `/api/v1/users/sync` | Clerk webhook user sync |

## Project Structure

```
DoubtMap/
├── frontend/                # Next.js 16 app
│   ├── src/
│   │   ├── app/             # Pages (student/, professor/, sign-in/, etc.)
│   │   ├── components/      # Chat, Dashboard, Syllabus, UI components
│   │   ├── hooks/           # useChat, useRole
│   │   └── lib/             # API client, types, constants
│   └── .env.local           # Clerk keys + API URL
├── backend/                 # FastAPI app
│   ├── app/
│   │   ├── routes/          # chat, doubts, reports, syllabus, users, webhooks
│   │   ├── services/        # groq, rag, embeddings, pinecone, n8n
│   │   └── database/        # models, connection
│   ├── Dockerfile           # Production container
│   └── .env                 # API keys
└── n8n/                     # Workflow definitions
    └── workflows/           # JSON exports for n8n Cloud
```

## Quick Start

### Frontend
```bash
cd frontend
npm install
cp .env.local.example .env.local  # Add Clerk keys + API URL
npm run dev                        # http://localhost:3000
```

### Backend
```bash
cd backend
python -m venv venv
venv/Scripts/activate              # Windows
# source venv/bin/activate         # Mac/Linux
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Environment Variables

**Frontend (`frontend/.env.local`)**
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

**Backend (`backend/.env`)**
```env
DATABASE_URL=sqlite:///./doubtmap.db
GROQ_API_KEY=gsk_...
PINECONE_API_KEY=pcsk_...
PINECONE_INDEX_NAME=doubtmap-syllabus
CORS_ORIGINS=http://localhost:3000
```

## Team

Built at Hackathon 2026 by Team UNOLOX.
