"use client";

import * as React from "react";
import { Download, Loader2, Unlock as UnlockIcon } from "lucide-react";
import { FileDropzone } from "@/components/tools/file-dropzone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function UnlockPdfEngine() {
  const [files, setFiles] = React.useState<File[]>([]);
  const [password, setPassword] = React.useState("");
  const [processing, setProcessing] = React.useState(false);
  const [pdfUrl, setPdfUrl] = React.useState<string | null>(null);
  const [fileName, setFileName] = React.useState<string>("unlocked.pdf");
  const [error, setError] = React.useState<string | null>(null);

  async function handleUnlock() {
    const file = files[0];
    if (!file) {
      setError("Upload a protected PDF first.");
      return;
    }
    if (!password.trim()) {
      setError("Enter the PDF's current password.");
      return;
    }

    setError(null);
    setProcessing(true);
    setPdfUrl(null);

    try {
      const { PDFDocument } = await import("@cantoo/pdf-lib");

      const bytes = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(bytes, { password });

      const unlockedBytes = await pdfDoc.save();

      const blob = new Blob([unlockedBytes as unknown as BlobPart], {
        type: "application/pdf",
      });
      setPdfUrl(URL.createObjectURL(blob));

      const baseName = file.name.replace(/\.pdf$/i, "");
      setFileName(`${baseName}-unlocked.pdf`);
    } catch (err) {
      console.error("Unlock PDF error:", err);
      setError(
        "Couldn't unlock this file. Double-check the password, or the PDF may not be encrypted."
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
        label="Drag and drop a protected PDF here"
        hint="Upload one password-protected PDF"
      />

      <div className="flex flex-col gap-2">
        <label htmlFor="unlock-password" className="text-sm font-medium">
          Current password
        </label>
        <Input
          id="unlock-password"
          type="password"
          placeholder="Enter the PDF's password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="max-w-xs"
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-3">
        <Button onClick={handleUnlock} disabled={processing || !files[0]}>
          {processing && <Loader2 className="h-4 w-4 animate-spin" />}
          {processing ? "Unlocking..." : "Unlock PDF"}
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
          <UnlockIcon className="h-4 w-4 shrink-0 text-primary" />
          <p className="text-sm text-muted-foreground">
            Your PDF has been unlocked and no longer requires a password to
            open.
          </p>
        </div>
      )}
    </div>
  );
}