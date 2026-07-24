"use client";

import * as React from "react";

export function TextCounterEngine({ slug }: { slug: string }) {
  const [text, setText] = React.useState("");

  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, "").length;
  const sentences = text.trim() ? (text.match(/[.!?]+/g) || []).length : 0;
  const paragraphs = text.trim() ? text.split(/\n\s*\n/).filter((p) => p.trim()).length : 0;
  const readingTime = Math.max(1, Math.ceil(words / 200));

  const frequency = React.useMemo(() => {
    if (!text.trim()) return [];
    const counts: Record<string, number> = {};
    text
      .toLowerCase()
      .replace(/[^\w\s']/g, "")
      .split(/\s+/)
      .filter(Boolean)
      .forEach((w) => {
        counts[w] = (counts[w] || 0) + 1;
      });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
  }, [text]);

  const showFrequency = slug === "word-frequency-counter";

  return (
    <div className="flex flex-col gap-6">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste or type your text here..."
        rows={10}
        className="w-full resize-y rounded-xl border border-input bg-background p-4 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ["Words", words],
          ["Characters", characters],
          ["No spaces", charactersNoSpaces],
          ["Sentences", sentences],
          ["Paragraphs", paragraphs],
          ["Reading time", `${readingTime} min`],
        ].map(([label, value]) => (
          <div key={label as string} className="rounded-xl bg-surface px-4 py-3 text-center">
            <p className="font-display text-xl font-bold text-primary">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      {showFrequency && frequency.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-medium">Top words</p>
          <ul className="flex flex-col gap-1.5">
            {frequency.map(([word, count]) => (
              <li
                key={word}
                className="flex items-center justify-between rounded-lg bg-surface px-3 py-2 text-sm"
              >
                <span>{word}</span>
                <span className="font-medium text-primary">{count}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
