"use client";

import * as React from "react";
import { Download, Loader2 } from "lucide-react";
import { FileDropzone } from "@/components/tools/file-dropzone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function PdfCropEngine() {
  const [files, setFiles] = React.useState<File[]>([]);
  const [top, setTop] = React.useState(0);
  const [bottom, setBottom] = React.useState(0);
  const [left, setLeft] = React.useState(0);
  const [right, setRight] = React.useState(0);
  const [processing, setProcessing] = React.useState(false);
  const [resultUrl, setResultUrl] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  async function handleCrop() {
    if (!files[0]) { setError("Upload a PDF first."); return; }
    setError(null); setProcessing(true); setResultUrl(null);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const bytes = await files[0].arrayBuffer();
      const doc = await PDFDocument.load(bytes);

      doc.getPages().forEach((page) => {
        const { width, height } = page.getSize();
        const newWidth = Math.max(1, width - left - right);
        const newHeight = Math.max(1, height - top - bottom);
        page.setCropBox(left, bottom, newWidth, newHeight);
      });

      const out = await doc.save();
      setResultUrl(URL.createObjectURL(new Blob([out as BlobPart], { type: "application/pdf" })));
    } catch {
      setError("Couldn't crop the PDF. Make sure it's a valid, unprotected file.");
    } finally {
      setProcessing(false);
    }
  }

  const marginFields = [
    { label: "Top", value: top, setValue: setTop },
    { label: "Bottom", value: bottom, setValue: setBottom },
    { label: "Left", value: left, setValue: setLeft },
    { label: "Right", value: right, setValue: setRight },
  ];

  return (
    <div className="flex flex-col gap-6">
      <FileDropzone accept=".pdf" files={files} onFilesChange={(f) => { setFiles(f); setResultUrl(null); }}
        label="Drag and drop a PDF here" hint="Upload one PDF to crop" />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {marginFields.map((f) => (
          <div key={f.label} className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">{f.label} (pt)</label>
            <Input
              type="number"
              min={0}
              value={f.value}
              onChange={(e) => f.setValue(Math.max(0, Number(e.target.value)))}
            />
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        1 inch = 72 points. Values trim margins evenly from every page in the document.
      </p>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-3">
        <Button onClick={handleCrop} disabled={processing || !files[0]}>
          {processing && <Loader2 className="h-4 w-4 animate-spin" />}
          {processing ? "Cropping..." : "Crop PDF"}
        </Button>
        {resultUrl && (
          <Button variant="secondary" asChild>
            <a href={resultUrl} download="cropped.pdf"><Download className="h-4 w-4" />Download</a>
          </Button>
        )}
      </div>
    </div>
  );
}
