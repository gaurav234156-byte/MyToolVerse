"use client";

import * as React from "react";
import { Download, Loader2, FileText } from "lucide-react";
import { FileDropzone } from "@/components/tools/file-dropzone";
import { Button } from "@/components/ui/button";

const PAGE_WIDTH = 595.28; // A4 in points
const PAGE_HEIGHT = 841.89;
const MARGIN = 56;
const FONT_SIZE = 11;
const LINE_HEIGHT = 16;

export function WordToPdfEngine() {
  const [files, setFiles] = React.useState<File[]>([]);
  const [processing, setProcessing] = React.useState(false);
  const [pdfUrl, setPdfUrl] = React.useState<string | null>(null);
  const [fileName, setFileName] = React.useState<string>("converted.pdf");
  const [pageCount, setPageCount] = React.useState<number | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  async function handleConvert() {
    const file = files[0];
    if (!file) {
      setError("Upload a Word document first.");
      return;
    }
    if (/\.doc$/i.test(file.name)) {
      setError(
        "Legacy .doc files aren't supported yet — please save the file as .docx and try again."
      );
      return;
    }

    setError(null);
    setProcessing(true);
    setPdfUrl(null);
    setPageCount(null);

    try {
      const mammoth = await import("mammoth");
      const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");

      const arrayBuffer = await file.arrayBuffer();
      const { value: rawText } = await mammoth.extractRawText({ arrayBuffer });

      const paragraphs = rawText
        .split(/\n+/)
        .map((p) => p.trim())
        .filter((p) => p.length > 0);

      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const maxWidth = PAGE_WIDTH - MARGIN * 2;

      let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      let y = PAGE_HEIGHT - MARGIN;
      let pages = 1;

      function newPage() {
        page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
        y = PAGE_HEIGHT - MARGIN;
        pages++;
      }

      function wrapLine(text: string): string[] {
        const words = text.split(" ");
        const lines: string[] = [];
        let current = "";
        for (const word of words) {
          const candidate = current ? `${current} ${word}` : word;
          const width = font.widthOfTextAtSize(candidate, FONT_SIZE);
          if (width > maxWidth && current) {
            lines.push(current);
            current = word;
          } else {
            current = candidate;
          }
        }
        if (current) lines.push(current);
        return lines;
      }

      const content = paragraphs.length > 0 ? paragraphs : [""];

      for (const paragraph of content) {
        const lines = wrapLine(paragraph);
        for (const line of lines) {
          if (y < MARGIN) newPage();
          page.drawText(line, {
            x: MARGIN,
            y,
            size: FONT_SIZE,
            font,
            color: rgb(0, 0, 0),
          });
          y -= LINE_HEIGHT;
        }
        y -= LINE_HEIGHT * 0.5;
        if (y < MARGIN) newPage();
      }

const bytes = await pdfDoc.save();
      const blob = new Blob([bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength)], {
        type: "application/pdf",
      });
      setPdfUrl(URL.createObjectURL(blob));
      setPageCount(pages);

      const baseName = file.name.replace(/\.docx$/i, "");
      setFileName(`${baseName}.pdf`);
    } catch {
      setError(
        "Couldn't convert this file. Make sure it's a valid, unprotected .docx document."
      );
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <FileDropzone
        accept=".doc,.docx"
        files={files}
        onFilesChange={(f) => {
          setFiles(f);
          setPdfUrl(null);
          setPageCount(null);
        }}
        label="Drag and drop a Word document here"
        hint="Upload one .docx file to convert into a PDF"
      />

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-3">
        <Button onClick={handleConvert} disabled={processing || !files[0]}>
          {processing && <Loader2 className="h-4 w-4 animate-spin" />}
          {processing ? "Converting..." : "Convert to PDF"}
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
          <FileText className="h-4 w-4 shrink-0 text-primary" />
          <p className="text-sm text-muted-foreground">
            Converted into a {pageCount}-page{" "}
            <span className="font-medium text-foreground">{fileName}</span>.
            Text and paragraph breaks carry over; complex layouts, tables,
            and images are not yet preserved.
          </p>
        </div>
      )}
    </div>
  );
}