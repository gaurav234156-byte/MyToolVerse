import type { Metadata } from "next";
import { Users, Target, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "About",
  description: "Learn what MyToolVerse is, who it's built for, and why every tool is free.",
};

export default function AboutPage() {
  return (
    <div className="container max-w-3xl py-16">
      <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
        About MyToolVerse
      </h1>
      <p className="mt-5 leading-relaxed text-muted-foreground">
        MyToolVerse started from a simple frustration: getting a basic task
        done online, like compressing a PDF or formatting a block of JSON,
        too often meant wading through ads, fake download buttons, and forced
        sign-ups. We built MyToolVerse to be the opposite of that experience.
      </p>
      <p className="mt-4 leading-relaxed text-muted-foreground">
        Whether you&apos;re a student finishing an assignment at midnight, an
        employee converting a file before a deadline, or a developer who
        needs a quick JSON formatter, MyToolVerse aims to have the tool ready
        and working the moment you land on the page.
      </p>

      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-6">
          <Users className="h-6 w-6 text-primary" />
          <h3 className="font-display mt-3 font-semibold">Who it&apos;s for</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Students, employees, freelancers, and anyone who needs a quick
            digital task done without friction.
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6">
          <Target className="h-6 w-6 text-primary" />
          <h3 className="font-display mt-3 font-semibold">Our focus</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            One job per tool, done well, with a clean interface that doesn&apos;t
            get in your way.
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6">
          <Sparkles className="h-6 w-6 text-primary" />
          <h3 className="font-display mt-3 font-semibold">Always growing</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            We&apos;re actively expanding the catalog across every category, with
            new tools shipping regularly.
          </p>
        </div>
      </div>
    </div>
  );
}
