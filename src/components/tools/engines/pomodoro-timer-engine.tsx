"use client";

import * as React from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PomodoroTimerEngine() {
  const [workMinutes, setWorkMinutes] = React.useState(25);
  const [breakMinutes, setBreakMinutes] = React.useState(5);
  const [mode, setMode] = React.useState<"work" | "break">("work");
  const [secondsLeft, setSecondsLeft] = React.useState(workMinutes * 60);
  const [running, setRunning] = React.useState(false);
  const [cycles, setCycles] = React.useState(0);

  React.useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          const nextMode = mode === "work" ? "break" : "work";
          if (mode === "work") setCycles((c) => c + 1);
          setMode(nextMode);
          return (nextMode === "work" ? workMinutes : breakMinutes) * 60;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [running, mode, workMinutes, breakMinutes]);

  function reset() {
    setRunning(false);
    setMode("work");
    setSecondsLeft(workMinutes * 60);
    setCycles(0);
  }

  function applyDurations(w: number, b: number) {
    setWorkMinutes(w);
    setBreakMinutes(b);
    if (!running) {
      setSecondsLeft((mode === "work" ? w : b) * 60);
    }
  }

  const minutes = Math.floor(secondsLeft / 60).toString().padStart(2, "0");
  const seconds = (secondsLeft % 60).toString().padStart(2, "0");

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="flex gap-4">
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Work (min)
          <input
            type="number"
            value={workMinutes}
            min={1}
            onChange={(e) => applyDurations(parseInt(e.target.value) || 1, breakMinutes)}
            disabled={running}
            className="h-10 w-24 rounded-xl border border-input bg-background px-3 text-center text-sm"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Break (min)
          <input
            type="number"
            value={breakMinutes}
            min={1}
            onChange={(e) => applyDurations(workMinutes, parseInt(e.target.value) || 1)}
            disabled={running}
            className="h-10 w-24 rounded-xl border border-input bg-background px-3 text-center text-sm"
          />
        </label>
      </div>

      <div className="flex flex-col items-center gap-2">
        <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          {mode === "work" ? "Focus time" : "Break time"}
        </p>
        <p className="font-display text-7xl font-bold tabular-nums text-primary">
          {minutes}:{seconds}
        </p>
        <p className="text-sm text-muted-foreground">{cycles} focus session{cycles === 1 ? "" : "s"} completed</p>
      </div>

      <div className="flex gap-3">
        <Button onClick={() => setRunning(!running)} className="w-32">
          {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          {running ? "Pause" : "Start"}
        </Button>
        <Button variant="secondary" onClick={reset}>
          <RotateCcw className="h-4 w-4" />
          Reset
        </Button>
      </div>
    </div>
  );
}