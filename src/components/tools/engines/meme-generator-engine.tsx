"use client";

import * as React from "react";
import { Download, Loader2 } from "lucide-react";
import { FileDropzone } from "@/components/tools/file-dropzone";
import { Button } from "@/components/ui/button";

export function MemeGeneratorEngine() {
  const [files, setFiles] = React.useState<File[]>([]);
  const [topText, setTopText] = React.useState("");
  const [bottomText, setBottomText] = React.useState("");
  const [fontSize, setFontSize] = React.useState(48);
  const [resultUrl, setResultUrl] = React.useState<string | null>(null);
  const [processing, setProcessing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  function drawMeme(img: HTMLImageElement) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(img, 0, 0);

    ctx.textAlign = "center";
    ctx.lineJoin = "round";
    ctx.font = `bold ${fontSize}px Impact, "Arial Black", sans-serif`;
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = fontSize / 12;

    const centerX = canvas.width / 2;

    if (topText.trim()) {
      const y = fontSize + 10;
      ctx.strokeText(topText.toUpperCase(), centerX, y);
      ctx.fillText(topText.toUpperCase(), centerX, y);
    }
    if (bottomText.trim()) {
      const y = canvas.height - 20;
      ctx.strokeText(bottomText.toUpperCase(), centerX, y);
      ctx.fillText(bottomText.toUpperCase(), centerX, y);
    }

    setResultUrl(canvas.toDataURL("image/png"));
  }

  async function handleGenerate() {
    if (files.length === 0) { setError("Upload an image first."); return; }
    setError(null); setProcessing(true);
    try {
      const file = files[0];
      const img = new Image();
      const url = URL.createObjectURL(file);
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Could not load image."));
        img.src = url;
      });
      drawMeme(img);
      URL.revokeObjectURL(url);
    } catch {
      setError("Something went wrong generating the meme.");
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

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Top text</label>
          <input
            type="text"
            value={topText}
            onChange={(e) => setTopText(e.target.value)}
            placeholder="TOP TEXT"
            className="h-11 rounded-xl border border-input bg-background px-4 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Bottom text</label>
          <input
            type="text"
            value={bottomText}
            onChange={(e) => setBottomText(e.target.value)}
            placeholder="BOTTOM TEXT"
            className="h-11 rounded-xl border border-input bg-background px-4 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Font size: {fontSize}px</label>
        <input
          type="range"
          min={20}
          max={100}
          value={fontSize}
          onChange={(e) => setFontSize(parseInt(e.target.value, 10))}
          className="w-full max-w-xs"
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button onClick={handleGenerate} disabled={processing || files.length === 0} className="self-start">
        {processing && <Loader2 className="h-4 w-4 animate-spin" />}
        {processing ? "Generating..." : "Generate meme"}
      </Button>

      <canvas ref={canvasRef} className="hidden" />

      {resultUrl && (
        <div className="flex flex-col items-start gap-3 rounded-xl border border-border bg-surface p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={resultUrl} alt="Meme preview" className="max-h-96 rounded-lg border border-border" />
          <Button variant="secondary" size="sm" asChild>
            <a href={resultUrl} download="meme.png">
              <Download className="h-3.5 w-3.5" />
              Download
            </a>
          </Button>
        </div>
      )}
    </div>
  );
}