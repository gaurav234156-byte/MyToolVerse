"use client";

import * as React from "react";
import { Download, Loader2 } from "lucide-react";
import { FileDropzone } from "@/components/tools/file-dropzone";
import { Button } from "@/components/ui/button";

const PRESETS = [
  { label: "Tiny",   description: "Max 100 KB",  maxSizeMB: 0.1 },
  { label: "Small",  description: "Max 300 KB",  maxSizeMB: 0.3 },
  { label: "Medium", description: "Max 500 KB",  maxSizeMB: 0.5 },
  { label: "Large",  description: "Max 1 MB",    maxSizeMB: 1.0 },
  { label: "Custom", description: "Enter size",  maxSizeMB: null },
];

export function ImageCompressEngine() {
  const [files, setFiles] = React.useState<File[]>([]);
  const [preset, setPreset] = React.useState(PRESETS[2]);
  const [customKB, setCustomKB] = React.useState("500");
  const [processing, setProcessing] = React.useState(false);
  const [results, setResults] = React.useState<
    { name: string; url: string; before: number; after: number; hit: boolean }[]
  >([]);
  const [error, setError] = React.useState<string | null>(null);

  const targetMB = preset.maxSizeMB ?? (parseInt(customKB, 10) / 1024);

  async function handleCompress() {
    if (files.length === 0) { setError("Upload at least one image first."); return; }
    if (!targetMB || targetMB <= 0) { setError("Enter a valid target size."); return; }

    setError(null); setProcessing(true); setResults([]);

    try {
      const imageCompression = (await import("browser-image-compression")).default;
      const compressed = await Promise.all(
        files.map(async (file) => {
          const output = await imageCompression(file, {
            maxSizeMB: targetMB,
            useWebWorker: true,
            initialQuality: 0.85,
          });
          return {
            name: file.name,
            url: URL.createObjectURL(output),
            before: file.size,
            after: output.size,
            hit: output.size <= targetMB * 1024 * 1024,
          };
        })
      );
      setResults(compressed);
    } catch {
      setError("Something went wrong compressing one of the images.");
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <FileDropzone
        accept="image/*"
        multiple
        files={files}
        onFilesChange={(f) => { setFiles(f); setResults([]); }}
        label="Drag and drop images here, or click to browse"
        hint="JPG, PNG, or WebP — multiple files supported"
      />

      {/* Target size selector */}
      <div className="flex flex-col gap-3">
        <label className="text-sm font-medium">Target output size per image</label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => setPreset(p)}
              className={`flex flex-col items-start rounded-xl border px-3 py-2.5 text-left transition-colors ${
                preset.label === p.label
                  ? "border-primary bg-primary-soft"
                  : "border-border hover:bg-accent"
              }`}
            >
              <span className={`text-sm font-semibold ${preset.label === p.label ? "text-primary" : "text-foreground"}`}>
                {p.label}
              </span>
              <span className="text-xs text-muted-foreground">{p.description}</span>
            </button>
          ))}
        </div>

        {preset.maxSizeMB === null && (
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={customKB}
              onChange={(e) => setCustomKB(e.target.value)}
              placeholder="e.g. 250"
              min={10}
              className="h-11 w-36 rounded-xl border border-input bg-background px-4 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <span className="text-sm text-muted-foreground">KB</span>
          </div>
        )}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button onClick={handleCompress} disabled={processing || files.length === 0} className="self-start">
        {processing && <Loader2 className="h-4 w-4 animate-spin" />}
        {processing
          ? "Compressing..."
          : `Compress to ~${preset.maxSizeMB ? preset.description.replace("Max ", "") : customKB + " KB"}`}
      </Button>

      {results.length > 0 && (
        <ul className="flex flex-col gap-2">
          {results.map((r) => (
            <li key={r.name} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{r.name}</p>
                <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{(r.before / 1024).toFixed(0)} KB</span>
                  <span>→</span>
                  <span className="font-semibold text-primary">{(r.after / 1024).toFixed(0)} KB</span>
                  {r.after < r.before && (
                    <span className="text-success font-medium">
                      {Math.round((1 - r.after / r.before) * 100)}% smaller
                    </span>
                  )}
                  {!r.hit && (
                    <span className="text-amber-600 dark:text-amber-400">⚠ target not reached</span>
                  )}
                </div>
              </div>
              <Button variant="secondary" size="sm" asChild>
                <a href={r.url} download={`compressed-${r.name}`}>
                  <Download className="h-3.5 w-3.5" />
                  Download
                </a>
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
