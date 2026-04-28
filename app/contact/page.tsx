import Link from "next/link";
import { PublicRoutePage } from "@/components/seo/PublicRoutePage";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { buildPublicPageMetadataById, requirePublicPageById } from "@/lib/seo/public-route-utils";
import { siteConfig } from "@/lib/seo/public-pages";

export const metadata = buildPublicPageMetadataById("contact");

const page = requirePublicPageById("contact");

export default function ContactPage() {
  return (
    <PublicRoutePage page={page} width="compact">
        <Card className="yh-gradient-border">
          <CardContent className="p-8 sm:p-10">
            <Eyebrow>Email</Eyebrow>
            <a href={`mailto:${siteConfig.email}`} className="mt-3 inline-block font-display text-3xl font-semibold tracking-tight-2 text-white">
              {siteConfig.email}
            </a>
            <p className="mt-5 max-w-2xl leading-8 text-text-secondary">
              Use the estimate flow if you already know the route. Contact us directly if you want to ask about a suburb, move type, or anything else before you start.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild>
                <Link href="/quote">Start your estimate</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/services">Browse services</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
    </PublicRoutePage>
  );
}
