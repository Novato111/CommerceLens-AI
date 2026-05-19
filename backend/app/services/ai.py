from google import genai

from app.core.config import settings


# Initialize Gemini client
client = genai.Client(
    api_key=settings.GEMINI_API_KEY
)


def generate_embedding(text: str) -> list[float]:
    """
    Generate a 768-dimensional embedding vector.
    """
    try:
        response = client.models.embed_content(
            model="text-embedding-004",
            contents=text,
        )

        return response.embeddings[0].values

    except Exception as e:
        print(f"Error generating embedding: {e}")
        raise