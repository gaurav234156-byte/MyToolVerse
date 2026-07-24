"use client";

import * as React from "react";

interface DiffLine {
  type: "same" | "added" | "removed";
  text: string;
}

function diffLines(a: string, b: string): DiffLine[] {
  const linesA = a.split("\n");
  const linesB = b.split("\n");
  const result: DiffLine[] = [];

  const m = linesA.length;
  const n = linesB.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      dp[i][j] =
        linesA[i] === linesB[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }

  let i = 0;
  let j = 0;
  while (i < m && j < n) {
    if (linesA[i] === linesB[j]) {
      result.push({ type: "same", text: linesA[i] });
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      result.push({ type: "removed", text: linesA[i] });
      i++;
    } else {
      result.push({ type: "added", text: linesB[j] });
      j++;
    }
  }
  while (i < m) {
    result.push({ type: "removed", text: linesA[i] });
    i++;
  }
  while (j < n) {
    result.push({ type: "added", text: linesB[j] });
    j++;
  }

  return result;
}

export function TextDiffEngine() {
  const [textA, setTextA] = React.useState("");
  const [textB, setTextB] = React.useState("");

  const diff = React.useMemo(() => {
    if (!textA && !textB) return [];
    return diffLines(textA, textB);
  }, [textA, textB]);

  const added = diff.filter((d) => d.type === "added").length;
  const removed = diff.filter((d) => d.type === "removed").length;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Original text</label>
          <textarea
            value={textA}
            onChange={(e) => setTextA(e.target.value)}
            placeholder="Paste the original text"
            rows={10}
            className="w-full resize-y rounded-xl border border-input bg-background p-4 font-mono text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Changed text</label>
          <textarea
            value={textB}
            onChange={(e) => setTextB(e.target.value)}
            placeholder="Paste the changed text"
            rows={10}
            className="w-full resize-y rounded-xl border border-input bg-background p-4 font-mono text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      </div>

      {diff.length > 0 && (
        <div>
          <p className="mb-2 text-sm text-muted-foreground">
            <span className="text-success">+{added} added</span> ·{" "}
            <span className="text-destructive">-{removed} removed</span>
          </p>
          <div className="overflow-x-auto rounded-xl border border-border font-mono text-xs">
            {diff.map((line, i) => (
              <div
                key={i}
                className={
                  line.type === "added"
                    ? "bg-success/10 px-4 py-1 text-success"
                    : line.type === "removed"
                      ? "bg-destructive/10 px-4 py-1 text-destructive line-through"
                      : "px-4 py-1 text-muted-foreground"
                }
              >
                {line.type === "added" ? "+ " : line.type === "removed" ? "- " : "  "}
                {line.text || " "}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
