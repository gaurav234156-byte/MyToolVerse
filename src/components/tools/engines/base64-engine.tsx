"use client";

import * as React from "react";
import { Copy, Check, ArrowDownUp, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Base64EngineProps {
  mode: "encode" | "decode";
}

function encodeBase64(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary);
}

function decodeBase64(b64: string): string {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

export function Base64Engine({ mode }: Base64EngineProps) {
  const [input, setInput] = React.useState("");
  const [output, setOutput] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);
  const [direction, setDirection] = React.useState<"encode" | "decode">(mode);

  function run() {
    setError(null);
    if (!input.trim()) {
      setOutput("");
      return;
    }
    try {
      setOutput(direction === "encode" ? encodeBase64(input) : decodeBase64(input.trim()));
    } catch {
      setError(
        direction === "decode"
          ? "That doesn't look like valid Base64 text."
          : "Couldn't encode this input."
      );
      setOutput("");
    }
  }

  React.useEffect(() => {
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, direction]);

  function copyOutput() {
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

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">
            {direction === "encode" ? "Plain text" : "Base64 text"}
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={direction === "encode" ? "Hello, world!" : "SGVsbG8sIHdvcmxkIQ=="}
            rows={8}
            spellCheck={false}
            className="w-full resize-y rounded-xl border border-input bg-background p-4 font-mono text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <div className="hidden justify-center lg:flex">
          <ArrowDownUp className="h-5 w-5 rotate-90 text-muted-foreground" />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">
              {direction === "encode" ? "Base64 output" : "Decoded text"}
            </label>
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
            placeholder="Result will appear here"
            rows={8}
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
