from app.services.embedding_service import get_embedding, get_embeddings
from app.services.pinecone_service import upsert_vectors, query_vectors


def retrieve_context(question: str, subject: str | None, top_k: int = 5) -> list[dict]:
    """
    1. Embed the question
    2. Search Pinecone for similar syllabus chunks
    3. Return list of {text, source, score}
    """
    question_embedding = get_embedding(question)
    matches = query_vectors(question_embedding, subject, top_k)

    context = []
    for match in matches:
        context.append({
            "text": match.metadata.get("text", ""),
            "source": match.metadata.get("source", "Unknown"),
            "score": match.score,
        })
    return context


def process_syllabus_pdf(file_bytes: bytes, subject: str, syllabus_id: str) -> int:
    """
    1. Extract text from PDF
    2. Split into overlapping chunks (~500 words, 50 overlap)
    3. Embed all chunks
    4. Upsert to Pinecone in batches of 100
    Returns total chunk count.
    """
    from pypdf import PdfReader
    from io import BytesIO

    # --- Extract text ---
    reader = PdfReader(BytesIO(file_bytes))
    full_text = ""
    for i, page in enumerate(reader.pages):
        page_text = page.extract_text() or ""
        full_text += f"\n[Page {i + 1}]\n{page_text}"

    # --- Chunk by words ---
    words = full_text.split()
    chunk_size = 500
    overlap = 50
    chunks = []
    for i in range(0, len(words), chunk_size - overlap):
        chunk_text = " ".join(words[i : i + chunk_size])
        if chunk_text.strip():
            chunks.append(chunk_text)

    if not chunks:
        return 0

    # --- Embed ---
    embeddings = get_embeddings(chunks)

    # --- Build Pinecone vectors ---
    vectors = []
    for i, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
        vectors.append({
            "id": f"{syllabus_id}-chunk-{i}",
            "values": embedding,
            "metadata": {
                "text": chunk,
                "subject": subject,
                "source": f"Syllabus: {subject}, Chunk {i + 1}",
                "syllabus_id": syllabus_id,
            },
        })

    # --- Upsert in batches of 100 ---
    for i in range(0, len(vectors), 100):
        upsert_vectors(vectors[i : i + 100])

    return len(chunks)
