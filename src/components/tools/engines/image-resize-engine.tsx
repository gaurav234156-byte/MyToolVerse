"use client";

import * as React from "react";
import { Download, Loader2, Link2, Link2Off } from "lucide-react";
import { FileDropzone } from "@/components/tools/file-dropzone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const PRESETS = [
  { label: "Custom",       w: null,  h: null,  desc: "Enter size" },
  { label: "HD",           w: 1280,  h: 720,   desc: "1280 × 720" },
  { label: "Full HD",      w: 1920,  h: 1080,  desc: "1920 × 1080" },
  { label: "4K",           w: 3840,  h: 2160,  desc: "3840 × 2160" },
  { label: "Instagram",    w: 1080,  h: 1080,  desc: "1080 × 1080" },
  { label: "Facebook",     w: 1200,  h: 630,   desc: "1200 × 630" },
  { label: "Twitter/X",    w: 1200,  h: 675,   desc: "1200 × 675" },
  { label: "LinkedIn",     w: 1200,  h: 627,   desc: "1200 × 627" },
  { label: "WhatsApp DP",  w: 500,   h: 500,   desc: "500 × 500" },
  { label: "Thumbnail",    w: 640,   h: 360,   desc: "640 × 360" },
  { label: "Favicon",      w: 32,    h: 32,    desc: "32 × 32" },
];

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

export function ImageResizeEngine() {
  const [files, setFiles] = React.useState<File[]>([]);
  const [original, setOriginal] = React.useState<{ w: number; h: number } | null>(null);
  const [activePreset, setActivePreset] = React.useState(PRESETS[0]);
  const [width, setWidth] = React.useState("");
  const [height, setHeight] = React.useState("");
  const [lockAspect, setLockAspect] = React.useState(true);
  const [processing, setProcessing] = React.useState(false);
  const [resultUrl, setResultUrl] = React.useState<string | null>(null);
  const [resultSize, setResultSize] = React.useState<{ w: number; h: number } | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  async function handleFilesChange(newFiles: File[]) {
    setFiles(newFiles);
    setResultUrl(null); setError(null); setResultSize(null);
    if (newFiles[0]) {
      const img = await loadImage(newFiles[0]);
      setOriginal({ w: img.naturalWidth, h: img.naturalHeight });
      setWidth(String(img.naturalWidth));
      setHeight(String(img.naturalHeight));
      setActivePreset(PRESETS[0]);
    } else {
      setOriginal(null);
    }
  }

  function applyPreset(p: typeof PRESETS[number]) {
    setActivePreset(p);
    if (p.w && p.h) {
      setWidth(String(p.w));
      setHeight(String(p.h));
    }
  }

  function onWidthChange(v: string) {
    setWidth(v);
    if (lockAspect && original) {
      const w = parseInt(v, 10);
      if (!isNaN(w) && w > 0) setHeight(String(Math.round((w * original.h) / original.w)));
    }
  }

  function onHeightChange(v: string) {
    setHeight(v);
    if (lockAspect && original) {
      const h = parseInt(v, 10);
      if (!isNaN(h) && h > 0) setWidth(String(Math.round((h * original.w) / original.h)));
    }
  }

  async function handleResize() {
    if (!files[0]) { setError("Upload an image first."); return; }
    const w = parseInt(width, 10);
    const h = parseInt(height, 10);
    if (!w || !h || w <= 0 || h <= 0) { setError("Enter a valid width and height."); return; }
    setError(null); setProcessing(true); setResultUrl(null);
    try {
      const img = await loadImage(files[0]);
      const canvas = document.createElement("canvas");
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas not supported");
      ctx.drawImage(img, 0, 0, w, h);
      canvas.toBlob((blob) => {
        if (blob) { setResultUrl(URL.createObjectURL(blob)); setResultSize({ w, h }); }
        setProcessing(false);
      }, files[0].type || "image/png");
    } catch {
      setError("Couldn't resize this image.");
      setProcessing(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <FileDropzone
        accept="image/*"
        files={files}
        onFilesChange={handleFilesChange}
        label="Drag and drop an image here, or click to browse"
        hint="JPG, PNG, or WebP"
      />

      {original && (
        <>
          <p className="text-xs text-muted-foreground">
            Original: <span className="font-semibold text-foreground">{original.w} × {original.h} px</span>
          </p>

          {/* Preset grid */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Output size</label>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  onClick={() => applyPreset(p)}
                  className={`flex flex-col rounded-xl border px-3 py-2.5 text-left transition-all duration-150 ${
                    activePreset.label === p.label
                      ? "border-primary bg-primary-soft"
                      : "border-border hover:bg-accent"
                  }`}
                >
                  <span className={`text-xs font-semibold ${activePreset.label === p.label ? "text-primary" : "text-foreground"}`}>
                    {p.label}
                  </span>
                  <span className="text-[10px] text-muted-foreground leading-tight mt-0.5">{p.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Manual width/height */}
          <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Width (px)</label>
              <Input type="number" value={width} onChange={(e) => onWidthChange(e.target.value)} />
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="mb-0.5"
              onClick={() => setLockAspect((v) => !v)}
              aria-label="Toggle aspect ratio lock"
            >
              {lockAspect
                ? <Link2 className="h-4 w-4 text-primary" />
                : <Link2Off className="h-4 w-4 text-muted-foreground" />}
            </Button>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Height (px)</label>
              <Input type="number" value={height} onChange={(e) => onHeightChange(e.target.value)} />
            </div>
          </div>
        </>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={handleResize} disabled={processing || !files[0]}>
          {processing && <Loader2 className="h-4 w-4 animate-spin" />}
          {processing ? "Resizing..." : `Resize to ${width || "?"}×${height || "?"} px`}
        </Button>
        {resultUrl && (
          <Button variant="secondary" asChild>
            <a href={resultUrl} download="resized-image">
              <Download className="h-4 w-4" />
              Download
            </a>
          </Button>
        )}
      </div>

      {resultUrl && resultSize && (
        <div className="flex flex-col gap-3">
          <p className="text-xs text-muted-foreground">
            Output: <span className="font-semibold text-foreground">{resultSize.w} × {resultSize.h} px</span>
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={resultUrl} alt="Resized preview"
            className="max-h-80 self-start rounded-xl border border-border object-contain" />
        </div>
      )}
    </div>
  );
}
