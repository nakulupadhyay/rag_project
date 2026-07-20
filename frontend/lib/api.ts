const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export type Source = "fixed" | "uploaded";

export interface SourceChunk {
  rank: number;
  doc_name: string;
  excerpt: string;
  score: number;
}

export interface ChatResponse {
  answer: string;
  sources: SourceChunk[];
}

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Request failed with status ${res.status}`);
  }
  return res.json();
}

export async function sendChat(message: string, source: Source): Promise<ChatResponse> {
  const res = await fetch(`${BASE_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, source }),
  });
  return handle<ChatResponse>(res);
}

export async function uploadFile(file: File): Promise<{ filename: string; chunks_indexed: number }> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${BASE_URL}/upload`, {
    method: "POST",
    body: formData,
  });
  return handle(res);
}

export async function listDocuments(source: Source): Promise<{ source: Source; documents: string[] }> {
  const res = await fetch(`${BASE_URL}/kb/${source}`);
  return handle(res);
}
