import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms that govern your use of MyToolVerse.",
};

const sections = [
  {
    title: "Using the site",
    body: "MyToolVerse provides free online tools for personal and professional use. You agree not to use the site for unlawful purposes or to attempt to disrupt its operation.",
  },
  {
    title: "No warranty",
    body: "Tools are provided as-is. While we aim for accuracy and reliability, we don't guarantee that results will be error-free, and you should verify important outputs (such as legal or financial calculations) independently.",
  },
  {
    title: "Your content",
    body: "You retain all rights to files and content you process through MyToolVerse. We don't claim ownership over anything you upload or create using the tools.",
  },
  {
    title: "Limitation of liability",
    body: "MyToolVerse is not liable for any indirect, incidental, or consequential damages arising from use of the site or its tools.",
  },
  {
    title: "Changes to these terms",
    body: "We may update these terms from time to time. Continued use of the site after changes constitutes acceptance of the updated terms.",
  },
];

export default function TermsOfServicePage() {
  return (
    <div className="container max-w-2xl py-16">
      <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
        Terms of Service
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long" })}
      </p>

      <div className="mt-10 flex flex-col gap-8">
        {sections.map((s) => (
          <div key={s.title}>
            <h2 className="font-display text-lg font-semibold">{s.title}</h2>
            <p className="mt-2 leading-relaxed text-muted-foreground">{s.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
