"use client";

import * as React from "react";
import { Download, Loader2, CheckCircle2 } from "lucide-react";
import { FileDropzone } from "@/components/tools/file-dropzone";
import { Button } from "@/components/ui/button";

export function RepairPdfEngine() {
  const [files, setFiles] = React.useState<File[]>([]);
  const [processing, setProcessing] = React.useState(false);
  const [resultUrl, setResultUrl] = React.useState<string | null>(null);
  const [pagesRecovered, setPagesRecovered] = React.useState<number | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  async function handleRepair() {
    if (!files[0]) { setError("Upload a PDF first."); return; }
    setError(null); setProcessing(true); setResultUrl(null); setPagesRecovered(null);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const bytes = await files[0].arrayBuffer();

      // ignoreEncryption + throwOnInvalidObject:false lets pdf-lib recover as much
      // structure as possible from a damaged file, then we re-serialize it cleanly.
      const doc = await PDFDocument.load(bytes, {
        ignoreEncryption: true,
        throwOnInvalidObject: false,
        updateMetadata: false,
      });

      const pageCount = doc.getPageCount();
      if (pageCount === 0) {
        setError("Couldn't recover any pages from this file — it may be too severely damaged.");
        return;
      }

      const out = await doc.save();
      setResultUrl(URL.createObjectURL(new Blob([out as BlobPart], { type: "application/pdf" })));
      setPagesRecovered(pageCount);
    } catch {
      setError("Couldn't open this file at all — it may not be a valid PDF, or the damage is too severe to recover from in the browser.");
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <FileDropzone accept=".pdf" files={files} onFilesChange={(f) => { setFiles(f); setResultUrl(null); setPagesRecovered(null); }}
        label="Drag and drop a PDF here" hint="Upload the damaged or corrupted PDF" />

      <p className="rounded-xl bg-surface px-4 py-3 text-xs leading-relaxed text-muted-foreground">
        This re-parses the file's internal structure and rebuilds it from scratch, which fixes many
        common corruption issues (broken cross-reference tables, malformed objects). It can't recover
        content that's been physically overwritten or truncated.
      </p>

      {error && <p className="text-sm text-destructive">{error}</p>}
      {pagesRecovered !== null && (
        <p className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="h-4 w-4" /> Recovered {pagesRecovered} page{pagesRecovered === 1 ? "" : "s"}.
        </p>
      )}

      <div className="flex gap-3">
        <Button onClick={handleRepair} disabled={processing || !files[0]}>
          {processing && <Loader2 className="h-4 w-4 animate-spin" />}
          {processing ? "Repairing..." : "Repair PDF"}
        </Button>
        {resultUrl && (
          <Button variant="secondary" asChild>
            <a href={resultUrl} download="repaired.pdf"><Download className="h-4 w-4" />Download</a>
          </Button>
        )}
      </div>
    </div>
  );
}
