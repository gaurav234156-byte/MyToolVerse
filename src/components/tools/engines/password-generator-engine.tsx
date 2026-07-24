"use client";

import * as React from "react";
import { Copy, Check, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const SETS = {
  lower: "abcdefghijklmnopqrstuvwxyz",
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  numbers: "0123456789",
  symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
};

function generatePassword(length: number, options: Record<keyof typeof SETS, boolean>): string {
  const pools = (Object.keys(options) as (keyof typeof SETS)[])
    .filter((k) => options[k])
    .map((k) => SETS[k]);

  if (pools.length === 0) return "";

  const allChars = pools.join("");
  const randomValues = new Uint32Array(length);
  crypto.getRandomValues(randomValues);

  let password = "";
  for (let i = 0; i < length; i++) {
    password += allChars[randomValues[i] % allChars.length];
  }
  return password;
}

function getStrength(length: number, optionCount: number): { label: string; color: string } {
  const score = length * optionCount;
  if (score < 40) return { label: "Weak", color: "bg-destructive" };
  if (score < 80) return { label: "Fair", color: "bg-amber-500" };
  if (score < 120) return { label: "Strong", color: "bg-success" };
  return { label: "Very strong", color: "bg-success" };
}

export function PasswordGeneratorEngine() {
  const [length, setLength] = React.useState(16);
  const [options, setOptions] = React.useState({
    lower: true,
    upper: true,
    numbers: true,
    symbols: false,
  });
  const [password, setPassword] = React.useState("");
  const [copied, setCopied] = React.useState(false);

  const regenerate = React.useCallback(() => {
    setPassword(generatePassword(length, options));
  }, [length, options]);

  React.useEffect(() => {
    regenerate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    regenerate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [length, options]);

  function copy() {
    if (!password) return;
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  const optionCount = Object.values(options).filter(Boolean).length;
  const strength = getStrength(length, optionCount);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4">
        <code className="flex-1 overflow-x-auto whitespace-nowrap font-mono text-lg font-semibold tracking-wide">
          {password || "Select at least one character type"}
        </code>
        <Button variant="ghost" size="icon" onClick={regenerate} aria-label="Regenerate">
          <RefreshCw className="h-4 w-4" />
        </Button>
        <Button variant="secondary" size="icon" onClick={copy} aria-label="Copy">
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>

      {password && (
        <div className="flex items-center gap-2">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full ${strength.color} transition-all duration-300`}
              style={{ width: `${Math.min(100, (length * optionCount * 100) / 140)}%` }}
            />
          </div>
          <span className="shrink-0 text-xs font-medium text-muted-foreground">{strength.label}</span>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Length</label>
          <span className="text-sm font-semibold text-primary">{length}</span>
        </div>
        <input
          type="range"
          min={6}
          max={64}
          value={length}
          onChange={(e) => setLength(Number(e.target.value))}
          className="h-2 w-full cursor-pointer appearance-none rounded-full bg-muted accent-blue-600"
        />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {([
          ["lower", "a-z"],
          ["upper", "A-Z"],
          ["numbers", "0-9"],
          ["symbols", "!@#$"],
        ] as [keyof typeof SETS, string][]).map(([key, label]) => (
          <label
            key={key}
            className="flex cursor-pointer items-center gap-2 rounded-xl border border-border px-3 py-2.5 text-sm transition-colors hover:bg-accent"
          >
            <input
              type="checkbox"
              checked={options[key]}
              onChange={(e) => setOptions((o) => ({ ...o, [key]: e.target.checked }))}
              className="h-4 w-4 accent-blue-600"
            />
            {label}
          </label>
        ))}
      </div>
    </div>
  );
}
