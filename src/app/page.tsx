import Link from "next/link";
import {
  Zap,
  ShieldCheck,
  Infinity as InfinityIcon,
  Smartphone,
  ArrowRight,
} from "lucide-react";
import { categories } from "@/data/categories";
import { allTools, popularTools, trendingTools } from "@/data/tools-index";
import { ToolSearch } from "@/components/shared/tool-search";
import { ToolCard } from "@/components/shared/tool-card";
import { CategoryCard } from "@/components/shared/category-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

const features = [
  {
    icon: Zap,
    title: "Instant results",
    description:
      "Most tools run right in your browser, so files process in seconds with no waiting on uploads.",
  },
  {
    icon: ShieldCheck,
    title: "Privacy first",
    description:
      "Client-side tools never leave your device. Your files stay yours.",
  },
  {
    icon: InfinityIcon,
    title: "No sign-up needed",
    description:
      "Open a tool and start using it immediately. No accounts, no email walls.",
  },
  {
    icon: Smartphone,
    title: "Works everywhere",
    description:
      "Every tool is fully responsive, so it works as well on your phone as your desktop.",
  },
];

const faqs = [
  {
    question: "Is MyToolVerse really free to use?",
    answer:
      "Yes. Every tool on MyToolVerse is free to use, with no hidden limits on the core functionality.",
  },
  {
    question: "Do I need to create an account?",
    answer:
      "No account is required for any tool. Just open the tool page and start working.",
  },
  {
    question: "Are my files safe?",
    answer:
      "Tools marked as fully live process files directly in your browser, meaning your files are never uploaded to a server. Tools still in development will clearly state how files are handled once they launch.",
  },
  {
    question: "Can I use MyToolVerse on my phone?",
    answer:
      "Yes, every tool and page is built to work smoothly on mobile, tablet, and desktop screens.",
  },
  {
    question: "How often are new tools added?",
    answer:
      "We're actively expanding the catalog across all ten categories. Tools marked 'Coming soon' are next in line for full functionality.",
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-grid">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[480px] bg-gradient-to-b from-primary-soft/60 via-transparent to-transparent" />
        <div className="container relative flex flex-col items-center py-20 text-center sm:py-28">
          <Badge variant="default" className="mb-6">
            {allTools.length}+ tools across 10 categories
          </Badge>
          <h1 className="font-display max-w-3xl text-balance text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl">
            Every tool you need,{" "}
            <span className="text-primary">in one place</span>
          </h1>
          <p className="mt-5 max-w-xl text-balance text-base leading-relaxed text-muted-foreground sm:text-lg">
            Compress a PDF, resize an image, format JSON, or calculate your
            GPA — free, fast, and without installing anything.
          </p>

          <div className="mt-9 w-full max-w-xl">
            <ToolSearch variant="hero" />
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground">
            <span>Try:</span>
            {["Compress PDF", "JSON Formatter", "BMI Calculator", "Password Generator"].map(
              (term) => (
                <span
                  key={term}
                  className="rounded-full border border-border bg-card px-3 py-1 text-xs"
                >
                  {term}
                </span>
              )
            )}
          </div>
        </div>
      </section>

      {/* Category dock */}
      <section className="border-y border-border bg-surface py-6">
        <div className="container">
          <div className="flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/category/${cat.slug}`}
                className="flex shrink-0 items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5"
              >
                <cat.icon className="h-4 w-4 text-primary" />
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Popular tools */}
      <section className="container py-20">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
              Popular tools
            </h2>
            <p className="mt-2 text-muted-foreground">
              The tools people reach for most.
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/categories">
              Browse all categories <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {popularTools.slice(0, 8).map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </div>
      </section>

      {/* Categories grid */}
      <section className="bg-surface py-20">
        <div className="container">
          <div className="mb-10 text-center">
            <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
              Browse by category
            </h2>
            <p className="mt-2 text-muted-foreground">
              Ten categories, one consistent experience.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => (
              <CategoryCard key={cat.slug} category={cat} />
            ))}
          </div>
        </div>
      </section>

      {/* Trending tools */}
      <section className="container py-20">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
              Trending right now
            </h2>
            <p className="mt-2 text-muted-foreground">
              What other people are using this week.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {trendingTools.slice(0, 8).map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-surface py-20">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
              Built to get out of your way
            </h2>
            <p className="mt-2 text-muted-foreground">
              No clutter, no upsells in the middle of a task.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <div key={f.title} className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-6">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
                  <f.icon className="h-5 w-5" />
                </span>
                <h3 className="font-display font-semibold">{f.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="container py-20">
        <div className="mx-auto max-w-2xl">
          <div className="mb-10 text-center">
            <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
              Frequently asked questions
            </h2>
          </div>
          <Accordion type="single" collapsible className="rounded-2xl border border-border bg-card px-6">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger>{faq.question}</AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </>
  );
}
