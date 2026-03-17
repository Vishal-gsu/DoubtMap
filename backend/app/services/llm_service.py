from groq import Groq
from app.config import settings
from app.prompts.socratic import SOCRATIC_SYSTEM_PROMPT
from app.prompts.direct import DIRECT_SYSTEM_PROMPT

_client = None


def _get_client() -> Groq:
    global _client
    if _client is None:
        _client = Groq(api_key=settings.GROQ_API_KEY)
    return _client


def ask_llm(
    question: str,
    context: list[dict],
    mode: str = "socratic",
    chat_history: list[dict] | None = None,
) -> dict:
    """
    Send question + RAG context to Groq (Llama 3.3 70B).
    Returns: { response: str, confidence: float }
    """
    client = _get_client()

    context_str = "\n\n".join(
        f"[Source: {c['source']}]\n{c['text']}" for c in context
    )

    system_prompt = SOCRATIC_SYSTEM_PROMPT if mode == "socratic" else DIRECT_SYSTEM_PROMPT

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "system", "content": f"## Relevant Syllabus Context:\n\n{context_str}"},
    ]

    # Append last 6 turns of conversation for memory
    if chat_history:
        for msg in chat_history[-6:]:
            messages.append({"role": msg["role"], "content": msg["content"]})

    messages.append({"role": "user", "content": question})

    completion = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=messages,
        temperature=0.3,
        max_tokens=1024,
    )

    answer = completion.choices[0].message.content

    # Confidence based on avg RAG match score (cosine similarity)
    if context:
        avg_score = sum(c.get("score", 0.0) for c in context) / len(context)
        confidence = round(min(avg_score * 1.2, 1.0), 2)
    else:
        confidence = 0.3  # No context found → low confidence

    return {"response": answer, "confidence": confidence}


def detect_topic(question: str, subject: str) -> str:
    """
    Ask the LLM to classify the question into a 2-4 word topic name.
    Adds minimal latency — uses tiny token budget.
    """
    client = _get_client()
    completion = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "system",
                "content": (
                    f"You are a topic classifier for '{subject}'. "
                    "Given a student question, reply with ONLY the topic name in 2-4 words. No explanation."
                ),
            },
            {"role": "user", "content": question},
        ],
        temperature=0,
        max_tokens=20,
    )
    return completion.choices[0].message.content.strip()
