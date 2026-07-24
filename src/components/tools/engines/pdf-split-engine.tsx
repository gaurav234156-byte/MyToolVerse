"use client";

import * as React from "react";
import { Download, Loader2 } from "lucide-react";
import { FileDropzone } from "@/components/tools/file-dropzone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function parseRanges(input: string, maxPage: number): number[] {
  const pages = new Set<number>();
  const parts = input.split(",").map((p) => p.trim()).filter(Boolean);
  for (const part of parts) {
    if (part.includes("-")) {
      const [startStr, endStr] = part.split("-").map((s) => s.trim());
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);
      if (!isNaN(start) && !isNaN(end)) {
        for (let i = start; i <= end; i++) {
          if (i >= 1 && i <= maxPage) pages.add(i);
        }
      }
    } else {
      const n = parseInt(part, 10);
      if (!isNaN(n) && n >= 1 && n <= maxPage) pages.add(n);
    }
  }
  return Array.from(pages).sort((a, b) => a - b);
}

export function PdfSplitEngine() {
  const [files, setFiles] = React.useState<File[]>([]);
  const [range, setRange] = React.useState("");
  const [totalPages, setTotalPages] = React.useState<number | null>(null);
  const [processing, setProcessing] = React.useState(false);
  const [resultUrl, setResultUrl] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  async function handleFilesChange(newFiles: File[]) {
    setFiles(newFiles);
    setResultUrl(null);
    setError(null);
    if (newFiles[0]) {
      const { PDFDocument } = await import("pdf-lib");
      const bytes = await newFiles[0].arrayBuffer();
      const doc = await PDFDocument.load(bytes);
      setTotalPages(doc.getPageCount());
    } else {
      setTotalPages(null);
    }
  }

  async function handleSplit() {
    if (!files[0]) {
      setError("Upload a PDF file first.");
      return;
    }
    if (!range.trim()) {
      setError("Enter a page range, e.g. 1-3,5");
      return;
    }
    setError(null);
    setProcessing(true);
    setResultUrl(null);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const bytes = await files[0].arrayBuffer();
      const sourcePdf = await PDFDocument.load(bytes);
      const maxPage = sourcePdf.getPageCount();
      const pageNumbers = parseRanges(range, maxPage);

      if (pageNumbers.length === 0) {
        setError(`No valid pages found in range. This PDF has ${maxPage} pages.`);
        setProcessing(false);
        return;
      }

      const newPdf = await PDFDocument.create();
      const pages = await newPdf.copyPages(
        sourcePdf,
        pageNumbers.map((n) => n - 1)
      );
      pages.forEach((page) => newPdf.addPage(page));

      const newBytes = await newPdf.save();
      const blob = new Blob([newBytes as BlobPart], { type: "application/pdf" });
      setResultUrl(URL.createObjectURL(blob));
    } catch (e) {
      setError("Something went wrong while splitting. Make sure the file is a valid PDF.");
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <FileDropzone
        accept=".pdf"
        files={files}
        onFilesChange={handleFilesChange}
        label="Drag and drop a PDF here, or click to browse"
        hint="Upload one PDF to extract pages from"
      />

      {totalPages !== null && (
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">
            Pages to extract ({totalPages} pages total)
          </label>
          <Input
            value={range}
            onChange={(e) => setRange(e.target.value)}
            placeholder="e.g. 1-3, 5, 8-10"
          />
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={handleSplit} disabled={processing || !files[0]}>
          {processing && <Loader2 className="h-4 w-4 animate-spin" />}
          {processing ? "Splitting..." : "Split PDF"}
        </Button>

        {resultUrl && (
          <Button variant="secondary" asChild>
            <a href={resultUrl} download="split.pdf">
              <Download className="h-4 w-4" />
              Download split PDF
            </a>
          </Button>
        )}
      </div>
    </div>
  );
}
