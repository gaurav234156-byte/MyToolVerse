"use client";

import * as React from "react";
import { Download, Loader2, Presentation } from "lucide-react";
import { FileDropzone } from "@/components/tools/file-dropzone";
import { Button } from "@/components/ui/button";

interface TextItemLike {
  str: string;
  transform: number[];
}

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

export function PdfToPowerpointEngine() {
  const [files, setFiles] = React.useState<File[]>([]);
  const [processing, setProcessing] = React.useState(false);
  const [pptxUrl, setPptxUrl] = React.useState<string | null>(null);
  const [fileName, setFileName] = React.useState<string>("converted.pptx");
  const [slideCount, setSlideCount] = React.useState<number | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  async function handleConvert() {
    const file = files[0];
    if (!file) {
      setError("Upload a PDF first.");
      return;
    }

    setError(null);
    setProcessing(true);
    setPptxUrl(null);
    setSlideCount(null);

    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
        "pdfjs-dist/build/pdf.worker.min.mjs",
        import.meta.url
      ).toString();

      const PptxGenJS = (await import("pptxgenjs")).default;

      const bytes = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;

      const pptx = new PptxGenJS();
      pptx.defineLayout({ name: "A4-ish", width: 10, height: 7.5 });
      pptx.layout = "A4-ish";

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const items = textContent.items as unknown as TextItemLike[];
        const lines = groupItemsIntoLines(items).filter((l) => l.length > 0);

        const slide = pptx.addSlide();
        const bodyText = lines.length > 0 ? lines.join("\n") : "(No text found on this page)";

        slide.addText(bodyText, {
          x: 0.4,
          y: 0.4,
          w: 9.2,
          h: 6.7,
          fontSize: 14,
          valign: "top",
          align: "left",
          shrinkText: true,
        });
      }

      const blob = (await pptx.write({ outputType: "blob" })) as Blob;
      setPptxUrl(URL.createObjectURL(blob));
      setSlideCount(pdf.numPages);

      const baseName = file.name.replace(/\.pdf$/i, "");
      setFileName(`${baseName}.pptx`);
    } catch (err) {
      console.error("PDF to PowerPoint error:", err);
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
          setPptxUrl(null);
          setSlideCount(null);
        }}
        label="Drag and drop a PDF here"
        hint="Upload one PDF to convert into a PowerPoint deck"
      />

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-3">
        <Button onClick={handleConvert} disabled={processing || !files[0]}>
          {processing && <Loader2 className="h-4 w-4 animate-spin" />}
          {processing ? "Converting..." : "Convert to PowerPoint"}
        </Button>
        {pptxUrl && (
          <Button variant="secondary" asChild>
            <a href={pptxUrl} download={fileName}>
              <Download className="h-4 w-4" />
              Download .pptx
            </a>
          </Button>
        )}
      </div>

      {pptxUrl && slideCount !== null && (
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
          <Presentation className="h-4 w-4 shrink-0 text-primary" />
          <p className="text-sm text-muted-foreground">
            Converted {slideCount} page{slideCount === 1 ? "" : "s"} into{" "}
            <span className="font-medium text-foreground">{fileName}</span>,
            one slide per page with the extracted text. Layout, images, and
            design are not yet preserved.
          </p>
        </div>
      )}
    </div>
  );
}