import { LocationGrid } from "@/components/sections/LocationGrid";
import { PublicRoutePage } from "@/components/seo/PublicRoutePage";
import { buildPublicPageMetadataById, requirePublicPageById } from "@/lib/seo/public-route-utils";

export const metadata = buildPublicPageMetadataById("locations-hub");

export default function LocationsHubPage() {
  const page = requirePublicPageById("locations-hub");

  return (
    <PublicRoutePage page={page}>
      <LocationGrid showIntro={false} />
    </PublicRoutePage>
  );
}
