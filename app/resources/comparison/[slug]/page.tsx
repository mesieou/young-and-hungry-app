import { PublicRoutePage } from "@/components/seo/PublicRoutePage";
import {
  buildPublicPageMetadataByPath,
  getStaticParamsForFamily,
  requirePublicPageByPath
} from "@/lib/seo/public-route-utils";

export const dynamicParams = false;

type ComparisonPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getStaticParamsForFamily("comparison");
}

export async function generateMetadata({ params }: ComparisonPageProps) {
  const { slug } = await params;
  return buildPublicPageMetadataByPath(`/resources/comparison/${slug}`, "comparison");
}

export default async function ComparisonPage({ params }: ComparisonPageProps) {
  const { slug } = await params;
  const page = requirePublicPageByPath(`/resources/comparison/${slug}`, "comparison");

  return <PublicRoutePage page={page} />;
}
