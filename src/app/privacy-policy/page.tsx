import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How MyToolVerse handles your files and data.",
};

const sections = [
  {
    title: "Files you process",
    body: "Tools marked as fully live run entirely in your browser. Your files are read locally and never uploaded to a server, processed, or stored by us. Tools still in development will clearly state their data handling once they launch with a live backend.",
  },
  {
    title: "Information we collect",
    body: "We collect basic, non-identifying analytics (such as page views and which tools are used) to understand what to build next. We do not sell personal data to third parties.",
  },
  {
    title: "Cookies",
    body: "We use minimal cookies for essential site functionality, such as remembering your light or dark theme preference.",
  },
  {
    title: "Contact form data",
    body: "If you submit the contact form, we use your name, email, and message only to respond to your inquiry.",
  },
  {
    title: "Changes to this policy",
    body: "We may update this policy as the site evolves. Continued use of MyToolVerse after changes means you accept the revised policy.",
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="container max-w-2xl py-16">
      <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
        Privacy Policy
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
