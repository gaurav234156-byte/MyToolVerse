import {
  FileText,
  Image as ImageIcon,
  Sparkles,
  Type,
  Code2,
  Calculator,
  Video,
  Music,
  GraduationCap,
  Briefcase,
  type LucideIcon,
} from "lucide-react";

export type CategorySlug =
  | "pdf-tools"
  | "image-tools"
  | "ai-tools"
  | "text-tools"
  | "developer-tools"
  | "calculator-tools"
  | "video-tools"
  | "audio-tools"
  | "student-tools"
  | "business-tools";

export interface Category {
  slug: CategorySlug;
  name: string;
  shortName: string;
  description: string;
  icon: LucideIcon;
  colorVar: string; // tailwind class suffix for tinting
}

export const categories: Category[] = [
  {
    slug: "pdf-tools",
    name: "PDF Tools",
    shortName: "PDF",
    description: "Merge, split, compress, and convert PDF files in seconds.",
    icon: FileText,
    colorVar: "blue",
  },
  {
    slug: "image-tools",
    name: "Image Tools",
    shortName: "Image",
    description: "Resize, compress, crop, and convert images of any format.",
    icon: ImageIcon,
    colorVar: "violet",
  },
  {
    slug: "ai-tools",
    name: "AI Tools",
    shortName: "AI",
    description: "Generate, rewrite, and enhance content with AI assistance.",
    icon: Sparkles,
    colorVar: "fuchsia",
  },
  {
    slug: "text-tools",
    name: "Text Tools",
    shortName: "Text",
    description: "Count, format, compare, and clean up text instantly.",
    icon: Type,
    colorVar: "amber",
  },
  {
    slug: "developer-tools",
    name: "Developer Tools",
    shortName: "Dev",
    description: "Formatters, encoders, and generators for everyday coding.",
    icon: Code2,
    colorVar: "emerald",
  },
  {
    slug: "calculator-tools",
    name: "Calculator Tools",
    shortName: "Calculators",
    description: "Finance, health, math, and everyday calculators.",
    icon: Calculator,
    colorVar: "orange",
  },
  {
    slug: "video-tools",
    name: "Video Tools",
    shortName: "Video",
    description: "Trim, compress, convert, and edit video files.",
    icon: Video,
    colorVar: "rose",
  },
  {
    slug: "audio-tools",
    name: "Audio Tools",
    shortName: "Audio",
    description: "Convert, trim, and enhance audio files online.",
    icon: Music,
    colorVar: "cyan",
  },
  {
    slug: "student-tools",
    name: "Student Tools",
    shortName: "Student",
    description: "Citation generators, GPA calculators, and study helpers.",
    icon: GraduationCap,
    colorVar: "indigo",
  },
  {
    slug: "business-tools",
    name: "Business Tools",
    shortName: "Business",
    description: "Invoices, signatures, and everyday business utilities.",
    icon: Briefcase,
    colorVar: "teal",
  },
];

export const categoryMap: Record<CategorySlug, Category> = categories.reduce(
  (acc, cat) => {
    acc[cat.slug] = cat;
    return acc;
  },
  {} as Record<CategorySlug, Category>
);
