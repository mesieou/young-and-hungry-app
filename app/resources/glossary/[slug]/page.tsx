import { PublicRoutePage } from "@/components/seo/PublicRoutePage";
import {
  buildPublicPageMetadataByPath,
  getStaticParamsForFamily,
  requirePublicPageByPath
} from "@/lib/seo/public-route-utils";

export const dynamicParams = false;

type GlossaryPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getStaticParamsForFamily("glossary");
}

export async function generateMetadata({ params }: GlossaryPageProps) {
  const { slug } = await params;
  return buildPublicPageMetadataByPath(`/resources/glossary/${slug}`, "glossary");
}

export default async function GlossaryPage({ params }: GlossaryPageProps) {
  const { slug } = await params;
  const page = requirePublicPageByPath(`/resources/glossary/${slug}`, "glossary");

  return <PublicRoutePage page={page} />;
}
