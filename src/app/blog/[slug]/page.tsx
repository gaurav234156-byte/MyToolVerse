import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { getAllPostSlugs, getPostBySlug } from "@/lib/blog";

export function generateStaticParams() {
  return getAllPostSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  const url = `https://mytoolverse.vercel.app/blog/${slug}`;

  return {
    title: post.title,
    description: post.meta_description,
    alternates: {
      canonical: `/blog/${slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.meta_description,
      url,
      type: "article",
      siteName: "MyToolVerse",
      images: [
        {
          url: "/og-default.png",
          width: 1200,
          height: 630,
          alt: "MyToolVerse — Free Online Tools",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.meta_description,
      images: ["/og-default.png"],
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.meta_description,
    datePublished: post.date,
    author: { "@type": "Organization", name: "MyToolVerse" },
    publisher: { "@type": "Organization", name: "MyToolVerse" },
    mainEntityOfPage: `https://mytoolverse.vercel.app/blog/${slug}`,
  };

  return (
    <div className="container max-w-3xl py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav className="mb-8 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/blog" className="hover:text-foreground">
          Blog
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground">{post.title}</span>
      </nav>

      <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
        {post.title}
      </h1>

      <div className="mt-8">
        <ReactMarkdown
          components={{
            h2: (props) => (
              <h2 className="font-display mt-8 text-xl font-semibold" {...props} />
            ),
            h3: (props) => (
              <h3 className="font-display mt-6 text-lg font-semibold" {...props} />
            ),
            p: (props) => (
              <p className="mt-4 leading-relaxed text-muted-foreground" {...props} />
            ),
            ul: (props) => (
              <ul className="mt-4 list-disc space-y-2 pl-6 text-muted-foreground" {...props} />
            ),
            ol: (props) => (
              <ol className="mt-4 list-decimal space-y-2 pl-6 text-muted-foreground" {...props} />
            ),
            a: (props) => (
              <a className="text-primary underline underline-offset-4" {...props} />
            ),
            strong: (props) => (
              <strong className="font-semibold text-foreground" {...props} />
            ),
            hr: () => <hr className="my-8 border-border" />,
          }}
        >
          {post.content}
        </ReactMarkdown>
      </div>
    </div>
  );
}