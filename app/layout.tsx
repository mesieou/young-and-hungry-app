import type { Metadata } from "next";
import "@/app/globals.css";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { getPublicPageById, siteConfig } from "@/lib/seo/public-pages";

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
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <div className="pointer-events-none fixed inset-0 -z-10 yh-grid-bg" />
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
