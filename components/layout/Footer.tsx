import type { Route } from "next";
import Link from "next/link";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { SiteContainer } from "@/components/layout/SiteContainer";
import type { NavItem } from "@/lib/navigation/public-site";

type FooterProps = {
  links: NavItem[];
};

export function Footer({ links }: FooterProps) {
  return (
    <footer className="border-t border-line py-10">
      <SiteContainer className="flex flex-col gap-6 text-sm text-text-muted md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-3">
          <BrandLogo imageClassName="h-11 sm:h-12" />
          <p className="max-w-sm">Melbourne removalists for small moves, apartment moves, and furniture jobs.</p>
          <p>© {new Date().getFullYear()} Young & Hungry. All rights reserved.</p>
        </div>
        <div className="flex flex-wrap gap-5">
          {links.map((link) => (
            <Link key={link.id} href={link.href as Route} className="transition hover:text-white">
              {link.label}
            </Link>
          ))}
        </div>
      </SiteContainer>
    </footer>
  );
}
