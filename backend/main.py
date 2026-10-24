import os
import base64
import json
import re
from typing import Optional
from pathlib import Path
from dotenv import load_dotenv
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import httpx

# Load environment variables from backend/.env or root .env
backend_dir = Path(__file__).resolve().parent
load_dotenv(backend_dir / ".env")
load_dotenv(backend_dir.parent / ".env")

GEMMA_API_KEY = os.getenv("GEMMA_API_KEY", "").strip()
GEMMA_MODEL = os.getenv("GEMMA_MODEL", "gemma-4").strip()

app = FastAPI(
  title="RepoGenius AI Backend",
  description="FastAPI service for Google Gemma 4 developer intelligence",
  version="1.0.0",
)

# Enable CORS for Vite frontend
app.add_middleware(
  CORSMiddleware,
  allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"],
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)

MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB limit
ALLOWED_MIME_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"]


class RepoExplainRequest(BaseModel):
  repo_name: str = Field(..., min_length=1, max_length=120)
  description: Optional[str] = ""
  language: Optional[str] = ""
  stars: Optional[int] = 0
  readme_excerpt: Optional[str] = Field(default="", max_length=12000)


class CodeExplainRequest(BaseModel):
  code: str = Field(..., min_length=1, max_length=20000)
  language: Optional[str] = ""
  context: Optional[str] = ""


def is_api_key_configured() -> bool:
  key = os.getenv("GEMMA_API_KEY", "").strip()
  return bool(key and key != "your_gemma_api_key_here")


@app.get("/api/health")
async def health_check():
  configured = is_api_key_configured()
  return {
    "status": "online",
    "gemma_configured": configured,
    "model": GEMMA_MODEL,
    "version": "1.0.0",
  }


@app.post("/api/explain-repo")
async def explain_repo(req: RepoExplainRequest):
  """Feature 1: AI Repository Explanation using Gemma 4."""
  api_key = os.getenv("GEMMA_API_KEY", "").strip()
  if not api_key or api_key == "your_gemma_api_key_here":
    raise HTTPException(
      status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
      detail=(
        "Gemma 4 API key is not configured in backend/.env. "
        "Supply a valid GEMMA_API_KEY to generate live AI repository explanations."
      ),
    )

  prompt = (
    f"You are Gemma 4, an expert software architect.\n"
    f"Explain this GitHub repository in clear, developer-friendly terms:\n"
    f"Repository: {req.repo_name}\n"
    f"Description: {req.description}\n"
    f"Primary Language: {req.language}\n"
    f"Stars: {req.stars}\n"
    f"README Excerpt:\n{req.readme_excerpt}\n\n"
    f"Return a structured JSON object with two fields:\n"
    f"1. 'summary': A concise 2-3 sentence overview of what the project does and who it is for.\n"
    f"2. 'architecture_notes': Key design patterns, major subsystems, and primary architectural concepts.\n"
    f"Return ONLY valid JSON."
  )

  endpoint = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMMA_MODEL}:generateContent?key={api_key}"
  payload = {
    "contents": [{"parts": [{"text": prompt}]}],
    "generationConfig": {"temperature": 0.2, "maxOutputTokens": 2048},
  }

  try:
    async with httpx.AsyncClient(timeout=45.0) as client:
      response = await client.post(endpoint, json=payload)

    if response.status_code != 200:
      raise HTTPException(
        status_code=status.HTTP_502_BAD_GATEWAY,
        detail=f"Gemma API returned HTTP {response.status_code}: {response.text[:300]}",
      )

    res_json = response.json()
    candidates = res_json.get("candidates", [])
    if not candidates:
      raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Gemma API returned an empty candidate list.",
      )

    raw_text = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")

    summary = raw_text
    architecture_notes = ""

    json_match = re.search(r"\{[\s\S]*\}", raw_text)
    if json_match:
      try:
        parsed = json.loads(json_match.group(0))
        summary = parsed.get("summary", summary)
        architecture_notes = parsed.get("architecture_notes", "")
      except Exception:
        pass

    return {
      "summary": summary,
      "architecture_notes": architecture_notes,
      "model": GEMMA_MODEL,
    }

  except httpx.RequestError as exc:
    raise HTTPException(
      status_code=status.HTTP_504_GATEWAY_TIMEOUT,
      detail=f"Network error querying Gemma API: {str(exc)}",
    )


@app.post("/api/explain-code")
async def explain_code(req: CodeExplainRequest):
  """Feature 2: AI Code Explainer using Gemma 4."""
  api_key = os.getenv("GEMMA_API_KEY", "").strip()
  if not api_key or api_key == "your_gemma_api_key_here":
    raise HTTPException(
      status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
      detail=(
        "Gemma 4 API key is not configured in backend/.env. "
        "Supply a valid GEMMA_API_KEY to generate live code explanations."
      ),
    )

  prompt = (
    f"You are Gemma 4, an expert programming mentor.\n"
    f"Explain this code snippet in a clear, beginner-friendly manner:\n"
    f"Language: {req.language or 'Auto-detect'}\n"
    f"Developer Context: {req.context or 'General explanation'}\n\n"
    f"Code:\n```\n{req.code}\n```\n\n"
    f"Return a structured JSON object with three fields:\n"
    f"1. 'summary': High-level plain English summary of what this code does.\n"
    f"2. 'detailed_explanation': Step-by-step or concept breakdown of how the code works.\n"
    f"3. 'key_takeaways': 2-3 important best practices, potential gotchas, or lessons from this snippet.\n"
    f"Return ONLY valid JSON."
  )

  endpoint = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMMA_MODEL}:generateContent?key={api_key}"
  payload = {
    "contents": [{"parts": [{"text": prompt}]}],
    "generationConfig": {"temperature": 0.2, "maxOutputTokens": 2048},
  }

  try:
    async with httpx.AsyncClient(timeout=45.0) as client:
      response = await client.post(endpoint, json=payload)

    if response.status_code != 200:
      raise HTTPException(
        status_code=status.HTTP_502_BAD_GATEWAY,
        detail=f"Gemma API returned HTTP {response.status_code}: {response.text[:300]}",
      )

    res_json = response.json()
    candidates = res_json.get("candidates", [])
    if not candidates:
      raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Gemma API returned an empty candidate list.",
      )

    raw_text = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")

    summary = raw_text
    detailed_explanation = ""
    key_takeaways = ""

    json_match = re.search(r"\{[\s\S]*\}", raw_text)
    if json_match:
      try:
        parsed = json.loads(json_match.group(0))
        summary = parsed.get("summary", summary)
        detailed_explanation = parsed.get("detailed_explanation", "")
        key_takeaways = parsed.get("key_takeaways", "")
      except Exception:
        pass

    return {
      "summary": summary,
      "detailed_explanation": detailed_explanation,
      "key_takeaways": key_takeaways,
      "model": GEMMA_MODEL,
    }

  except httpx.RequestError as exc:
    raise HTTPException(
      status_code=status.HTTP_504_GATEWAY_TIMEOUT,
      detail=f"Network error querying Gemma API: {str(exc)}",
    )


@app.post("/api/debug-screenshot")
async def debug_screenshot(
  image: UploadFile = File(...),
  question: str = Form(default="Diagnose the programming error in this screenshot, identify the root cause, and provide a suggested fix."),
):
  """Feature 3: Visual Debugger using Gemma 4 Image Understanding."""
  # Validate file mime type
  if image.content_type not in ALLOWED_MIME_TYPES:
    raise HTTPException(
      status_code=status.HTTP_400_BAD_REQUEST,
      detail=f"Unsupported file format '{image.content_type}'. Please upload a PNG, JPEG, or WebP image.",
    )

  # Read and validate file size
  image_bytes = await image.read()
  if len(image_bytes) > MAX_IMAGE_SIZE_BYTES:
    raise HTTPException(
      status_code=status.HTTP_400_BAD_REQUEST,
      detail=f"Image size exceeds 10MB limit (size: {len(image_bytes)/(1024*1024):.2f}MB).",
    )

  if len(image_bytes) == 0:
    raise HTTPException(
      status_code=status.HTTP_400_BAD_REQUEST,
      detail="Uploaded image file is empty.",
    )

  # Check API Key
  api_key = os.getenv("GEMMA_API_KEY", "").strip()
  if not api_key or api_key == "your_gemma_api_key_here":
    raise HTTPException(
      status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
      detail=(
        "Gemma 4 API key is not configured in backend/.env. "
        "Per hackathon requirements, successful AI responses are not simulated. "
        "Supply a valid GEMMA_API_KEY to execute live visual debugging."
      ),
    )

  # Prepare multimodal prompt
  base64_data = base64.b64encode(image_bytes).decode("utf-8")
  mime_type = image.content_type or "image/png"

  system_prompt = (
    "You are Gemma 4, an expert software developer and visual code debugger. "
    "Analyze this error screenshot and the developer question. "
    "Return your response in a structured JSON object with three fields:\n"
    "1. 'diagnosis': A precise explanation of what error or exception is visible.\n"
    "2. 'likely_cause': The root technical reason for the issue.\n"
    "3. 'suggested_fix': The code snippet or exact step-by-step remediation to resolve it.\n"
    "Return ONLY valid JSON."
  )

  full_prompt = f"{system_prompt}\n\nDeveloper question: {question}"

  endpoint = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMMA_MODEL}:generateContent?key={api_key}"
  payload = {
    "contents": [
      {
        "parts": [
          {"text": full_prompt},
          {
            "inline_data": {
              "mime_type": mime_type,
              "data": base64_data,
            }
          },
        ]
      }
    ],
    "generationConfig": {"temperature": 0.2, "maxOutputTokens": 2048},
  }

  try:
    async with httpx.AsyncClient(timeout=60.0) as client:
      response = await client.post(endpoint, json=payload)

    if response.status_code != 200:
      raise HTTPException(
        status_code=status.HTTP_502_BAD_GATEWAY,
        detail=f"Gemma API returned HTTP {response.status_code}: {response.text[:300]}",
      )

    res_json = response.json()
    candidates = res_json.get("candidates", [])
    if not candidates:
      raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Gemma API returned empty response candidates.",
      )

    raw_text = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")

    diagnosis = "Error identified in provided screenshot."
    likely_cause = "Code execution halted due to unexpected syntax or runtime exception."
    suggested_fix = raw_text

    json_match = re.search(r"\{[\s\S]*\}", raw_text)
    if json_match:
      try:
        parsed = json.loads(json_match.group(0))
        diagnosis = parsed.get("diagnosis", diagnosis)
        likely_cause = parsed.get("likely_cause", likely_cause)
        suggested_fix = parsed.get("suggested_fix", suggested_fix)
      except Exception:
        pass

    return {
      "diagnosis": diagnosis,
      "likely_cause": likely_cause,
      "suggested_fix": suggested_fix,
      "model": GEMMA_MODEL,
    }

  except httpx.RequestError as exc:
    raise HTTPException(
      status_code=status.HTTP_504_GATEWAY_TIMEOUT,
      detail=f"Network error querying Gemma API: {str(exc)}",
    )


if __name__ == "__main__":
  import uvicorn

  host = os.getenv("HOST", "127.0.0.1")
  port = int(os.getenv("PORT", "8000"))
  uvicorn.run("main:app", host=host, port=port, reload=True)
