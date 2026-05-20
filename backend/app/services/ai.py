from google import genai
from google.genai import types
from app.core.config import settings

# Initialize the modern Gemini client
client = genai.Client(api_key=settings.GEMINI_API_KEY)

async def generate_embedding(text: str) -> list[float]:
    """
    Asynchronously generates a 768-dimensional float list using Gemini.
    """
    try:
        # Using the new embedding model and truncating it to match our Postgres schema
        response = await client.aio.models.embed_content(
            model='gemini-embedding-001',
            contents=text,
            config=types.EmbedContentConfig(output_dimensionality=768)
        )
        return response.embeddings[0].values
    except Exception as e:
        print(f"Error generating embedding: {e}")
        raise

async def stream_rag_response(user_query: str, context_products: list):
    """
    Takes a user query and a list of retrieved products, formats them into a strict prompt,
    and streams the response from Gemini token-by-token.
    """
    # 1. Format the retrieved context
    context_str = "\n\n".join([
        f"Product: {p.name}\nPrice: ${p.price}\nDescription: {p.description}"
        for p in context_products
    ])

    # 2. Build the System Prompt
    prompt = f"""
    You are an expert commerce assistant for an elite e-commerce platform. 
    Answer the user's question based strictly on the provided product context. 
    If the answer cannot be found in the context, politely inform the user.
    Be concise, professional, and highlight key specifications or prices.

    Context:
    {context_str}

    User Question: {user_query}
    """

    # 3. Call Gemini with streaming enabled
    try:
        response = await client.aio.models.generate_content_stream(
            model='gemini-2.5-flash',
            contents=prompt,
        )
        
        # Yield chunks in Server-Sent Events (SSE) format
        async for chunk in response:
            if chunk.text:
                yield f"data: {chunk.text}\n\n"
        
        # Send a specific event to tell the frontend the stream is done
        yield "data: [DONE]\n\n"
        
    except Exception as e:
        print(f"Error streaming response: {e}")
        yield f"data: Error generating response.\n\n"



import json

async def generate_product_comparison(product_a, product_b) -> dict:
    """
    Forces Gemini to output a structured JSON comparison between two products.
    """
    prompt = f"""
    You are an expert tech reviewer. Compare these two products and output ONLY a valid JSON object.
    Do not use markdown formatting like ```json. Just return the raw JSON string.
    
    Product A: {product_a.name} - ${product_a.price}
    Specs: {product_a.specifications}
    Description: {product_a.description}
    
    Product B: {product_b.name} - ${product_b.price}
    Specs: {product_b.specifications}
    Description: {product_b.description}
    
    Expected JSON format:
    {{
      "winner": "Product A or B",
      "verdict": "A one sentence summary of why",
      "product_a_pros": ["pro1", "pro2"],
      "product_b_pros": ["pro1", "pro2"],
      "key_differences": ["diff1", "diff2"]
    }}
    """

    try:
        response = await client.aio.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
        )
        
        # Clean the response in case Gemini includes markdown backticks
        clean_text = response.text.replace("```json", "").replace("```", "").strip()
        return json.loads(clean_text)
    except Exception as e:
        print(f"Error generating comparison: {e}")
        return {"error": "Failed to generate comparison"}
    


async def analyze_product_reviews(product, reviews) -> dict:
    """
    Forces Gemini to analyze a list of reviews and output structured sentiment JSON.
    """
    if not reviews:
        return {"error": "No reviews available to analyze."}

    review_text = "\n".join([f"Rating: {r.rating}/5 - {r.review_text}" for r in reviews])

    prompt = f"""
    You are a consumer insights analyst. Analyze the following customer reviews for {product.name}.
    Output ONLY a valid JSON object. Do not use markdown formatting like ```json.
    
    Reviews:
    {review_text}
    
    Expected JSON format:
    {{
      "overall_sentiment": "Positive, Neutral, or Negative",
      "score_out_of_10": 8.5,
      "top_praises": ["praise 1", "praise 2"],
      "dealbreakers": ["complaint 1", "complaint 2"],
      "buyer_advice": "One sentence summarizing if they should buy it based on reviews."
    }}
    """

    try:
        response = await client.aio.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
        )
        clean_text = response.text.replace("```json", "").replace("```", "").strip()
        return json.loads(clean_text)
    except Exception as e:
        print(f"Error analyzing reviews: {e}")
        return {"error": "Failed to analyze reviews"}
    


def generate_rag_prompt(user_query: str, context: str) -> str:
    """
    Constructs the prompt for Gemini, injecting the database context.
    """
    return f"""
    You are an expert commerce AI assistant. 
    Use the following product information to answer the user's question. 
    If the context does not contain the answer, say you don't know based on the available catalog.

    CONTEXT:
    {context}

    USER QUESTION:
    {user_query}
    
    RESPONSE:
    """