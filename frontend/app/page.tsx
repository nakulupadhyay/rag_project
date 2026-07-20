"use client";

import { useCallback, useEffect, useState } from "react";
import { listDocuments, type Source } from "@/lib/api";
import KBToggle from "@/components/KBToggle";
import UploadPanel from "@/components/UploadPanel";
import ChatPanel from "@/components/ChatPanel";

export default function Home() {
  const [source, setSource] = useState<Source>("fixed");
  const [fixedDocs, setFixedDocs] = useState<string[]>([]);
  const [uploadedDocs, setUploadedDocs] = useState<string[]>([]);

  const refresh = useCallback(async () => {
    try {
      const [fixed, uploaded] = await Promise.all([listDocuments("fixed"), listDocuments("uploaded")]);
      setFixedDocs(fixed.documents);
      setUploadedDocs(uploaded.documents);
    } catch {
      // Backend may still be waking up on a free-tier host — chat panel surfaces real errors.
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-6 py-10 lg:px-10">
      <header className="mb-10 flex items-baseline justify-between border-b border-parchment/10 pb-6">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-brass-light">Catalog No. 001 — RAG</p>
          <h1 className="font-display text-3xl italic text-parchment">The Stacks</h1>
        </div>
        <p className="hidden max-w-xs text-right text-xs text-parchment/40 sm:block">
          A retrieval-augmented research assistant. Ask a question, and it pulls the exact
          passages it used to answer.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
        <aside className="space-y-6">
          <section className="space-y-3">
            <h2 className="font-mono text-[11px] uppercase tracking-wider text-parchment/40">Knowledge Source</h2>
            <KBToggle source={source} onChange={setSource} />
          </section>

          {source === "fixed" ? (
            <section className="space-y-2">
              <h2 className="font-mono text-[11px] uppercase tracking-wider text-parchment/40">
                In the archive ({fixedDocs.length})
              </h2>
              <ul className="space-y-1">
                {fixedDocs.map((doc) => (
                  <li
                    key={doc}
                    className="truncate rounded-sm border border-parchment/10 bg-ink-soft px-2.5 py-1.5 font-mono text-xs text-parchment/70"
                  >
                    {doc}
                  </li>
                ))}
              </ul>
            </section>
          ) : (
            <section className="space-y-3">
              <h2 className="font-mono text-[11px] uppercase tracking-wider text-parchment/40">Add to your index</h2>
              <UploadPanel documents={uploadedDocs} onUploaded={refresh} />
            </section>
          )}
        </aside>

        <section className="h-[calc(100vh-220px)] min-h-[480px] rounded-sm border border-parchment/10 bg-ink-soft/40 p-5">
          <ChatPanel source={source} />
        </section>
      </div>
    </main>
  );
}
