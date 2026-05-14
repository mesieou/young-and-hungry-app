import { PublicRoutePage } from "@/components/seo/PublicRoutePage";
import { buildPublicPageMetadataById, requirePublicPageById } from "@/lib/seo/public-route-utils";

export const metadata = buildPublicPageMetadataById("resources-cost-hub");

export default function CostHubPage() {
  const page = requirePublicPageById("resources-cost-hub");

  return <PublicRoutePage page={page} />;
}
