"use client";

import * as React from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function QrGeneratorEngine() {
  const [text, setText] = React.useState("");
  const [dataUrl, setDataUrl] = React.useState<string | null>(null);
  const [generating, setGenerating] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function generate() {
    if (!text.trim()) {
      setError("Enter a URL or text first.");
      return;
    }
    setError(null);
    setGenerating(true);
    try {
      const QRCode = (await import("qrcode")).default;
      const url = await QRCode.toDataURL(text, {
        width: 320,
        margin: 2,
        color: { dark: "#0f172a", light: "#ffffff" },
      });
      setDataUrl(url);
    } catch {
      setError("Couldn't generate a QR code for this input.");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">URL or text</label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && generate()}
            placeholder="https://example.com"
            className="flex-1"
          />
          <Button onClick={generate} disabled={generating}>
            {generating && <Loader2 className="h-4 w-4 animate-spin" />}
            {generating ? "Generating..." : "Generate QR code"}
          </Button>
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {dataUrl && (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-surface p-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={dataUrl} alt="Generated QR code" className="h-56 w-56 rounded-lg bg-white p-2" />
          <Button variant="secondary" asChild>
            <a href={dataUrl} download="qrcode.png">
              <Download className="h-4 w-4" />
              Download PNG
            </a>
          </Button>
        </div>
      )}
    </div>
  );
}
