import Link from "next/link";
import type { Category } from "@/data/categories";
import { getToolsByCategory } from "@/data/tools-index";

export function CategoryCard({ category }: { category: Category }) {
  const count = getToolsByCategory(category.slug).length;
  return (
    <Link
      href={`/category/${category.slug}`}
      className="group flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-soft text-primary transition-transform duration-200 group-hover:scale-105">
        <category.icon className="h-6 w-6" />
      </span>
      <div>
        <h3 className="font-display text-base font-semibold">{category.name}</h3>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          {category.description}
        </p>
      </div>
      <span className="text-xs font-medium text-primary">
        {count} tool{count !== 1 ? "s" : ""} →
      </span>
    </Link>
  );
}
