import Link from "next/link";
import { Button } from "@/components/ui/Button";

const navItems = [
  ["How it works", "/how-it-works"],
  ["Services", "/services"],
  ["Pricing", "/pricing"],
  ["FAQ", "/faq"]
] as const;

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-line/80 bg-ink/82 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-gradient-to-br from-violet to-blue font-display text-lg font-bold shadow-glow">
            YH
          </span>
          <span className="font-display text-lg font-semibold tracking-[-0.03em]">Young & Hungry</span>
        </Link>
        <nav className="hidden items-center gap-7 md:flex">
          {navItems.map(([label, href]) => (
            <Link key={href} href={href} className="text-sm font-medium text-text-secondary transition hover:text-white">
              {label}
            </Link>
          ))}
        </nav>
        <Button asChild size="sm">
          <Link href="/quote">Get quote</Link>
        </Button>
      </div>
    </header>
  );
}
