"use client";

import * as React from "react";
import { Download, Loader2, Eraser } from "lucide-react";
import { FileDropzone } from "@/components/tools/file-dropzone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function PdfSignEngine() {
  const [files, setFiles] = React.useState<File[]>([]);
  const [pageNumber, setPageNumber] = React.useState(1);
  const [processing, setProcessing] = React.useState(false);
  const [resultUrl, setResultUrl] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const drawingRef = React.useRef(false);
  const hasDrawnRef = React.useRef(false);

  function getPos(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function handlePointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawingRef.current = true;
    hasDrawnRef.current = true;
    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  }

  function handlePointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { x, y } = getPos(e);
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#1e293b";
    ctx.lineTo(x, y);
    ctx.stroke();
  }

  function handlePointerUp() {
    drawingRef.current = false;
  }

  function clearCanvas() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    hasDrawnRef.current = false;
  }

  async function handleSign() {
    if (!files[0]) { setError("Upload a PDF first."); return; }
    if (!hasDrawnRef.current) { setError("Draw a signature first."); return; }
    setError(null); setProcessing(true); setResultUrl(null);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const bytes = await files[0].arrayBuffer();
      const doc = await PDFDocument.load(bytes);
      const pages = doc.getPages();
      const idx = Math.min(Math.max(pageNumber, 1), pages.length) - 1;
      const page = pages[idx];

      const canvas = canvasRef.current!;
      const pngDataUrl = canvas.toDataURL("image/png");
      const pngBytes = await fetch(pngDataUrl).then((r) => r.arrayBuffer());
      const pngImage = await doc.embedPng(pngBytes);

      const sigWidth = 160;
      const sigHeight = (canvas.height / canvas.width) * sigWidth;
      const { width, height } = page.getSize();

      page.drawImage(pngImage, {
        x: width - sigWidth - 40,
        y: 40,
        width: sigWidth,
        height: Math.max(20, height > 0 ? sigHeight : 60),
      });

      const out = await doc.save();
      setResultUrl(URL.createObjectURL(new Blob([out as BlobPart], { type: "application/pdf" })));
    } catch {
      setError("Couldn't sign the PDF. Make sure it's a valid, unprotected file.");
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <FileDropzone accept=".pdf" files={files} onFilesChange={(f) => { setFiles(f); setResultUrl(null); }}
        label="Drag and drop a PDF here" hint="Upload one PDF to sign" />

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">Draw your signature</label>
        <canvas
          ref={canvasRef}
          width={400}
          height={150}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          className="touch-none rounded-md border border-input bg-white"
        />
        <Button variant="ghost" size="sm" onClick={clearCanvas} className="w-fit">
          <Eraser className="h-4 w-4" /> Clear
        </Button>
      </div>

      <div className="flex flex-col gap-1.5 sm:w-48">
        <label className="text-sm font-medium">Place on page</label>
        <Input type="number" min={1} value={pageNumber} onChange={(e) => setPageNumber(Number(e.target.value))} />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-3">
        <Button onClick={handleSign} disabled={processing || !files[0]}>
          {processing && <Loader2 className="h-4 w-4 animate-spin" />}
          {processing ? "Signing..." : "Sign PDF"}
        </Button>
        {resultUrl && (
          <Button variant="secondary" asChild>
            <a href={resultUrl} download="signed.pdf"><Download className="h-4 w-4" />Download</a>
          </Button>
        )}
      </div>
    </div>
  );
}
