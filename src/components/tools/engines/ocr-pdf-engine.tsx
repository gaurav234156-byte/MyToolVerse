"use client";

import * as React from "react";
import { Download, Loader2, ScanText } from "lucide-react";
import { FileDropzone } from "@/components/tools/file-dropzone";
import { Button } from "@/components/ui/button";

const RENDER_SCALE = 2; // canvas pixels per PDF point, for sharper OCR input

export function OcrPdfEngine() {
  const [files, setFiles] = React.useState<File[]>([]);
  const [processing, setProcessing] = React.useState(false);
  const [progressLabel, setProgressLabel] = React.useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = React.useState<string | null>(null);
  const [fileName, setFileName] = React.useState<string>("searchable.pdf");
  const [pageCount, setPageCount] = React.useState<number | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  async function handleOcr() {
    const file = files[0];
    if (!file) {
      setError("Upload a scanned PDF first.");
      return;
    }

    setError(null);
    setProcessing(true);
    setPdfUrl(null);
    setPageCount(null);

    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
        "pdfjs-dist/build/pdf.worker.min.mjs",
        import.meta.url
      ).toString();

      const { PDFDocument } = await import("pdf-lib");
      const { createWorker } = await import("tesseract.js");

      const bytes = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;

      const outDoc = await PDFDocument.create();
      const worker = await createWorker("eng");

      for (let i = 1; i <= pdf.numPages; i++) {
        setProgressLabel(`Reading page ${i} of ${pdf.numPages}...`);

        const page = await pdf.getPage(i);
        const baseViewport = page.getViewport({ scale: 1 });
        const renderViewport = page.getViewport({ scale: RENDER_SCALE });

        const canvas = document.createElement("canvas");
        canvas.width = renderViewport.width;
        canvas.height = renderViewport.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Canvas not supported in this browser.");

        await page.render({ canvas, canvasContext: ctx, viewport: renderViewport })
          .promise;

        setProgressLabel(`Recognizing text on page ${i} of ${pdf.numPages}...`);
        const { data } = await worker.recognize(canvas);

        const pngDataUrl = canvas.toDataURL("image/png");
        const pngBytes = await fetch(pngDataUrl).then((r) => r.arrayBuffer());
        const pngImage = await outDoc.embedPng(pngBytes);

        const outPage = outDoc.addPage([baseViewport.width, baseViewport.height]);
        outPage.drawImage(pngImage, {
          x: 0,
          y: 0,
          width: baseViewport.width,
          height: baseViewport.height,
        });

        const words = data.words || [];
        for (const word of words) {
          if (!word.text.trim()) continue;
          const { x0, y0, y1 } = word.bbox;
          const pdfX = x0 / RENDER_SCALE;
          const pdfY = baseViewport.height - y1 / RENDER_SCALE;
          const fontSize = Math.max((y1 - y0) / RENDER_SCALE, 4);

          outPage.drawText(word.text, {
            x: pdfX,
            y: pdfY,
            size: fontSize,
            opacity: 0, // invisible but selectable text layer over the image
          });
        }
      }

      await worker.terminate();

      const outBytes = await outDoc.save();
      const blob = new Blob([outBytes as unknown as BlobPart], {
        type: "application/pdf",
      });
      setPdfUrl(URL.createObjectURL(blob));
      setPageCount(pdf.numPages);

      const baseName = file.name.replace(/\.pdf$/i, "");
      setFileName(`${baseName}-searchable.pdf`);
    } catch (err) {
      console.error("OCR PDF error:", err);
      setError(
        "Couldn't process this PDF. Make sure it's a valid, unprotected file."
      );
    } finally {
      setProcessing(false);
      setProgressLabel(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <FileDropzone
        accept=".pdf"
        files={files}
        onFilesChange={(f) => {
          setFiles(f);
          setPdfUrl(null);
          setPageCount(null);
        }}
        label="Drag and drop a scanned PDF here"
        hint="Upload one scanned or image-based PDF to make it searchable"
      />

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-3">
        <Button onClick={handleOcr} disabled={processing || !files[0]}>
          {processing && <Loader2 className="h-4 w-4 animate-spin" />}
          {processing ? progressLabel || "Processing..." : "Make Searchable"}
        </Button>
        {pdfUrl && (
          <Button variant="secondary" asChild>
            <a href={pdfUrl} download={fileName}>
              <Download className="h-4 w-4" />
              Download .pdf
            </a>
          </Button>
        )}
      </div>

      {pdfUrl && pageCount !== null && (
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
          <ScanText className="h-4 w-4 shrink-0 text-primary" />
          <p className="text-sm text-muted-foreground">
            Processed {pageCount} page{pageCount === 1 ? "" : "s"} into{" "}
            <span className="font-medium text-foreground">{fileName}</span>.
            Text is now selectable and searchable; recognition accuracy
            depends on scan quality, and text position is approximate.
          </p>
        </div>
      )}
    </div>
  );
}