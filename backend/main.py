"""
FastAPI entrypoint for the RAG backend.

Endpoints
---------
GET  /health          liveness check
GET  /kb/{source}      list documents currently indexed for "fixed" or "uploaded"
POST /upload           upload a PDF/TXT file into the "uploaded" index
POST /chat              ask a question against the "fixed" or "uploaded" index
"""
from __future__ import annotations

from typing import Literal

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from config import settings
from rag_engine import engine

app = FastAPI(title="RAG Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.FRONTEND_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def _startup() -> None:
    engine.build_fixed_index()


class ChatRequest(BaseModel):
    message: str
    source: Literal["fixed", "uploaded"] = "fixed"


class ChatResponse(BaseModel):
    answer: str
    sources: list[dict]


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.get("/kb/{source}")
def list_kb(source: Literal["fixed", "uploaded"]) -> dict:
    return {"source": source, "documents": engine.list_documents(source)}


@app.post("/upload")
async def upload(file: UploadFile = File(...)) -> dict:
    if not file.filename.lower().endswith((".pdf", ".txt", ".md")):
        raise HTTPException(400, "Only .pdf, .txt, or .md files are supported.")
    raw = await file.read()
    num_chunks = engine.add_uploaded_document(file.filename, raw)
    if num_chunks == 0:
        raise HTTPException(422, "Couldn't extract any text from that file.")
    return {"filename": file.filename, "chunks_indexed": num_chunks}


@app.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest) -> ChatResponse:
    if not req.message.strip():
        raise HTTPException(400, "message must not be empty.")
    result = engine.answer(req.message, req.source)
    return ChatResponse(**result)
