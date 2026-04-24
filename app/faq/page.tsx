import { PublicRoutePage } from "@/components/seo/PublicRoutePage";
import { buildPublicPageMetadataById, requirePublicPageById } from "@/lib/seo/public-route-utils";

export const metadata = buildPublicPageMetadataById("faq");

const page = requirePublicPageById("faq");

export default function FaqPage() {
  return <PublicRoutePage page={page} width="compact" />;
}
