from pinecone import Pinecone
from app.config import settings

_pc = None
_index = None


def _get_index():
    global _pc, _index
    if _index is None:
        _pc = Pinecone(api_key=settings.PINECONE_API_KEY)
        _index = _pc.Index(settings.PINECONE_INDEX_NAME)
    return _index


def upsert_vectors(vectors: list[dict]):
    """
    vectors: [{"id": str, "values": list[float], "metadata": dict}]
    """
    _get_index().upsert(vectors=vectors, namespace="syllabus")


def query_vectors(embedding: list[float], subject: str | None, top_k: int = 5) -> list:
    """
    Query Pinecone for similar chunks, optionally filtered by subject.
    Returns list of matches with metadata.
    """
    filter_dict = {"subject": {"$eq": subject}} if subject else None
    results = _get_index().query(
        vector=embedding,
        top_k=top_k,
        namespace="syllabus",
        filter=filter_dict,
        include_metadata=True,
    )
    return results.matches
