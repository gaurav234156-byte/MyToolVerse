"use client";

import * as React from "react";
import { Copy, Check } from "lucide-react";
import { FileDropzone } from "@/components/tools/file-dropzone";
import { Button } from "@/components/ui/button";

interface PickedColor { hex: string; rgb: string; hsl: string }

function rgbToHsl(r: number, g: number, b: number) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
}

function toHex(n: number) { return n.toString(16).padStart(2, "0"); }

export function ImageColorPickerEngine() {
  const [files, setFiles] = React.useState<File[]>([]);
  const [imgUrl, setImgUrl] = React.useState<string | null>(null);
  const [palette, setPalette] = React.useState<PickedColor[]>([]);
  const [copiedHex, setCopiedHex] = React.useState<string | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const imgRef = React.useRef<HTMLImageElement>(null);

  React.useEffect(() => {
    if (files.length === 0) { setImgUrl(null); setPalette([]); return; }
    const url = URL.createObjectURL(files[0]);
    setImgUrl(url);
    setPalette([]);
    return () => URL.revokeObjectURL(url);
  }, [files]);

  function handleImageLoad() {
    const img = imgRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas) return;
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx?.drawImage(img, 0, 0);
  }

  function handleClick(e: React.MouseEvent<HTMLImageElement>) {
    const img = imgRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const rect = img.getBoundingClientRect();
    const scaleX = img.naturalWidth / rect.width;
    const scaleY = img.naturalHeight / rect.height;
    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);

    const [r, g, b] = ctx.getImageData(x, y, 1, 1).data;
    const hex = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    const rgb = `rgb(${r}, ${g}, ${b})`;
    const hsl = rgbToHsl(r, g, b);

    setPalette((prev) => [{ hex, rgb, hsl }, ...prev].slice(0, 20));
  }

  function copy(text: string) {
    navigator.clipboard.writeText(text);
    setCopiedHex(text);
    setTimeout(() => setCopiedHex(null), 1500);
  }

  return (
    <div className="flex flex-col gap-6">
      <FileDropzone
        accept="image/*"
        files={files}
        onFilesChange={setFiles}
        label="Drag and drop an image here, or click to browse"
        hint="Click anywhere on the image to pick a color"
      />

      {imgUrl && (
        <div className="overflow-auto rounded-xl border border-border bg-surface p-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imgRef}
            src={imgUrl}
            alt="Uploaded"
            onLoad={handleImageLoad}
            onClick={handleClick}
            className="max-w-full cursor-crosshair rounded-lg"
          />
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />

      {palette.length > 0 && (
        <ul className="flex flex-col gap-2">
          {palette.map((c, i) => (
            <li key={`${c.hex}-${i}`} className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
              <span className="h-8 w-8 shrink-0 rounded-lg border border-border" style={{ backgroundColor: c.hex }} />
              <div className="flex min-w-0 flex-1 flex-col gap-0.5 text-xs sm:flex-row sm:items-center sm:gap-4">
                <span className="font-mono text-sm font-semibold">{c.hex}</span>
                <span className="text-muted-foreground">{c.rgb}</span>
                <span className="text-muted-foreground">{c.hsl}</span>
              </div>
              <Button variant="secondary" size="sm" onClick={() => copy(c.hex)}>
                {copiedHex === c.hex ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}