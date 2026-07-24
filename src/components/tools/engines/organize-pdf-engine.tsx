"use client";

import * as React from "react";
import { Download, Loader2, Trash2, Copy, ArrowLeft, ArrowRight } from "lucide-react";
import { FileDropzone } from "@/components/tools/file-dropzone";
import { Button } from "@/components/ui/button";

type PageItem = { id: string; originalIndex: number; thumb: string };

export function OrganizePdfEngine() {
  const [files, setFiles] = React.useState<File[]>([]);
  const [pages, setPages] = React.useState<PageItem[]>([]);
  const [loadingThumbs, setLoadingThumbs] = React.useState(false);
  const [processing, setProcessing] = React.useState(false);
  const [resultUrl, setResultUrl] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const originalBytesRef = React.useRef<ArrayBuffer | null>(null);
  const idCounter = React.useRef(0);

  async function handleFilesChange(f: File[]) {
    setFiles(f);
    setResultUrl(null);
    setPages([]);
    setError(null);
    if (!f[0]) return;

    setLoadingThumbs(true);
    try {
      const bytes = await f[0].arrayBuffer();
      originalBytesRef.current = bytes;

      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
        "pdfjs-dist/build/pdf.worker.min.mjs",
        import.meta.url
      ).toString();

      const pdf = await pdfjsLib.getDocument({ data: bytes.slice(0) }).promise;
      const items: PageItem[] = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 0.4 });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d")!;
        await page.render({ canvasContext: ctx, viewport }).promise;
        items.push({
          id: `p-${idCounter.current++}`,
          originalIndex: i - 1,
          thumb: canvas.toDataURL("image/jpeg", 0.7),
        });
      }
      setPages(items);
    } catch {
      setError("Couldn't read this PDF. Make sure it's valid and unprotected.");
    } finally {
      setLoadingThumbs(false);
    }
  }

  function moveLeft(idx: number) {
    if (idx === 0) return;
    setPages((prev) => {
      const next = [...prev];
      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      return next;
    });
  }

  function moveRight(idx: number) {
    setPages((prev) => {
      if (idx === prev.length - 1) return prev;
      const next = [...prev];
      [next[idx + 1], next[idx]] = [next[idx], next[idx + 1]];
      return next;
    });
  }

  function deletePage(idx: number) {
    setPages((prev) => prev.filter((_, i) => i !== idx));
  }

  function duplicatePage(idx: number) {
    setPages((prev) => {
      const next = [...prev];
      next.splice(idx + 1, 0, { ...prev[idx], id: `p-${idCounter.current++}` });
      return next;
    });
  }

  async function handleSave() {
    if (!originalBytesRef.current || pages.length === 0) { setError("No pages to save."); return; }
    setError(null); setProcessing(true); setResultUrl(null);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const srcDoc = await PDFDocument.load(originalBytesRef.current);
      const outDoc = await PDFDocument.create();
      const copiedPages = await outDoc.copyPages(srcDoc, pages.map((p) => p.originalIndex));
      copiedPages.forEach((p) => outDoc.addPage(p));
      const out = await outDoc.save();
      setResultUrl(URL.createObjectURL(new Blob([out as BlobPart], { type: "application/pdf" })));
    } catch {
      setError("Couldn't save the reorganized PDF.");
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <FileDropzone accept=".pdf" files={files} onFilesChange={handleFilesChange}
        label="Drag and drop a PDF here" hint="Upload one PDF to organize" />

      {loadingThumbs && (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading pages...
        </p>
      )}

      {pages.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {pages.map((p, idx) => (
            <div key={p.id} className="flex flex-col gap-2 rounded-lg border border-border p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.thumb} alt={`Page ${idx + 1}`} className="w-full rounded border border-border" />
              <p className="text-center text-xs text-muted-foreground">Page {idx + 1}</p>
              <div className="flex items-center justify-center gap-1">
                <Button variant="ghost" size="sm" onClick={() => moveLeft(idx)} disabled={idx === 0}>
                  <ArrowLeft className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => duplicatePage(idx)}>
                  <Copy className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => deletePage(idx)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => moveRight(idx)} disabled={idx === pages.length - 1}>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-3">
        <Button onClick={handleSave} disabled={processing || pages.length === 0}>
          {processing && <Loader2 className="h-4 w-4 animate-spin" />}
          {processing ? "Saving..." : "Save PDF"}
        </Button>
        {resultUrl && (
          <Button variant="secondary" asChild>
            <a href={resultUrl} download="organized.pdf"><Download className="h-4 w-4" />Download</a>
          </Button>
        )}
      </div>
    </div>
  );
}
