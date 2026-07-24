"use client";

import * as React from "react";
import { Download, Loader2 } from "lucide-react";
import { FileDropzone } from "@/components/tools/file-dropzone";
import { Button } from "@/components/ui/button";

export function ImagesToPdfEngine() {
  const [files, setFiles] = React.useState<File[]>([]);
  const [processing, setProcessing] = React.useState(false);
  const [resultUrl, setResultUrl] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  async function handleConvert() {
    if (files.length === 0) { setError("Upload at least one image."); return; }
    setError(null); setProcessing(true); setResultUrl(null);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const doc = await PDFDocument.create();

      for (const file of files) {
        const bytes = await file.arrayBuffer();
        let img;
        if (file.type === "image/jpeg" || file.name.toLowerCase().endsWith(".jpg") || file.name.toLowerCase().endsWith(".jpeg")) {
          img = await doc.embedJpg(bytes);
        } else {
          img = await doc.embedPng(bytes);
        }
        const page = doc.addPage([img.width, img.height]);
        page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
      }

      const out = await doc.save();
      setResultUrl(URL.createObjectURL(new Blob([out as BlobPart], { type: "application/pdf" })));
    } catch {
      setError("Couldn't convert images. Make sure all files are JPG or PNG.");
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <FileDropzone accept=".jpg,.jpeg,.png" multiple files={files}
        onFilesChange={(f) => { setFiles(f); setResultUrl(null); }}
        label="Drag and drop JPG or PNG images here"
        hint="Each image becomes one page — add multiple files" />

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-3">
        <Button onClick={handleConvert} disabled={processing || files.length === 0}>
          {processing && <Loader2 className="h-4 w-4 animate-spin" />}
          {processing ? "Converting..." : "Convert to PDF"}
        </Button>
        {resultUrl && (
          <Button variant="secondary" asChild>
            <a href={resultUrl} download="images.pdf"><Download className="h-4 w-4" />Download PDF</a>
          </Button>
        )}
      </div>
    </div>
  );
}
