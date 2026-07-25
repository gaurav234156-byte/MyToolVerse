"use client";

import * as React from "react";
import { Download, Loader2 } from "lucide-react";
import { FileDropzone } from "@/components/tools/file-dropzone";
import { Button } from "@/components/ui/button";

const SCALE_OPTIONS = [2, 3, 4];

function sharpen(ctx: CanvasRenderingContext2D, width: number, height: number, amount: number) {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const copy = new Uint8ClampedArray(data);
  const kernel = [0, -amount, 0, -amount, 1 + 4 * amount, -amount, 0, -amount, 0];
  const side = 3;
  const half = 1;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      for (let c = 0; c < 3; c++) {
        let sum = 0;
        for (let ky = 0; ky < side; ky++) {
          for (let kx = 0; kx < side; kx++) {
            const px = Math.min(width - 1, Math.max(0, x + kx - half));
            const py = Math.min(height - 1, Math.max(0, y + ky - half));
            sum += copy[(py * width + px) * 4 + c] * kernel[ky * side + kx];
          }
        }
        data[(y * width + x) * 4 + c] = sum;
      }
    }
  }
  ctx.putImageData(imageData, 0, 0);
}

export function ImageUpscalerEngine() {
  const [files, setFiles] = React.useState<File[]>([]);
  const [scale, setScale] = React.useState(2);
  const [processing, setProcessing] = React.useState(false);
  const [resultUrl, setResultUrl] = React.useState<string | null>(null);
  const [dims, setDims] = React.useState<{ from: string; to: string } | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  async function handleUpscale() {
    if (files.length === 0) { setError("Upload an image first."); return; }
    setError(null); setProcessing(true); setResultUrl(null);

    try {
      const file = files[0];
      const url = URL.createObjectURL(file);
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Could not load image."));
        img.src = url;
      });

      const newWidth = img.naturalWidth * scale;
      const newHeight = img.naturalHeight * scale;

      let canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      let ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);

      let curW = img.naturalWidth;
      let curH = img.naturalHeight;
      while (curW < newWidth) {
        const nextW = Math.min(newWidth, curW * 2);
        const nextH = Math.min(newHeight, curH * 2);
        const next = document.createElement("canvas");
        next.width = nextW;
        next.height = nextH;
        const nctx = next.getContext("2d")!;
        nctx.imageSmoothingEnabled = true;
        nctx.imageSmoothingQuality = "high";
        nctx.drawImage(canvas, 0, 0, nextW, nextH);
        canvas = next;
        ctx = nctx;
        curW = nextW;
        curH = nextH;
      }

      sharpen(ctx, canvas.width, canvas.height, 0.15);

      const resultBlob: Blob = await new Promise((resolve) => canvas.toBlob((b) => resolve(b!), "image/png"));
      setResultUrl(URL.createObjectURL(resultBlob));
      setDims({ from: `${img.naturalWidth}×${img.naturalHeight}`, to: `${canvas.width}×${canvas.height}` });
      URL.revokeObjectURL(url);
    } catch {
      setError("Something went wrong upscaling the image.");
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <FileDropzone
        accept="image/*"
        files={files}
        onFilesChange={(f) => { setFiles(f); setResultUrl(null); }}
        label="Drag and drop an image here, or click to browse"
        hint="JPG or PNG"
      />

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Scale factor</label>
        <div className="flex gap-2">
          {SCALE_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setScale(s)}
              className={`rounded-xl border px-4 py-2 text-sm font-medium transition-colors ${
                scale === s ? "border-primary bg-primary-soft text-primary" : "border-border hover:bg-accent"
              }`}
            >
              {s}×
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button onClick={handleUpscale} disabled={processing || files.length === 0} className="self-start">
        {processing && <Loader2 className="h-4 w-4 animate-spin" />}
        {processing ? "Upscaling..." : `Upscale ${scale}×`}
      </Button>

      {resultUrl && (
        <div className="flex flex-col items-start gap-3 rounded-xl border border-border bg-surface p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={resultUrl} alt="Upscaled" className="max-h-96 rounded-lg border border-border" />
          {dims && (
            <p className="text-xs text-muted-foreground">
              {dims.from} → <span className="font-semibold text-primary">{dims.to}</span>
            </p>
          )}
          <Button variant="secondary" size="sm" asChild>
            <a href={resultUrl} download="upscaled.png">
              <Download className="h-3.5 w-3.5" />
              Download
            </a>
          </Button>
        </div>
      )}
    </div>
  );
}