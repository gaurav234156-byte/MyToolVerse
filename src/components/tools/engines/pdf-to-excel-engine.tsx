"use client";

import * as React from "react";
import { Download, Loader2, FileSpreadsheet } from "lucide-react";
import { FileDropzone } from "@/components/tools/file-dropzone";
import { Button } from "@/components/ui/button";

interface TextItemLike {
  str: string;
  transform: number[];
  width: number;
}

// Groups extracted PDF text items into rows (by y position), then splits
// each row into cells wherever there's a large horizontal gap between
// words — a simple heuristic for reconstructing table columns.
function groupIntoRows(items: TextItemLike[]): string[][] {
  const rows: { y: number; items: TextItemLike[] }[] = [];

  for (const item of items) {
    if (!item.str.trim()) continue;
    const y = Math.round(item.transform[5]);
    let row = rows.find((r) => Math.abs(r.y - y) < 4);
    if (!row) {
      row = { y, items: [] };
      rows.push(row);
    }
    row.items.push(item);
  }

  rows.sort((a, b) => b.y - a.y);

  const GAP_THRESHOLD = 12;

  return rows.map((row) => {
    row.items.sort((a, b) => a.transform[4] - b.transform[4]);
    const cells: string[] = [];
    let current = "";
    let lastEnd: number | null = null;

    for (const item of row.items) {
      const x = item.transform[4];
      if (lastEnd !== null && x - lastEnd > GAP_THRESHOLD) {
        cells.push(current.trim());
        current = item.str;
      } else {
        current = current ? `${current} ${item.str}` : item.str;
      }
      lastEnd = x + item.width;
    }
    if (current) cells.push(current.trim());
    return cells;
  });
}

export function PdfToExcelEngine() {
  const [files, setFiles] = React.useState<File[]>([]);
  const [processing, setProcessing] = React.useState(false);
  const [xlsxUrl, setXlsxUrl] = React.useState<string | null>(null);
  const [fileName, setFileName] = React.useState<string>("converted.xlsx");
  const [pageCount, setPageCount] = React.useState<number | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  async function handleConvert() {
    const file = files[0];
    if (!file) {
      setError("Upload a PDF first.");
      return;
    }

    setError(null);
    setProcessing(true);
    setXlsxUrl(null);
    setPageCount(null);

    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
        "pdfjs-dist/build/pdf.worker.min.mjs",
        import.meta.url
      ).toString();

      const XLSX = await import("xlsx");

      const bytes = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;

      const workbook = XLSX.utils.book_new();

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const items = textContent.items as unknown as TextItemLike[];
        const rows = groupIntoRows(items);

        const sheetData = rows.length > 0 ? rows : [[""]];
        const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
        XLSX.utils.book_append_sheet(workbook, worksheet, `Page ${i}`);
      }

      const out = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
      const blob = new Blob([out], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      setXlsxUrl(URL.createObjectURL(blob));
      setPageCount(pdf.numPages);

      const baseName = file.name.replace(/\.pdf$/i, "");
      setFileName(`${baseName}.xlsx`);
    } catch (err) {
      console.error("PDF to Excel error:", err);
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
          setXlsxUrl(null);
          setPageCount(null);
        }}
        label="Drag and drop a PDF here"
        hint="Upload one PDF to extract tables into a spreadsheet"
      />

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-3">
        <Button onClick={handleConvert} disabled={processing || !files[0]}>
          {processing && <Loader2 className="h-4 w-4 animate-spin" />}
          {processing ? "Converting..." : "Convert to Excel"}
        </Button>
        {xlsxUrl && (
          <Button variant="secondary" asChild>
            <a href={xlsxUrl} download={fileName}>
              <Download className="h-4 w-4" />
              Download .xlsx
            </a>
          </Button>
        )}
      </div>

      {xlsxUrl && pageCount !== null && (
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
          <FileSpreadsheet className="h-4 w-4 shrink-0 text-primary" />
          <p className="text-sm text-muted-foreground">
            Converted {pageCount} page{pageCount === 1 ? "" : "s"} into{" "}
            <span className="font-medium text-foreground">{fileName}</span>,
            one sheet per page. Simple tables extract best; complex
            multi-column layouts may need manual adjustment.
          </p>
        </div>
      )}
    </div>
  );
}
