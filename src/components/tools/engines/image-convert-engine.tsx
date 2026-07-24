"use client";

import * as React from "react";
import { Download, Loader2 } from "lucide-react";
import { FileDropzone } from "@/components/tools/file-dropzone";
import { Button } from "@/components/ui/button";

const FORMATS: { id: string; label: string; mime: string; ext: string }[] = [
  { id: "png", label: "PNG", mime: "image/png", ext: "png" },
  { id: "jpg", label: "JPG", mime: "image/jpeg", ext: "jpg" },
  { id: "webp", label: "WebP", mime: "image/webp", ext: "webp" },
];

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

export function ImageConvertEngine() {
  const [files, setFiles] = React.useState<File[]>([]);
  const [target, setTarget] = React.useState(FORMATS[1]);
  const [processing, setProcessing] = React.useState(false);
  const [resultUrl, setResultUrl] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  async function handleConvert() {
    if (!files[0]) {
      setError("Upload an image first.");
      return;
    }
    setError(null);
    setProcessing(true);
    setResultUrl(null);
    try {
      const img = await loadImage(files[0]);
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas not supported");
      if (target.id === "jpg") {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(
        (blob) => {
          if (blob) setResultUrl(URL.createObjectURL(blob));
          setProcessing(false);
        },
        target.mime,
        0.92
      );
    } catch {
      setError("Couldn't convert this image. Your browser may not support this output format.");
      setProcessing(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <FileDropzone
        accept="image/*"
        files={files}
        onFilesChange={(f) => {
          setFiles(f);
          setResultUrl(null);
        }}
        label="Drag and drop an image here, or click to browse"
        hint="JPG, PNG, or WebP"
      />

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Convert to</label>
        <div className="flex gap-2">
          {FORMATS.map((f) => (
            <button
              key={f.id}
              onClick={() => setTarget(f)}
              className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                target.id === f.id
                  ? "border-primary bg-primary-soft text-primary"
                  : "border-border text-muted-foreground hover:bg-accent"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={handleConvert} disabled={processing || !files[0]}>
          {processing && <Loader2 className="h-4 w-4 animate-spin" />}
          {processing ? "Converting..." : `Convert to ${target.label}`}
        </Button>
        {resultUrl && (
          <Button variant="secondary" asChild>
            <a href={resultUrl} download={`converted.${target.ext}`}>
              <Download className="h-4 w-4" />
              Download {target.label}
            </a>
          </Button>
        )}
      </div>

      {resultUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={resultUrl} alt="Converted preview" className="max-h-80 self-start rounded-xl border border-border" />
      )}
    </div>
  );
}
