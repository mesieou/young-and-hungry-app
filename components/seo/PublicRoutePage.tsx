import type { Route } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { PageSection } from "@/components/layout/PageSection";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { PublicStructuredData } from "@/components/seo/PublicStructuredData";
import {
  getFaqEntriesForPage,
  getRelatedPages,
  type PublicPageEntry
} from "@/lib/seo/public-pages";

type PublicRoutePageProps = {
  page: PublicPageEntry;
  width?: "compact" | "narrow" | "default";
  children?: ReactNode;
};

export function PublicRoutePage({
  page,
  width = "narrow",
  children
}: PublicRoutePageProps) {
  const faqs = getFaqEntriesForPage(page);
  const relatedPages = getRelatedPages(page);

  return (
    <PageSection width={width}>
      <PublicStructuredData page={page} />

      <div className="grid gap-10">
        <div className="max-w-4xl">
          <Badge tone="gradient">{page.heroEyebrow}</Badge>
          <h1 className="mt-5 font-display text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl">
            {page.heroTitle}
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-text-secondary sm:text-lg">
            {page.heroDescription}
          </p>
          {page.highlights?.length ? (
            <div className="mt-6 flex flex-wrap gap-3">
              {page.highlights.map((highlight) => (
                <Badge key={highlight}>{highlight}</Badge>
              ))}
            </div>
          ) : null}
          <div className="mt-8">
            <Button asChild size="lg">
              <Link href={page.cta.href as Route}>
                {page.cta.label}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        {children}

        {page.sections?.length ? (
          <section className="grid gap-4 md:grid-cols-2">
            {page.sections.map((section) => (
              <Card key={section.title} className="transition duration-200 hover:-translate-y-1 hover:border-line-hover hover:shadow-lift">
                <CardContent className="p-6">
                  <h2 className="font-display text-2xl font-semibold text-white">{section.title}</h2>
                  <div className="mt-3 grid gap-4 text-sm leading-7 text-text-secondary sm:text-base">
                    {section.paragraphs.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                    {section.bullets?.length ? (
                      <ul className="grid gap-2">
                        {section.bullets.map((bullet) => (
                          <li key={bullet} className="rounded-2xl border border-line bg-ink/60 px-4 py-3 text-white">
                            {bullet}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            ))}
          </section>
        ) : null}

        {faqs.length ? (
          <section>
            <div className="max-w-3xl">
              <Badge>FAQ</Badge>
              <h2 className="mt-5 font-display text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">
                Questions customers ask before sending the move.
              </h2>
            </div>
            <div className="mt-8 grid gap-4">
              {faqs.map((faq) => (
                <Card key={faq.id}>
                  <CardContent className="p-6">
                    <h3 className="font-display text-2xl font-semibold text-white">{faq.question}</h3>
                    <p className="mt-3 leading-7 text-text-secondary">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        ) : null}

        {relatedPages.length ? (
          <section>
            <div className="max-w-3xl">
              <Badge>Related pages</Badge>
              <h2 className="mt-5 font-display text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">
                Keep exploring the move flow.
              </h2>
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {relatedPages.map((relatedPage) => (
                <Card key={relatedPage.id} className="transition duration-200 hover:-translate-y-1 hover:border-line-hover hover:shadow-lift">
                  <CardContent className="p-6">
                    <p className="font-mono text-xs uppercase tracking-[0.18em] text-blue-soft">{relatedPage.label}</p>
                    <h3 className="mt-3 font-display text-2xl font-semibold text-white">{relatedPage.heroTitle}</h3>
                    <p className="mt-3 leading-7 text-text-secondary">{relatedPage.cardDescription}</p>
                    <Button asChild variant="ghost" className="mt-5 px-0">
                      <Link href={relatedPage.canonicalPath as Route}>
                        Open page
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </PageSection>
  );
}
