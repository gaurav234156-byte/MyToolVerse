import type { Metadata } from "next";
import { categories } from "@/data/categories";
import { CategoryCard } from "@/components/shared/category-card";

export const metadata: Metadata = {
  title: "All Categories",
  description: "Browse every tool category on MyToolVerse, from PDF and image tools to AI, developer, and business utilities.",
};

export default function CategoriesPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "All Categories",
    url: "https://mytoolverse.vercel.app/categories",
    description:
      "Browse every tool category on MyToolVerse, from PDF and image tools to AI, developer, and business utilities.",
    isPartOf: {
      "@type": "WebSite",
      name: "MyToolVerse",
      url: "https://mytoolverse.vercel.app",
    },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: categories.length,
      itemListElement: categories.map((cat, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "CollectionPage",
          name: cat.name,
          url: `https://mytoolverse.vercel.app/category/${cat.slug}`,
        },
      })),
    },
  };

  return (
    <div className="container py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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
