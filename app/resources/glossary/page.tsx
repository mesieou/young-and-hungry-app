import { PublicRoutePage } from "@/components/seo/PublicRoutePage";
import { buildPublicPageMetadataById, requirePublicPageById } from "@/lib/seo/public-route-utils";

export const metadata = buildPublicPageMetadataById("resources-glossary-hub");

export default function GlossaryHubPage() {
  const page = requirePublicPageById("resources-glossary-hub");

  return <PublicRoutePage page={page} />;
}
