import { homeFeatureCards, homeQuoteFormCopy, quoteFlowCopy, trustStripItems } from "@/lib/content/site-copy";
import {
  buildBreadcrumbStructuredData,
  buildPublicPageStructuredData,
  getFaqEntriesForPage,
  getIndexablePublicPages,
  getPublicPageById,
  publicPages
} from "@/lib/seo/public-pages";
import { publicRoutes } from "@/lib/seo/route-registry";

describe("public SEO registry", () => {
  it("keeps canonical paths, titles, and primary keywords unique across indexable pages", () => {
    const pages = getIndexablePublicPages();
    const canonicalPaths = new Set(pages.map((page) => page.canonicalPath));
    const titles = new Set(pages.map((page) => page.title));
    const keywords = new Set(pages.map((page) => `${page.family}:${page.primaryKeyword}`));

    expect(canonicalPaths.size).toBe(pages.length);
    expect(titles.size).toBe(pages.length);
    expect(keywords.size).toBe(pages.length);
  });

  it("includes core, service, and location pages in the public route registry", () => {
    expect(publicPages.some((page) => page.family === "core")).toBe(true);
    expect(publicPages.some((page) => page.family === "service")).toBe(true);
    expect(publicPages.some((page) => page.family === "location")).toBe(true);
    expect(publicRoutes.length).toBe(getIndexablePublicPages().length);
  });

  it("resolves every faq reference used by indexable pages", () => {
    for (const page of getIndexablePublicPages()) {
      expect(getFaqEntriesForPage(page).length).toBe(page.faqIds?.length ?? 0);
    }
  });
});

describe("public structured data", () => {
  it("emits moving company schema for the homepage", () => {
    const homePage = getPublicPageById("home");

    expect(homePage).toBeTruthy();
    expect(buildPublicPageStructuredData(homePage!)["@type"]).toBe("MovingCompany");
  });

  it("emits service schema and a breadcrumb trail for service pages", () => {
    const servicePage = getPublicPageById("service-small-moves");

    expect(servicePage).toBeTruthy();
    expect(buildPublicPageStructuredData(servicePage!)["@type"]).toBe("Service");
    expect(buildBreadcrumbStructuredData(servicePage!).itemListElement).toHaveLength(3);
  });

  it("emits FAQ page schema for the main FAQ route", () => {
    const faqPage = getPublicPageById("faq");

    expect(faqPage).toBeTruthy();
    expect(buildPublicPageStructuredData(faqPage!)["@type"]).toBe("FAQPage");
  });
});

describe("public content wording", () => {
  it("keeps banned internal jargon out of the registry and shared site copy", () => {
    const serialized = JSON.stringify({
      publicPages,
      homeFeatureCards,
      homeQuoteFormCopy,
      quoteFlowCopy,
      trustStripItems
    });

    expect(serialized).not.toMatch(/execution platform/i);
    expect(serialized).not.toMatch(/execution layer/i);
    expect(serialized).not.toMatch(/ops-reviewed/i);
    expect(serialized).not.toMatch(/real-time clarity/i);
    expect(serialized).not.toMatch(/directory chaos/i);
    expect(serialized).not.toMatch(/logistics-first/i);
  });
});
