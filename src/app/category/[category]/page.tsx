import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { categories, categoryMap, type CategorySlug } from "@/data/categories";
import { getToolsByCategory } from "@/data/tools-index";
import { ToolCard } from "@/components/shared/tool-card";

export function generateStaticParams() {
  return categories.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const cat = categoryMap[category as CategorySlug];
  if (!cat) return {};
  return {
    title: `${cat.name} — Free Online ${cat.name}`,
    description: cat.description,
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const cat = categoryMap[category as CategorySlug];
  if (!cat) notFound();

  const tools = getToolsByCategory(cat.slug);

  return (
    <div className="container py-14">
      <div className="mb-10 flex flex-col items-center text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft text-primary">
          <cat.icon className="h-7 w-7" />
        </span>
        <h1 className="font-display mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
          {cat.name}
        </h1>
        <p className="mt-3 max-w-xl text-balance text-muted-foreground">
          {cat.description}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          {tools.length} tool{tools.length !== 1 ? "s" : ""} available
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <ToolCard key={tool.slug} tool={tool} />
        ))}
      </div>
    </div>
  );
}
