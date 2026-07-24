"use client";

import * as React from "react";
import { Copy, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function UrlEncodeEngine() {
  const [input, setInput] = React.useState("");
  const [output, setOutput] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [direction, setDirection] = React.useState<"encode" | "decode">("encode");
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (!input) {
      setOutput("");
      setError(null);
      return;
    }
    try {
      setOutput(direction === "encode" ? encodeURIComponent(input) : decodeURIComponent(input));
      setError(null);
    } catch {
      setError("Couldn't decode this — it may not be validly URL-encoded.");
      setOutput("");
    }
  }, [input, direction]);

  function copy() {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-1.5 self-start rounded-lg border border-border p-1">
        <button
          onClick={() => setDirection("encode")}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            direction === "encode" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent"
          }`}
        >
          Encode
        </button>
        <button
          onClick={() => setDirection("decode")}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            direction === "decode" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent"
          }`}
        >
          Decode
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">
            {direction === "encode" ? "Plain URL or text" : "Encoded text"}
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={direction === "encode" ? "https://example.com/path?q=hello world" : "https%3A%2F%2Fexample.com"}
            rows={6}
            spellCheck={false}
            className="w-full resize-y rounded-xl border border-input bg-background p-4 font-mono text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Result</label>
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
            rows={6}
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
    </div>
  );
}
