"use client";

import * as React from "react";
import { Download, Loader2 } from "lucide-react";
import { FileDropzone } from "@/components/tools/file-dropzone";
import { Button } from "@/components/ui/button";
import { degrees } from "pdf-lib";

const ANGLES = [90, 180, 270] as const;

export function PdfRotateEngine() {
  const [files, setFiles] = React.useState<File[]>([]);
  const [angle, setAngle] = React.useState<90 | 180 | 270>(90);
  const [pages, setPages] = React.useState<"all" | string>("all");
  const [processing, setProcessing] = React.useState(false);
  const [resultUrl, setResultUrl] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  async function handleRotate() {
    if (!files[0]) { setError("Upload a PDF first."); return; }
    setError(null); setProcessing(true); setResultUrl(null);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const bytes = await files[0].arrayBuffer();
      const doc = await PDFDocument.load(bytes);
      const pageCount = doc.getPageCount();

      let indices: number[] = [];
      if (pages === "all") {
        indices = Array.from({ length: pageCount }, (_, i) => i);
      } else {
        pages.split(",").forEach((part) => {
          const [a, b] = part.trim().split("-").map(Number);
          if (!isNaN(b)) {
            for (let i = a; i <= b; i++) if (i >= 1 && i <= pageCount) indices.push(i - 1);
          } else if (!isNaN(a) && a >= 1 && a <= pageCount) {
            indices.push(a - 1);
          }
        });
      }

      indices.forEach((i) => {
        const page = doc.getPage(i);
        page.setRotation(degrees((page.getRotation().angle + angle) % 360));
      });

      const out = await doc.save();
      setResultUrl(URL.createObjectURL(new Blob([out as BlobPart], { type: "application/pdf" })));
    } catch {
      setError("Couldn't rotate this PDF. Make sure it's a valid, unprotected file.");
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <FileDropzone accept=".pdf" files={files} onFilesChange={(f) => { setFiles(f); setResultUrl(null); }}
        label="Drag and drop a PDF here" hint="Upload one PDF to rotate" />

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Rotation angle</label>
        <div className="flex gap-2">
          {ANGLES.map((a) => (
            <button key={a} onClick={() => setAngle(a)}
              className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${angle === a ? "border-primary bg-primary-soft text-primary" : "border-border text-muted-foreground hover:bg-accent"}`}>
              {a}°
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Pages</label>
        <div className="flex gap-2">
          {(["all", "custom"] as const).map((v) => (
            <button key={v} onClick={() => setPages(v === "all" ? "all" : "1")}
              className={`rounded-lg border px-4 py-2 text-sm font-medium capitalize transition-colors ${(v === "all" ? pages === "all" : pages !== "all") ? "border-primary bg-primary-soft text-primary" : "border-border text-muted-foreground hover:bg-accent"}`}>
              {v}
            </button>
          ))}
        </div>
        {pages !== "all" && (
          <input value={pages} onChange={(e) => setPages(e.target.value)} placeholder="e.g. 1,3-5"
            className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" />
        )}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-3">
        <Button onClick={handleRotate} disabled={processing || !files[0]}>
          {processing && <Loader2 className="h-4 w-4 animate-spin" />}
          {processing ? "Rotating..." : "Rotate PDF"}
        </Button>
        {resultUrl && (
          <Button variant="secondary" asChild>
            <a href={resultUrl} download="rotated.pdf"><Download className="h-4 w-4" />Download</a>
          </Button>
        )}
      </div>
    </div>
  );
}
