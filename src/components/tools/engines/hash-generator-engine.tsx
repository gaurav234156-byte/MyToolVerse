"use client";

import * as React from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const ALGORITHMS: { id: "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512"; label: string }[] = [
  { id: "SHA-1", label: "SHA-1" },
  { id: "SHA-256", label: "SHA-256" },
  { id: "SHA-384", label: "SHA-384" },
  { id: "SHA-512", label: "SHA-512" },
];

async function hashText(text: string, algorithm: string): Promise<string> {
  const bytes = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest(algorithm, bytes);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function HashGeneratorEngine() {
  const [input, setInput] = React.useState("");
  const [hashes, setHashes] = React.useState<Record<string, string>>({});
  const [copiedAlgo, setCopiedAlgo] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!input) {
      setHashes({});
      return;
    }
    let cancelled = false;
    (async () => {
      const entries = await Promise.all(
        ALGORITHMS.map(async (a) => [a.id, await hashText(input, a.id)] as const)
      );
      if (!cancelled) setHashes(Object.fromEntries(entries));
    })();
    return () => {
      cancelled = true;
    };
  }, [input]);

  function copy(algo: string, value: string) {
    navigator.clipboard.writeText(value);
    setCopiedAlgo(algo);
    setTimeout(() => setCopiedAlgo(null), 1200);
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Text to hash</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type or paste any text"
          rows={4}
          spellCheck={false}
          className="w-full resize-y rounded-xl border border-input bg-background p-4 font-mono text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      <div className="flex flex-col gap-2">
        {ALGORITHMS.map((a) => (
          <div
            key={a.id}
            className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface px-4 py-3"
          >
            <div className="min-w-0">
              <p className="text-xs font-semibold text-muted-foreground">{a.label}</p>
              <code className="block truncate font-mono text-sm">
                {hashes[a.id] || "—"}
              </code>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              disabled={!hashes[a.id]}
              onClick={() => copy(a.id, hashes[a.id])}
              aria-label={`Copy ${a.label} hash`}
            >
              {copiedAlgo === a.id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
