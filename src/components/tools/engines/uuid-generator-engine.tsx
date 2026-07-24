"use client";

import * as React from "react";
import { Copy, Check, RefreshCw, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function UuidGeneratorEngine() {
  const [uuids, setUuids] = React.useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null);
  const [copiedAll, setCopiedAll] = React.useState(false);

  function generate(count: number) {
    const next = Array.from({ length: count }, () => crypto.randomUUID());
    setUuids(next);
  }

  React.useEffect(() => {
    generate(5);
  }, []);

  function copyOne(uuid: string, index: number) {
    navigator.clipboard.writeText(uuid);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1200);
  }

  function copyAll() {
    navigator.clipboard.writeText(uuids.join("\n"));
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 1500);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={() => generate(5)}>
          <RefreshCw className="h-4 w-4" />
          Generate 5 UUIDs
        </Button>
        <Button variant="secondary" onClick={() => generate(uuids.length + 1)}>
          <Plus className="h-4 w-4" />
          Add one more
        </Button>
        {uuids.length > 0 && (
          <Button variant="ghost" onClick={copyAll}>
            {copiedAll ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copiedAll ? "Copied all" : "Copy all"}
          </Button>
        )}
      </div>

      <ul className="flex flex-col gap-2">
        {uuids.map((uuid, i) => (
          <li
            key={uuid}
            className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface px-4 py-3"
          >
            <code className="truncate font-mono text-sm">{uuid}</code>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0"
              onClick={() => copyOne(uuid, i)}
              aria-label="Copy UUID"
            >
              {copiedIndex === i ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
