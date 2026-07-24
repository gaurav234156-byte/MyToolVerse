"use client";

import * as React from "react";
import { AlertCircle } from "lucide-react";

function base64UrlDecode(str: string): string {
  const padded = str.replace(/-/g, "+").replace(/_/g, "/").padEnd(str.length + ((4 - (str.length % 4)) % 4), "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

export function JwtDecodeEngine() {
  const [token, setToken] = React.useState("");
  const [header, setHeader] = React.useState<string | null>(null);
  const [payload, setPayload] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!token.trim()) {
      setHeader(null);
      setPayload(null);
      setError(null);
      return;
    }
    const parts = token.trim().split(".");
    if (parts.length < 2) {
      setError("That doesn't look like a JWT — it should have three parts separated by dots.");
      setHeader(null);
      setPayload(null);
      return;
    }
    try {
      const decodedHeader = JSON.stringify(JSON.parse(base64UrlDecode(parts[0])), null, 2);
      const decodedPayload = JSON.stringify(JSON.parse(base64UrlDecode(parts[1])), null, 2);
      setHeader(decodedHeader);
      setPayload(decodedPayload);
      setError(null);
    } catch {
      setError("Couldn't decode this token. Check that it's a valid JWT.");
      setHeader(null);
      setPayload(null);
    }
  }, [token]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">JWT token</label>
        <textarea
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="eyJhbGciOiJIUzI1NiIs..."
          rows={4}
          spellCheck={false}
          className="w-full resize-y rounded-xl border border-input bg-background p-4 font-mono text-xs outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {(header || payload) && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div>
            <p className="mb-2 text-sm font-medium text-muted-foreground">Header</p>
            <pre className="overflow-x-auto rounded-xl border border-border bg-surface p-4 font-mono text-xs">
              {header}
            </pre>
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-muted-foreground">Payload</p>
            <pre className="overflow-x-auto rounded-xl border border-border bg-surface p-4 font-mono text-xs">
              {payload}
            </pre>
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        This only decodes the token's contents — it doesn't verify the signature.
      </p>
    </div>
  );
}
