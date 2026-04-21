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
  openGraph: {
    title: "Young & Hungry",
    description: "Removalist booking without the back-and-forth.",
    url: "https://youngandh.co",
    siteName: "Young & Hungry",
    type: "website"
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
