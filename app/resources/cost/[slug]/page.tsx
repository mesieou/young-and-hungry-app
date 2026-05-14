import { PublicRoutePage } from "@/components/seo/PublicRoutePage";
import {
  buildPublicPageMetadataByPath,
  getStaticParamsForFamily,
  requirePublicPageByPath
} from "@/lib/seo/public-route-utils";

export const dynamicParams = false;

type CostPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getStaticParamsForFamily("cost");
}

export async function generateMetadata({ params }: CostPageProps) {
  const { slug } = await params;
  return buildPublicPageMetadataByPath(`/resources/cost/${slug}`, "cost");
}

export default async function CostPage({ params }: CostPageProps) {
  const { slug } = await params;
  const page = requirePublicPageByPath(`/resources/cost/${slug}`, "cost");

  return <PublicRoutePage page={page} />;
}
