import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { allTools, getToolBySlug, getRelatedTools } from "@/data/tools-index";
import { categoryMap } from "@/data/categories";
import { Badge } from "@/components/ui/badge";
import { ToolCard } from "@/components/shared/tool-card";
import { ToolEngineRenderer } from "@/components/tools/tool-engine-renderer";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

export function generateStaticParams() {
  return allTools.map((t) => ({ category: t.category, tool: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; tool: string }>;
}): Promise<Metadata> {
  const { tool: toolSlug } = await params;
  const tool = getToolBySlug(toolSlug);
  if (!tool) return {};
  return {
    title: `${tool.name} — Free Online Tool`,
    description: tool.shortDescription,
    openGraph: {
      title: `${tool.name} | MyToolVerse`,
      description: tool.shortDescription,
    },
  };
}

export default async function ToolPage({
  params,
}: {
  params: Promise<{ category: string; tool: string }>;
}) {
  const { category, tool: toolSlug } = await params;
  const tool = getToolBySlug(toolSlug);
  if (!tool || tool.category !== category) notFound();

  const cat = categoryMap[tool.category];
  const related = getRelatedTools(tool);

  return (
    <div className="container py-10">
      {/* Breadcrumb */}
      <nav className="mb-8 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href={`/category/${cat.slug}`} className="hover:text-foreground">
          {cat.name}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground">{tool.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0">
          {/* Header */}
          <div className="mb-8 flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
              <cat.icon className="h-6 w-6" />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
                  {tool.name}
                </h1>
                {tool.isLive ? (
                  <Badge variant="success">Live</Badge>
                ) : (
                  <Badge variant="warning">Coming soon</Badge>
                )}
              </div>
              <p className="mt-2 text-muted-foreground">{tool.shortDescription}</p>
            </div>
          </div>

          {/* Tool interface */}
          <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
            <ToolEngineRenderer tool={tool} />
          </div>

          {/* Description */}
          <div className="mt-10">
            <h2 className="font-display text-lg font-semibold">
              About {tool.name}
            </h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              {tool.longDescription}
            </p>
          </div>

          {/* FAQ */}
          {tool.faqs.length > 0 && (
            <div className="mt-10">
              <h2 className="font-display text-lg font-semibold">
                Frequently asked questions
              </h2>
              <Accordion type="single" collapsible className="mt-4 rounded-2xl border border-border bg-card px-6">
                {tool.faqs.map((faq, i) => (
                  <AccordionItem key={i} value={`faq-${i}`}>
                    <AccordionTrigger>{faq.question}</AccordionTrigger>
                    <AccordionContent>{faq.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          )}
        </div>

        {/* Sidebar: related tools */}
        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <h2 className="font-display text-sm font-semibold text-muted-foreground">
            Related tools
          </h2>
          <div className="mt-4 flex flex-col gap-3">
            {related.map((t) => (
              <ToolCard key={t.slug} tool={t} />
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
