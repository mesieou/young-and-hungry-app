"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { SiteContainer } from "@/components/layout/SiteContainer";
import { Button } from "@/components/ui/Button";
import { ResponsiveDrawer } from "@/components/ui/ResponsiveDrawer";

const navItems = [
  ["How it works", "/how-it-works"],
  ["Services", "/services"],
  ["Pricing", "/pricing"],
  ["FAQ", "/faq"]
] as const;

export function Header() {
  const [isNavOpen, setIsNavOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-line/80 bg-ink/82 backdrop-blur-xl">
        <SiteContainer className="flex h-20 items-center justify-between gap-4">
          <BrandLogo priority className="min-w-0 shrink-0" imageClassName="h-10 sm:h-12 md:h-14" />
          <nav className="hidden items-center gap-7 md:flex">
            {navItems.map(([label, href]) => (
              <Link key={href} href={href} className="text-sm font-medium text-text-secondary transition hover:text-white">
                {label}
              </Link>
            ))}
          </nav>
          <div className="flex shrink-0 items-center gap-2">
            <Button asChild size="sm" className="px-3 sm:px-4">
              <Link href="/quote">
                <span className="sm:hidden">Quote</span>
                <span className="hidden sm:inline">Get quote</span>
              </Link>
            </Button>
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-ink/70 text-text-secondary transition hover:border-line-hover hover:text-white md:hidden"
              aria-label="Open navigation menu"
              onClick={() => setIsNavOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </SiteContainer>
      </header>

      <ResponsiveDrawer
        open={isNavOpen}
        onOpenChange={setIsNavOpen}
        title="Navigation"
        description="Browse the core Young & Hungry pages."
      >
        <nav className="grid gap-3">
          {navItems.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className="rounded-2xl border border-line bg-ink/70 px-4 py-4 text-sm font-semibold text-white transition hover:border-line-hover hover:bg-navy"
              onClick={() => setIsNavOpen(false)}
            >
              {label}
            </Link>
          ))}
          <Button asChild size="lg" className="mt-2 w-full">
            <Link href="/quote" onClick={() => setIsNavOpen(false)}>
              Get quote
            </Link>
          </Button>
        </nav>
      </ResponsiveDrawer>
    </>
  );
}
