"use client";

import * as React from "react";
import { Download, Loader2 } from "lucide-react";
import { FileDropzone } from "@/components/tools/file-dropzone";
import { Button } from "@/components/ui/button";

export function HeicToJpgEngine() {
  const [files, setFiles] = React.useState<File[]>([]);
  const [processing, setProcessing] = React.useState(false);
  const [results, setResults] = React.useState<{ name: string; url: string }[]>([]);
  const [error, setError] = React.useState<string | null>(null);

  async function handleConvert() {
    if (files.length === 0) { setError("Upload at least one HEIC image first."); return; }
    setError(null); setProcessing(true); setResults([]);

    try {
      const heic2any = (await import("heic2any")).default;
      const converted = await Promise.all(
        files.map(async (file) => {
          const output = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.9 });
          const blob = Array.isArray(output) ? output[0] : output;
          const name = file.name.replace(/\.heic$/i, ".jpg");
          return { name, url: URL.createObjectURL(blob as Blob) };
        })
      );
      setResults(converted);
    } catch {
      setError("Something went wrong converting one of the images. Make sure the file is a valid HEIC photo.");
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <FileDropzone
        accept=".heic,image/heic,image/heif"
        multiple
        files={files}
        onFilesChange={(f) => { setFiles(f); setResults([]); }}
        label="Drag and drop HEIC photos here, or click to browse"
        hint="iPhone HEIC files — multiple supported"
      />

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button onClick={handleConvert} disabled={processing || files.length === 0} className="self-start">
        {processing && <Loader2 className="h-4 w-4 animate-spin" />}
        {processing ? "Converting..." : "Convert to JPG"}
      </Button>

      {results.length > 0 && (
        <ul className="flex flex-col gap-2">
          {results.map((r) => (
            <li key={r.name} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface px-4 py-3">
              <p className="truncate text-sm font-medium">{r.name}</p>
              <Button variant="secondary" size="sm" asChild>
                <a href={r.url} download={r.name}>
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