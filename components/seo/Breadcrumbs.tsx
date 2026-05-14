import type { Route } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getBreadcrumbTrail, type PublicPageEntry } from "@/lib/seo/public-pages";

type BreadcrumbsProps = {
  page: PublicPageEntry;
};

export function Breadcrumbs({ page }: BreadcrumbsProps) {
  const trail = getBreadcrumbTrail(page);

  if (trail.length <= 1) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className="text-sm text-text-secondary">
      <ol className="flex flex-wrap items-center gap-1.5">
        {trail.map((entry, index) => {
          const isLast = index === trail.length - 1;
          const label = entry.id === "home" ? "Home" : entry.label;
          return (
            <li key={entry.id} className="flex items-center gap-1.5">
              {isLast ? (
                <span aria-current="page" className="text-white">
                  {label}
                </span>
              ) : (
                <Link
                  href={entry.canonicalPath as Route}
                  className="transition-colors hover:text-white"
                >
                  {label}
                </Link>
              )}
              {!isLast ? <ChevronRight aria-hidden className="h-3.5 w-3.5 text-line" /> : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
