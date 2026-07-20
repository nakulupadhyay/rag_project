"use client";

import { useCallback, useRef, useState } from "react";
import { uploadFile } from "@/lib/api";

interface Props {
  documents: string[];
  onUploaded: () => void;
}

export default function UploadPanel({ documents, onUploaded }: Props) {
  const [dragging, setDragging] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;
      setBusy(true);
      setStatus(null);
      try {
        for (const file of Array.from(files)) {
          const result = await uploadFile(file);
          setStatus(`Indexed "${result.filename}" — ${result.chunks_indexed} passages catalogued.`);
        }
        onUploaded();
      } catch (err) {
        setStatus(err instanceof Error ? err.message : "Upload failed.");
      } finally {
        setBusy(false);
      }
    },
    [onUploaded]
  );

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={`focus-ring cursor-pointer rounded-sm border border-dashed px-4 py-6 text-center transition-colors ${
          dragging ? "border-brass bg-brass/10" : "border-parchment/25 hover:border-parchment/40"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.txt,.md"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <p className="font-display text-sm text-parchment/80">
          {busy ? "Cataloguing…" : "Drop a PDF or text file here"}
        </p>
        <p className="mt-1 font-mono text-[11px] uppercase tracking-wider text-parchment/40">
          or click to browse — .pdf, .txt, .md
        </p>
      </div>

      {status && <p className="font-mono text-xs text-brass-light">{status}</p>}

      {documents.length > 0 && (
        <div className="space-y-1.5">
          <p className="font-mono text-[11px] uppercase tracking-wider text-parchment/40">
            Indexed ({documents.length})
          </p>
          <ul className="space-y-1">
            {documents.map((doc) => (
              <li
                key={doc}
                className="truncate rounded-sm border border-parchment/10 bg-ink-soft px-2.5 py-1.5 font-mono text-xs text-parchment/70"
                title={doc}
              >
                {doc}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
