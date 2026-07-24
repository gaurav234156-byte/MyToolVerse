import { pdfTools } from "./tools/pdf-tools";
import { imageTools } from "./tools/image-tools";
import { aiTools } from "./tools/ai-tools";
import { textTools } from "./tools/text-tools";
import { developerTools } from "./tools/developer-tools";
import { calculatorTools } from "./tools/calculator-tools";
import { videoTools } from "./tools/video-tools";
import { audioTools } from "./tools/audio-tools";
import { studentTools } from "./tools/student-tools";
import { businessTools } from "./tools/business-tools";
import type { Tool } from "./types";
import type { CategorySlug } from "./categories";

export const allTools: Tool[] = [
  ...pdfTools,
  ...imageTools,
  ...aiTools,
  ...textTools,
  ...developerTools,
  ...calculatorTools,
  ...videoTools,
  ...audioTools,
  ...studentTools,
  ...businessTools,
];

export const toolsByCategory: Record<CategorySlug, Tool[]> = allTools.reduce(
  (acc, tool) => {
    if (!acc[tool.category]) acc[tool.category] = [];
    acc[tool.category].push(tool);
    return acc;
  },
  {} as Record<CategorySlug, Tool[]>
);

export function getToolBySlug(slug: string): Tool | undefined {
  return allTools.find((t) => t.slug === slug);
}

export function getToolsByCategory(category: CategorySlug): Tool[] {
  return toolsByCategory[category] ?? [];
}

export function getRelatedTools(tool: Tool, limit = 4): Tool[] {
  return allTools
    .filter((t) => t.category === tool.category && t.slug !== tool.slug)
    .slice(0, limit);
}

export const popularTools: Tool[] = allTools.filter((t) => t.popular);
export const trendingTools: Tool[] = allTools.filter((t) => t.trending);

export function searchTools(query: string): Tool[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return allTools.filter(
    (t) =>
      t.name.toLowerCase().includes(q) ||
      t.shortDescription.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q)
  );
}
