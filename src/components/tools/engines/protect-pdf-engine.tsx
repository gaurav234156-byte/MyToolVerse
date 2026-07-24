"use client";

import * as React from "react";
import { Download, Loader2, Lock } from "lucide-react";
import { FileDropzone } from "@/components/tools/file-dropzone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ProtectPdfEngine() {
  const [files, setFiles] = React.useState<File[]>([]);
  const [password, setPassword] = React.useState("");
  const [processing, setProcessing] = React.useState(false);
  const [pdfUrl, setPdfUrl] = React.useState<string | null>(null);
  const [fileName, setFileName] = React.useState<string>("protected.pdf");
  const [error, setError] = React.useState<string | null>(null);

  async function handleProtect() {
    const file = files[0];
    if (!file) {
      setError("Upload a PDF first.");
      return;
    }
    if (!password.trim()) {
      setError("Enter a password to protect the file with.");
      return;
    }

    setError(null);
    setProcessing(true);
    setPdfUrl(null);

    try {
      const { PDFDocument } = await import("@cantoo/pdf-lib");

      const bytes = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(bytes);

      await pdfDoc.encrypt({
        userPassword: password,
        ownerPassword: password,
      });

      const encryptedBytes = await pdfDoc.save();

      const blob = new Blob([encryptedBytes as unknown as BlobPart], {
        type: "application/pdf",
      });
      setPdfUrl(URL.createObjectURL(blob));

      const baseName = file.name.replace(/\.pdf$/i, "");
      setFileName(`${baseName}-protected.pdf`);
    } catch (err) {
      console.error("Protect PDF error:", err);
      setError(
        "Couldn't protect this file. Make sure it's a valid, unencrypted PDF."
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
        label="Drag and drop a PDF here"
        hint="Upload one PDF to add a password to"
      />

      <div className="flex flex-col gap-2">
        <label htmlFor="protect-password" className="text-sm font-medium">
          Password
        </label>
        <Input
          id="protect-password"
          type="password"
          placeholder="Enter a password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="max-w-xs"
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-3">
        <Button onClick={handleProtect} disabled={processing || !files[0]}>
          {processing && <Loader2 className="h-4 w-4 animate-spin" />}
          {processing ? "Protecting..." : "Protect PDF"}
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
          <Lock className="h-4 w-4 shrink-0 text-primary" />
          <p className="text-sm text-muted-foreground">
            Your PDF is now password protected. Keep the password safe —
            it can&apos;t be recovered if lost.
          </p>
        </div>
      )}
    </div>
  );
}