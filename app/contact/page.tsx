import type { Metadata } from "next";
import Link from "next/link";
import { PageSection } from "@/components/layout/PageSection";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Young & Hungry."
};

export default function ContactPage() {
  return (
    <PageSection width="compact">
      <div>
        <Card className="yh-gradient-border">
          <CardContent className="p-8 sm:p-10">
            <h1 className="font-display text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">Contact Young & Hungry</h1>
            <p className="mt-5 max-w-2xl leading-8 text-text-secondary">
              For MVP, contact flows should convert into structured quote requests so ops can track every job from lead to completion.
            </p>
            <Button asChild className="mt-8">
              <Link href="/quote">Start a quote</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </PageSection>
  );
}
