import type { Metadata } from "next";
import { categories } from "@/data/categories";
import { CategoryCard } from "@/components/shared/category-card";

export const metadata: Metadata = {
  title: "All Categories",
  description: "Browse every tool category on MyToolVerse, from PDF and image tools to AI, developer, and business utilities.",
};

export default function CategoriesPage() {
  return (
    <div className="container py-14">
      <div className="mb-12 text-center">
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          All categories
        </h1>
        <p className="mt-3 text-muted-foreground">
          Ten categories, every tool one click away.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => (
          <CategoryCard key={cat.slug} category={cat} />
        ))}
      </div>
    </div>
  );
}
