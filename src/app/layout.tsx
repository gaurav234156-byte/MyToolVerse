import type { Metadata } from "next";
import { Inter, Sora, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap",
  weight: ["500", "600", "700", "800"],
});

const jbmono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jbmono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://mytoolverse.vercel.app"),
  alternates: {
    canonical: "/",
  },
  title: {
    default: "MyToolVerse — 100+ Free Online Tools for PDF, Image & AI",
    template: "%s | MyToolVerse",
  },
  description:
    "MyToolVerse is a free all-in-one toolbox: compress PDFs, edit images, generate AI content, format code, calculate, and more — no installs, no signup.",
  keywords: [
    "online tools",
    "free pdf tools",
    "image compressor",
    "ai tools",
    "developer tools",
    "json formatter",
    "calculators",
  ],
  openGraph: {
    title: "MyToolVerse — 100+ Free Online Tools",
    description:
      "Compress, convert, generate, and calculate — every tool you need, free and in one place.",
    url: "https://mytoolverse.vercel.app",
    siteName: "MyToolVerse",
    type: "website",
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
    title: "MyToolVerse — 100+ Free Online Tools",
    description:
      "Compress, convert, generate, and calculate — every tool you need, free and in one place.",
    images: ["/og-default.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: "RiEBjwi-8o_6yLgXNhZuIeD-FRFVpynd6B5bBOGq3nE",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5425932231401853"
          crossOrigin="anonymous"
        ></script>
      </head>
      <body
        className={`${inter.variable} ${sora.variable} ${jbmono.variable} font-sans`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <div className="relative flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </ThemeProvider>
        <GoogleAnalytics gaId="G-H8W6HN5B3Z" />
      </body>
    </html>
  );
}