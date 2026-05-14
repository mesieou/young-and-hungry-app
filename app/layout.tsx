import type { Metadata } from "next";
import "@/app/globals.css";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { getFooterLinks, getPrimaryNav } from "@/lib/navigation/public-site";
import { getPublicPageById, siteConfig } from "@/lib/seo/public-pages";

const gscVerification = process.env.NEXT_PUBLIC_GSC_VERIFICATION;

const homePage = getPublicPageById("home");

if (!homePage) {
  throw new Error("Missing public page config for home");
}

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`
  },
  description: homePage.description,
  alternates: {
    canonical: "/"
  },
  icons: {
    icon: "/young-and-hungry-logo-icon.svg",
    shortcut: "/young-and-hungry-logo-icon.svg",
    apple: "/young-and-hungry-logo-icon.svg"
  },
  openGraph: {
    title: `${homePage.title} | ${siteConfig.name}`,
    description: homePage.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    type: "website",
    images: [
      {
        url: "/young-and-hungry-horizontal-logo.svg",
        width: 1200,
        height: 300,
        alt: "Young & Hungry"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: `${homePage.title} | ${siteConfig.name}`,
    description: homePage.description,
    images: ["/young-and-hungry-horizontal-logo.svg"]
  },
  verification: gscVerification ? { google: gscVerification } : undefined
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const navItems = getPrimaryNav();
  const footerLinks = getFooterLinks();

  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <div className="pointer-events-none fixed inset-0 -z-10 yh-grid-bg" />
        <Header navItems={navItems} />
        <main>{children}</main>
        <Footer links={footerLinks} />
        <GoogleAnalytics />
      </body>
    </html>
  );
}
