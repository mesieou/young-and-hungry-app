import {
  buildBreadcrumbStructuredData,
  buildFaqStructuredData,
  buildPublicPageStructuredData,
  type PublicPageEntry
} from "@/lib/seo/public-pages";

export function PublicStructuredData({ page }: { page: PublicPageEntry }) {
  const scripts = [
    buildPublicPageStructuredData(page),
    buildFaqStructuredData(page),
    page.id === "home" ? null : buildBreadcrumbStructuredData(page)
  ].filter(Boolean) as Array<Record<string, unknown>>;

  return (
    <>
      {scripts.map((script, index) => (
        <script
          key={`${page.id}-structured-data-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(script) }}
        />
      ))}
    </>
  );
}
