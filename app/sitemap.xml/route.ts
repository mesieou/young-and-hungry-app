import { NextResponse } from "next/server";
import { buildSitemapUrl, getSitemapEntriesByFamily } from "@/lib/seo/public-pages";

export const dynamic = "force-static";

function renderSitemapIndex(urls: string[]) {
  const body = urls.map((url) => `<sitemap><loc>${url}</loc></sitemap>`).join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</sitemapindex>`;
}

export function GET() {
  const families = getSitemapEntriesByFamily();
  const sitemapUrls = Object.entries(families)
    .filter(([, entries]) => entries.length > 0)
    .map(([family]) => buildSitemapUrl(`/sitemaps/${family}.xml`));

  return new NextResponse(renderSitemapIndex(sitemapUrls), {
    headers: {
      "content-type": "application/xml; charset=utf-8"
    }
  });
}
