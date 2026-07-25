"use client";

import * as React from "react";
import { Download, Loader2 } from "lucide-react";
import { FileDropzone } from "@/components/tools/file-dropzone";
import { Button } from "@/components/ui/button";

const PNG_SIZES = [16, 32, 48, 64, 128, 180, 192, 512];
const ICO_SIZES = [16, 32, 48];

function resizeToSquarePng(img: HTMLImageElement, size: number): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const scale = Math.max(size / img.naturalWidth, size / img.naturalHeight);
  const w = img.naturalWidth * scale;
  const h = img.naturalHeight * scale;
  const x = (size - w) / 2;
  const y = (size - h) / 2;
  ctx.drawImage(img, x, y, w, h);
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b!), "image/png"));
}

function buildIco(entries: { size: number; buffer: ArrayBuffer }[]): Blob {
  const count = entries.length;
  const headerSize = 6 + 16 * count;
  let offset = headerSize;
  const header = new ArrayBuffer(headerSize);
  const view = new DataView(header);
  view.setUint16(0, 0, true);
  view.setUint16(2, 1, true);
  view.setUint16(4, count, true);

  let entryOffset = 6;
  const parts: BlobPart[] = [header];
  for (const { size, buffer } of entries) {
    const dim = size >= 256 ? 0 : size;
    view.setUint8(entryOffset, dim);
    view.setUint8(entryOffset + 1, dim);
    view.setUint8(entryOffset + 2, 0);
    view.setUint8(entryOffset + 3, 0);
    view.setUint16(entryOffset + 4, 1, true);
    view.setUint16(entryOffset + 6, 32, true);
    view.setUint32(entryOffset + 8, buffer.byteLength, true);
    view.setUint32(entryOffset + 12, offset, true);
    entryOffset += 16;
    offset += buffer.byteLength;
    parts.push(buffer);
  }
  return new Blob(parts, { type: "image/x-icon" });
}

export function FaviconGeneratorEngine() {
  const [files, setFiles] = React.useState<File[]>([]);
  const [processing, setProcessing] = React.useState(false);
  const [zipUrl, setZipUrl] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  async function handleGenerate() {
    if (files.length === 0) { setError("Upload an image first."); return; }
    setError(null); setProcessing(true); setZipUrl(null);

    try {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();

      const file = files[0];
      const url = URL.createObjectURL(file);
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Could not load image."));
        img.src = url;
      });

      const icoBuffers: { size: number; buffer: ArrayBuffer }[] = [];

      for (const size of PNG_SIZES) {
        const blob = await resizeToSquarePng(img, size);
        const name =
          size === 180 ? "apple-touch-icon.png" :
          size === 192 ? "android-chrome-192x192.png" :
          size === 512 ? "android-chrome-512x512.png" :
          `favicon-${size}x${size}.png`;
        zip.file(name, blob);
        if (ICO_SIZES.includes(size)) {
          icoBuffers.push({ size, buffer: await blob.arrayBuffer() });
        }
      }

      const ico = buildIco(icoBuffers);
      zip.file("favicon.ico", ico);

      zip.file(
        "site.webmanifest",
        JSON.stringify(
          {
            name: "",
            icons: [
              { src: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
              { src: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
            ],
          },
          null,
          2
        )
      );

      URL.revokeObjectURL(url);
      const zipBlob = await zip.generateAsync({ type: "blob" });
      setZipUrl(URL.createObjectURL(zipBlob));
    } catch {
      setError("Something went wrong generating the favicon set.");
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <FileDropzone
        accept="image/*"
        files={files}
        onFilesChange={(f) => { setFiles(f); setZipUrl(null); }}
        label="Drag and drop your logo here, or click to browse"
        hint="A square image works best — it will be cropped to fit"
      />

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button onClick={handleGenerate} disabled={processing || files.length === 0} className="self-start">
        {processing && <Loader2 className="h-4 w-4 animate-spin" />}
        {processing ? "Generating..." : "Generate favicon set"}
      </Button>

      {zipUrl && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface px-4 py-3">
          <p className="text-sm font-medium">favicons.zip is ready</p>
          <Button variant="secondary" size="sm" asChild>
            <a href={zipUrl} download="favicons.zip">
              <Download className="h-3.5 w-3.5" />
              Download
            </a>
          </Button>
        </div>
      )}
    </div>
  );
}