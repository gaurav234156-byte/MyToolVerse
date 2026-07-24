"use client";

import * as React from "react";
import { Download, Loader2 } from "lucide-react";
import { FileDropzone } from "@/components/tools/file-dropzone";
import { Button } from "@/components/ui/button";

export function ExcelToPdfEngine() {
  const [files, setFiles] = React.useState<File[]>([]);
  const [landscape, setLandscape] = React.useState(false);
  const [processing, setProcessing] = React.useState(false);
  const [resultUrl, setResultUrl] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  async function handleConvert() {
    if (!files[0]) { setError("Upload a spreadsheet first."); return; }
    setError(null); setProcessing(true); setResultUrl(null);
    try {
      const XLSX = await import("xlsx");
      const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");

      const buf = await files[0].arrayBuffer();
      const workbook = XLSX.read(buf, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rows: string[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false, defval: "" });

      const doc = await PDFDocument.create();
      const font = await doc.embedFont(StandardFonts.Helvetica);
      const boldFont = await doc.embedFont(StandardFonts.HelveticaBold);

      const pageWidth = landscape ? 792 : 612;
      const pageHeight = landscape ? 612 : 792;
      const margin = 36;
      const fontSize = 8;
      const rowHeight = 16;
      const usableWidth = pageWidth - margin * 2;
      const colCount = Math.max(1, ...rows.map((r) => r.length));
      const colWidth = usableWidth / colCount;

      let page = doc.addPage([pageWidth, pageHeight]);
      let y = pageHeight - margin;

      rows.forEach((row, rowIdx) => {
        if (y < margin + rowHeight) {
          page = doc.addPage([pageWidth, pageHeight]);
          y = pageHeight - margin;
        }
        const isHeader = rowIdx === 0;
        row.forEach((cell, colIdx) => {
          const x = margin + colIdx * colWidth;
          const text = String(cell ?? "").slice(0, 40);
          page.drawText(text, {
            x: x + 2,
            y: y - rowHeight + 5,
            size: fontSize,
            font: isHeader ? boldFont : font,
            color: rgb(0.1, 0.1, 0.1),
          });
        });
        page.drawLine({
          start: { x: margin, y: y - rowHeight },
          end: { x: pageWidth - margin, y: y - rowHeight },
          thickness: 0.5,
          color: rgb(0.85, 0.85, 0.85),
        });
        y -= rowHeight;
      });

      const out = await doc.save();
      setResultUrl(URL.createObjectURL(new Blob([out as BlobPart], { type: "application/pdf" })));
    } catch {
      setError("Couldn't convert this file. Make sure it's a valid .xls or .xlsx spreadsheet.");
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <FileDropzone accept=".xls,.xlsx" files={files} onFilesChange={(f) => { setFiles(f); setResultUrl(null); }}
        label="Drag and drop a spreadsheet here" hint="Upload one .xls or .xlsx file" />

      <label className="flex w-fit items-center gap-2 text-sm">
        <input type="checkbox" checked={landscape} onChange={(e) => setLandscape(e.target.checked)} />
        Landscape orientation (for wide sheets)
      </label>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-3">
        <Button onClick={handleConvert} disabled={processing || !files[0]}>
          {processing && <Loader2 className="h-4 w-4 animate-spin" />}
          {processing ? "Converting..." : "Convert to PDF"}
        </Button>
        {resultUrl && (
          <Button variant="secondary" asChild>
            <a href={resultUrl} download="converted.pdf"><Download className="h-4 w-4" />Download</a>
          </Button>
        )}
      </div>
    </div>
  );
}
