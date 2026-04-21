import type { Metadata } from "next";
import { ServiceGrid } from "@/components/sections/ServiceGrid";

export const metadata: Metadata = {
  title: "Services",
  description: "Removalist services from small jobs to apartment and house moves."
};

export default function ServicesPage() {
  return <ServiceGrid showIntro />;
}
