import Link from "next/link";
import type { Metadata } from "next";
import { getAllPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Guides and tips for getting more done with MyToolVerse's free online tools.",
  alternates: {
    canonical: "/blog",
  },
};

export default function BlogIndexPage() {
  const posts = getAllPosts();

  return (
    <div className="container max-w-3xl py-16">
      <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
        Blog
      </h1>
      <p className="mt-3 text-muted-foreground">
        Guides and tips for getting more done with MyToolVerse.
      </p>

      {posts.length === 0 ? (
        <p className="mt-10 text-muted-foreground">
          No posts published yet — check back soon.
        </p>
      ) : (
        <div className="mt-10 flex flex-col gap-4">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="rounded-2xl border border-border bg-card p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5"
            >
              <h2 className="font-display text-xl font-semibold">
                {post.title}
              </h2>
              {post.meta_description && (
                <p className="mt-2 text-sm text-muted-foreground">
                  {post.meta_description}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}