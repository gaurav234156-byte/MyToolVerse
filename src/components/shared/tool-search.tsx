"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowRight, CornerDownLeft } from "lucide-react";
import { searchTools } from "@/data/tools-index";
import { categoryMap } from "@/data/categories";
import { cn } from "@/lib/utils";

interface ToolSearchProps {
  variant?: "hero" | "compact";
  className?: string;
}

export function ToolSearch({ variant = "hero", className }: ToolSearchProps) {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const results = React.useMemo(() => searchTools(query).slice(0, 7), [query]);

  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function go(slug: string, category: string) {
    setOpen(false);
    setQuery("");
    router.push(`/tools/${category}/${slug}`);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open || results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const t = results[activeIndex];
      if (t) go(t.slug, t.category);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <div
        className={cn(
          "group relative flex items-center gap-3 rounded-2xl border border-border bg-card transition-all duration-200",
          variant === "hero"
            ? "h-14 px-5 shadow-lg shadow-primary/5 focus-within:border-primary focus-within:shadow-xl focus-within:shadow-primary/10"
            : "h-11 px-4 focus-within:border-primary"
        )}
      >
        <Search
          className={cn(
            "shrink-0 text-muted-foreground transition-colors group-focus-within:text-primary",
            variant === "hero" ? "h-5 w-5" : "h-4 w-4"
          )}
        />
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActiveIndex(0);
            setOpen(true);
          }}
          onFocus={() => query && setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={
            variant === "hero"
              ? "Search 100+ tools — try \"compress pdf\" or \"json formatter\""
              : "Search tools..."
          }
          className={cn(
            "w-full bg-transparent outline-none placeholder:text-muted-foreground",
            variant === "hero" ? "text-base" : "text-sm"
          )}
          aria-label="Search tools"
          autoComplete="off"
        />
        {variant === "hero" && (
          <kbd className="hidden shrink-0 rounded-md border border-border bg-muted px-2 py-1 text-[11px] font-medium text-muted-foreground sm:inline-flex">
            ⌘K
          </kbd>
        )}
      </div>

      {open && query && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-black/10 animate-in fade-in slide-in-from-top-1 duration-150">
          {results.length === 0 ? (
            <div className="px-5 py-6 text-center text-sm text-muted-foreground">
              No tools found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            <ul role="listbox" className="max-h-80 overflow-y-auto py-2">
              {results.map((tool, i) => {
                const cat = categoryMap[tool.category];
                return (
                  <li key={tool.slug}>
                    <button
                      onMouseEnter={() => setActiveIndex(i)}
                      onClick={() => go(tool.slug, tool.category)}
                      className={cn(
                        "flex w-full items-center justify-between gap-3 px-5 py-3 text-left transition-colors",
                        i === activeIndex ? "bg-accent" : "hover:bg-accent/60"
                      )}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <cat.icon className="h-4 w-4 shrink-0 text-primary" />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{tool.name}</p>
                          <p className="truncate text-xs text-muted-foreground">{cat.name}</p>
                        </div>
                      </div>
                      {i === activeIndex ? (
                        <CornerDownLeft className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      ) : (
                        <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
