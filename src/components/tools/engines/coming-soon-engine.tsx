import { Construction } from "lucide-react";
import type { Tool } from "@/data/types";

export function ComingSoonEngine({ tool }: { tool: Tool }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border-2 border-dashed border-border bg-surface px-6 py-14 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-soft text-primary">
        <Construction className="h-6 w-6" />
      </span>
      <div>
        <p className="font-medium">{tool.name} is almost ready</p>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          The interface is built and waiting on its processing engine. Check
          back soon, or explore a related tool below in the meantime.
        </p>
      </div>
    </div>
  );
}
