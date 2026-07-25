"use client";

import * as React from "react";
import { Download, Loader2 } from "lucide-react";
import { FileDropzone } from "@/components/tools/file-dropzone";
import { Button } from "@/components/ui/button";

const MODEL_URL = "https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights";

export function BlurFaceEngine() {
  const [files, setFiles] = React.useState<File[]>([]);
  const [processing, setProcessing] = React.useState(false);
  const [resultUrl, setResultUrl] = React.useState<string | null>(null);
  const [faceCount, setFaceCount] = React.useState<number | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const modelsLoaded = React.useRef(false);

  async function handleBlur() {
    if (files.length === 0) { setError("Upload an image first."); return; }
    setError(null); setProcessing(true); setResultUrl(null); setFaceCount(null);

    try {
      const faceapi = await import("face-api.js");

      if (!modelsLoaded.current) {
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        modelsLoaded.current = true;
      }

      const file = files[0];
      const url = URL.createObjectURL(file);
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Could not load image."));
        img.src = url;
      });

      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);

      const detections = await faceapi.detectAllFaces(canvas, new faceapi.TinyFaceDetectorOptions());
      setFaceCount(detections.length);

      if (detections.length > 0) {
        const blurredCanvas = document.createElement("canvas");
        blurredCanvas.width = canvas.width;
        blurredCanvas.height = canvas.height;
        const bctx = blurredCanvas.getContext("2d")!;
        bctx.filter = "blur(18px)";
        bctx.drawImage(canvas, 0, 0);

        for (const d of detections) {
          const { x, y, width, height } = d.box;
          const pad = width * 0.15;
          const sx = Math.max(0, x - pad);
          const sy = Math.max(0, y - pad);
          const sw = Math.min(canvas.width - sx, width + pad * 2);
          const sh = Math.min(canvas.height - sy, height + pad * 2);
          ctx.drawImage(blurredCanvas, sx, sy, sw, sh, sx, sy, sw, sh);
        }
      }

      URL.revokeObjectURL(url);
      const blob: Blob = await new Promise((resolve) => canvas.toBlob((b) => resolve(b!), "image/png"));
      setResultUrl(URL.createObjectURL(blob));
    } catch {
      setError("Something went wrong detecting or blurring faces.");
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <FileDropzone
        accept="image/*"
        files={files}
        onFilesChange={(f) => { setFiles(f); setResultUrl(null); }}
        label="Drag and drop a photo here, or click to browse"
        hint="JPG or PNG — works best with clear, front-facing faces"
      />

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button onClick={handleBlur} disabled={processing || files.length === 0} className="self-start">
        {processing && <Loader2 className="h-4 w-4 animate-spin" />}
        {processing ? "Detecting faces..." : "Blur faces"}
      </Button>

      {faceCount !== null && (
        <p className="text-sm text-muted-foreground">
          {faceCount === 0 ? "No faces detected." : `${faceCount} face${faceCount > 1 ? "s" : ""} blurred.`}
        </p>
      )}

      {resultUrl && (
        <div className="flex flex-col items-start gap-3 rounded-xl border border-border bg-surface p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={resultUrl} alt="Faces blurred" className="max-h-96 rounded-lg border border-border" />
          <Button variant="secondary" size="sm" asChild>
            <a href={resultUrl} download="blurred.png">
              <Download className="h-3.5 w-3.5" />
              Download
            </a>
          </Button>
        </div>
      )}
    </div>
  );
}