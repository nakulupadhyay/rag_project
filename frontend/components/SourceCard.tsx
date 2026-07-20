import type { SourceChunk } from "@/lib/api";

export default function SourceCard({ source }: { source: SourceChunk }) {
  return (
    <div className="bg-card-fold flex gap-3 rounded-sm border border-parchment/10 bg-ink-soft p-3">
      <span className="font-display text-lg italic text-brass-light">{source.rank}</span>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <p className="truncate font-mono text-xs uppercase tracking-wider text-parchment/50">
            {source.doc_name}
          </p>
          <span className="shrink-0 font-mono text-[10px] text-parchment/30">
            match {(source.score * 100).toFixed(0)}%
          </span>
        </div>
        <p className="mt-1 text-sm leading-relaxed text-parchment/70">{source.excerpt}…</p>
      </div>
    </div>
  );
}
