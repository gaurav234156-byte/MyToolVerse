"use client";

import * as React from "react";
import { Download, Loader2, Archive } from "lucide-react";
import { FileDropzone } from "@/components/tools/file-dropzone";
import { Button } from "@/components/ui/button";

export function PdfToPdfaEngine() {
  const [files, setFiles] = React.useState<File[]>([]);
  const [processing, setProcessing] = React.useState(false);
  const [pdfUrl, setPdfUrl] = React.useState<string | null>(null);
  const [fileName, setFileName] = React.useState<string>("converted.pdf");
  const [error, setError] = React.useState<string | null>(null);

  async function handleConvert() {
    const file = files[0];
    if (!file) {
      setError("Upload a PDF first.");
      return;
    }

    setError(null);
    setProcessing(true);
    setPdfUrl(null);

    try {
      const { PDFDocument } = await import("pdf-lib");

      const bytes = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(bytes);

      // Embed baseline metadata required for long-term archival readability.
      pdfDoc.setProducer("MyToolVerse PDF to PDF/A");
      pdfDoc.setCreator("MyToolVerse");
      if (!pdfDoc.getTitle()) {
        pdfDoc.setTitle(file.name.replace(/\.pdf$/i, ""));
      }
      pdfDoc.setModificationDate(new Date());

      const outBytes = await pdfDoc.save();
      const blob = new Blob([outBytes as unknown as BlobPart], {
        type: "application/pdf",
      });
      setPdfUrl(URL.createObjectURL(blob));

      const baseName = file.name.replace(/\.pdf$/i, "");
      setFileName(`${baseName}-pdfa.pdf`);
    } catch (err) {
      console.error("PDF to PDF/A error:", err);
      setError(
        "Couldn't convert this PDF. Make sure it's a valid, unprotected file."
      );
    } finally {
      setProcessing(false);
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
        }}
        label="Drag and drop a PDF here"
        hint="Upload one PDF to prepare for long-term archival"
      />

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-3">
        <Button onClick={handleConvert} disabled={processing || !files[0]}>
          {processing && <Loader2 className="h-4 w-4 animate-spin" />}
          {processing ? "Converting..." : "Convert to PDF/A"}
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

      {pdfUrl && (
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
          <Archive className="h-4 w-4 shrink-0 text-primary" />
          <p className="text-sm text-muted-foreground">
            Archival metadata has been added to{" "}
            <span className="font-medium text-foreground">{fileName}</span>.
            This is a simplified conversion for long-term readability, not
            an ISO 19005 (PDF/A) certified output — for formal compliance
            checks, verify with a dedicated PDF/A validator.
          </p>
        </div>
      )}
    </div>
  );
}