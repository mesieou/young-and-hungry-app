import type { Metadata } from "next";
import "@/app/globals.css";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";

export const metadata: Metadata = {
  metadataBase: new URL("https://youngandh.co"),
  title: {
    default: "Young & Hungry | Removalist Booking Platform",
    template: "%s | Young & Hungry"
  },
  description:
    "Young & Hungry is a logistics-first removalist platform for fast quotes, scheduled moves, and reliable job execution.",
  alternates: {
    canonical: "/"
  },
  icons: {
    icon: "/young-and-hungry-logo-icon.svg",
    shortcut: "/young-and-hungry-logo-icon.svg",
    apple: "/young-and-hungry-logo-icon.svg"
  },
  openGraph: {
    title: "Young & Hungry",
    description: "Removalist booking without the back-and-forth.",
    url: "https://youngandh.co",
    siteName: "Young & Hungry",
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
    title: "Young & Hungry",
    description: "Removalist booking without the back-and-forth.",
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
