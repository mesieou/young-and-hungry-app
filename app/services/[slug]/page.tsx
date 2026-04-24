import { PublicRoutePage } from "@/components/seo/PublicRoutePage";
import { buildPublicPageMetadataByPath, getStaticParamsForFamily, requirePublicPageByPath } from "@/lib/seo/public-route-utils";

type ServicePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return getStaticParamsForFamily("service");
}

export async function generateMetadata({ params }: ServicePageProps) {
  const { slug } = await params;

  return buildPublicPageMetadataByPath(`/services/${slug}`, "service");
}

export default async function ServiceDetailPage({ params }: ServicePageProps) {
  const { slug } = await params;
  const page = requirePublicPageByPath(`/services/${slug}`, "service");

  return <PublicRoutePage page={page} />;
}
