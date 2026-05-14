import {
  publicPages,
  type PublicPageEntry
} from "@/lib/seo/public-pages";

export type NavItem = {
  id: string;
  label: string;
  href: PublicPageEntry["canonicalPath"];
};

function toNavItem(page: PublicPageEntry): NavItem {
  return {
    id: page.id,
    label: page.navLabel ?? page.label,
    href: page.canonicalPath
  };
}

export function getPrimaryNav(): NavItem[] {
  return publicPages
    .filter((page) => page.indexable && typeof page.navOrder === "number")
    .slice()
    .sort((a, b) => (a.navOrder ?? 0) - (b.navOrder ?? 0))
    .map(toNavItem);
}

export function getFooterLinks(): NavItem[] {
  const nav = getPrimaryNav();
  const contact = publicPages.find((page) => page.id === "contact");
  if (contact && !nav.some((item) => item.id === contact.id)) {
    nav.push(toNavItem(contact));
  }
  const quote = publicPages.find((page) => page.id === "quote");
  if (quote && !nav.some((item) => item.id === quote.id)) {
    nav.push(toNavItem(quote));
  }
  return nav;
}
