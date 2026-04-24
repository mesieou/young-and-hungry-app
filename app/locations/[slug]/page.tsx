import { PublicRoutePage } from "@/components/seo/PublicRoutePage";
import { buildPublicPageMetadataByPath, getStaticParamsForFamily, requirePublicPageByPath } from "@/lib/seo/public-route-utils";

type LocationPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return getStaticParamsForFamily("location");
}

export async function generateMetadata({ params }: LocationPageProps) {
  const { slug } = await params;

  return buildPublicPageMetadataByPath(`/locations/${slug}`, "location");
}

export default async function LocationDetailPage({ params }: LocationPageProps) {
  const { slug } = await params;
  const page = requirePublicPageByPath(`/locations/${slug}`, "location");

  return <PublicRoutePage page={page} />;
}
