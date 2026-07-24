"use client";

import * as React from "react";
import { Download, Loader2 } from "lucide-react";
import { FileDropzone } from "@/components/tools/file-dropzone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const POSITIONS = [
  { value: "bottom-center", label: "Bottom center" },
  { value: "bottom-right", label: "Bottom right" },
  { value: "bottom-left", label: "Bottom left" },
  { value: "top-center", label: "Top center" },
  { value: "top-right", label: "Top right" },
] as const;

export function PdfPageNumbersEngine() {
  const [files, setFiles] = React.useState<File[]>([]);
  const [startAt, setStartAt] = React.useState(1);
  const [position, setPosition] = React.useState<(typeof POSITIONS)[number]["value"]>("bottom-center");
  const [processing, setProcessing] = React.useState(false);
  const [resultUrl, setResultUrl] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  async function handleAddNumbers() {
    if (!files[0]) { setError("Upload a PDF first."); return; }
    setError(null); setProcessing(true); setResultUrl(null);
    try {
      const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");
      const bytes = await files[0].arrayBuffer();
      const doc = await PDFDocument.load(bytes);
      const font = await doc.embedFont(StandardFonts.Helvetica);
      const pages = doc.getPages();
      const margin = 28;
      const fontSize = 11;

      pages.forEach((page, i) => {
        const { width } = page.getSize();
        const label = String(startAt + i);
        const textWidth = font.widthOfTextAtSize(label, fontSize);
        let x = width / 2 - textWidth / 2;
        let y = margin;

        if (position.startsWith("top")) y = page.getHeight() - margin;
        if (position.endsWith("right")) x = width - margin - textWidth;
        if (position.endsWith("left")) x = margin;

        page.drawText(label, { x, y, size: fontSize, font, color: rgb(0.2, 0.2, 0.2) });
      });

      const out = await doc.save();
      setResultUrl(URL.createObjectURL(new Blob([out as BlobPart], { type: "application/pdf" })));
    } catch {
      setError("Couldn't add page numbers. Make sure the PDF is valid and unprotected.");
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <FileDropzone accept=".pdf" files={files} onFilesChange={(f) => { setFiles(f); setResultUrl(null); }}
        label="Drag and drop a PDF here" hint="Upload one PDF to number" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">Start numbering at</label>
          <Input type="number" min={0} value={startAt} onChange={(e) => setStartAt(Number(e.target.value))} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">Position</label>
          <select
            value={position}
            onChange={(e) => setPosition(e.target.value as typeof position)}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            {POSITIONS.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-3">
        <Button onClick={handleAddNumbers} disabled={processing || !files[0]}>
          {processing && <Loader2 className="h-4 w-4 animate-spin" />}
          {processing ? "Adding numbers..." : "Add page numbers"}
        </Button>
        {resultUrl && (
          <Button variant="secondary" asChild>
            <a href={resultUrl} download="numbered.pdf"><Download className="h-4 w-4" />Download</a>
          </Button>
        )}
      </div>
    </div>
  );
}
