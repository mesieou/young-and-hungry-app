import Link from "next/link";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { SiteContainer } from "@/components/layout/SiteContainer";

export function Footer() {
  return (
    <footer className="border-t border-line py-10">
      <SiteContainer className="flex flex-col gap-6 text-sm text-text-muted md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-3">
          <BrandLogo imageClassName="h-11 sm:h-12" />
          <p>© {new Date().getFullYear()} Young & Hungry. All rights reserved.</p>
        </div>
        <div className="flex flex-wrap gap-5">
          <Link href="/contact" className="transition hover:text-white">Contact</Link>
          <Link href="/quote" className="transition hover:text-white">Quote</Link>
          <Link href="/faq" className="transition hover:text-white">FAQ</Link>
        </div>
      </SiteContainer>
    </footer>
  );
}
