"use client";

import type { Source } from "@/lib/api";

interface Props {
  source: Source;
  onChange: (s: Source) => void;
}

export default function KBToggle({ source, onChange }: Props) {
  const options: { value: Source; label: string; hint: string }[] = [
    { value: "fixed", label: "Fixed Archive", hint: "Curated docs about RAG" },
    { value: "uploaded", label: "Your Upload", hint: "Files you add below" },
  ];

  return (
    <div role="radiogroup" aria-label="Knowledge source" className="grid grid-cols-2 gap-2">
      {options.map((opt) => {
        const active = source === opt.value;
        return (
          <button
            key={opt.value}
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.value)}
            className={`focus-ring rounded-sm border px-3 py-2.5 text-left transition-colors ${
              active
                ? "border-brass bg-brass/15 text-parchment"
                : "border-parchment/15 text-parchment/60 hover:border-parchment/30"
            }`}
          >
            <span className="block font-display text-sm tracking-wide">{opt.label}</span>
            <span className="block font-mono text-[11px] uppercase tracking-wider text-parchment/40">
              {opt.hint}
            </span>
          </button>
        );
      })}
    </div>
  );
}
