"use client";

import * as React from "react";
import { Download, Loader2, FileText } from "lucide-react";
import { FileDropzone } from "@/components/tools/file-dropzone";
import { Button } from "@/components/ui/button";

const PAGE_WIDTH = 792; // 11in landscape-ish slide page, in points
const PAGE_HEIGHT = 612;
const MARGIN = 48;
const TITLE_SIZE = 20;
const BODY_SIZE = 13;
const LINE_HEIGHT = 18;

function decodeXmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function sanitize(text: string): string {
  return text
    .replace(/\t/g, "    ")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\u2026/g, "...")
    // eslint-disable-next-line no-control-regex
    .replace(/[^\x00-\x7F]/g, "");
}

// Extracts the text runs from a slide's XML, in document order.
function extractSlideLines(xml: string): string[] {
  const paragraphMatches = xml.match(/<a:p>[\s\S]*?<\/a:p>/g) || [];
  const lines: string[] = [];
  for (const para of paragraphMatches) {
    const runs = para.match(/<a:t>([\s\S]*?)<\/a:t>/g) || [];
    const text = runs
      .map((r) => decodeXmlEntities(r.replace(/<a:t>|<\/a:t>/g, "")))
      .join("");
    lines.push(sanitize(text).trim());
  }
  return lines;
}

export function PowerpointToPdfEngine() {
  const [files, setFiles] = React.useState<File[]>([]);
  const [processing, setProcessing] = React.useState(false);
  const [pdfUrl, setPdfUrl] = React.useState<string | null>(null);
  const [fileName, setFileName] = React.useState<string>("converted.pdf");
  const [slideCount, setSlideCount] = React.useState<number | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  async function handleConvert() {
    const file = files[0];
    if (!file) {
      setError("Upload a PowerPoint file first.");
      return;
    }
    if (/\.ppt$/i.test(file.name)) {
      setError(
        "Legacy .ppt files aren't supported yet — please save the file as .pptx and try again."
      );
      return;
    }

    setError(null);
    setProcessing(true);
    setPdfUrl(null);
    setSlideCount(null);

    try {
      const JSZip = (await import("jszip")).default;
      const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");

      const arrayBuffer = await file.arrayBuffer();
      const zip = await JSZip.loadAsync(arrayBuffer);

      const slideFiles = Object.keys(zip.files)
        .filter((name) => /^ppt\/slides\/slide\d+\.xml$/.test(name))
        .sort((a, b) => {
          const numA = parseInt(a.match(/slide(\d+)\.xml/)?.[1] || "0", 10);
          const numB = parseInt(b.match(/slide(\d+)\.xml/)?.[1] || "0", 10);
          return numA - numB;
        });

      if (slideFiles.length === 0) {
        throw new Error("No slides found in this file.");
      }

      const pdfDoc = await PDFDocument.create();
      const titleFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const bodyFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const maxWidth = PAGE_WIDTH - MARGIN * 2;

      function wrapLine(text: string, font: typeof bodyFont, size: number): string[] {
        const words = text.split(" ");
        const lines: string[] = [];
        let current = "";
        for (const word of words) {
          const candidate = current ? `${current} ${word}` : word;
          const width = font.widthOfTextAtSize(candidate, size);
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

      for (const slidePath of slideFiles) {
        const xml = await zip.files[slidePath].async("text");
        const lines = extractSlideLines(xml).filter((l) => l.length > 0);

        const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
        let y = PAGE_HEIGHT - MARGIN;

        lines.forEach((line, index) => {
          const isTitle = index === 0;
          const font = isTitle ? titleFont : bodyFont;
          const size = isTitle ? TITLE_SIZE : BODY_SIZE;
          const wrapped = wrapLine(line, font, size);
          for (const wrappedLine of wrapped) {
            if (y < MARGIN) return;
            page.drawText(wrappedLine, {
              x: MARGIN,
              y,
              size,
              font,
              color: rgb(0, 0, 0),
            });
            y -= LINE_HEIGHT;
          }
          y -= LINE_HEIGHT * 0.4;
        });
      }

      const bytes = await pdfDoc.save();
      const blob = new Blob([bytes as unknown as BlobPart], {
        type: "application/pdf",
      });
      setPdfUrl(URL.createObjectURL(blob));
      setSlideCount(slideFiles.length);

      const baseName = file.name.replace(/\.pptx$/i, "");
      setFileName(`${baseName}.pdf`);
    } catch (err) {
      console.error("PowerPoint to PDF error:", err);
      setError(
        "Couldn't convert this file. Make sure it's a valid, unprotected .pptx presentation."
      );
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <FileDropzone
        accept=".ppt,.pptx"
        files={files}
        onFilesChange={(f) => {
          setFiles(f);
          setPdfUrl(null);
          setSlideCount(null);
        }}
        label="Drag and drop a PowerPoint file here"
        hint="Upload one .pptx file to convert into a PDF"
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

      {pdfUrl && slideCount !== null && (
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
          <FileText className="h-4 w-4 shrink-0 text-primary" />
          <p className="text-sm text-muted-foreground">
            Converted {slideCount} slide{slideCount === 1 ? "" : "s"} into{" "}
            <span className="font-medium text-foreground">{fileName}</span>.
            Text content carries over as one page per slide; images,
            animations, and complex layouts are not yet preserved.
          </p>
        </div>
      )}
    </div>
  );
}