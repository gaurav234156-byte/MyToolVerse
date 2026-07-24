"use client";

import * as React from "react";
import { Copy, Check, RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/* ── helpers ── */

function formatHtml(html: string): string {
  let indent = 0;
  const INDENT = "  ";
  return html
    .replace(/>\s*</g, ">\n<")
    .split("\n")
    .map((line) => {
      line = line.trim();
      if (!line) return "";
      if (/^<\//.test(line)) indent = Math.max(0, indent - 1);
      const out = INDENT.repeat(indent) + line;
      if (/^<[^/!][^>]*[^/]>$/.test(line) && !/<\//.test(line)) indent++;
      return out;
    })
    .filter(Boolean)
    .join("\n");
}

function minifyCss(css: string): string {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s*([{}:;,>+~])\s*/g, "$1")
    .replace(/;\}/g, "}")
    .replace(/\s+/g, " ")
    .trim();
}

function minifyJs(js: string): string {
  return js
    .replace(/\/\/[^\n]*/g, "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s+/g, " ")
    .replace(/\s*([=+\-*/<>!&|(){},;:])\s*/g, "$1")
    .trim();
}

function loremIpsum(count: number): string {
  const sentences = [
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.",
    "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum.",
    "Excepteur sint occaecat cupidatat non proident, sunt in culpa.",
    "Nisi ut aliquip ex ea commodo consequat lorem amet.",
    "Pellentesque habitant morbi tristique senectus et netus malesuada.",
    "Vestibulum ante ipsum primis in faucibus orci luctus ultrices.",
    "Curabitur pretium tincidunt lacus, nulla facilisi nullam velit.",
    "Aliquam erat volutpat, nam dui mi, tincidunt quis.",
  ];
  const result: string[] = [];
  for (let i = 0; i < count; i++) result.push(sentences[i % sentences.length]);
  return result.join(" ");
}

function timestampToDate(val: string): string {
  const n = Number(val.trim());
  if (isNaN(n)) return "Invalid input";
  const ms = n > 1e10 ? n : n * 1000;
  return new Date(ms).toUTCString();
}

function dateToTimestamp(val: string): string {
  const d = new Date(val.trim());
  if (isNaN(d.getTime())) return "Invalid date";
  return String(Math.floor(d.getTime() / 1000));
}

function hexToRgb(hex: string): string {
  const m = hex.replace("#", "").match(/^([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!m) return "Invalid hex";
  let h = m[1];
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const n = parseInt(h, 16);
  return `rgb(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255})`;
}

function rgbToHex(rgb: string): string {
  const m = rgb.match(/(\d+),\s*(\d+),\s*(\d+)/);
  if (!m) return "Invalid rgb";
  return (
    "#" +
    [m[1], m[2], m[3]]
      .map((v) => Number(v).toString(16).padStart(2, "0"))
      .join("")
  );
}

/* ── sub-tools ── */

function CodeTransformTool({
  label,
  inputPlaceholder,
  outputLabel,
  fn,
}: {
  label: string;
  inputPlaceholder: string;
  outputLabel: string;
  fn: (s: string) => string;
}) {
  const [input, setInput] = React.useState("");
  const [copied, setCopied] = React.useState(false);
  const output = input ? fn(input) : "";

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">{label}</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={inputPlaceholder}
            rows={12}
            spellCheck={false}
            className="w-full resize-y rounded-xl border border-input bg-background p-4 font-mono text-xs outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">{outputLabel}</label>
            {output && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(output);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1200);
                }}
                className="h-7 px-2 text-xs"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            )}
          </div>
          <textarea
            value={output}
            readOnly
            rows={12}
            spellCheck={false}
            className="w-full resize-y rounded-xl border border-input bg-surface p-4 font-mono text-xs outline-none placeholder:text-muted-foreground"
          />
        </div>
      </div>
    </div>
  );
}

function RegexTester() {
  const [pattern, setPattern] = React.useState("");
  const [flags, setFlags] = React.useState("g");
  const [text, setText] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  const matches = React.useMemo(() => {
    if (!pattern || !text) return null;
    try {
      setError(null);
      const re = new RegExp(pattern, flags);
      const found = Array.from(text.matchAll(new RegExp(pattern, flags.includes("g") ? flags : flags + "g")));
      return found;
    } catch (e) {
      setError((e as Error).message);
      return null;
    }
  }, [pattern, flags, text]);

  const highlighted = React.useMemo(() => {
    if (!matches || matches.length === 0 || !pattern) return null;
    try {
      return text.replace(new RegExp(pattern, flags.includes("g") ? flags : flags + "g"), (m) => `__MATCH__${m}__END__`);
    } catch {
      return null;
    }
  }, [text, pattern, flags, matches]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="flex flex-1 flex-col gap-1.5">
          <label className="text-sm font-medium">Pattern</label>
          <Input value={pattern} onChange={(e) => setPattern(e.target.value)} placeholder="e.g. \d+" className="font-mono" />
        </div>
        <div className="flex flex-col gap-1.5 sm:w-24">
          <label className="text-sm font-medium">Flags</label>
          <Input value={flags} onChange={(e) => setFlags(e.target.value)} placeholder="gim" className="font-mono" />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Test string</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste text to test your regex against"
          rows={6}
          spellCheck={false}
          className="w-full resize-y rounded-xl border border-input bg-background p-4 font-mono text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {matches !== null && !error && (
        <div className="rounded-xl bg-surface px-4 py-3">
          <p className="text-sm font-medium">
            {matches.length === 0 ? "No matches" : `${matches.length} match${matches.length > 1 ? "es" : ""}`}
          </p>
          {highlighted && (
            <p className="mt-2 break-all font-mono text-xs leading-relaxed">
              {highlighted.split(/__MATCH__|__END__/).map((part, i) =>
                i % 2 === 1 ? (
                  <mark key={i} className="rounded bg-yellow-200 px-0.5 dark:bg-yellow-500/30">
                    {part}
                  </mark>
                ) : (
                  <span key={i}>{part}</span>
                )
              )}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function ColorConverter() {
  const [hex, setHex] = React.useState("#2563eb");
  const [rgb, setRgb] = React.useState("37, 99, 235");
  const [previewColor, setPreviewColor] = React.useState("#2563eb");

  function fromHex(v: string) {
    setHex(v);
    const result = hexToRgb(v);
    if (!result.startsWith("Invalid")) {
      const nums = result.replace("rgb(", "").replace(")", "");
      setRgb(nums);
      setPreviewColor(v);
    }
  }

  function fromRgb(v: string) {
    setRgb(v);
    const result = rgbToHex(v);
    if (!result.startsWith("Invalid")) {
      setHex(result);
      setPreviewColor(result);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex h-24 items-center justify-center rounded-2xl border border-border" style={{ backgroundColor: previewColor }}>
        <span className="rounded-lg bg-black/20 px-3 py-1 font-mono text-sm text-white backdrop-blur-sm">{previewColor}</span>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">HEX</label>
          <Input value={hex} onChange={(e) => fromHex(e.target.value)} placeholder="#2563eb" className="font-mono" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">RGB</label>
          <Input value={rgb} onChange={(e) => fromRgb(e.target.value)} placeholder="37, 99, 235" className="font-mono" />
        </div>
      </div>
      <p className="text-xs text-muted-foreground">Type in either field to convert. HSL support coming soon.</p>
    </div>
  );
}

function TimestampConverter() {
  const [ts, setTs] = React.useState(String(Math.floor(Date.now() / 1000)));
  const [dateStr, setDateStr] = React.useState(new Date().toISOString().slice(0, 10));

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Unix timestamp → Date</label>
        <div className="flex gap-3">
          <Input value={ts} onChange={(e) => setTs(e.target.value)} placeholder="1700000000" className="font-mono" />
          <Button variant="ghost" size="icon" onClick={() => setTs(String(Math.floor(Date.now() / 1000)))} aria-label="Now">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        <p className="rounded-xl bg-surface px-4 py-3 font-mono text-sm">{ts ? timestampToDate(ts) : "—"}</p>
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Date → Unix timestamp</label>
        <Input type="date" value={dateStr} onChange={(e) => setDateStr(e.target.value)} />
        <p className="rounded-xl bg-surface px-4 py-3 font-mono text-sm">{dateStr ? dateToTimestamp(dateStr) : "—"}</p>
      </div>
    </div>
  );
}

function LoremIpsumGenerator() {
  const [count, setCount] = React.useState(3);
  const [copied, setCopied] = React.useState(false);
  const text = loremIpsum(count);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium">Sentences</label>
        <input
          type="range"
          min={1}
          max={20}
          value={count}
          onChange={(e) => setCount(Number(e.target.value))}
          className="flex-1 h-2 cursor-pointer appearance-none rounded-full bg-muted accent-blue-600"
        />
        <span className="w-6 text-sm font-semibold text-primary">{count}</span>
      </div>
      <div className="relative">
        <textarea
          value={text}
          readOnly
          rows={8}
          className="w-full rounded-xl border border-input bg-surface p-4 text-sm outline-none"
        />
      </div>
      <Button
        variant="secondary"
        className="self-start"
        onClick={() => {
          navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        {copied ? "Copied!" : "Copy text"}
      </Button>
    </div>
  );
}

function CronGenerator() {
  const [minute, setMinute] = React.useState("0");
  const [hour, setHour] = React.useState("*");
  const [dom, setDom] = React.useState("*");
  const [month, setMonth] = React.useState("*");
  const [dow, setDow] = React.useState("*");
  const [copied, setCopied] = React.useState(false);
  const expr = `${minute} ${hour} ${dom} ${month} ${dow}`;

  const presets = [
    { label: "Every minute", value: "* * * * *" },
    { label: "Every hour", value: "0 * * * *" },
    { label: "Daily at midnight", value: "0 0 * * *" },
    { label: "Every Monday 9am", value: "0 9 * * 1" },
    { label: "First of month", value: "0 0 1 * *" },
  ];

  function applyPreset(v: string) {
    const [m, h, d, mo, dw] = v.split(" ");
    setMinute(m); setHour(h); setDom(d); setMonth(mo); setDow(dw);
  }

  const fields = [
    ["Minute (0-59)", minute, setMinute],
    ["Hour (0-23)", hour, setHour],
    ["Day of month", dom, setDom],
    ["Month (1-12)", month, setMonth],
    ["Day of week (0-6)", dow, setDow],
  ] as const;

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {fields.map(([label, value, setter]) => (
          <div key={label} className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">{label}</label>
            <Input value={value} onChange={(e) => setter(e.target.value)} className="font-mono text-center" />
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 rounded-xl bg-surface px-4 py-3">
        <code className="flex-1 font-mono text-sm font-semibold">{expr}</code>
        <Button variant="ghost" size="icon" onClick={() => { navigator.clipboard.writeText(expr); setCopied(true); setTimeout(() => setCopied(false), 1500); }}>
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium">Quick presets</p>
        <div className="flex flex-wrap gap-2">
          {presets.map((p) => (
            <button
              key={p.label}
              onClick={() => applyPreset(p.value)}
              className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-accent"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── dispatcher ── */
export function DevGenericEngine({ slug }: { slug: string }) {
  switch (slug) {
    case "html-formatter":
      return (
        <CodeTransformTool
          label="HTML input"
          inputPlaceholder="<div><p>Paste your HTML here</p></div>"
          outputLabel="Formatted HTML"
          fn={formatHtml}
        />
      );
    case "css-minifier":
      return (
        <CodeTransformTool
          label="CSS input"
          inputPlaceholder="body {\n  margin: 0;\n  padding: 0;\n}"
          outputLabel="Minified CSS"
          fn={minifyCss}
        />
      );
    case "js-minifier":
      return (
        <CodeTransformTool
          label="JavaScript input"
          inputPlaceholder="// Paste your JavaScript here\nfunction greet(name) {\n  return 'Hello, ' + name;\n}"
          outputLabel="Minified JS"
          fn={minifyJs}
        />
      );
    case "regex-tester":
      return <RegexTester />;
    case "color-converter":
      return <ColorConverter />;
    case "timestamp-converter":
      return <TimestampConverter />;
    case "lorem-ipsum-generator":
      return <LoremIpsumGenerator />;
    case "cron-job-generator":
      return <CronGenerator />;
    default:
      return (
        <p className="rounded-xl bg-surface px-4 py-6 text-center text-sm text-muted-foreground">
          This developer tool is being wired up.
        </p>
      );
  }
}
