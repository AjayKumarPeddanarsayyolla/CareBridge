"""
CareBridge AI Service — Local FastAPI Healthcare Assistant with RAG
Provides privacy-preserving clinical triage, retrieval, and transparent fallbacks.
"""

import os
import sys
import time
from typing import Optional, List
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from safety_guard import check_emergency_symptoms
from rag_engine import RAGEngine

app = FastAPI(
    title="CareBridge Local AI Healthcare Assistant",
    description="RAG-powered clinical guidance assistant running locally with privacy-first architecture",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Initialize RAG Engine
current_dir = os.path.dirname(os.path.abspath(__file__))
knowledge_path = os.path.join(current_dir, "knowledge", "approved_documents.json")
rag_engine = RAGEngine(knowledge_path)

# Request Models
class QueryRequest(BaseModel):
    query: str
    userId: Optional[str] = None
    role: Optional[str] = "PATIENT"

class Citation(BaseModel):
    title: str
    publisher: str
    sourceUrl: Optional[str] = None
    snippet: str

class QueryResponse(BaseModel):
    success: bool
    answer: str
    citations: List[Citation]
    is_emergency: bool
    evidence_sufficient: bool
    model_status: str
    disclaimer: str
    duration_ms: int

@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "CareBridge Local AI Assistant",
        "runtime": "Python FastAPI",
        "indexed_chunks": len(rag_engine.chunks),
        "indexed_documents": len(rag_engine.documents),
        "local_model": "Ollama / Deterministic RAG Fallback",
        "time": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    }

@app.get("/status")
def service_status():
    return {
        "service": "CareBridge Local AI Service",
        "status": "operational",
        "local_llm_installed": False, # Ollama not found on default machine
        "fallback_active": True,
        "fallback_engine": "Deterministic Clinical RAG Engine (TF-IDF & Rule-based Grounding)",
        "documents_loaded": len(rag_engine.documents),
        "chunks_indexed": len(rag_engine.chunks),
        "instructions_for_ollama": (
            "To enable real local neural model: 1. Install Ollama from https://ollama.ai. "
            "2. Run: 'ollama run medllama2' or 'ollama run llama3'. "
            "3. Restart the CareBridge AI service."
        )
    }

@app.get("/api/knowledge")
def list_knowledge_documents():
    return {
        "success": True,
        "count": len(rag_engine.documents),
        "data": rag_engine.documents
    }

@app.post("/api/chat", response_model=QueryResponse)
def chat_with_assistant(req: QueryRequest):
    start_time = time.time()
    clean_query = req.query.strip()

    if not clean_query:
        raise HTTPException(status_code=400, detail="Query text cannot be empty")

    # Step 1: Deterministic Safety Check for Life-Threatening Emergency Symptoms
    is_emergency, emergency_directive = check_emergency_symptoms(clean_query)
    if is_emergency:
        duration_ms = int((time.time() - start_time) * 1000)
        return QueryResponse(
            success=True,
            answer=emergency_directive,
            citations=[
                Citation(
                    title="National Emergency Response Support System (ERSS)",
                    publisher="Ministry of Home Affairs & National Health Mission (India)",
                    sourceUrl="https://112.gov.in",
                    snippet="Pan-India single emergency contact 112 with integrated 108 medical dispatch for acute life-threatening situations."
                )
            ],
            is_emergency=True,
            evidence_sufficient=True,
            model_status="deterministic_safety_guard",
            disclaimer="CRITICAL ALERT: Digital tools cannot diagnose or treat life-threatening conditions. Call emergency services immediately.",
            duration_ms=duration_ms
        )

    # Step 2: Semantic Retrieval over Approved Knowledge Documents
    retrieved_passages = rag_engine.retrieve(clean_query, top_k=2)

    # Step 3: Synthesis with Evidence Grounding
    synthesis = rag_engine.synthesize_response(clean_query, retrieved_passages, model_online=False)
    duration_ms = int((time.time() - start_time) * 1000)

    return QueryResponse(
        success=True,
        answer=synthesis["answer"],
        citations=[Citation(**c) for c in synthesis["citations"]],
        is_emergency=False,
        evidence_sufficient=synthesis["evidence_sufficient"],
        model_status=synthesis["model_status"],
        disclaimer=synthesis["disclaimer"],
        duration_ms=duration_ms
    )

if __name__ == "__main__":
    import uvicorn
    print("[AI Service] Starting CareBridge AI FastAPI server on port 8000...")
    uvicorn.run(app, host="127.0.0.1", port=8000)
