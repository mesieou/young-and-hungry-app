import { NextResponse } from "next/server";
import {
  buildSitemapUrl,
  getSitemapEntriesByFamily,
  type SitemapFamily
} from "@/lib/seo/public-pages";

export const dynamic = "force-static";

function renderUrlSet(entries: Array<{ path: string; updatedAt: string }>) {
  const body = entries
    .map(
      ({ path, updatedAt }) =>
        `<url><loc>${buildSitemapUrl(path)}</loc><lastmod>${updatedAt}</lastmod></url>`
    )
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>`;
}

interface SitemapRouteProps {
  params: Promise<{ family: string }>;
}

export function generateStaticParams() {
  const families = getSitemapEntriesByFamily();
  return Object.entries(families)
    .filter(([, entries]) => entries.length > 0)
    .map(([family]) => ({ family: `${family}.xml` }));
}

export async function GET(_request: Request, { params }: SitemapRouteProps) {
  const { family } = await params;
  const normalizedFamily = family.replace(/\.xml$/, "") as SitemapFamily;
  const entriesByFamily = getSitemapEntriesByFamily();
  const entries = entriesByFamily[normalizedFamily];

  if (!entries) {
    return new NextResponse("Not found", { status: 404 });
  }

  return new NextResponse(
    renderUrlSet(
      entries.map((entry) => ({ path: entry.canonicalPath, updatedAt: entry.updatedAt }))
    ),
    {
      headers: {
        "content-type": "application/xml; charset=utf-8"
      }
    }
  );
}
