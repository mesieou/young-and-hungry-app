import type { MetadataRoute } from "next";
import { getIndexablePublicPages } from "@/lib/seo/public-pages";

export type PublicRoute = {
  path: string;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  lastModified: string;
};

export const publicRoutes: PublicRoute[] = getIndexablePublicPages().map((page) => ({
  path: page.canonicalPath,
  priority: page.priority,
  changeFrequency: page.changeFrequency,
  lastModified: page.updatedAt
}));
