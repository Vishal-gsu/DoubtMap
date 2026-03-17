"""Quick debug script — run with: venv/Scripts/python debug_test.py"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))

from dotenv import load_dotenv
load_dotenv()

print("=" * 50)
print("1. Testing config / env vars...")
try:
    from app.config import settings
    print(f"   GROQ_API_KEY   : {'SET' if settings.GROQ_API_KEY else 'MISSING'}")
    print(f"   PINECONE_KEY   : {'SET' if settings.PINECONE_API_KEY else 'MISSING'}")
    print(f"   PINECONE_INDEX : {settings.PINECONE_INDEX_NAME}")
    print(f"   DATABASE_URL   : {settings.DATABASE_URL}")
    print("   [OK]")
except Exception as e:
    print(f"   [FAIL] {e}")
    sys.exit(1)

print()
print("2. Testing DB connection + table creation...")
try:
    from app.database.connection import engine
    from app.database.models import Base
    Base.metadata.create_all(bind=engine)
    print("   [OK]")
except Exception as e:
    print(f"   [FAIL] {e}")

print()
print("3. Testing sentence-transformers embedding...")
try:
    from app.services.embedding_service import get_embedding
    vec = get_embedding("hello world")
    print(f"   Embedding dims : {len(vec)}")
    print("   [OK]")
except Exception as e:
    print(f"   [FAIL] {e}")

print()
print("4. Testing Pinecone connection...")
try:
    from app.services.pinecone_service import _get_index
    idx = _get_index()
    print(f"   Index          : {settings.PINECONE_INDEX_NAME}")
    print("   [OK]")
except Exception as e:
    print(f"   [FAIL] {e}")

print()
print("5. Testing Groq API call...")
try:
    from app.services.llm_service import ask_llm
    result = ask_llm(
        question="What is 2+2?",
        context=[],
        mode="direct"
    )
    print(f"   Response       : {result['response'][:80]}...")
    print(f"   Confidence     : {result['confidence']}")
    print("   [OK]")
except Exception as e:
    print(f"   [FAIL] {e}")

print()
print("=" * 50)
print("Done.")
