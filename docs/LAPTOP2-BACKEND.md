# LAPTOP 2 — BACKEND + RAG (FastAPI + Render)

## YOUR OWNERSHIP
You own the `backend/` folder ONLY. Never touch `frontend/` or `n8n/`.

---

## TECH STACK
- **Framework:** FastAPI (Python 3.11+)
- **LLM API:** Groq (Llama 3.3 70B — free, fast)
- **RAG Framework:** LangChain
- **Vector DB:** Pinecone (free tier)
- **Database:** PostgreSQL (Render managed)
- **PDF Processing:** PyPDF2 + LangChain text splitters
- **Embeddings:** HuggingFace `all-MiniLM-L6-v2` (free, runs on CPU)
- **ORM:** SQLAlchemy + alembic
- **Deploy:** Render (Web Service)

---

## SETUP COMMANDS (Run on Day 1)

```bash
cd e:/hackathon/UNOLOX
mkdir backend && cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Create requirements.txt first (listed below), then:
pip install -r requirements.txt
```

**`requirements.txt`:**
```txt
fastapi==0.115.0
uvicorn==0.30.0
sqlalchemy==2.0.35
alembic==1.13.0
psycopg2-binary==2.9.9
python-multipart==0.0.9
python-dotenv==1.0.1
langchain==0.3.7
langchain-community==0.3.5
langchain-groq==0.2.1
langchain-huggingface==0.1.2
langchain-pinecone==0.2.0
pinecone-client==5.0.0
pypdf2==3.0.1
sentence-transformers==3.3.0
pydantic==2.9.0
httpx==0.27.0
```

---

## FOLDER STRUCTURE (YOU CREATE ALL OF THESE)

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                       ← FastAPI app entry point
│   ├── config.py                     ← Env vars + settings
│   ├── database/
│   │   ├── __init__.py
│   │   ├── connection.py             ← SQLAlchemy engine + session
│   │   └── models.py                 ← All DB models (User, Doubt, Report, Syllabus)
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── chat.py                   ← POST /chat/ask, GET /chat/history
│   │   ├── doubts.py                 ← GET /doubts/heatmap, /recent, /escalated
│   │   ├── reports.py                ← GET /reports
│   │   ├── syllabus.py               ← POST /syllabus/upload, GET /syllabus/list
│   │   ├── webhooks.py               ← POST /webhooks/n8n/* (n8n calls these)
│   │   └── health.py                 ← GET /health
│   ├── services/
│   │   ├── __init__.py
│   │   ├── rag_service.py            ← RAG pipeline: embed, search, retrieve
│   │   ├── llm_service.py            ← Groq LLM calls + Socratic prompt
│   │   ├── pinecone_service.py       ← Pinecone init, upsert, query
│   │   ├── embedding_service.py      ← HuggingFace embeddings
│   │   └── report_service.py         ← Generate weekly reports via LLM
│   ├── prompts/
│   │   ├── __init__.py
│   │   ├── socratic.py               ← Socratic mode system prompt
│   │   ├── direct.py                 ← Direct answer system prompt
│   │   └── report.py                 ← Weekly report generation prompt
│   └── schemas/
│       ├── __init__.py
│       ├── chat.py                   ← Pydantic request/response schemas
│       ├── doubt.py
│       ├── report.py
│       └── syllabus.py
├── alembic/                          ← DB migrations
│   ├── versions/
│   └── env.py
├── alembic.ini
├── .env                              ← API keys
├── requirements.txt
├── Dockerfile
├── render.yaml                       ← Render deploy config
└── README.md
```

---

## ENV VARIABLES (.env)

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/doubtmap

# Groq (LLM)
GROQ_API_KEY=gsk_xxxxxxxxxxxxx

# Pinecone (Vector DB)
PINECONE_API_KEY=pcsk_xxxxxxxxxxxxx
PINECONE_INDEX_NAME=doubtmap-syllabus
PINECONE_ENVIRONMENT=us-east-1

# App
APP_ENV=development
CORS_ORIGINS=http://localhost:3000,https://doubtmap.vercel.app

# n8n Webhook Secret (so only n8n can hit webhook endpoints)
N8N_WEBHOOK_SECRET=your-random-secret-here
```

---

## DATABASE MODELS

### `app/database/models.py`

```python
from sqlalchemy import Column, String, Integer, Float, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
import uuid

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    clerk_id = Column(String, unique=True, nullable=False, index=True)
    email = Column(String, nullable=False)
    name = Column(String, nullable=False)
    role = Column(String, nullable=False, default="student")  # "student" | "professor"
    created_at = Column(DateTime, default=datetime.utcnow)

    doubts = relationship("Doubt", back_populates="user")
    reports = relationship("Report", back_populates="user")


class Doubt(Base):
    __tablename__ = "doubts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(String, nullable=False, index=True)       # clerk_id
    message = Column(Text, nullable=False)                      # student's question
    response = Column(Text, nullable=False)                     # AI's answer
    subject = Column(String, nullable=True)                     # e.g., "Data Structures"
    topic_detected = Column(String, nullable=True)              # e.g., "Binary Trees"
    confidence = Column(Float, nullable=False, default=0.0)     # 0.0 to 1.0
    sources = Column(Text, nullable=True)                       # JSON array of source refs
    mode = Column(String, default="socratic")                   # "socratic" | "direct"
    escalated = Column(Boolean, default=False)                  # True if confidence < 0.5
    professor_response = Column(Text, nullable=True)            # Professor's manual answer
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="doubts", foreign_keys=[user_id],
                        primaryjoin="User.clerk_id == Doubt.user_id")


class Report(Base):
    __tablename__ = "reports"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(String, nullable=False, index=True)       # clerk_id
    week_start = Column(DateTime, nullable=False)
    week_end = Column(DateTime, nullable=False)
    total_doubts = Column(Integer, default=0)
    weak_topics = Column(Text, nullable=True)                   # JSON array
    strong_topics = Column(Text, nullable=True)                 # JSON array
    improvement_score = Column(Integer, default=0)              # 0-100
    summary = Column(Text, nullable=True)                       # LLM-generated summary
    suggestions = Column(Text, nullable=True)                   # JSON array
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="reports", foreign_keys=[user_id],
                        primaryjoin="User.clerk_id == Report.user_id")


class Syllabus(Base):
    __tablename__ = "syllabi"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    subject = Column(String, nullable=False)
    filename = Column(String, nullable=False)
    professor_id = Column(String, nullable=False)               # clerk_id
    status = Column(String, default="processing")               # processing | indexed | failed
    chunk_count = Column(Integer, default=0)                    # how many chunks stored
    created_at = Column(DateTime, default=datetime.utcnow)
```

---

## CORE SERVICE IMPLEMENTATIONS

### 1. `app/services/pinecone_service.py`

```python
from pinecone import Pinecone
from app.config import settings

pc = Pinecone(api_key=settings.PINECONE_API_KEY)
index = pc.Index(settings.PINECONE_INDEX_NAME)

def upsert_vectors(vectors: list[dict]):
    """
    vectors: [{"id": "chunk-uuid", "values": [0.1, 0.2, ...], "metadata": {"text": "...", "subject": "...", "source": "..."}}]
    """
    index.upsert(vectors=vectors, namespace="syllabus")

def query_vectors(embedding: list[float], subject: str, top_k: int = 5):
    """
    Query Pinecone for similar chunks filtered by subject
    """
    results = index.query(
        vector=embedding,
        top_k=top_k,
        namespace="syllabus",
        filter={"subject": {"$eq": subject}} if subject else None,
        include_metadata=True
    )
    return results.matches
```

### 2. `app/services/embedding_service.py`

```python
from sentence_transformers import SentenceTransformer

# This model is ~80MB and runs on CPU — no GPU needed
model = SentenceTransformer('all-MiniLM-L6-v2')

def get_embedding(text: str) -> list[float]:
    """Get single text embedding"""
    return model.encode(text).tolist()

def get_embeddings(texts: list[str]) -> list[list[float]]:
    """Get batch embeddings"""
    return model.encode(texts).tolist()
```

### 3. `app/services/rag_service.py`

```python
from app.services.embedding_service import get_embedding
from app.services.pinecone_service import query_vectors

def retrieve_context(question: str, subject: str, top_k: int = 5) -> list[dict]:
    """
    1. Embed the question
    2. Search Pinecone for similar chunks
    3. Return relevant context with sources
    """
    question_embedding = get_embedding(question)
    matches = query_vectors(question_embedding, subject, top_k)

    context = []
    for match in matches:
        context.append({
            "text": match.metadata.get("text", ""),
            "source": match.metadata.get("source", "Unknown"),
            "score": match.score
        })

    return context


def process_syllabus_pdf(file_bytes: bytes, subject: str, syllabus_id: str):
    """
    1. Extract text from PDF
    2. Split into chunks (500 tokens, 50 overlap)
    3. Embed each chunk
    4. Upsert to Pinecone
    """
    from pypdf2 import PdfReader
    from io import BytesIO
    from app.services.embedding_service import get_embeddings
    from app.services.pinecone_service import upsert_vectors
    import uuid

    # Extract text
    reader = PdfReader(BytesIO(file_bytes))
    full_text = ""
    for i, page in enumerate(reader.pages):
        full_text += f"\n[Page {i+1}]\n" + page.extract_text()

    # Chunk text (simple approach — split by ~500 words)
    words = full_text.split()
    chunk_size = 500
    overlap = 50
    chunks = []
    for i in range(0, len(words), chunk_size - overlap):
        chunk_text = " ".join(words[i:i + chunk_size])
        chunks.append(chunk_text)

    # Embed all chunks
    embeddings = get_embeddings([c for c in chunks])

    # Prepare vectors for Pinecone
    vectors = []
    for i, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
        vectors.append({
            "id": f"{syllabus_id}-chunk-{i}",
            "values": embedding,
            "metadata": {
                "text": chunk,
                "subject": subject,
                "source": f"Syllabus: {subject}, Chunk {i+1}",
                "syllabus_id": syllabus_id
            }
        })

    # Upsert to Pinecone (batch of 100)
    for i in range(0, len(vectors), 100):
        batch = vectors[i:i+100]
        upsert_vectors(batch)

    return len(chunks)
```

### 4. `app/services/llm_service.py`

```python
from groq import Groq
from app.config import settings
from app.prompts.socratic import SOCRATIC_SYSTEM_PROMPT
from app.prompts.direct import DIRECT_SYSTEM_PROMPT

client = Groq(api_key=settings.GROQ_API_KEY)

def ask_llm(
    question: str,
    context: list[dict],
    mode: str = "socratic",
    chat_history: list[dict] = None
) -> dict:
    """
    Send question + RAG context to Groq LLM.
    Returns: { response, confidence }
    """
    # Build context string from RAG results
    context_str = "\n\n".join([
        f"[Source: {c['source']}]\n{c['text']}" for c in context
    ])

    system_prompt = SOCRATIC_SYSTEM_PROMPT if mode == "socratic" else DIRECT_SYSTEM_PROMPT

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "system", "content": f"## Relevant Syllabus Context:\n\n{context_str}"},
    ]

    # Add chat history if provided (last 6 messages for conversation memory)
    if chat_history:
        for msg in chat_history[-6:]:
            messages.append({"role": msg["role"], "content": msg["content"]})

    messages.append({"role": "user", "content": question})

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=messages,
        temperature=0.3,
        max_tokens=1024,
    )

    answer = response.choices[0].message.content

    # Simple confidence scoring based on context match scores
    avg_context_score = sum(c.get("score", 0) for c in context) / max(len(context), 1)
    confidence = round(min(avg_context_score * 1.2, 1.0), 2)  # Scale up slightly, cap at 1.0

    return {
        "response": answer,
        "confidence": confidence
    }


def detect_topic(question: str, subject: str) -> str:
    """Use LLM to detect which topic the question falls under"""
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": f"You are a topic classifier for the subject '{subject}'. Given a student's question, respond with ONLY the topic name (2-4 words). No explanation."},
            {"role": "user", "content": question}
        ],
        temperature=0,
        max_tokens=20,
    )
    return response.choices[0].message.content.strip()
```

### 5. `app/prompts/socratic.py`

```python
SOCRATIC_SYSTEM_PROMPT = """You are DoubtMap AI — a Socratic tutor for college students.

## YOUR TEACHING METHOD:
- NEVER give direct answers immediately
- Instead, guide the student step-by-step using questions
- Start by checking what they already know about the topic
- Build on their existing knowledge
- If they're completely lost, give a small hint, then ask again
- After 2-3 exchanges, if they still struggle, give a clear explanation

## RULES:
1. Use the syllabus context provided to give accurate, curriculum-aligned answers
2. Reference specific sources/pages when possible
3. Keep responses concise — max 3-4 sentences per exchange
4. Use simple language, avoid jargon unless explaining it
5. Use code examples when relevant (properly formatted in markdown)
6. If the context doesn't cover the question, say so honestly
7. Always be encouraging — never make students feel dumb

## FORMAT:
- Use markdown for formatting
- Use ```code blocks``` for code
- Use **bold** for key terms
- Use bullet points for lists"""
```

### 6. `app/prompts/direct.py`

```python
DIRECT_SYSTEM_PROMPT = """You are DoubtMap AI — a knowledgeable tutor for college students.

## YOUR TEACHING METHOD:
- Give clear, direct explanations
- Start with a concise answer, then elaborate
- Use examples to illustrate concepts
- Reference the syllabus context provided

## RULES:
1. Use the syllabus context to give curriculum-aligned answers
2. Reference specific sources/pages when relevant
3. Keep responses focused and clear
4. Use simple language
5. Use code examples when helpful (markdown formatted)
6. If the context doesn't cover the question, say so honestly

## FORMAT:
- Use markdown for formatting
- Use ```code blocks``` for code
- Use **bold** for key terms
- Use bullet points for lists"""
```

### 7. `app/prompts/report.py`

```python
REPORT_SYSTEM_PROMPT = """You are DoubtMap AI generating a weekly learning report for a student.

Given the student's doubt history for the past week, generate:
1. A brief summary of their learning activity (2-3 sentences)
2. A list of weak topics they need to focus on
3. A list of strong topics they're doing well in
4. An improvement score (0-100) based on doubt resolution and variety
5. 3-4 specific, actionable study suggestions

Respond in this EXACT JSON format:
{
  "summary": "...",
  "weak_topics": ["topic1", "topic2"],
  "strong_topics": ["topic1", "topic2"],
  "improvement_score": 72,
  "suggestions": ["suggestion1", "suggestion2", "suggestion3"]
}

Only respond with valid JSON. No extra text."""
```

---

## ROUTE IMPLEMENTATIONS

### `app/routes/chat.py`

```python
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.database.models import Doubt
from app.services.rag_service import retrieve_context
from app.services.llm_service import ask_llm, detect_topic
from app.schemas.chat import ChatRequest, ChatResponse
import json

router = APIRouter(prefix="/chat", tags=["chat"])

@router.post("/ask", response_model=ChatResponse)
async def ask_doubt(req: ChatRequest, db: Session = Depends(get_db)):
    # 1. Retrieve context from RAG
    context = retrieve_context(req.message, req.subject)

    # 2. Get LLM response
    result = ask_llm(
        question=req.message,
        context=context,
        mode=req.mode
    )

    # 3. Detect topic
    topic = detect_topic(req.message, req.subject) if req.subject else "General"

    # 4. Determine if should escalate (confidence < 0.5)
    should_escalate = result["confidence"] < 0.5

    # 5. Save to database
    doubt = Doubt(
        user_id=req.user_id,
        message=req.message,
        response=result["response"],
        subject=req.subject,
        topic_detected=topic,
        confidence=result["confidence"],
        sources=json.dumps([c["source"] for c in context]),
        mode=req.mode,
        escalated=should_escalate
    )
    db.add(doubt)
    db.commit()
    db.refresh(doubt)

    # 6. Return response
    return ChatResponse(
        response=result["response"],
        confidence=result["confidence"],
        sources=[c["source"] for c in context],
        mode=req.mode,
        doubt_id=str(doubt.id),
        topic_detected=topic
    )


@router.get("/history")
async def get_chat_history(user_id: str, limit: int = 50, db: Session = Depends(get_db)):
    doubts = db.query(Doubt).filter(
        Doubt.user_id == user_id
    ).order_by(Doubt.created_at.desc()).limit(limit).all()

    return {
        "messages": [
            {
                "id": str(d.id),
                "user_id": d.user_id,
                "message": d.message,
                "response": d.response,
                "confidence": d.confidence,
                "topic": d.topic_detected,
                "mode": d.mode,
                "sources": json.loads(d.sources) if d.sources else [],
                "created_at": d.created_at.isoformat()
            }
            for d in doubts
        ]
    }
```

### `app/routes/doubts.py`

```python
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database.connection import get_db
from app.database.models import Doubt

router = APIRouter(prefix="/doubts", tags=["doubts"])

@router.get("/heatmap")
async def get_heatmap(subject: str = None, db: Session = Depends(get_db)):
    query = db.query(
        Doubt.topic_detected,
        func.count(Doubt.id).label("count"),
        func.avg(Doubt.confidence).label("avg_confidence")
    )
    if subject:
        query = query.filter(Doubt.subject == subject)

    results = query.group_by(Doubt.topic_detected).order_by(func.count(Doubt.id).desc()).all()

    return {
        "topics": [
            {
                "topic": r.topic_detected or "Unknown",
                "count": r.count,
                "avg_confidence": round(float(r.avg_confidence or 0), 2)
            }
            for r in results
        ]
    }

@router.get("/recent")
async def get_recent_doubts(limit: int = 20, db: Session = Depends(get_db)):
    doubts = db.query(Doubt).order_by(Doubt.created_at.desc()).limit(limit).all()

    return {
        "doubts": [
            {
                "id": str(d.id),
                "student_name": "Anonymous",
                "topic": d.topic_detected,
                "message": d.message,
                "confidence": d.confidence,
                "escalated": d.escalated,
                "created_at": d.created_at.isoformat()
            }
            for d in doubts
        ]
    }

@router.get("/escalated")
async def get_escalated_doubts(db: Session = Depends(get_db)):
    doubts = db.query(Doubt).filter(
        Doubt.escalated == True,
        Doubt.professor_response.is_(None)
    ).order_by(Doubt.created_at.desc()).all()

    # Group by topic and count
    topic_groups = {}
    for d in doubts:
        topic = d.topic_detected or "Unknown"
        if topic not in topic_groups:
            topic_groups[topic] = {
                "id": str(d.id),
                "topic": topic,
                "message": d.message,
                "student_count": 0,
                "professor_response": None,
                "created_at": d.created_at.isoformat()
            }
        topic_groups[topic]["student_count"] += 1

    return {"doubts": list(topic_groups.values())}

@router.post("/escalated/{doubt_id}/respond")
async def respond_to_escalation(doubt_id: str, professor_id: str, response: str, db: Session = Depends(get_db)):
    doubt = db.query(Doubt).filter(Doubt.id == doubt_id).first()
    if doubt:
        doubt.professor_response = response
        db.commit()
    return {"status": "ok"}
```

### `app/routes/syllabus.py`

```python
from fastapi import APIRouter, UploadFile, File, Form, Depends, BackgroundTasks
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.database.models import Syllabus
from app.services.rag_service import process_syllabus_pdf

router = APIRouter(prefix="/syllabus", tags=["syllabus"])

@router.post("/upload")
async def upload_syllabus(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    subject: str = Form(...),
    professor_id: str = Form(...),
    db: Session = Depends(get_db)
):
    # Save record to DB
    syllabus = Syllabus(
        subject=subject,
        filename=file.filename,
        professor_id=professor_id,
        status="processing"
    )
    db.add(syllabus)
    db.commit()
    db.refresh(syllabus)

    # Read file bytes
    file_bytes = await file.read()

    # Process in background (embed + upsert to Pinecone)
    background_tasks.add_task(
        _process_and_update,
        file_bytes, subject, str(syllabus.id), db
    )

    return {
        "message": "Syllabus uploaded and indexing started",
        "syllabus_id": str(syllabus.id),
        "status": "processing"
    }


async def _process_and_update(file_bytes, subject, syllabus_id, db):
    try:
        chunk_count = process_syllabus_pdf(file_bytes, subject, syllabus_id)
        syllabus = db.query(Syllabus).filter(Syllabus.id == syllabus_id).first()
        syllabus.status = "indexed"
        syllabus.chunk_count = chunk_count
        db.commit()
    except Exception as e:
        syllabus = db.query(Syllabus).filter(Syllabus.id == syllabus_id).first()
        syllabus.status = "failed"
        db.commit()
        print(f"Error processing syllabus: {e}")


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
                "uploaded_at": s.created_at.isoformat()
            }
            for s in syllabi
        ]
    }
```

### `app/routes/reports.py`

```python
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.database.models import Report
import json

router = APIRouter(prefix="/reports", tags=["reports"])

@router.get("")
async def get_reports(user_id: str, db: Session = Depends(get_db)):
    reports = db.query(Report).filter(
        Report.user_id == user_id
    ).order_by(Report.created_at.desc()).all()

    return {
        "reports": [
            {
                "id": str(r.id),
                "week": f"{r.week_start.strftime('%B %d')} - {r.week_end.strftime('%B %d, %Y')}",
                "total_doubts": r.total_doubts,
                "weak_topics": json.loads(r.weak_topics) if r.weak_topics else [],
                "strong_topics": json.loads(r.strong_topics) if r.strong_topics else [],
                "improvement_score": r.improvement_score,
                "summary": r.summary,
                "suggestions": json.loads(r.suggestions) if r.suggestions else [],
                "created_at": r.created_at.isoformat()
            }
            for r in reports
        ]
    }
```

### `app/routes/webhooks.py` — n8n calls these

```python
from fastapi import APIRouter, Header, HTTPException, Depends
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.database.models import Doubt, Report
from app.services.llm_service import ask_llm
from app.config import settings
from datetime import datetime, timedelta
import json

router = APIRouter(prefix="/webhooks/n8n", tags=["webhooks"])

def verify_n8n_secret(x_n8n_secret: str = Header(None)):
    if x_n8n_secret != settings.N8N_WEBHOOK_SECRET:
        raise HTTPException(status_code=401, detail="Unauthorized")

@router.post("/generate-report")
async def generate_report(
    user_id: str,
    db: Session = Depends(get_db),
    _=Depends(verify_n8n_secret)
):
    """n8n calls this weekly to generate a student report"""
    week_end = datetime.utcnow()
    week_start = week_end - timedelta(days=7)

    # Get all doubts from this week
    doubts = db.query(Doubt).filter(
        Doubt.user_id == user_id,
        Doubt.created_at >= week_start,
        Doubt.created_at <= week_end
    ).all()

    if not doubts:
        return {"status": "no_doubts", "message": "No doubts this week"}

    # Prepare doubt summary for LLM
    doubt_summary = "\n".join([
        f"- Topic: {d.topic_detected}, Question: {d.message}, Confidence: {d.confidence}"
        for d in doubts
    ])

    from app.prompts.report import REPORT_SYSTEM_PROMPT
    from groq import Groq

    client = Groq(api_key=settings.GROQ_API_KEY)
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": REPORT_SYSTEM_PROMPT},
            {"role": "user", "content": f"Student had {len(doubts)} doubts this week:\n{doubt_summary}"}
        ],
        temperature=0.3,
        max_tokens=1024,
    )

    report_data = json.loads(response.choices[0].message.content)

    # Save report to DB
    report = Report(
        user_id=user_id,
        week_start=week_start,
        week_end=week_end,
        total_doubts=len(doubts),
        weak_topics=json.dumps(report_data["weak_topics"]),
        strong_topics=json.dumps(report_data["strong_topics"]),
        improvement_score=report_data["improvement_score"],
        summary=report_data["summary"],
        suggestions=json.dumps(report_data["suggestions"])
    )
    db.add(report)
    db.commit()

    return {"status": "ok", "report_id": str(report.id)}


@router.post("/get-escalated")
async def get_escalated_for_n8n(
    db: Session = Depends(get_db),
    _=Depends(verify_n8n_secret)
):
    """n8n calls this to get escalated doubts for professor notification"""
    doubts = db.query(Doubt).filter(
        Doubt.escalated == True,
        Doubt.professor_response.is_(None)
    ).all()

    return {
        "escalated_count": len(doubts),
        "doubts": [
            {
                "topic": d.topic_detected,
                "message": d.message,
                "confidence": d.confidence
            }
            for d in doubts
        ]
    }
```

### `app/routes/health.py`

```python
from fastapi import APIRouter

router = APIRouter(tags=["health"])

@router.get("/health")
async def health_check():
    return {"status": "ok", "version": "1.0.0"}
```

---

## MAIN APP ENTRY POINT

### `app/main.py`

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routes import chat, doubts, reports, syllabus, webhooks, health
from app.database.connection import engine
from app.database.models import Base

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="DoubtMap API", version="1.0.0")

# CORS — allow frontend origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes under /api/v1 prefix
app.include_router(health.router, prefix="/api/v1")
app.include_router(chat.router, prefix="/api/v1")
app.include_router(doubts.router, prefix="/api/v1")
app.include_router(reports.router, prefix="/api/v1")
app.include_router(syllabus.router, prefix="/api/v1")
app.include_router(webhooks.router, prefix="/api/v1")
```

### `app/config.py`

```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    GROQ_API_KEY: str
    PINECONE_API_KEY: str
    PINECONE_INDEX_NAME: str = "doubtmap-syllabus"
    PINECONE_ENVIRONMENT: str = "us-east-1"
    CORS_ORIGINS: str = "http://localhost:3000"
    N8N_WEBHOOK_SECRET: str = "change-me"
    APP_ENV: str = "development"

    class Config:
        env_file = ".env"

settings = Settings()
```

### `app/database/connection.py`

```python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.config import settings

engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

---

## PYDANTIC SCHEMAS

### `app/schemas/chat.py`

```python
from pydantic import BaseModel

class ChatRequest(BaseModel):
    user_id: str
    message: str
    subject: str | None = None
    mode: str = "socratic"  # "socratic" | "direct"

class ChatResponse(BaseModel):
    response: str
    confidence: float
    sources: list[str]
    mode: str
    doubt_id: str
    topic_detected: str
```

---

## PINECONE SETUP (One-time)

```python
# Run this once to create the index:
from pinecone import Pinecone, ServerlessSpec

pc = Pinecone(api_key="your-key")
pc.create_index(
    name="doubtmap-syllabus",
    dimension=384,          # all-MiniLM-L6-v2 outputs 384 dimensions
    metric="cosine",
    spec=ServerlessSpec(cloud="aws", region="us-east-1")
)
```

---

## RENDER DEPLOY

### `Dockerfile`
```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### `render.yaml`
```yaml
services:
  - type: web
    name: doubtmap-api
    runtime: docker
    repo: https://github.com/your-repo
    rootDir: backend
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: doubtmap-db
          property: connectionString
      - key: GROQ_API_KEY
        sync: false
      - key: PINECONE_API_KEY
        sync: false
      - key: PINECONE_INDEX_NAME
        value: doubtmap-syllabus
      - key: CORS_ORIGINS
        value: https://doubtmap.vercel.app
      - key: N8N_WEBHOOK_SECRET
        sync: false

databases:
  - name: doubtmap-db
    plan: free
    databaseName: doubtmap
```

### Deploy Steps:
1. Push `backend/` to GitHub
2. Go to render.com → New → Web Service
3. Connect repo → set root directory to `backend`
4. Set environment variables
5. Deploy → get URL like `https://doubtmap-api.onrender.com`

---

## LOCAL DEVELOPMENT

```bash
cd backend
source venv/bin/activate

# Run locally
uvicorn app.main:app --reload --port 8000

# Test endpoints
# http://localhost:8000/docs  ← FastAPI Swagger UI auto-generated
```

---

## DO'S AND DON'TS

| DO | DON'T |
|---|---|
| Only work in `backend/` | Touch `frontend/` or `n8n/` |
| Follow the exact API contract above | Change response shapes without telling Laptop 1 |
| Use background tasks for PDF processing | Block the API while processing PDFs |
| Use Groq API (free, fast) | Try to run models locally |
| Add CORS for frontend URLs | Forget CORS — frontend will get blocked |
| Use the webhook secret for n8n routes | Leave webhook endpoints unprotected |
| Test with FastAPI Swagger at `/docs` | Guess if endpoints work |

---

## PRIORITY ORDER (If time is short)

1. POST `/chat/ask` — the CORE feature (RAG + LLM)
2. Syllabus upload + Pinecone indexing
3. GET `/doubts/heatmap` — professor dashboard needs this
4. GET `/chat/history`
5. Webhook: `/webhooks/n8n/generate-report`
6. GET `/doubts/escalated` + POST respond
7. GET `/reports`
8. GET `/doubts/recent`
