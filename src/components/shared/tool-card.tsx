import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Tool } from "@/data/types";
import { categoryMap } from "@/data/categories";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function ToolCard({ tool, className }: { tool: Tool; className?: string }) {
  const cat = categoryMap[tool.category];
  return (
    <Link
      href={`/tools/${tool.category}/${tool.slug}`}
      className={cn(
        "group relative flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary transition-transform duration-200 group-hover:scale-105">
          <cat.icon className="h-5 w-5" />
        </span>
        <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
      </div>
      <div>
        <h3 className="font-display text-[15px] font-semibold leading-snug">
          {tool.name}
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
          {tool.shortDescription}
        </p>
      </div>
      <div className="mt-auto flex items-center gap-2 pt-1">
        <Badge variant="outline" className="text-[11px]">
          {cat.shortName}
        </Badge>
        {!tool.isLive && (
          <Badge variant="warning" className="text-[11px]">
            Coming soon
          </Badge>
        )}
      </div>
    </Link>
  );
}
