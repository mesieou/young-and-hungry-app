import { PublicRoutePage } from "@/components/seo/PublicRoutePage";
import { buildPublicPageMetadataById, requirePublicPageById } from "@/lib/seo/public-route-utils";

export const metadata = buildPublicPageMetadataById("resources-comparison-hub");

export default function ComparisonHubPage() {
  const page = requirePublicPageById("resources-comparison-hub");

  return <PublicRoutePage page={page} />;
}
