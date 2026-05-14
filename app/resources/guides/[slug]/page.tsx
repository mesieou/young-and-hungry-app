import { PublicRoutePage } from "@/components/seo/PublicRoutePage";
import {
  buildPublicPageMetadataByPath,
  getStaticParamsForFamily,
  requirePublicPageByPath
} from "@/lib/seo/public-route-utils";

export const dynamicParams = false;

type GuidePageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getStaticParamsForFamily("guide");
}

export async function generateMetadata({ params }: GuidePageProps) {
  const { slug } = await params;
  return buildPublicPageMetadataByPath(`/resources/guides/${slug}`, "guide");
}

export default async function GuidePage({ params }: GuidePageProps) {
  const { slug } = await params;
  const page = requirePublicPageByPath(`/resources/guides/${slug}`, "guide");

  return <PublicRoutePage page={page} />;
}
