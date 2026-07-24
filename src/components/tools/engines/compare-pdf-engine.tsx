"use client";

import * as React from "react";
import { Loader2, GitCompare } from "lucide-react";
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

async function extractLines(file: File): Promise<string[]> {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
  ).toString();

  const bytes = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
  const allLines: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const items = textContent.items as unknown as TextItemLike[];
    const lines = groupItemsIntoLines(items).filter((l) => l.length > 0);
    allLines.push(...lines);
  }
  return allLines;
}

type DiffOp = { type: "equal" | "added" | "removed"; text: string };

// Classic LCS-based line diff.
function diffLines(a: string[], b: string[]): DiffOp[] {
  const n = a.length;
  const m = b.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () =>
    new Array(m + 1).fill(0)
  );

  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] =
        a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }

  const ops: DiffOp[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      ops.push({ type: "equal", text: a[i] });
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      ops.push({ type: "removed", text: a[i] });
      i++;
    } else {
      ops.push({ type: "added", text: b[j] });
      j++;
    }
  }
  while (i < n) {
    ops.push({ type: "removed", text: a[i] });
    i++;
  }
  while (j < m) {
    ops.push({ type: "added", text: b[j] });
    j++;
  }
  return ops;
}

export function ComparePdfEngine() {
  const [filesA, setFilesA] = React.useState<File[]>([]);
  const [filesB, setFilesB] = React.useState<File[]>([]);
  const [processing, setProcessing] = React.useState(false);
  const [diff, setDiff] = React.useState<DiffOp[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  async function handleCompare() {
    if (!filesA[0] || !filesB[0]) {
      setError("Upload both PDFs to compare.");
      return;
    }

    setError(null);
    setProcessing(true);
    setDiff(null);

    try {
      const [linesA, linesB] = await Promise.all([
        extractLines(filesA[0]),
        extractLines(filesB[0]),
      ]);
      setDiff(diffLines(linesA, linesB));
    } catch (err) {
      console.error("Compare PDF error:", err);
      setError(
        "Couldn't compare these files. Make sure both are valid, unprotected, text-based PDFs."
      );
    } finally {
      setProcessing(false);
    }
  }

  const addedCount = diff?.filter((d) => d.type === "added").length ?? 0;
  const removedCount = diff?.filter((d) => d.type === "removed").length ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <FileDropzone
          accept=".pdf"
          files={filesA}
          onFilesChange={(f) => {
            setFilesA(f);
            setDiff(null);
          }}
          label="Original PDF"
          hint="Upload the first version"
        />
        <FileDropzone
          accept=".pdf"
          files={filesB}
          onFilesChange={(f) => {
            setFilesB(f);
            setDiff(null);
          }}
          label="Revised PDF"
          hint="Upload the second version"
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button
        onClick={handleCompare}
        disabled={processing || !filesA[0] || !filesB[0]}
        className="w-fit"
      >
        {processing && <Loader2 className="h-4 w-4 animate-spin" />}
        {processing ? "Comparing..." : "Compare PDFs"}
      </Button>

      {diff && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
            <GitCompare className="h-4 w-4 shrink-0 text-primary" />
            <p className="text-sm text-muted-foreground">
              Found <span className="font-medium text-foreground">{addedCount}</span>{" "}
              added and{" "}
              <span className="font-medium text-foreground">{removedCount}</span>{" "}
              removed line{removedCount === 1 ? "" : "s"}. Comparison is
              text-based; layout and image differences aren&apos;t detected.
            </p>
          </div>

          <div className="max-h-[500px] overflow-y-auto rounded-xl border border-border">
            {diff.map((op, index) => (
              <div
                key={index}
                className={
                  op.type === "added"
                    ? "bg-green-500/10 px-4 py-1 text-sm text-green-700 dark:text-green-400"
                    : op.type === "removed"
                    ? "bg-red-500/10 px-4 py-1 text-sm text-red-700 dark:text-red-400 line-through"
                    : "px-4 py-1 text-sm text-muted-foreground"
                }
              >
                {op.type === "added" ? "+ " : op.type === "removed" ? "- " : "  "}
                {op.text}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}