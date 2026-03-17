"""
Run this ONCE to create the Pinecone index before starting the app.
Usage:
    cd backend
    source venv/bin/activate
    python setup_pinecone.py
"""

import os
from dotenv import load_dotenv

load_dotenv()

from pinecone import Pinecone, ServerlessSpec

api_key = os.getenv("PINECONE_API_KEY")
index_name = os.getenv("PINECONE_INDEX_NAME", "doubtmap-syllabus")

pc = Pinecone(api_key=api_key)

existing = [i.name for i in pc.list_indexes()]
if index_name in existing:
    print(f"Index '{index_name}' already exists — nothing to do.")
else:
    pc.create_index(
        name=index_name,
        dimension=384,          # all-MiniLM-L6-v2 output dimension
        metric="cosine",
        spec=ServerlessSpec(cloud="aws", region="us-east-1"),
    )
    print(f"Index '{index_name}' created successfully.")
