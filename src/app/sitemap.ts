import type { MetadataRoute } from "next";
import { categories } from "@/data/categories";
import { allTools } from "@/data/tools-index";

const BASE_URL = "https://mytoolverse.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    "",
    "/about",
    "/contact",
    "/categories",
    "/privacy-policy",
    "/terms-of-service",
  ].map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
  }));

  const categoryPages = categories.map((cat) => ({
    url: `${BASE_URL}/category/${cat.slug}`,
    lastModified: new Date(),
  }));

  const toolPages = allTools.map((tool) => ({
    url: `${BASE_URL}/tools/${tool.category}/${tool.slug}`,
    lastModified: new Date(),
  }));

  return [...staticPages, ...categoryPages, ...toolPages];
}
