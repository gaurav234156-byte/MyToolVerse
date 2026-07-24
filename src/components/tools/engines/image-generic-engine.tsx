"use client";

import * as React from "react";
import { Download, Loader2, Copy, Check } from "lucide-react";
import { FileDropzone } from "@/components/tools/file-dropzone";
import { Button } from "@/components/ui/button";

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

/* ── Image to Base64 ── */
function ImageToBase64() {
  const [files, setFiles] = React.useState<File[]>([]);
  const [b64, setB64] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);

  async function convert() {
    if (!files[0]) return;
    const reader = new FileReader();
    reader.onload = () => setB64(reader.result as string);
    reader.readAsDataURL(files[0]);
  }

  return (
    <div className="flex flex-col gap-5">
      <FileDropzone accept="image/*" files={files} onFilesChange={(f) => { setFiles(f); setB64(null); }}
        label="Drop an image here" hint="JPG, PNG, WebP, or GIF" />
      <Button onClick={convert} disabled={!files[0]} className="self-start">Convert to Base64</Button>
      {b64 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Base64 data URL</label>
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs"
              onClick={() => { navigator.clipboard.writeText(b64); setCopied(true); setTimeout(() => setCopied(false), 1500); }}>
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
          <textarea readOnly value={b64} rows={4}
            className="w-full resize-y rounded-xl border border-input bg-surface p-4 font-mono text-xs outline-none" />
        </div>
      )}
    </div>
  );
}

/* ── Rotate Image ── */
function RotateImage() {
  const [files, setFiles] = React.useState<File[]>([]);
  const [angle, setAngle] = React.useState<90 | 180 | 270>(90);
  const [processing, setProcessing] = React.useState(false);
  const [resultUrl, setResultUrl] = React.useState<string | null>(null);

  async function rotate() {
    if (!files[0]) return;
    setProcessing(true); setResultUrl(null);
    try {
      const img = await loadImage(files[0]);
      const swap = angle === 90 || angle === 270;
      const canvas = document.createElement("canvas");
      canvas.width = swap ? img.naturalHeight : img.naturalWidth;
      canvas.height = swap ? img.naturalWidth : img.naturalHeight;
      const ctx = canvas.getContext("2d")!;
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((angle * Math.PI) / 180);
      ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
      canvas.toBlob((blob) => { if (blob) setResultUrl(URL.createObjectURL(blob)); setProcessing(false); },
        files[0].type || "image/png");
    } catch { setProcessing(false); }
  }

  return (
    <div className="flex flex-col gap-5">
      <FileDropzone accept="image/*" files={files} onFilesChange={(f) => { setFiles(f); setResultUrl(null); }}
        label="Drop an image here" hint="JPG, PNG, or WebP" />
      <div className="flex gap-2">
        {([90, 180, 270] as const).map((a) => (
          <button key={a} onClick={() => setAngle(a)}
            className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${angle === a ? "border-primary bg-primary-soft text-primary" : "border-border text-muted-foreground hover:bg-accent"}`}>
            {a}°
          </button>
        ))}
      </div>
      <div className="flex gap-3">
        <Button onClick={rotate} disabled={processing || !files[0]}>
          {processing && <Loader2 className="h-4 w-4 animate-spin" />}
          {processing ? "Rotating..." : "Rotate image"}
        </Button>
        {resultUrl && (
          <Button variant="secondary" asChild>
            <a href={resultUrl} download="rotated-image"><Download className="h-4 w-4" />Download</a>
          </Button>
        )}
      </div>
      {resultUrl && <img src={resultUrl} alt="Rotated" className="max-h-80 self-start rounded-xl border border-border" />}
    </div>
  );
}

/* ── Image Watermark ── */
function ImageWatermark() {
  const [files, setFiles] = React.useState<File[]>([]);
  const [waterText, setWaterText] = React.useState("© MyToolVerse");
  const [opacity, setOpacity] = React.useState(50);
  const [processing, setProcessing] = React.useState(false);
  const [resultUrl, setResultUrl] = React.useState<string | null>(null);

  async function addWatermark() {
    if (!files[0]) return;
    setProcessing(true); setResultUrl(null);
    try {
      const img = await loadImage(files[0]);
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      const fontSize = Math.max(20, Math.min(img.naturalWidth, img.naturalHeight) * 0.06);
      ctx.font = `bold ${fontSize}px sans-serif`;
      ctx.globalAlpha = opacity / 100;
      ctx.fillStyle = "#ffffff";
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 2;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.translate(img.naturalWidth / 2, img.naturalHeight / 2);
      ctx.rotate(-Math.PI / 6);
      ctx.strokeText(waterText, 0, 0);
      ctx.fillText(waterText, 0, 0);
      canvas.toBlob((blob) => { if (blob) setResultUrl(URL.createObjectURL(blob)); setProcessing(false); },
        files[0].type || "image/png");
    } catch { setProcessing(false); }
  }

  return (
    <div className="flex flex-col gap-5">
      <FileDropzone accept="image/*" files={files} onFilesChange={(f) => { setFiles(f); setResultUrl(null); }}
        label="Drop an image here" hint="JPG, PNG, or WebP" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">Watermark text</label>
          <input value={waterText} onChange={(e) => setWaterText(e.target.value)}
            className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" />
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Opacity</label>
            <span className="text-sm font-semibold text-primary">{opacity}%</span>
          </div>
          <input type="range" min={10} max={90} value={opacity} onChange={(e) => setOpacity(Number(e.target.value))}
            className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-full bg-muted accent-blue-600" />
        </div>
      </div>
      <div className="flex gap-3">
        <Button onClick={addWatermark} disabled={processing || !files[0]}>
          {processing && <Loader2 className="h-4 w-4 animate-spin" />}
          {processing ? "Adding watermark..." : "Add watermark"}
        </Button>
        {resultUrl && (
          <Button variant="secondary" asChild>
            <a href={resultUrl} download="watermarked-image"><Download className="h-4 w-4" />Download</a>
          </Button>
        )}
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {resultUrl && <img src={resultUrl} alt="Watermarked" className="max-h-80 self-start rounded-xl border border-border" />}
    </div>
  );
}

/* ── Dispatcher ── */
export function ImageGenericEngine({ slug }: { slug: string }) {
  switch (slug) {
    case "image-to-base64":  return <ImageToBase64 />;
    case "rotate-image":     return <RotateImage />;
    case "image-watermark":  return <ImageWatermark />;
    default:
      return <p className="rounded-xl bg-surface px-4 py-6 text-center text-sm text-muted-foreground">This image tool is being wired up.</p>;
  }
}
