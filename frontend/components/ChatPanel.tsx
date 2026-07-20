"use client";

import { useEffect, useRef, useState } from "react";
import { sendChat, type Source, type SourceChunk } from "@/lib/api";
import SourceCard from "./SourceCard";

interface Message {
  role: "user" | "assistant";
  text: string;
  sources?: SourceChunk[];
}

export default function ChatPanel({ source }: { source: Source }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: "Ask a question about the fixed archive, or switch to your own upload once you've added a file.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const question = input.trim();
    if (!question || loading) return;

    setMessages((prev) => [...prev, { role: "user", text: question }]);
    setInput("");
    setLoading(true);

    try {
      const res = await sendChat(question, source);
      setMessages((prev) => [...prev, { role: "assistant", text: res.answer, sources: res.sources }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: err instanceof Error ? `Retrieval failed: ${err.message}` : "Something went wrong.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-4 overflow-y-auto pr-1">
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
            <div className={`max-w-[85%] space-y-2 ${m.role === "user" ? "items-end" : "items-start"}`}>
              <div
                className={`rounded-sm px-4 py-3 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-brass/20 text-parchment"
                    : "border border-parchment/10 bg-parchment/[0.04] text-parchment/90"
                }`}
              >
                {m.text}
              </div>
              {m.sources && m.sources.length > 0 && (
                <div className="space-y-1.5">
                  {m.sources.map((s) => (
                    <SourceCard key={s.rank} source={s} />
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="rounded-sm border border-parchment/10 bg-parchment/[0.04] px-4 py-3 font-mono text-xs text-parchment/40">
              retrieving passages…
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} className="mt-4 flex gap-2 border-t border-parchment/10 pt-4">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question…"
          className="focus-ring flex-1 rounded-sm border border-parchment/15 bg-ink-soft px-3 py-2.5 text-sm text-parchment placeholder:text-parchment/30"
        />
        <button
          type="submit"
          disabled={loading}
          className="focus-ring rounded-sm bg-brass px-5 py-2.5 font-display text-sm text-ink transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          Ask
        </button>
      </form>
    </div>
  );
}
