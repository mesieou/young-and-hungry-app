import { LocationGrid } from "@/components/sections/LocationGrid";
import { ServiceGrid } from "@/components/sections/ServiceGrid";
import { PublicStructuredData } from "@/components/seo/PublicStructuredData";
import { buildPublicPageMetadataById, requirePublicPageById } from "@/lib/seo/public-route-utils";

export const metadata = buildPublicPageMetadataById("services-hub");

const page = requirePublicPageById("services-hub");

export default function ServicesPage() {
  return (
    <>
      <PublicStructuredData page={page} />
      <ServiceGrid showIntro />
      <LocationGrid showIntro />
    </>
  );
}
