import { PublicRoutePage } from "@/components/seo/PublicRoutePage";
import { buildPublicPageMetadataById, requirePublicPageById } from "@/lib/seo/public-route-utils";

export const metadata = buildPublicPageMetadataById("resources-guides-hub");

export default function GuidesHubPage() {
  const page = requirePublicPageById("resources-guides-hub");

  return <PublicRoutePage page={page} />;
}
