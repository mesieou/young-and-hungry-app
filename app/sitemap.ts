import type { MetadataRoute } from "next";
import { publicRoutes } from "@/lib/seo/route-registry";

export default function sitemap(): MetadataRoute.Sitemap {
  return publicRoutes.map((route) => ({
    url: `https://youngandh.co${route.path}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority
  }));
}
