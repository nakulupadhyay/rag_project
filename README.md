# The Stacks — Retrieval-Augmented Generation Chat App

A full-stack RAG (Retrieval-Augmented Generation) application: a FastAPI backend
that chunks, embeds, and indexes documents with FAISS, and a Next.js frontend
where you can chat over a curated document set or your own uploaded PDFs —
every answer comes with the exact source passages it was grounded in.

Built entirely on free, open-source models (Sentence-Transformers for
embeddings, a local Flan-T5 model for generation) — **no paid API key
required.**

**Live demo:** _add your deployed Vercel URL here_
**Backend API:** _add your deployed Render URL here_

---

## Why this project

This repo demonstrates an end-to-end RAG pipeline: document ingestion,
chunking strategy, embedding generation, vector similarity search, prompt
construction, and grounded generation with citations — plus a deployable
production split (static/edge frontend on Vercel, Python inference service on
Render).

## Architecture

```
┌─────────────────┐        HTTPS/JSON        ┌──────────────────────┐
│   Next.js UI     │ ───────────────────────▶ │      FastAPI          │
│   (Vercel)       │ ◀─────────────────────── │      (Render)         │
└─────────────────┘                           │                        │
                                               │  1. chunk documents    │
                                               │  2. embed (MiniLM)     │
                                               │  3. FAISS similarity   │
                                               │     search             │
                                               │  4. build prompt with  │
                                               │     retrieved context  │
                                               │  5. generate (Flan-T5  │
                                               │     or HF Inference    │
                                               │     API)               │
                                               └──────────────────────┘
```

Two FAISS indices live in the backend process: `fixed` (built at startup from
`backend/sample_docs/`) and `uploaded` (grows as files are uploaded through
the UI). Each answer returns the ranked source chunks that were retrieved, so
the UI can show exactly what the model used to answer.

## Tech stack

| Layer          | Choice                                                        |
| -------------- | --------------------------------------------------------------|
| Frontend       | Next.js 14 (App Router), TypeScript, Tailwind CSS              |
| Backend        | FastAPI, Uvicorn                                               |
| Embeddings     | `sentence-transformers/all-MiniLM-L6-v2` (local, free)        |
| Vector store   | FAISS (in-memory, `IndexFlatIP` / cosine similarity)           |
| Generation     | `google/flan-t5-small` locally, or the free HF Inference API   |
| PDF parsing    | `pypdf`                                                        |
| Deployment     | Vercel (frontend) + Render (backend)                           |

## Repository layout

```
.
├── backend/
│   ├── main.py            FastAPI app + routes
│   ├── rag_engine.py       embeddings, FAISS indices, retrieval, generation
│   ├── document_loader.py  PDF/text extraction + chunking
│   ├── config.py           env-driven settings
│   ├── sample_docs/        fixed knowledge base (swap in your own docs)
│   ├── requirements.txt
│   └── render.yaml         Render deploy blueprint
└── frontend/
    ├── app/                 Next.js App Router pages
    ├── components/          ChatPanel, UploadPanel, KBToggle, SourceCard
    ├── lib/api.ts            typed API client
    └── package.json
```

## Running locally

### Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --reload
```

The first run downloads the embedding + generation models (a few hundred MB)
from Hugging Face — this only happens once. The API is now at
`http://localhost:8000` (docs at `/docs`).

### Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local   # points NEXT_PUBLIC_API_URL at your backend
npm run dev
```

Open `http://localhost:3000`.

## Deploying

### Backend → Render

1. Push this repo to GitHub.
2. In Render, choose **New → Blueprint** and point it at the repo — it will
   pick up `backend/render.yaml` automatically. (Or create a **Web Service**
   manually with root directory `backend`, build command
   `pip install -r requirements.txt`, start command
   `uvicorn main:app --host 0.0.0.0 --port $PORT`.)
3. Once deployed, copy the service URL (e.g. `https://rag-backend.onrender.com`).

> Render's free tier spins down after inactivity, so the first request after
> idling can take ~30-60s while it wakes up and reloads the models.

### Frontend → Vercel

1. Import the repo in Vercel, set **Root Directory** to `frontend`.
2. Add an environment variable: `NEXT_PUBLIC_API_URL` = your Render backend URL.
3. Deploy. Vercel auto-detects Next.js — no other config needed.
4. Back in Render, set `FRONTEND_ORIGINS` to your new Vercel URL so CORS allows it.

## Configuration

All tunables live in `backend/config.py` / `.env`:

| Variable                | Default                                     | Purpose                                   |
|--------------------------|----------------------------------------------|--------------------------------------------|
| `GENERATION_MODE`        | `local`                                       | `local` (free, on-server) or `api` (HF Inference API) |
| `LOCAL_GENERATION_MODEL` | `google/flan-t5-small`                        | Swap for a larger local model if you have the RAM |
| `HF_API_TOKEN`           | _(empty)_                                     | Only needed if `GENERATION_MODE=api`      |
| `CHUNK_SIZE_WORDS`       | `180`                                         | Words per chunk                            |
| `CHUNK_OVERLAP_WORDS`    | `40`                                          | Overlap between chunks                     |
| `TOP_K`                  | `4`                                           | Chunks retrieved per query                 |

## Swapping in your own knowledge base

Drop `.txt`, `.md`, or `.pdf` files into `backend/sample_docs/` and restart
the backend — they're indexed automatically at startup into the "Fixed
Archive" source.

## Possible extensions

- Swap FAISS for a managed vector DB (Pinecone/Qdrant) for persistence across restarts
- Stream generation tokens over SSE/WebSocket for a typing effect
- Add re-ranking (e.g. a cross-encoder) after the initial FAISS retrieval
- Persist uploaded indices to disk or object storage so they survive a redeploy

## License

MIT — see [LICENSE](LICENSE).
