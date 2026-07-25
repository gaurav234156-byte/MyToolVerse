"use client";

import * as React from "react";
import { Download, Loader2 } from "lucide-react";
import { FileDropzone } from "@/components/tools/file-dropzone";
import { Button } from "@/components/ui/button";

const WORKER_SCRIPT = "https://cdnjs.cloudflare.com/ajax/libs/gif.js/0.2.0/gif.worker.js";

export function GifMakerEngine() {
  const [files, setFiles] = React.useState<File[]>([]);
  const [delay, setDelay] = React.useState(500);
  const [processing, setProcessing] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [gifUrl, setGifUrl] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  async function loadImage(file: File): Promise<HTMLImageElement> {
    const url = URL.createObjectURL(file);
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Could not load one of the images."));
      img.src = url;
    });
    return img;
  }

  async function handleGenerate() {
    if (files.length < 2) { setError("Upload at least two images to animate."); return; }
    setError(null); setProcessing(true); setProgress(0); setGifUrl(null);

    try {
      const GIF = (await import("gif.js")).default;
      const images = await Promise.all(files.map(loadImage));

      const width = Math.max(...images.map((i) => i.naturalWidth));
      const height = Math.max(...images.map((i) => i.naturalHeight));

      const gif = new GIF({
        workers: 2,
        quality: 10,
        width,
        height,
        workerScript: WORKER_SCRIPT,
      });

      for (const img of images) {
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d")!;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, width, height);
        const x = (width - img.naturalWidth) / 2;
        const y = (height - img.naturalHeight) / 2;
        ctx.drawImage(img, x, y);
        gif.addFrame(canvas, { delay });
      }

      gif.on("progress", (p: number) => setProgress(Math.round(p * 100)));
      gif.on("finished", (blob: Blob) => {
        setGifUrl(URL.createObjectURL(blob));
        setProcessing(false);
      });
      gif.render();
    } catch {
      setError("Something went wrong creating the GIF.");
      setProcessing(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <FileDropzone
        accept="image/*"
        multiple
        files={files}
        onFilesChange={(f) => { setFiles(f); setGifUrl(null); }}
        label="Drag and drop images here, or click to browse"
        hint="Add frames in the order you want them to play — up to 50 images"
      />

      <div className="flex max-w-xs flex-col gap-2">
        <label className="text-sm font-medium">Frame delay: {delay}ms</label>
        <input
          type="range"
          min={50}
          max={2000}
          step={50}
          value={delay}
          onChange={(e) => setDelay(parseInt(e.target.value, 10))}
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button onClick={handleGenerate} disabled={processing || files.length < 2} className="self-start">
        {processing && <Loader2 className="h-4 w-4 animate-spin" />}
        {processing ? `Rendering... ${progress}%` : "Create GIF"}
      </Button>

      {gifUrl && (
        <div className="flex flex-col items-start gap-3 rounded-xl border border-border bg-surface p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={gifUrl} alt="Generated GIF" className="max-h-96 rounded-lg border border-border" />
          <Button variant="secondary" size="sm" asChild>
            <a href={gifUrl} download="animation.gif">
              <Download className="h-3.5 w-3.5" />
              Download
            </a>
          </Button>
        </div>
      )}
    </div>
  );
}