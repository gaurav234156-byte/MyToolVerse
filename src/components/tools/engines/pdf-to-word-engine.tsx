"use client";

import * as React from "react";
import { Download, Loader2, FileText } from "lucide-react";
import { FileDropzone } from "@/components/tools/file-dropzone";
import { Button } from "@/components/ui/button";

interface TextItemLike {
  str: string;
  transform: number[];
  width: number;
}

// Groups extracted PDF text items into lines based on their vertical position,
// then sorts each line left-to-right so words read in natural order.
function groupItemsIntoLines(items: TextItemLike[]): string[] {
  const rows: { y: number; items: TextItemLike[] }[] = [];

  for (const item of items) {
    if (!item.str) continue;
    const y = Math.round(item.transform[5]);
    let row = rows.find((r) => Math.abs(r.y - y) < 4);
    if (!row) {
      row = { y, items: [] };
      rows.push(row);
    }
    row.items.push(item);
  }

  rows.sort((a, b) => b.y - a.y);

  return rows.map((row) => {
    row.items.sort((a, b) => a.transform[4] - b.transform[4]);
    return row.items.map((i) => i.str).join(" ").replace(/\s+/g, " ").trim();
  });
}

export function PdfToWordEngine() {
  const [files, setFiles] = React.useState<File[]>([]);
  const [processing, setProcessing] = React.useState(false);
  const [docxUrl, setDocxUrl] = React.useState<string | null>(null);
  const [fileName, setFileName] = React.useState<string>("converted.docx");
  const [pageCount, setPageCount] = React.useState<number | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  async function handleConvert() {
    if (!files[0]) {
      setError("Upload a PDF first.");
      return;
    }
    setError(null);
    setProcessing(true);
    setDocxUrl(null);
    setPageCount(null);

    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
        "pdfjs-dist/build/pdf.worker.min.mjs",
        import.meta.url
      ).toString();

      const { Document, Packer, Paragraph, TextRun, PageBreak } = await import("docx");

      const bytes = await files[0].arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;

      const children: InstanceType<typeof Paragraph>[] = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const items = textContent.items as unknown as TextItemLike[];
        const lines = groupItemsIntoLines(items);

        if (lines.length === 0) {
          children.push(new Paragraph({ children: [new TextRun("")] }));
        } else {
          for (const line of lines) {
            children.push(
              new Paragraph({
                children: [new TextRun(line)],
                spacing: { after: 120 },
              })
            );
          }
        }

        if (i < pdf.numPages) {
          children.push(
            new Paragraph({ children: [new PageBreak()] })
          );
        }
      }

      const doc = new Document({
        sections: [{ children }],
      });

      const blob = await Packer.toBlob(doc);
      setDocxUrl(URL.createObjectURL(blob));
      setPageCount(pdf.numPages);

      const baseName = files[0].name.replace(/\.pdf$/i, "");
      setFileName(`${baseName}.docx`);
    } catch {
      setError(
        "Couldn't convert this PDF. Make sure it's a valid, unprotected, text-based file."
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
          setDocxUrl(null);
          setPageCount(null);
        }}
        label="Drag and drop a PDF here"
        hint="Upload one PDF to convert into an editable Word document"
      />

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-3">
        <Button onClick={handleConvert} disabled={processing || !files[0]}>
          {processing && <Loader2 className="h-4 w-4 animate-spin" />}
          {processing ? "Converting..." : "Convert to Word"}
        </Button>
        {docxUrl && (
          <Button variant="secondary" asChild>
            <a href={docxUrl} download={fileName}>
              <Download className="h-4 w-4" />
              Download .docx
            </a>
          </Button>
        )}
      </div>

      {docxUrl && pageCount !== null && (
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
          <FileText className="h-4 w-4 shrink-0 text-primary" />
          <p className="text-sm text-muted-foreground">
            Converted {pageCount} page{pageCount === 1 ? "" : "s"} into{" "}
            <span className="font-medium text-foreground">{fileName}</span>.
            Text-based PDFs convert best; scanned pages without selectable
            text may come through blank.
          </p>
        </div>
      )}
    </div>
  );
}