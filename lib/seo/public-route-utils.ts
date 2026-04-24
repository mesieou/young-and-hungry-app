import { notFound } from "next/navigation";
import {
  buildPublicMetadata,
  getPublicPageById,
  getPublicPageByPath,
  getStaticParamsForFamily,
  type PublicPageFamily
} from "@/lib/seo/public-pages";

export function requirePublicPageById(id: string) {
  const page = getPublicPageById(id);

  if (!page) {
    notFound();
  }

  return page;
}

export function requirePublicPageByPath(path: string, expectedFamily?: PublicPageFamily) {
  const page = getPublicPageByPath(path);

  if (!page || (expectedFamily && page.family !== expectedFamily)) {
    notFound();
  }

  return page;
}

export function buildPublicPageMetadataById(id: string) {
  return buildPublicMetadata(requirePublicPageById(id));
}

export function buildPublicPageMetadataByPath(path: string, expectedFamily?: PublicPageFamily) {
  return buildPublicMetadata(requirePublicPageByPath(path, expectedFamily));
}

export { getStaticParamsForFamily };
