"use client";

import * as React from "react";
import { Download, Loader2 } from "lucide-react";
import { FileDropzone } from "@/components/tools/file-dropzone";
import { Button } from "@/components/ui/button";

const PRESETS = [
  { label: "Small", description: "Max ~500 KB", maxKB: 500 },
  { label: "Medium", description: "Max ~1 MB", maxKB: 1024 },
  { label: "Large", description: "Max ~2 MB", maxKB: 2048 },
  { label: "Custom", description: "Enter size", maxKB: null },
];

export function PdfCompressEngine() {
  const [files, setFiles] = React.useState<File[]>([]);
  const [preset, setPreset] = React.useState(PRESETS[1]);
  const [customKB, setCustomKB] = React.useState("1024");
  const [processing, setProcessing] = React.useState(false);
  const [resultUrl, setResultUrl] = React.useState<string | null>(null);
  const [sizes, setSizes] = React.useState<{ before: number; after: number } | null>(null);
  const [rasterized, setRasterized] = React.useState(false);
  const [warning, setWarning] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const targetKB = preset.maxKB ?? parseInt(customKB, 10);

  async function rasterCompress(originalBytes: ArrayBuffer, targetBytes: number) {
    const pdfjsLib = await import("pdfjs-dist");
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/build/pdf.worker.min.mjs",
      import.meta.url
    ).toString();
    const { PDFDocument } = await import("pdf-lib");

    const ratio = Math.max(0.05, Math.min(1, targetBytes / originalBytes.byteLength));
    const scale = ratio < 0.15 ? 0.9 : ratio < 0.3 ? 1.1 : 1.5;
    const quality = Math.max(0.3, Math.min(0.85, ratio * 2));

    const pdf = await pdfjsLib.getDocument({ data: originalBytes.slice(0) }).promise;
    const outDoc = await PDFDocument.create();

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext("2d")!;
      await page.render({ canvasContext: ctx, viewport }).promise;

      const jpegDataUrl = canvas.toDataURL("image/jpeg", quality);
      const jpegBytes = await fetch(jpegDataUrl).then((r) => r.arrayBuffer());
      const jpgImage = await outDoc.embedJpg(jpegBytes);

      const originalViewport = page.getViewport({ scale: 1 });
      const pdfPage = outDoc.addPage([originalViewport.width, originalViewport.height]);
      pdfPage.drawImage(jpgImage, {
        x: 0,
        y: 0,
        width: originalViewport.width,
        height: originalViewport.height,
      });
    }

    return outDoc.save();
  }

  async function handleCompress() {
    if (!files[0]) { setError("Upload a PDF file first."); return; }
    if (!targetKB || targetKB <= 0) { setError("Enter a valid target size."); return; }

    setError(null); setWarning(null);
    setProcessing(true); setResultUrl(null); setSizes(null); setRasterized(false);

    try {
      const { PDFDocument } = await import("pdf-lib");
      const originalBytes = await files[0].arrayBuffer();
      const doc = await PDFDocument.load(originalBytes);

      // Pass 1: strip metadata (fast, keeps text selectable, no quality loss)
      doc.setTitle(""); doc.setAuthor(""); doc.setSubject("");
      doc.setKeywords([]); doc.setProducer(""); doc.setCreator("");
      let outputBytes: Uint8Array = await doc.save({ useObjectStreams: true });

      // Pass 2: if still over target, rasterize pages and re-encode as compressed JPEGs
      if (outputBytes.byteLength / 1024 > targetKB) {
        try {
          const rasterBytes = await rasterCompress(originalBytes, targetKB * 1024);
          if (rasterBytes.byteLength < outputBytes.byteLength) {
            outputBytes = rasterBytes;
            setRasterized(true);
          }
        } catch {
          // If rasterizing fails for any reason, fall back silently to the metadata-only result.
        }
      }

      const afterKB = outputBytes.byteLength / 1024;
      const blob = new Blob([outputBytes as BlobPart], { type: "application/pdf" });
      setResultUrl(URL.createObjectURL(blob));
      setSizes({ before: originalBytes.byteLength, after: outputBytes.byteLength });

      if (afterKB > targetKB) {
        setWarning(
          `Result is ${afterKB.toFixed(0)} KB — the closest we could get to ${targetKB} KB while keeping pages readable. ` +
          `Very image-heavy or high-resolution scans have a floor on how small they can safely go.`
        );
      }
    } catch {
      setError("Something went wrong. Make sure the file is a valid, unprotected PDF.");
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <FileDropzone
        accept=".pdf"
        files={files}
        onFilesChange={(f) => { setFiles(f); setResultUrl(null); setSizes(null); setWarning(null); }}
        label="Drag and drop a PDF here, or click to browse"
        hint="Upload one PDF to compress"
      />

      {/* File size info */}
      {files[0] && (
        <p className="text-sm text-muted-foreground">
          Original size: <span className="font-semibold text-foreground">{(files[0].size / 1024).toFixed(0)} KB</span>
        </p>
      )}

      {/* Target size selector */}
      <div className="flex flex-col gap-3">
        <label className="text-sm font-medium">Target output size</label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => setPreset(p)}
              className={`flex flex-col items-start rounded-xl border px-4 py-3 text-left transition-colors ${
                preset.label === p.label
                  ? "border-primary bg-primary-soft"
                  : "border-border hover:bg-accent"
              }`}
            >
              <span className={`text-sm font-semibold ${preset.label === p.label ? "text-primary" : "text-foreground"}`}>
                {p.label}
              </span>
              <span className="text-xs text-muted-foreground">{p.description}</span>
            </button>
          ))}
        </div>

        {preset.maxKB === null && (
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={customKB}
              onChange={(e) => setCustomKB(e.target.value)}
              placeholder="e.g. 800"
              min={50}
              className="h-11 w-40 rounded-xl border border-input bg-background px-4 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <span className="text-sm text-muted-foreground">KB</span>
          </div>
        )}
      </div>

      <p className="rounded-xl bg-surface px-4 py-3 text-xs leading-relaxed text-muted-foreground">
        We first strip metadata to shrink the file with zero quality loss. If that's not enough
        to hit your target, image-heavy or scanned PDFs are automatically re-encoded at a lower
        resolution to reach the size you asked for.
      </p>

      {rasterized && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-xs leading-relaxed text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400">
          ℹ️ This file needed deeper compression, so pages were re-rendered at a lower resolution to shrink it further. Text is no longer selectable in the result, but it stays readable.
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
      {warning && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400">
          ⚠️ {warning}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={handleCompress} disabled={processing || !files[0]}>
          {processing && <Loader2 className="h-4 w-4 animate-spin" />}
          {processing ? "Compressing..." : `Compress to ~${targetKB || "?"}  KB`}
        </Button>

        {resultUrl && (
          <Button variant="secondary" asChild>
            <a href={resultUrl} download="compressed.pdf">
              <Download className="h-4 w-4" />
              Download compressed PDF
            </a>
          </Button>
        )}
      </div>

      {sizes && (
        <div className="flex items-center gap-4 rounded-xl bg-surface px-5 py-4">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Before</p>
            <p className="font-semibold">{(sizes.before / 1024).toFixed(0)} KB</p>
          </div>
          <div className="flex-1 text-center text-muted-foreground">→</div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">After</p>
            <p className="font-semibold text-primary">{(sizes.after / 1024).toFixed(0)} KB</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Saved</p>
            <p className={`font-semibold ${sizes.after < sizes.before ? "text-success" : "text-muted-foreground"}`}>
              {sizes.after < sizes.before
                ? `${Math.round((1 - sizes.after / sizes.before) * 100)}%`
                : "—"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
