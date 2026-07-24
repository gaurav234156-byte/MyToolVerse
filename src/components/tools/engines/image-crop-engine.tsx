"use client";

import * as React from "react";
import { Download, Loader2 } from "lucide-react";
import { FileDropzone } from "@/components/tools/file-dropzone";
import { Button } from "@/components/ui/button";

interface CropBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

export function ImageCropEngine() {
  const [files, setFiles] = React.useState<File[]>([]);
  const [imgUrl, setImgUrl] = React.useState<string | null>(null);
  const [naturalSize, setNaturalSize] = React.useState({ width: 0, height: 0 });
  const [crop, setCrop] = React.useState<CropBox>({ x: 10, y: 10, w: 80, h: 80 });
  const [dragging, setDragging] = React.useState<"move" | "resize" | null>(null);
  const [dragStart, setDragStart] = React.useState({ x: 0, y: 0, crop: crop });
  const [processing, setProcessing] = React.useState(false);
  const [resultUrl, setResultUrl] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  function handleFilesChange(newFiles: File[]) {
    setFiles(newFiles);
    setResultUrl(null);
    setError(null);
    setCrop({ x: 10, y: 10, w: 80, h: 80 });
    if (newFiles[0]) {
      const url = URL.createObjectURL(newFiles[0]);
      setImgUrl(url);
      const img = new Image();
      img.onload = () => setNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
      img.src = url;
    } else {
      setImgUrl(null);
    }
  }

  function onPointerDown(e: React.PointerEvent, mode: "move" | "resize") {
    e.stopPropagation();
    setDragging(mode);
    setDragStart({ x: e.clientX, y: e.clientY, crop });
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const dxPct = ((e.clientX - dragStart.x) / rect.width) * 100;
    const dyPct = ((e.clientY - dragStart.y) / rect.height) * 100;

    if (dragging === "move") {
      const x = Math.min(Math.max(dragStart.crop.x + dxPct, 0), 100 - dragStart.crop.w);
      const y = Math.min(Math.max(dragStart.crop.y + dyPct, 0), 100 - dragStart.crop.h);
      setCrop((c) => ({ ...c, x, y }));
    } else {
      const w = Math.min(Math.max(dragStart.crop.w + dxPct, 5), 100 - dragStart.crop.x);
      const h = Math.min(Math.max(dragStart.crop.h + dyPct, 5), 100 - dragStart.crop.y);
      setCrop((c) => ({ ...c, w, h }));
    }
  }

  function onPointerUp() {
    setDragging(null);
  }

  async function handleCrop() {
    if (!files[0] || !naturalSize.width) {
      setError("Upload an image first.");
      return;
    }
    setError(null);
    setProcessing(true);
    setResultUrl(null);
    try {
      const img = new Image();
      img.src = imgUrl!;
      await new Promise((res) => (img.onload = res));

      const sx = (crop.x / 100) * naturalSize.width;
      const sy = (crop.y / 100) * naturalSize.height;
      const sw = (crop.w / 100) * naturalSize.width;
      const sh = (crop.h / 100) * naturalSize.height;

      const canvas = document.createElement("canvas");
      canvas.width = sw;
      canvas.height = sh;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas not supported");
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);

      canvas.toBlob((blob) => {
        if (blob) setResultUrl(URL.createObjectURL(blob));
        setProcessing(false);
      }, files[0].type || "image/png");
    } catch {
      setError("Couldn't crop this image.");
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

      {imgUrl && (
        <div
          ref={containerRef}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
          className="relative w-full select-none overflow-hidden rounded-xl border border-border bg-surface"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imgUrl} alt="To crop" className="block w-full" draggable={false} />
          <div
            onPointerDown={(e) => onPointerDown(e, "move")}
            className="absolute cursor-move border-2 border-primary bg-primary/10"
            style={{
              left: `${crop.x}%`,
              top: `${crop.y}%`,
              width: `${crop.w}%`,
              height: `${crop.h}%`,
            }}
          >
            <div
              onPointerDown={(e) => onPointerDown(e, "resize")}
              className="absolute -bottom-1.5 -right-1.5 h-4 w-4 cursor-se-resize rounded-full border-2 border-white bg-primary shadow"
            />
          </div>
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={handleCrop} disabled={processing || !files[0]}>
          {processing && <Loader2 className="h-4 w-4 animate-spin" />}
          {processing ? "Cropping..." : "Crop image"}
        </Button>
        {resultUrl && (
          <Button variant="secondary" asChild>
            <a href={resultUrl} download="cropped-image">
              <Download className="h-4 w-4" />
              Download
            </a>
          </Button>
        )}
      </div>

      {resultUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={resultUrl} alt="Cropped preview" className="max-h-80 self-start rounded-xl border border-border" />
      )}
    </div>
  );
}
