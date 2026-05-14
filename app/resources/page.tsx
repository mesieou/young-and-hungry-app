import { PublicRoutePage } from "@/components/seo/PublicRoutePage";
import { buildPublicPageMetadataById, requirePublicPageById } from "@/lib/seo/public-route-utils";

export const metadata = buildPublicPageMetadataById("resources-hub");

export default function ResourcesHubPage() {
  const page = requirePublicPageById("resources-hub");

  return <PublicRoutePage page={page} />;
}
