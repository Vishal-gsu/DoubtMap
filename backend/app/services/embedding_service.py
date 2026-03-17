from sentence_transformers import SentenceTransformer

# ~80MB model, runs on CPU — no GPU needed
_model = None


def _get_model() -> SentenceTransformer:
    global _model
    if _model is None:
        _model = SentenceTransformer("all-MiniLM-L6-v2")
    return _model


def get_embedding(text: str) -> list[float]:
    return _get_model().encode(text).tolist()


def get_embeddings(texts: list[str]) -> list[list[float]]:
    return _get_model().encode(texts).tolist()
