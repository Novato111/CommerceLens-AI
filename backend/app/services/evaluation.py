import time
import difflib
import asyncio
from app.services.ai import client

async def benchmark_model_run(prompt: str, model_name: str = 'gemini-2.5-flash'):
    """Runs a prompt against a model and tracks latency and metadata."""
    start_time = time.time()
    
    try:
        response = await client.aio.models.generate_content(
            model=model_name,
            contents=prompt,
        )
        end_time = time.time()
        
        # Safely extract token counts if available in the metadata
        token_count = 0
        if hasattr(response, 'usage_metadata') and response.usage_metadata:
            token_count = response.usage_metadata.candidates_token_count
        else:
            # Fallback estimation if metadata is missing
            token_count = len(response.text.split())

        return {
            "status": "success",
            "model": model_name,
            "latency_seconds": round(end_time - start_time, 3),
            "token_count": token_count,
            "text": response.text
        }
    except Exception as e:
        return {"status": "error", "error": str(e)}

def generate_lcs_diff(text1: str, text2: str):
    """
    Uses an LCS-based sequence matcher to find differences between two texts.
    Returns an array of operations to render a visual diff on the frontend.
    """
    words1 = text1.split()
    words2 = text2.split()
    matcher = difflib.SequenceMatcher(None, words1, words2)
    
    diff_output = []
    
    # get_opcodes returns instructions on how to turn words1 into words2
    for tag, i1, i2, j1, j2 in matcher.get_opcodes():
        if tag == 'equal':
            diff_output.append({"type": "equal", "text": " ".join(words1[i1:i2])})
        elif tag == 'replace':
            diff_output.append({"type": "remove", "text": " ".join(words1[i1:i2])})
            diff_output.append({"type": "add", "text": " ".join(words2[j1:j2])})
        elif tag == 'delete':
            diff_output.append({"type": "remove", "text": " ".join(words1[i1:i2])})
        elif tag == 'insert':
            diff_output.append({"type": "add", "text": " ".join(words2[j1:j2])})
            
    return diff_output