# DoubtMap - Your AI Study Buddy That Actually Teaches

> AI-powered campus doubt resolution platform with Socratic teaching, professor analytics, and automated workflows.

## Tech Stack

| Layer | Tech | Deploy |
|-------|------|--------|
| Frontend | Next.js 14, TypeScript, Tailwind, shadcn/ui, Clerk | Vercel |
| Backend | FastAPI, LangChain, SQLAlchemy | Render |
| LLM | Groq (Llama 3.3 70B) | API |
| Vector DB | Pinecone | Cloud |
| Database | PostgreSQL | Render |
| Auth | Clerk | Cloud |
| Workflows | n8n | n8n Cloud |

## Project Structure

```
DoubtMap/
├── frontend/          # Next.js app (Laptop 1)
├── backend/           # FastAPI app (Laptop 2)
├── n8n/               # Workflow exports (Laptop 3)
│   └── workflows/
├── docs/              # Plan files for each team member
│   ├── LAPTOP1-FRONTEND.md
│   ├── LAPTOP2-BACKEND.md
│   └── LAPTOP3-N8N.md
└── README.md
```

## Quick Start

### Frontend
```bash
cd frontend
npm install
npm run dev    # http://localhost:3000
```

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

## Team

Built at Hackathon 2026.
