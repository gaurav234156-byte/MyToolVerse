"use client";

import * as React from "react";
import { Copy, Check, Loader2 } from "lucide-react";
import { FileDropzone } from "@/components/tools/file-dropzone";
import { Button } from "@/components/ui/button";

export function ImageToTextOcrEngine() {
  const [files, setFiles] = React.useState<File[]>([]);
  const [processing, setProcessing] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [text, setText] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleExtract() {
    if (files.length === 0) { setError("Upload an image first."); return; }
    setError(null); setProcessing(true); setText(null); setProgress(0);

    try {
      const Tesseract = await import("tesseract.js");
      const { data } = await Tesseract.recognize(files[0], "eng", {
        logger: (m) => {
          if (m.status === "recognizing text") {
            setProgress(Math.round(m.progress * 100));
          }
        },
      });
      setText(data.text.trim());
    } catch {
      setError("Something went wrong reading text from that image.");
    } finally {
      setProcessing(false);
    }
  }

  function copyText() {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="flex flex-col gap-6">
      <FileDropzone
        accept="image/*"
        files={files}
        onFilesChange={(f) => { setFiles(f); setText(null); }}
        label="Drag and drop a photo or screenshot here, or click to browse"
        hint="JPG or PNG — clear, well-lit text works best"
      />

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button onClick={handleExtract} disabled={processing || files.length === 0} className="self-start">
        {processing && <Loader2 className="h-4 w-4 animate-spin" />}
        {processing ? `Reading text... ${progress}%` : "Extract text"}
      </Button>

      {text !== null && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Extracted text</label>
            <Button variant="secondary" size="sm" onClick={copyText}>
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
          <textarea
            readOnly
            value={text || "No text was detected in this image."}
            rows={10}
            className="w-full resize-y rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      )}
    </div>
  );
}