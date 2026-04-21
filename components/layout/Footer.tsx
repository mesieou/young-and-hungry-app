import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-line px-6 py-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 text-sm text-text-muted md:flex-row md:items-center md:justify-between">
        <p>© {new Date().getFullYear()} Young & Hungry. Built for `youngandh.co`.</p>
        <div className="flex gap-5">
          <Link href="/contact" className="transition hover:text-white">Contact</Link>
          <Link href="/quote" className="transition hover:text-white">Quote</Link>
          <Link href="/faq" className="transition hover:text-white">FAQ</Link>
        </div>
      </div>
    </footer>
  );
}
