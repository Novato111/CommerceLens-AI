from fastapi import APIRouter
from pydantic import BaseModel
import asyncio

from app.services.evaluation import benchmark_model_run, generate_lcs_diff

router = APIRouter()

class EvalRequest(BaseModel):
    query: str

@router.post("/run-ab-test")
async def run_ab_test(request: EvalRequest):
    """
    Runs two different prompting strategies concurrently and generates a text diff.
    """
    # Strategy A: Strict and concise
    prompt_a = f"You are a strict data assistant. Answer in one very short sentence. Request: {request.query}"
    
    # Strategy B: Friendly and detailed
    prompt_b = f"You are a friendly salesperson. Answer in 2-3 detailed sentences. Request: {request.query}"

    # Execute both network calls simultaneously to save time
    task_a = benchmark_model_run(prompt_a)
    task_b = benchmark_model_run(prompt_b)
    
    result_a, result_b = await asyncio.gather(task_a, task_b)
    
    # Generate the Token-Level Diff if both succeeded
    diff = []
    if result_a["status"] == "success" and result_b["status"] == "success":
        diff = generate_lcs_diff(result_a["text"], result_b["text"])

    return {
        "run_a": result_a,
        "run_b": result_b,
        "diff": diff
    }