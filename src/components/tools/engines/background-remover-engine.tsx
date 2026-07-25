"use client";

import * as React from "react";
import { Download, Loader2 } from "lucide-react";
import { FileDropzone } from "@/components/tools/file-dropzone";
import { Button } from "@/components/ui/button";

export function BackgroundRemoverEngine() {
  const [files, setFiles] = React.useState<File[]>([]);
  const [processing, setProcessing] = React.useState(false);
  const [resultUrl, setResultUrl] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [progressLabel, setProgressLabel] = React.useState("");

  async function handleRemove() {
    if (files.length === 0) { setError("Upload an image first."); return; }
    setError(null); setProcessing(true); setResultUrl(null); setProgressLabel("Loading model...");

    try {
      const { removeBackground } = await import("@imgly/background-removal");
      const blob = await removeBackground(files[0], {
        progress: (key: string, current: number, total: number) => {
          setProgressLabel(`${key}: ${Math.round((current / total) * 100)}%`);
        },
      });
      setResultUrl(URL.createObjectURL(blob));
    } catch {
      setError("Something went wrong removing the background. Try a clearer photo.");
    } finally {
      setProcessing(false);
      setProgressLabel("");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <FileDropzone
        accept="image/*"
        files={files}
        onFilesChange={(f) => { setFiles(f); setResultUrl(null); }}
        label="Drag and drop a photo here, or click to browse"
        hint="JPG or PNG — best results with a clear subject"
      />

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button onClick={handleRemove} disabled={processing || files.length === 0} className="self-start">
        {processing && <Loader2 className="h-4 w-4 animate-spin" />}
        {processing ? (progressLabel || "Removing background...") : "Remove background"}
      </Button>

      {processing && (
        <p className="text-xs text-muted-foreground">
          First run downloads an AI model (tens of MB) — it's cached in your browser after that.
        </p>
      )}

      {resultUrl && (
        <div
          className="flex flex-col items-start gap-3 rounded-xl border border-border p-4"
          style={{
            backgroundImage:
              "conic-gradient(#e5e5e5 0 25%, transparent 0 50%, #e5e5e5 0 75%, transparent 0)",
            backgroundSize: "20px 20px",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={resultUrl} alt="Background removed" className="max-h-96 rounded-lg" />
          <Button variant="secondary" size="sm" asChild>
            <a href={resultUrl} download="background-removed.png">
              <Download className="h-3.5 w-3.5" />
              Download
            </a>
          </Button>
        </div>
      )}
    </div>
  );
}