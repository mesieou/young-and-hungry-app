import Link from "next/link";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { SiteContainer } from "@/components/layout/SiteContainer";

export function Footer() {
  return (
    <footer className="border-t border-line py-10">
      <SiteContainer className="flex flex-col gap-6 text-sm text-text-muted md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-3">
          <BrandLogo imageClassName="h-11 sm:h-12" />
          <p className="max-w-sm">Melbourne removalists for small moves, apartment moves, and furniture jobs.</p>
          <p>© {new Date().getFullYear()} Young & Hungry. All rights reserved.</p>
        </div>
        <div className="flex flex-wrap gap-5">
          <Link href="/services" className="transition hover:text-white">Services</Link>
          <Link href="/pricing" className="transition hover:text-white">Pricing</Link>
          <Link href="/contact" className="transition hover:text-white">Contact</Link>
          <Link href="/quote" className="transition hover:text-white">Estimate</Link>
          <Link href="/faq" className="transition hover:text-white">FAQ</Link>
        </div>
      </SiteContainer>
    </footer>
  );
}
