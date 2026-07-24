"use client";

import * as React from "react";
import { Download, Loader2 } from "lucide-react";
import { FileDropzone } from "@/components/tools/file-dropzone";
import { Button } from "@/components/ui/button";

export function PdfToJpgEngine() {
  const [files, setFiles] = React.useState<File[]>([]);
  const [processing, setProcessing] = React.useState(false);
  const [zipUrl, setZipUrl] = React.useState<string | null>(null);
  const [thumbs, setThumbs] = React.useState<string[]>([]);
  const [error, setError] = React.useState<string | null>(null);

  async function handleConvert() {
    if (!files[0]) { setError("Upload a PDF first."); return; }
    setError(null); setProcessing(true); setZipUrl(null); setThumbs([]);
    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
        "pdfjs-dist/build/pdf.worker.min.mjs",
        import.meta.url
      ).toString();

      const JSZip = (await import("jszip")).default;
      const bytes = await files[0].arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
      const zip = new JSZip();
      const previews: string[] = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.6 });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d")!;
        await page.render({ canvasContext: ctx, viewport }).promise;

        const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
        if (i <= 6) previews.push(dataUrl);
        const base64 = dataUrl.split(",")[1];
        zip.file(`page-${String(i).padStart(2, "0")}.jpg`, base64, { base64: true });
      }

      setThumbs(previews);
      const blob = await zip.generateAsync({ type: "blob" });
      setZipUrl(URL.createObjectURL(blob));
    } catch {
      setError("Couldn't convert this PDF. Make sure it's a valid, unprotected file.");
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <FileDropzone accept=".pdf" files={files} onFilesChange={(f) => { setFiles(f); setZipUrl(null); setThumbs([]); }}
        label="Drag and drop a PDF here" hint="Upload one PDF to export as images" />

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-3">
        <Button onClick={handleConvert} disabled={processing || !files[0]}>
          {processing && <Loader2 className="h-4 w-4 animate-spin" />}
          {processing ? "Converting..." : "Convert to JPG"}
        </Button>
        {zipUrl && (
          <Button variant="secondary" asChild>
            <a href={zipUrl} download="pdf-pages.zip"><Download className="h-4 w-4" />Download ZIP</a>
          </Button>
        )}
      </div>

      {thumbs.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {thumbs.map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={i} src={src} alt={`Page ${i + 1}`} className="rounded-md border border-border" />
          ))}
        </div>
      )}
    </div>
  );
}
