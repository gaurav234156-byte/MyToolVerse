"use client";

import * as React from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

type Style = "APA" | "MLA" | "Chicago";

export function CitationGeneratorEngine() {
  const [style, setStyle] = React.useState<Style>("APA");
  const [author, setAuthor] = React.useState("");
  const [title, setTitle] = React.useState("");
  const [year, setYear] = React.useState("");
  const [source, setSource] = React.useState(""); // publisher, website name, or journal
  const [url, setUrl] = React.useState("");
  const [copied, setCopied] = React.useState(false);

  function formatAuthorAPA(name: string) {
    const parts = name.trim().split(" ");
    if (parts.length < 2) return name;
    const last = parts[parts.length - 1];
    const initials = parts.slice(0, -1).map((p) => p[0]?.toUpperCase() + ".").join(" ");
    return `${last}, ${initials}`;
  }

  function formatAuthorMLA(name: string) {
    const parts = name.trim().split(" ");
    if (parts.length < 2) return name;
    const last = parts[parts.length - 1];
    const rest = parts.slice(0, -1).join(" ");
    return `${last}, ${rest}`;
  }

  function buildCitation(): string {
    if (!author.trim() || !title.trim()) return "";

    if (style === "APA") {
      const a = formatAuthorAPA(author);
      let citation = `${a} (${year || "n.d."}). ${title}.`;
      if (source) citation += ` ${source}.`;
      if (url) citation += ` ${url}`;
      return citation;
    }

    if (style === "MLA") {
      const a = formatAuthorMLA(author);
      let citation = `${a}. "${title}."`;
      if (source) citation += ` ${source},`;
      if (year) citation += ` ${year}${url ? "," : "."}`;
      if (url) citation += ` ${url}.`;
      return citation;
    }

    // Chicago
    let citation = `${author}. "${title}."`;
    if (source) citation += ` ${source}`;
    if (year) citation += ` (${year})`;
    if (url) citation += `. ${url}`;
    return citation + ".";
  }

  const citation = buildCitation();

  function copy() {
    if (!citation) return;
    navigator.clipboard.writeText(citation);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">Citation style</label>
        <div className="flex gap-2">
          {(["APA", "MLA", "Chicago"] as Style[]).map((s) => (
            <button
              key={s}
              onClick={() => setStyle(s)}
              className={`rounded-xl border px-4 py-2 text-sm font-medium transition-colors ${
                style === s ? "border-primary bg-primary-soft text-primary" : "border-border hover:bg-accent"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">Author (First Last)</label>
          <input
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Jane Smith"
            className="h-11 rounded-xl border border-input bg-background px-4 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title of the work"
            className="h-11 rounded-xl border border-input bg-background px-4 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">Year</label>
          <input
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder="2024"
            className="h-11 rounded-xl border border-input bg-background px-4 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">Publisher / Website / Journal</label>
          <input
            value={source}
            onChange={(e) => setSource(e.target.value)}
            placeholder="e.g. Penguin Books, or Nature"
            className="h-11 rounded-xl border border-input bg-background px-4 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <label className="text-sm font-medium">URL (optional)</label>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://..."
            className="h-11 rounded-xl border border-input bg-background px-4 text-sm"
          />
        </div>
      </div>

      {citation && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Citation</label>
            <Button variant="secondary" size="sm" onClick={copy}>
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
          <p className="rounded-xl border border-input bg-surface px-4 py-3 text-sm">{citation}</p>
        </div>
      )}
    </div>
  );
}