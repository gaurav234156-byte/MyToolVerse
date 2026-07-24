"use client";

import * as React from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

function toTitleCase(s: string) {
  return s.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
}
function toSentenceCase(s: string) {
  const lower = s.toLowerCase();
  return lower.replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase());
}
function toCamelCase(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase());
}
function toSnakeCase(s: string) {
  return s
    .trim()
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}
function toKebabCase(s: string) {
  return s
    .trim()
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const TRANSFORMS: { id: string; label: string; fn: (s: string) => string }[] = [
  { id: "upper", label: "UPPERCASE", fn: (s) => s.toUpperCase() },
  { id: "lower", label: "lowercase", fn: (s) => s.toLowerCase() },
  { id: "title", label: "Title Case", fn: toTitleCase },
  { id: "sentence", label: "Sentence case", fn: toSentenceCase },
  { id: "camel", label: "camelCase", fn: toCamelCase },
  { id: "snake", label: "snake_case", fn: toSnakeCase },
  { id: "kebab", label: "kebab-case", fn: toKebabCase },
];

export function CaseConverterEngine() {
  const [input, setInput] = React.useState("");
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  function copy(id: string, value: string) {
    navigator.clipboard.writeText(value);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1200);
  }

  return (
    <div className="flex flex-col gap-6">
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type or paste your text here..."
        rows={5}
        className="w-full resize-y rounded-xl border border-input bg-background p-4 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
      />

      {input.trim() && (
        <ul className="flex flex-col gap-2">
          {TRANSFORMS.map((t) => {
            const value = t.fn(input);
            return (
              <li
                key={t.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-muted-foreground">{t.label}</p>
                  <p className="truncate text-sm">{value}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={() => copy(t.id, value)}
                  aria-label={`Copy ${t.label}`}
                >
                  {copiedId === t.id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
