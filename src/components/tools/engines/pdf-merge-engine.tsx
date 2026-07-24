"use client";

import * as React from "react";
import { Download, Loader2, ArrowDownUp } from "lucide-react";
import { FileDropzone } from "@/components/tools/file-dropzone";
import { Button } from "@/components/ui/button";

export function PdfMergeEngine() {
  const [files, setFiles] = React.useState<File[]>([]);
  const [processing, setProcessing] = React.useState(false);
  const [resultUrl, setResultUrl] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  function moveFile(index: number, direction: -1 | 1) {
    const next = [...files];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setFiles(next);
  }

  async function handleMerge() {
    if (files.length < 2) {
      setError("Add at least two PDF files to merge.");
      return;
    }
    setError(null);
    setProcessing(true);
    setResultUrl(null);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const mergedPdf = await PDFDocument.create();

      for (const file of files) {
        const bytes = await file.arrayBuffer();
        const sourcePdf = await PDFDocument.load(bytes);
        const pages = await mergedPdf.copyPages(sourcePdf, sourcePdf.getPageIndices());
        pages.forEach((page) => mergedPdf.addPage(page));
      }

      const mergedBytes = await mergedPdf.save();
      const blob = new Blob([mergedBytes as BlobPart], { type: "application/pdf" });
      setResultUrl(URL.createObjectURL(blob));
    } catch (e) {
      setError("Something went wrong while merging. Make sure all files are valid PDFs.");
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <FileDropzone
        accept=".pdf"
        multiple
        files={files}
        onFilesChange={(f) => {
          setFiles(f);
          setResultUrl(null);
        }}
        label="Drag and drop PDFs here, or click to browse"
        hint="Add 2 or more PDF files — they'll merge in the order shown below"
      />

      {files.length > 1 && (
        <ul className="flex flex-col gap-2">
          {files.map((file, i) => (
            <li
              key={`${file.name}-${i}`}
              className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-2.5"
            >
              <span className="truncate text-sm">
                {i + 1}. {file.name}
              </span>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => moveFile(i, -1)}
                  disabled={i === 0}
                  aria-label="Move up"
                >
                  <ArrowDownUp className="h-3.5 w-3.5 rotate-180" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => moveFile(i, 1)}
                  disabled={i === files.length - 1}
                  aria-label="Move down"
                >
                  <ArrowDownUp className="h-3.5 w-3.5" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={handleMerge} disabled={processing || files.length < 2}>
          {processing && <Loader2 className="h-4 w-4 animate-spin" />}
          {processing ? "Merging..." : "Merge PDFs"}
        </Button>

        {resultUrl && (
          <Button variant="secondary" asChild>
            <a href={resultUrl} download="merged.pdf">
              <Download className="h-4 w-4" />
              Download merged PDF
            </a>
          </Button>
        )}
      </div>
    </div>
  );
}
