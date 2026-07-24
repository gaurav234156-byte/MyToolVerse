"use client";

import * as React from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

function removeDuplicateLines(text: string): string {
  const lines = text.split("\n");
  return Array.from(new Set(lines)).join("\n");
}

function reverseText(text: string): string {
  return text.split("").reverse().join("");
}

function removeExtraWhitespace(text: string): string {
  return text
    .split("\n")
    .map((line) => line.trim().replace(/\s+/g, " "))
    .filter((line) => line.length > 0)
    .join("\n");
}

function slugify(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const CONFIG: Record<string, { label: string; placeholder: string; fn: (s: string) => string; live?: boolean }> = {
  "duplicate-line-remover": {
    label: "Lines without duplicates",
    placeholder: "Paste lines, one per row",
    fn: removeDuplicateLines,
  },
  "text-reverser": {
    label: "Reversed text",
    placeholder: "Type or paste text to reverse",
    fn: reverseText,
  },
  "whitespace-remover": {
    label: "Cleaned text",
    placeholder: "Paste text with extra spaces or blank lines",
    fn: removeExtraWhitespace,
  },
  "slug-generator": {
    label: "URL slug",
    placeholder: "Enter a title, e.g. My Blog Post Title!",
    fn: slugify,
  },
};

export function TextGenericEngine({ slug }: { slug: string }) {
  const [input, setInput] = React.useState("");
  const [copied, setCopied] = React.useState(false);

  const config = CONFIG[slug];
  const output = config && input ? config.fn(input) : "";

  function copy() {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  if (!config) {
    return (
      <p className="rounded-xl bg-surface px-4 py-6 text-center text-sm text-muted-foreground">
        This tool is being wired up.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Input</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={config.placeholder}
            rows={10}
            className="w-full resize-y rounded-xl border border-input bg-background p-4 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">{config.label}</label>
            {output && (
              <Button variant="ghost" size="sm" onClick={copy} className="h-7 px-2 text-xs">
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            )}
          </div>
          <textarea
            value={output}
            readOnly
            placeholder="Result will appear here"
            rows={10}
            className="w-full resize-y rounded-xl border border-input bg-surface p-4 text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
      </div>
    </div>
  );
}
