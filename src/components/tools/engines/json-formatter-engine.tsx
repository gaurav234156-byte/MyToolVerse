"use client";

import * as React from "react";
import { Copy, Check, Trash2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function JsonFormatterEngine() {
  const [input, setInput] = React.useState("");
  const [output, setOutput] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [indent, setIndent] = React.useState(2);
  const [copied, setCopied] = React.useState(false);

  function format() {
    if (!input.trim()) {
      setError("Paste some JSON first.");
      setOutput("");
      return;
    }
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, indent));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid JSON");
      setOutput("");
    }
  }

  function minify() {
    if (!input.trim()) {
      setError("Paste some JSON first.");
      setOutput("");
      return;
    }
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid JSON");
      setOutput("");
    }
  }

  function copyOutput() {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function clearAll() {
    setInput("");
    setOutput("");
    setError(null);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Input JSON</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='{"hello": "world"}'
            rows={14}
            spellCheck={false}
            className="w-full resize-y rounded-xl border border-input bg-background p-4 font-mono text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Formatted output</label>
            {output && (
              <Button variant="ghost" size="sm" onClick={copyOutput} className="h-7 px-2 text-xs">
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            )}
          </div>
          <textarea
            value={output}
            readOnly
            placeholder="Formatted JSON will appear here"
            rows={14}
            spellCheck={false}
            className="w-full resize-y rounded-xl border border-input bg-surface p-4 font-mono text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={format}>Format JSON</Button>
        <Button variant="secondary" onClick={minify}>
          Minify
        </Button>
        <div className="flex items-center gap-1.5 rounded-lg border border-border px-1 py-1">
          {[2, 4].map((n) => (
            <button
              key={n}
              onClick={() => setIndent(n)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                indent === n ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent"
              }`}
            >
              {n} spaces
            </button>
          ))}
        </div>
        <Button variant="ghost" onClick={clearAll}>
          <Trash2 className="h-4 w-4" />
          Clear
        </Button>
      </div>
    </div>
  );
}
