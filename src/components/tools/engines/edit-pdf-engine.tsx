"use client";

import * as React from "react";
import { Download, Loader2, Plus, Trash2 } from "lucide-react";
import { FileDropzone } from "@/components/tools/file-dropzone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Annotation = {
  id: string;
  page: number;
  text: string;
  xPct: number; // 0-100, from left
  yPct: number; // 0-100, from top
  size: number;
};

export function EditPdfEngine() {
  const [files, setFiles] = React.useState<File[]>([]);
  const [annotations, setAnnotations] = React.useState<Annotation[]>([]);
  const [draftText, setDraftText] = React.useState("");
  const [draftPage, setDraftPage] = React.useState(1);
  const [draftX, setDraftX] = React.useState(10);
  const [draftY, setDraftY] = React.useState(10);
  const [draftSize, setDraftSize] = React.useState(16);
  const [processing, setProcessing] = React.useState(false);
  const [resultUrl, setResultUrl] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const idRef = React.useRef(0);

  function addAnnotation() {
    if (!draftText.trim()) return;
    setAnnotations((prev) => [
      ...prev,
      { id: `a-${idRef.current++}`, page: draftPage, text: draftText, xPct: draftX, yPct: draftY, size: draftSize },
    ]);
    setDraftText("");
  }

  function removeAnnotation(id: string) {
    setAnnotations((prev) => prev.filter((a) => a.id !== id));
  }

  async function handleSave() {
    if (!files[0]) { setError("Upload a PDF first."); return; }
    if (annotations.length === 0) { setError("Add at least one text annotation first."); return; }
    setError(null); setProcessing(true); setResultUrl(null);
    try {
      const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");
      const bytes = await files[0].arrayBuffer();
      const doc = await PDFDocument.load(bytes);
      const font = await doc.embedFont(StandardFonts.Helvetica);
      const pages = doc.getPages();

      annotations.forEach((a) => {
        const idx = Math.min(Math.max(a.page, 1), pages.length) - 1;
        const page = pages[idx];
        const { width, height } = page.getSize();
        page.drawText(a.text, {
          x: (a.xPct / 100) * width,
          y: height - (a.yPct / 100) * height,
          size: a.size,
          font,
          color: rgb(0.1, 0.1, 0.1),
        });
      });

      const out = await doc.save();
      setResultUrl(URL.createObjectURL(new Blob([out as BlobPart], { type: "application/pdf" })));
    } catch {
      setError("Couldn't save the edited PDF. Make sure it's valid and unprotected.");
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <FileDropzone accept=".pdf" files={files} onFilesChange={(f) => { setFiles(f); setResultUrl(null); setAnnotations([]); }}
        label="Drag and drop a PDF here" hint="Upload one PDF to edit" />

      <div className="flex flex-col gap-3 rounded-xl border border-border p-4">
        <label className="text-sm font-medium">Add a text box</label>
        <Input placeholder="Text to add" value={draftText} onChange={(e) => setDraftText(e.target.value)} />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">Page</label>
            <Input type="number" min={1} value={draftPage} onChange={(e) => setDraftPage(Number(e.target.value))} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">From left %</label>
            <Input type="number" min={0} max={100} value={draftX} onChange={(e) => setDraftX(Number(e.target.value))} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">From top %</label>
            <Input type="number" min={0} max={100} value={draftY} onChange={(e) => setDraftY(Number(e.target.value))} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">Font size</label>
            <Input type="number" min={6} max={72} value={draftSize} onChange={(e) => setDraftSize(Number(e.target.value))} />
          </div>
        </div>
        <Button variant="secondary" size="sm" onClick={addAnnotation} className="w-fit">
          <Plus className="h-3.5 w-3.5" /> Add to page
        </Button>
      </div>

      {annotations.length > 0 && (
        <ul className="flex flex-col gap-2">
          {annotations.map((a) => (
            <li key={a.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm">
              <span>Page {a.page}: “{a.text}” at {a.xPct}%, {a.yPct}%</span>
              <Button variant="ghost" size="sm" onClick={() => removeAnnotation(a.id)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-3">
        <Button onClick={handleSave} disabled={processing || !files[0]}>
          {processing && <Loader2 className="h-4 w-4 animate-spin" />}
          {processing ? "Saving..." : "Save edited PDF"}
        </Button>
        {resultUrl && (
          <Button variant="secondary" asChild>
            <a href={resultUrl} download="edited.pdf"><Download className="h-4 w-4" />Download</a>
          </Button>
        )}
      </div>
    </div>
  );
}
