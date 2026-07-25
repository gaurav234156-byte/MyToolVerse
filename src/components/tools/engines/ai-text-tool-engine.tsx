"use client";

import * as React from "react";
import { Copy, Check, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const CONFIG: Record<
  string,
  { inputLabel: string; placeholder: string; buttonLabel: string; outputLabel: string }
> = {
  "ai-text-summarizer": {
    inputLabel: "Paste the text you want to summarize",
    placeholder: "Paste an article, report, or document here...",
    buttonLabel: "Summarize",
    outputLabel: "Summary",
  },
  "ai-paraphrasing-tool": {
    inputLabel: "Paste the text you want to paraphrase",
    placeholder: "Paste a sentence or paragraph here...",
    buttonLabel: "Paraphrase",
    outputLabel: "Paraphrased text",
  },
  "ai-grammar-checker": {
    inputLabel: "Paste the text you want checked",
    placeholder: "Paste your text here...",
    buttonLabel: "Check grammar",
    outputLabel: "Corrected text",
  },
  "ai-essay-writer": {
    inputLabel: "What's the essay topic?",
    placeholder: "e.g. The impact of social media on teenagers",
    buttonLabel: "Write essay",
    outputLabel: "Essay draft",
  },
  "ai-resume-builder": {
    inputLabel: "Describe your work history and skills",
    placeholder: "e.g. 5 years as a marketing manager, led a team of 4, increased leads by 30%...",
    buttonLabel: "Build resume content",
    outputLabel: "Resume content",
  },
  "ai-code-explainer": {
    inputLabel: "Paste the code you want explained",
    placeholder: "Paste a code snippet here...",
    buttonLabel: "Explain code",
    outputLabel: "Explanation",
  },
  "ai-content-detector": {
    inputLabel: "Paste the text you want analyzed",
    placeholder: "Paste text to check for AI-generated patterns...",
    buttonLabel: "Analyze text",
    outputLabel: "Result",
  },
  "ai-email-writer": {
    inputLabel: "What do you want the email to say?",
    placeholder: "e.g. Ask my landlord to repair the kitchen sink",
    buttonLabel: "Write email",
    outputLabel: "Email draft",
  },
  "grammar-checker": {
    inputLabel: "Paste the text you want checked",
    placeholder: "Paste your text here...",
    buttonLabel: "Check grammar",
    outputLabel: "Corrected text",
  },
  "paraphrasing-tool": {
    inputLabel: "Paste the text you want to paraphrase",
    placeholder: "Paste a sentence or paragraph here...",
    buttonLabel: "Paraphrase",
    outputLabel: "Paraphrased text",
  },
  "text-summarizer": {
    inputLabel: "Paste the text you want to summarize",
    placeholder: "Paste an article, report, or document here...",
    buttonLabel: "Summarize",
    outputLabel: "Summary",
  },
};

export function AiTextToolEngine({ slug }: { slug: string }) {
  const config = CONFIG[slug] ?? {
    inputLabel: "Enter your text",
    placeholder: "Paste text here...",
    buttonLabel: "Generate",
    outputLabel: "Result",
  };

  const [input, setInput] = React.useState("");
  const [output, setOutput] = React.useState<string | null>(null);
  const [processing, setProcessing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);

  async function handleGenerate() {
    if (!input.trim()) {
      setError("Enter some text first.");
      return;
    }
    setError(null);
    setProcessing(true);
    setOutput(null);

    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task: slug, input }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed.");
      setOutput(data.output);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setProcessing(false);
    }
  }

  function copyOutput() {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">{config.inputLabel}</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={config.placeholder}
          rows={8}
          className="w-full resize-y rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <p className="text-xs text-muted-foreground">
          {input.length.toLocaleString()} / 20,000 characters
        </p>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button onClick={handleGenerate} disabled={processing || !input.trim()} className="self-start">
        {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
        {processing ? "Generating..." : config.buttonLabel}
      </Button>

      {output !== null && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">{config.outputLabel}</label>
            <Button variant="secondary" size="sm" onClick={copyOutput}>
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
          <div className="whitespace-pre-wrap rounded-xl border border-input bg-surface px-4 py-3 text-sm">
            {output}
          </div>
        </div>
      )}
    </div>
  );
}