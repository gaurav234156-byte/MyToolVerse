import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Have a bug report, tool request, or question? Get in touch with the MyToolVerse team and we'll get back to you by email.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact MyToolVerse",
    description:
      "Have a bug report, tool request, or question? Get in touch with the MyToolVerse team.",
    url: "https://mytoolverse.vercel.app/contact",
    type: "website",
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
    title: "Contact MyToolVerse",
    description:
      "Have a bug report, tool request, or question? Get in touch with the MyToolVerse team.",
    images: ["/og-default.png"],
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
